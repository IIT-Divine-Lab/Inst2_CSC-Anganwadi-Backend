const Assessment = require("../model/assessment");
const { redisClient } = require("../cache/redisClient");

// 60 = 1 minute;
// 60 * 60 = 1 hour;
// 60 * 60 * 8 = 8 hours;

const CACHE_EXPIRY = 60 * 60 * 8;

async function addNewQuestion(req, res) {
   try {
      const {
         quesCategory,
         ageGroup,
         structure,
         questionText,
         questionType,
         totalOptions,
         correctAnswer,
         questionSoundText,
         questionOnlyText,
         questionSound
      } = req.body;

      let option = [];
      let questionImage = { before: {}, after: {} };
      let answerImage = {};

      // req.files.forEach(file => {
      //    console.log(file)
      //    if (file.fieldname.startsWith("option")) {
      //       console.log("Option")
      //       option.push({
      //          key: file.fieldname.split(".")[1], // Extract option key (e.g., o1, o2)
      //          filePath: file.path,
      //          fileName: file.filename
      //       });
      //    } else if (file.fieldname.startsWith("questionImageBefore")) {
      //       questionImage.before = {
      //          filePath: file.path,
      //          fileName: file.filename
      //       };
      //    } else if (file.fieldname.startsWith("questionImageAfter")) {
      //       questionImage.after = {
      //          filePath: file.path,
      //          fileName: file.filename
      //       };
      //    }
      // });
      req.files.forEach(file => {
         if (file.fieldname.startsWith("option")) {
            option.push({
               key: file.fieldname.split(".")[1], // Extract option key (e.g., o1, o2)
               filePath: file.buffer,
               fileName: file.originalname
            });
         } else if (file.fieldname.startsWith("questionImageBefore")) {
            questionImage.before = {
               filePath: file.buffer,
               fileName: file.originalname
            };
         } else if (file.fieldname.startsWith("questionImageAfter")) {
            questionImage.after = {
               filePath: file.buffer,
               fileName: file.originalname
            };
         } else if (file.fieldname.startsWith("answerImage")) {
            answerImage = {
               filePath: file.buffer,
               fileName: file.originalname
            };
         }
      });

      const newQuestion = await Assessment.create({
         quesCategory,
         ageGroup,
         question: {
            structure,
            questionText,
            questionType,
            totalOptions,
            correctAnswer,
            option,
            questionImage,
            questionOnlyText,
            questionSound,
            questionSoundText,
            answerImage
         },
      });



      await newQuestion.populate('quesCategory', 'categoryName totalQuestions');

      await redisClient.del(`getAllQuestions`);
      await redisClient.del(`getQuestionsAgeWise:/${ageGroup}`);

      res.status(200).json({
         message: "Success",
         question: newQuestion
      })
   }
   catch (error) {
      console.log(error);
      res.status(404).json({ message: "Fail in adding question", error });
   }
}

async function modifyQuestion(req, res) {
   const { id } = req.params;
   const {
      quesCategory,
      ageGroup,
      structure,
      questionText,
      questionType,
      totalOptions,
      correctAnswer,
      questionSoundText,
      questionOnlyText,
      questionSound,
      option,
      questionImageBefore,
      questionImageAfter,
      answerImage
   } = req.body;

   // console.log(questionImageAfter, option, questionImageBefore)
   // console.log(JSON.parse(questionImageAfter), JSON.parse(option), JSON.parse(questionImageBefore))
   // console.log(typeof (questionImageAfter), typeof (option), typeof (questionImageBefore))

   // console.log(JSON.parse(option))

   let options = option ?
      JSON.parse(option)
      :
      [];
   let questionImage = {};
   if (questionImageAfter) {
      if (questionImageBefore) {
         questionImage = { before: JSON.parse(questionImageBefore) }
      }
      questionImage = { ...questionImage, after: JSON.parse(questionImageAfter) }
   }
   else {
      questionImage = { before: {}, after: {} }
   }
   let answerImages = answerImage ? JSON.parse(answerImage) : {};

   req.files.length !== 0 && req.files.forEach(file => {
      if (file.fieldname.startsWith("option")) {
         options.push({
            key: file.fieldname.split(".")[1], // Extract option key (e.g., o1, o2)
            filePath: file.buffer,
            fileName: file.originalname
         });
      } else if (file.fieldname.startsWith("questionImageBefore")) {
         questionImage.before = {
            filePath: file.buffer,
            fileName: file.originalname
         };
      } else if (file.fieldname.startsWith("questionImageAfter")) {
         questionImage.after = {
            filePath: file.buffer,
            fileName: file.originalname
         };
      } else if (file.fieldname.startsWith("answerImage")) {
         answerImages = {
            filePath: file.buffer,
            fileName: file.originalname
         };
      }
   });

   await redisClient.del(`getAllQuestions`);
   await redisClient.del(`getQuestion/${id}`);
   await redisClient.del(`getQuestionsAgeWise:/${ageGroup}`);

   const question = await Assessment.findByIdAndUpdate(id, { ageGroup, quesCategory, question: { structure, questionText, questionType, correctAnswer, questionImage, totalOptions, questionSound, questionOnlyText, questionSoundText, option: options, questionImage, answerImage: answerImages } }, { new: true });

   if (!question) return res.status(201).json({ message: "No question found." })

   await question.populate('quesCategory', 'categoryName totalQuestions');

   await redisClient.setEx(`getQuestion/${id}`, CACHE_EXPIRY, JSON.stringify(question));

   res.status(200).json({ message: "Success", question });
}

