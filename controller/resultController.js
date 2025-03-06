const Result = require("../model/result");
const Student = require("../model/student");
const Dashboard = require("../model/dashboard");

async function calculateResult(resultId, user, res) {
   const result = await Result.findById(resultId).populate('userId', 'name rollno awcentre age gender').populate('questions.quesCategory', 'categoryName').populate('questions.quesId', 'question.correctAnswer question.questionType')

   const newQuestionData = [];

   for (let i = 0; i < result.questions.length; i++) {
      const element = result.questions[i];
      if (!(element.quesCategory.categoryName.includes("Demo"))) {
         let answerMarked = "";
         for (let j = 0; j < element.AnswerMarked.length; j++) {
            if (element.AnswerMarked[j].length <= 3) {
               if (element.quesId.question.questionType === "multi")
                  answerMarked += (Number(element.AnswerMarked[j].split("o")[1]) - 1).toString() + (j == element.AnswerMarked.length - 1 ? "" : ",")
               else
                  answerMarked += (element.AnswerMarked[j].split("o")[1])
            }
            else
               break;
         }
         newQuestionData.push({
            quesId: element.quesId._id,
            questionType: element.quesId.question.questionType,
            correctAnswer: element.quesId.question.correctAnswer,
            answerMarked: [answerMarked],
            quesCategory: element.quesCategory._id
         })
      }
   }

   const totalQuestionsAttempted = newQuestionData.length;
   var maxCorrectAnswers = 0;
   var totalCorrectAnswers = 0;

   // newQuestionData.forEach((data) => {
   //    if (data.questionType === "multi") {
   //       let ansMar = data.answerMarked[0].split(",");
   //       let corAns = data.correctAnswer[0].split(",");
   //       ansMar.sort((a, b) => Number(a) - Number(b))
   //       corAns.sort((a, b) => Number(a) - Number(b))
   //       maxCorrectAnswers += corAns.length;
   //       ansMar.forEach((ans) => {
   //          if (corAns.includes(ans)) {
   //             totalCorrectAnswers++;
   //          }
   //       })
   //    }
   //    else if (data.questionType === "single") {
   //       let ansMar = data.answerMarked[0];
   //       let corAns = data.correctAnswer[0];
   //       maxCorrectAnswers++;
   //       if (Number(corAns) === Number(ansMar)) {
   //          totalCorrectAnswers++;
   //       }
   //    }
   // })



   // const details = user.awcentre.split(" - ")

   // const data = await Dashboard.create({ assessId: resultId, attemptedQuestions: totalQuestionsAttempted, correctAnswers: totalCorrectAnswers, maxCorrectAnswers, userId: user._id, state: details[0], district: details[1], anganwadi: details[2] + " - " + details[3], schoolType: details[4], ageGroup: user.age, gender: user.gender })

   // if (!data) {
   //    console.log("Error");
   // }

   /*
{
  _id: new ObjectId('67b9b3df706149ed5300e17b'),
  name: 'Kushdeep Singh',
  age: '4-5',
  rollno: 4.4,
  gender: 'female',
  awcentre: 'Jharkhand - Ramgarh - 20361040412 - Barlong - Controlled',
  __v: 0
}
   */

   // res.status(200).json({
   //    message: "Success",
   //    question: newQuestionData
   // })
}

async function submitAssessment(req, res, next) {
   try {
      // console.log(req.body);
      const { userId, questions } = req.body;

      const user = await Student.findById(userId);
      // console.log(user)
      if (!user) res.status(404).json({ message: "Not Found" });
      else {

         const quest = await Result.create({ userId, questions });

         calculateResult(quest._id, user, res);

         res.status(200).json({
            message: "Success",
            question: quest
         })
      }
   }
   catch (error) {
      console.log(error);
      res.status(404).json({ message: "Fail in submitting assessment", error });
   }
}

async function getAll(req, res, next) {
   try {
      // const result = await Result.countDocuments() !== 0 ? await Result.find().lean() : 0;
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