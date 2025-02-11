const Assessment = require("../model/assessment");

async function addNewQuestion(req, res) {
   try {
      const {
         quesCategory,
         ageGroup,
         structure,
         questionText,
         questionType,
         totalOptions,
         correctAnswer
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

      const newQuestion = new Assessment({
         quesCategory,
         ageGroup,
         question: {
            structure,
            questionText,
            questionType,
            totalOptions,
            correctAnswer,
            option,
            questionImage
         },
      });

      console.log(newQuestion);

      await newQuestion.save();

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

async function getAll(req, res) {
   try {
      const allQuestions = await Assessment.find().populate('quesCategory', 'categoryName totalQuestions');
      allQuestions.sort((a, b) => {
         if (a.quesCategory.categoryName < b.quesCategory.categoryName) return -1;
         if (a.quesCategory.categoryName > b.quesCategory.categoryName) return 1;
         return 0;
      });
      if (allQuestions.length === 0) res.status(201).json({ message: "No questions found." })
      else {
         res.status(200).json({ message: "Success", questions: allQuestions });
      }
   }
   catch (error) {
      console.log(error.errors);
      res.status(404).json({ message: "Fail in fetching question age wise / common", error: error.errors });
   }
}

async function getQuestionById(req, res) {
   try {
      const { id } = req.params;
      const question = await Assessment.findById(id);
      if (!question) res.status(201).json({ message: "No question found." })
      else {
         res.status(200).json({ message: "Success", questions: question });
      }
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
      const ageQuestions = await Assessment.find({ ageGroup }).populate('quesCategory', 'categoryName');

      // const ageQuestions = await Assessment.find({ ageGroup, quesCategory: "Task 5 (Sorting) - Big Small" });
      // const age = await Assessment.find({ ageGroup, quesCategory: "Task 6 (Egg Farm Task)" });
      if (ageGroup !== "common") {
         const commonQuestions = await Assessment.find({ ageGroup: "common" }).populate('quesCategory', 'categoryName');
         if (ageQuestions.length === 0 && commonQuestions.length === 0) res.status(201).json({ message: "No questions for this age group." })
         else {
            response.push(...commonQuestions);
            response.push(...ageQuestions);
            response.sort((a, b) => {
               if (a.quesCategory.categoryName < b.quesCategory.categoryName) return -1;
               if (a.quesCategory.categoryName > b.quesCategory.categoryName) return 1;
               return 0;
            });

            // res.status(200).json({ message: "Success", questions: [...ageQuestions] });
            res.status(200).json({ message: "Success", questions: response });
         }
      }
      else {
         if (ageQuestions.length === 0) res.status(201).json({ message: "No questions for this age group." })
         else {
            response.push(ageQuestions);
            response.sort((a, b) => {
               if (a.quesCategory.categoryName < b.quesCategory.categoryName) return -1;
               if (a.quesCategory.categoryName > b.quesCategory.categoryName) return 1;
               return 0;
            });
            res.status(200).json({ message: "Success", questions: response });
         }
      }
   }
   catch (error) {
      console.log(error);
      res.status(404).json({ message: "Fail in fetching question age wise / common", error });
   }
}

async function deleteQuestion(req, res) {
   try {
      const { id } = req.params;
      const question = await Assessment.findByIdAndDelete(id);
      res.status(200).json({ message: "Deleted Successfully", question });
   } catch (error) {
      console.log(error.errors);
      res.status(404).json({ message: "Fail in deleting question", error: error.errors });
   }
}

module.exports = { addNewQuestion, getQuestionAgeWise, getAll, deleteQuestion, getQuestionById }