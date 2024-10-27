const Result = require("../model/result");
const Student = require("../model/student");

async function submitAssessment(req, res, next) {
   try {
      console.log(req.body);
      const { userId, questions } = req.body;

      const user = await Student.findById(userId);
      if (!user) res.status(404).json({ message: "Not Found" });
      else {

         const quest = await Result.create({ userId, questions });

         res.status(200).json({
            message: "Success",
            question: quest
         })
      }
   }
   catch (error) {
      console.log(error.errors);
      res.status(404).json({ message: "Fail in submitting assessment", error: error.errors });
   }
}

async function getAll(req, res, next) {
   try {
      const result = await Result.find().lean().populate('userId', 'name rollno awcentre age').populate('questions.quesId', 'quesCategory question.correctAnswer');
      if (result.length === 0) {
         res.status(201).json({
            message: "No Record Found"
         })
         return;
      }
      res.status(200).json({
         message: "Fetch Successfull",
         result
      })
   } catch (error) {
      console.log(error.errors);
      res.status(404).json({ message: "Fail in fetching records", error: error.errors });
   }
}

module.exports = { submitAssessment, getAll }