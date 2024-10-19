const Assessment = require("../model/assessment");

async function addNewQuestion(req, res) {
   try {
      console.log(req.body);
      const { ageGroup, question } = req.body;

      const { structure, questionText, questionType, questionImage, questionSound, totalOptions, option, correctAnswer } = question;

      requireQuesFields = { structure, questionText, questionType, questionImage, questionSound, totalOptions, option, correctAnswer };

      const quest = await Assessment.create({ ageGroup, question: requireQuesFields });

      res.status(200).json({
         message: "Success",
         question: quest
      })
   } 
   catch (error) {
      console.log(error.errors);
      res.status(404).json({ message: "Fail in adding question", error: error.errors });
   }
}

async function getQuestionAgeWise(req, res) {
   try {
      const { ageGroup } = req.body;

      const questions = await Assessment.find({ ageGroup });
      if (questions.length === 0) res.status(201).json({ message: "No questions for this age group." })
      else res.status(200).json({ message: "Success", questions });
   } 
   catch (error) {
      console.log(error.errors);
      res.status(404).json({ message: "Fail in fetching question age wise / common", error: error.errors });
   }
}

module.exports = { addNewQuestion, getQuestionAgeWise }