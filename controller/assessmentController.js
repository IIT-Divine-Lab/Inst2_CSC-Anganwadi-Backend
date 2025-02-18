const Assessment = require("../model/assessment");
const redisClient = require("../cache/redisClient");

const CACHE_EXPIRY = 60 * 60 * 24;

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
         }
         console.log(file)
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
            questionSoundText
         },
      });



      console.log(await newQuestion.populate('quesCategory', 'categoryName totalQuestions'));

      await redisClient.del(`getAllQuestions`);

      res.status(200).json({
         message: "Success",
         question: newQuestion
      })
   }
   catch (error) {
      console.log(error.errors);
      res.status(404).json({ message: "Fail in adding question", error: error.errors });
   }
}

async function modifyQuestion(req, res) {

}

async function getAll(req, res) {
   try {
      const cachedQuestions = await redisClient.get(`getAllQuestions`);
      if (cachedQuestions) {
         console.log("Cache Hit: Get All Questions");
         return res.status(200).json({ message: "Success", questions: JSON.parse(cachedQuestions) });
      }
      console.log("Cache miss: Get All Questions");

      const allQuestions = await Assessment.find().populate('quesCategory', 'categoryName totalQuestions');

      if (!allQuestions) return res.status(201).json({ message: "No questions found." })

      allQuestions.sort((a, b) => {
         if (a.quesCategory.categoryName < b.quesCategory.categoryName) return -1;
         if (a.quesCategory.categoryName > b.quesCategory.categoryName) return 1;
         return 0;
      });

      await redisClient.setEx(`getAllQuestions`, CACHE_EXPIRY, JSON.stringify(allQuestions));

      res.status(200).json({ message: "Success", questions: allQuestions });
   }
   catch (error) {
      console.log(error.errors);
      res.status(404).json({ message: "Fail in fetching question age wise / common", error: error.errors });
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
      console.log(error.errors);
      res.status(404).json({ message: "Fail in fetching question age wise / common", error: error.errors });
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

module.exports = { addNewQuestion, modifyQuestion, getQuestionAgeWise, getAll, deleteQuestion, getQuestionById }