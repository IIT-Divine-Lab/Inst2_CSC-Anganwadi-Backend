const Student = require("../model/student");
const Assessment = require("../model/assessment");

async function userRegister(req, res, next) {
   try {
      const { name, age, rollno, gender, awcentre } = req.body;
      const user = await Student.create({ name, age, rollno, gender, awcentre });
      res.status(200).json({
         message: "Success",
         user
      })
   }
   catch (error) {
      next(error);
   }
}

async function getAll(req, res, next) {
   const students = await Student.find().lean();
   if (students.length !== 0)
      res.status(200).json({ students });
   else
      res.status(201).json({ message: "No Data" })
}

async function patchAssessment(req, res, next) {
   const { userId } = req.params;
   const { assessId } = req.body;

   if (assessId === undefined) res.status(404).json({ message: "Error" })

   let user = await Student.findByIdAndUpdate({ _id: userId }, { assessId });
   
   res.json({ message: "Success" });
}

module.exports = { userRegister, getAll, patchAssessment };