function postProcess() {
   setTimeout(() => {
      console.log("triggered");
   }, 10000);
}

async function getAll(req, res) {
   try {
      const cachedQuestions = await redisClient.get(`getAllQuestions`);
      if (cachedQuestions) {
         console.log("Cache Hit: Get All Questions");
         if (JSON.parse(cachedQuestions).length === 0)
            return res.status(201).json({ message: "No questions found." });
         return res.status(200).json({ message: "Success", questions: JSON.parse(cachedQuestions) });
      }
      console.log("Cache miss: Get All Questions");

      const allQuestions = await Assessment.find().populate('quesCategory', 'categoryName totalQuestions');

      if (!allQuestions) return res.status(201).json({ message: "No questions found." })

      allQuestions.sort((a, b) => {
         if (a?.quesCategory?.categoryName < b?.quesCategory?.categoryName) return -1;
         if (a?.quesCategory?.categoryName > b?.quesCategory?.categoryName) return 1;
         return 0;
      });

      await redisClient.setEx(`getAllQuestions`, CACHE_EXPIRY, JSON.stringify(allQuestions));
     
      res.status(200).json({ message: "Success", questions: allQuestions });
   }
   catch (error) {
      console.log(error);
      res.status(404).json({ message: "Fail in fetching question age wise / common", error });
   }
}

async function getQuestionById(req, res) {
   try {
      const { id } = req.params;

      const cachedQuestion = await redisClient.get(`getQuestion/${id}`);
      if (cachedQuestion) {
         console.log(`Cache Hit: Get Question by ID: ${id}`);
         return res.status(200).json({ message: "Success", questions: JSON.parse(cachedQuestion) });
      }
      console.log(`Cache Miss: Get Question by ID: ${id}`);

      const question = await Assessment.findById(id);

      if (!question) return res.status(201).json({ message: "No question found." })

      await redisClient.setEx(`getQuestion/${id}`, CACHE_EXPIRY, JSON.stringify(question));
      res.status(200).json({ message: "Success", questions: question });
   }
   catch (error) {
      console.log(error);
      res.status(404).json({ message: "Fail in fetching question age wise / common", error });
   }
}

async function getQuestionAgeWise(req, res) {
   try {
      const { ageGroup } = req.body;
      // let ageGroup = "common";
      const response = [];

      const cachedQuestion = await redisClient.get(`getQuestionsAgeWise:/${ageGroup}`);
      if (cachedQuestion) {
         console.log(`Cache Hit: Get Questions Age-wise: ${ageGroup}`);
         return res.status(200).json({ message: "Success", questions: JSON.parse(cachedQuestion) });
      }
      console.log(`Cache Miss: Get Question Age-wise: ${ageGroup}`);

      const ageQuestions = await Assessment.find({ ageGroup }).populate('quesCategory', 'categoryName');

      if (ageGroup !== "common") {

         const commonQuestions = await Assessment.find({ ageGroup: "common" }).populate('quesCategory', 'categoryName');

         if (!ageQuestions && !commonQuestions) return res.status(201).json({ message: "No questions for this age group." })

         response.push(...commonQuestions);
         response.push(...ageQuestions);
      }
      else {
         if (!ageQuestions) return res.status(201).json({ message: "No questions for this age group." })

         response.push(ageQuestions);
      }

      response.sort((a, b) => {
         if (a.quesCategory.categoryName < b.quesCategory.categoryName) return -1;
         if (a.quesCategory.categoryName > b.quesCategory.categoryName) return 1;
         return 0;
      });

      await redisClient.setEx(`getQuestionsAgeWise:/${ageGroup}`, CACHE_EXPIRY, JSON.stringify(response));

      res.status(200).json({ message: "Success", questions: response });
   }
   catch (error) {
      console.log(error);
      res.status(404).json({ message: "Fail in fetching question age wise", error });
   }
}

async function deleteCache(req, res) {
   const keys = await redisClient.keys("*");

   keys.map(async (key) => {
      if (key.includes("ues")) {
         await redisClient.del(key);
      }
      else if (key.includes("ategor")) {
         await redisClient.del(key);
      }
      return;
   })

   res.status(200).json(keys);
}

async function deleteQuestion(req, res) {
   try {
      const { id } = req.params;
      const question = await Assessment.findByIdAndDelete(id);

      await redisClient.del(`getAllQuestions`);
      await redisClient.del(`getQuestion/${id}`);
      await redisClient.del(`getQuestionsAgeWise:/${question.ageGroup}`);

      res.status(200).json({ message: "Deleted Successfully", question });
   } catch (error) {
      console.log(error);
      res.status(404).json({ message: "Fail in deleting question", error });
   }
}

module.exports = { addNewQuestion, modifyQuestion, getQuestionAgeWise, deleteCache, getAll, deleteQuestion, getQuestionById }
