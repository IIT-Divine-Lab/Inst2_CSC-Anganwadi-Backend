const Student = require("../model/student");

async function userRegister(req, res) {
   try {
      const { name, age, rollno, gender, awcentre } = req.body;
      const user = await Student.create({ name, age, rollno, gender, awcentre });

      res.status(200).json({
         message: "Success",
         user
      })
   }
   catch (error) {
      console.log(error);
      res.status(404).json({ message: "Fail in registering user", error });
   }
}

async function getAll(req, res) {
   try {
      const students = await Student.find().lean();
      if (students.length !== 0)
         res.status(200).json({ students });
      else
         res.status(201).json({ message: "No Data" })
   } catch (error) {
      console.log(error);
      res.status(404).json({ message: "Fail in fetching all data", error });
   }
}

async function patchAssessment(req, res, next) {
   try {
      const { userId } = req.params;
      const { assessId } = req.body;

      if (assessId === undefined) res.status(404).json({ message: "Error" })

      let user = await Student.findByIdAndUpdate({ _id: userId }, { assessId });

      res.json({ message: "Success", user });
   } catch (error) {
      console.log(error);
      res.status(404).json({ message: "Fail in linking assessment details to user", error });
   }
}

module.exports = { userRegister, getAll, patchAssessment };
