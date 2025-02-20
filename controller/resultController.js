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
      console.log(error);
      res.status(404).json({ message: "Fail in submitting assessment", error: error.errors });
   }
}

async function getAll(req, res, next) {
   try {
      const result = await Result.countDocuments() !== 0 ? await Result.find().lean().populate('userId', 'name rollno awcentre age gender').populate('questions.quesId', 'question.correctAnswer question.questionType').populate('questions.quesCategory', 'categoryName') : 0;
      if (!result || result.length === 0) {
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
      console.log(error);
      res.status(404).json({ message: "Fail in fetching records", error: error.errors });
   }
}

async function getAllWithNoUserDetails(req, res, next) {
   try {
      const result = await Result.countDocuments() !== 0 ? await Result.find().lean() : [];

      if (result.length === 0) {
         return res.json({ nullUsers: [], notNullUsers: [] });
      }

      let users = result.map((val) => val.userId.toString()); // Ensure all IDs are strings

      // Fetch all users in a single query
      const students = await Student.find({ _id: { $in: users } }).lean();

      // Separate null and not-null users
      let nullUsersSet = new Set(); // Use a Set for unique nullUsers
      let notNullUsers = [];

      users.forEach((id) => {
         const user = students.find((student) => student._id.toString() === id); // Compare as strings
         if (user) {
            notNullUsers.push(id);
         } else {
            nullUsersSet.add(id); // Add to Set to ensure uniqueness
         }
      });

      const nullUsers = Array.from(nullUsersSet); // Convert Set back to array

      let response = result.filter((val) => nullUsers.includes(val.userId))

      res.json({ length: response.length, nullLength: nullUsers.length, nullUsers });

      // const nullData = await result.filter((doc) => doc.userId === null);
      // const allResults = await Result.countDocuments() !== 0 ? await Result.find().lean() : 0;
      // res.json({ null: nullData.length, res: allResults.length });

   }
   catch (error) {
      console.log(error);
   }
}

module.exports = { submitAssessment, getAll, getAllWithNoUserDetails }