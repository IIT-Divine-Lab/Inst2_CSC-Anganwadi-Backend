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
   } catch (error) {
      next(error)
   }
}

module.exports = { submitAssessment }