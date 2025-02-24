const redisClient = require("../cache/redisClient");
const Dashboard = require("../model/dashboard");
const Student = require("../model/student");
// const Result = require("../model/result");

// 60 = 1 minute;
// 60 * 60 = 1 hour;
// 60 * 60 * 8 = 8 hours;

const CACHE_EXPIRY = 60 * 60 * 8;

async function getKpis(req, res) {
   const filters = req.query ? req.query?.state === "" && req.query.district === "" && req.query.anganwadi === "" && req.query.ageGroup === "" ? undefined : req.query : undefined
   const cacheKey = `dashboard:kpis:${JSON.stringify(req.query)}`;
   console.log("GET KPI", cacheKey);
   const matchStage = filters !== undefined ? { $match: filters } : { $match: {} };

   try {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
         return res.status(200).json({ message: "Success", data: JSON.parse(cachedData) });
      }
      // const pipeline = [
      //    // { $unwind: "$questions" },
      //    // // Join with Assessment to get question details
      //    // {
      //    //    $lookup: {
      //    //       from: "assessments",
      //    //       localField: "questions.quesId",
      //    //       foreignField: "_id",
      //    //       as: "questions.quesId",
      //    //       pipeline: [
      //    //          { $project: { _id: 1, ageGroup: 1, quesCategory: 1 } }
      //    //       ]
      //    //    }
      //    // },
      //    // { $unwind: "$questions.quesId" },
      //    // // Join with Student to allow filtering by student properties (e.g., age, awcentre)
      //    // {
      //    //    $lookup: {
      //    //       from: "students",
      //    //       localField: "userId",
      //    //       foreignField: "_id",
      //    //       as: "userId"
      //    //    }
      //    // },
      //    // { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },

      //    // { $unwind: "$student" },
      //    // (Optional) Apply filters from req.query here.
      //    // For simplicity, we pass the query directly. In production, you’d validate and map filters.
      //    // {
      //    //    $match: {
      //    //       ageGroup: req.query.ageGroup,
      //    //       awcentre: req.query.state + " - " + req.query.district + " - " + req.query.anganwadi
      //    //    }
      //    // },
      //    // // Add question fields: extract questionType and correctAnswer from the Assessment document.
      //    // {
      //    //    $addFields: {
      //    //       questionType: "$assessment.question.questionType",
      //    //       correctAnswer: "$assessment.question.correctAnswer"
      //    //    }
      //    // },
      //    // // Compute the score (computedScore) and maximum possible score (maxScore) for each question.
      //    // {
      //    //    $addFields: {
      //    //       computedScore: {
      //    //          $cond: [
      //    //             { $eq: ["$questionType", "single-choice"] },
      //    //             {
      //    //                $cond: [
      //    //                   { $eq: [{ $arrayElemAt: ["$questions.AnswerMarked", 0] }, { $arrayElemAt: ["$assessment.question.correctAnswer", 0] }] },
      //    //                   1,
      //    //                   0
      //    //                ]
      //    //             },
      //    //             { $size: { $setIntersection: ["$questions.AnswerMarked", "$assessment.question.correctAnswer"] } }
      //    //          ]
      //    //       },
      //    //       maxScore: {
      //    //          $cond: [
      //    //             { $eq: ["$questionType", "single-choice"] },
      //    //             1,
      //    //             { $size: "$assessment.question.correctAnswer" }
      //    //          ]
      //    //       }
      //    //    }
      //    // },
      //    // // Group all documents to compute overall totals.
      //    // {
      //    //    $group: {
      //    //       _id: null,
      //    //       totalQuestions: { $sum: 1 },
      //    //       totalScore: { $sum: "$computedScore" },
      //    //       totalMaxScore: { $sum: "$maxScore" }
      //    //    }
      //    // },
      //    // // Project the final results and compute accuracy.
      //    // {
      //    //    $project: {
      //    //       _id: 0,
      //    //       totalQuestions: 1,
      //    //       totalScore: 1,
      //    //       totalMaxScore: 1,
      //    //       accuracy: { $multiply: [{ $divide: ["$totalScore", "$totalMaxScore"] }, 100] }
      //    //    }
      //    // }
      // ];
      console.log(matchStage);
      const pipeline = [
         matchStage,
         {
            $group: {
               _id: null,
               totalQuestions: { $sum: "$attemptedQuestions" },
               totalScore: { $sum: "$correctAnswers" },
               totalMaxScore: { $sum: "$maxCorrectAnswers" }
            }
         },
         {
            $project: {
               _id: 0,
               totalQuestions: 1,
               totalScore: 1,
               totalMaxScore: 1,
               accuracy: { $multiply: [{ $divide: ["$totalScore", "$totalMaxScore"] }, 100] }
            }
         }
      ]
      const stats = await Dashboard.aggregate(pipeline);
      const response = stats.length > 0 ? stats[0] : { totalQuestions: 0, totalScore: 0, totalMaxScore: 0, accuracy: 0 };

      // Cache the response for 60 seconds.
      await redisClient.setEx(cacheKey, CACHE_EXPIRY, JSON.stringify(response));
      res.status(200).json({ message: "Success", data: response });
   } catch (error) {
      console.log(error);
   }
}

async function getDomainWise(req, res) {
   // const filters = req.query ? req.query?.state === "" && req.query.district === "" && req.query.anganwadi === "" && req.query.ageGroup === "" ? undefined : req.query : undefined

   // const cacheKey = `dashboard:domainWise:${JSON.stringify(req.query)}`;
   // console.log("GET KPI", cacheKey);

   // const matchStage = filters !== undefined ? { $match: filters } : { $match: {} };

   // try {
   //    const cachedData = await redisClient.get(cacheKey);
   //    if (cachedData) {
   //       // return res.status(200).json({ message: "Success", data: JSON.parse(cachedData) });
   //    }
   //    console.log(matchStage);
   //    const pipeline = [
   //       matchStage,
   //       {
   //          $lookup: {
   //             from: "result",
   //             localField: "assessId",
   //             foreignField: "_id",
   //             as: "assessment",
   //             pipeline: [
   //                { $project: { _id: 1, ageGroup: 1, quesCategory: 1 } }
   //             ]
   //          }
   //       }

   //    ]
   //    const stats = await Dashboard.aggregate(pipeline);
   //    const response = stats.length > 0 ? stats[0] : { totalQuestions: 0, totalScore: 0, totalMaxScore: 0, accuracy: 0 };



   //    // Cache the response for 60 seconds.
   //    // await redisClient.setEx(cacheKey, CACHE_EXPIRY, JSON.stringify(response));
   //    res.status(200).json({ message: "Success", data: stats });
   // } catch (error) {
   //    console.log(error);
   // }
   // res.status(200).json();
}

async function getGenderCount(req, res) {
   const { state } = req.query;
   const matchStage = state && state !== "All" ? { awcentre: new RegExp(`^${state}`, "i") } : {}

   const response = await Student.aggregate([
      { $match: { ...matchStage } },
      {
         $group: {
            _id: {
               state: { $substrCP: ["$awcentre", 0, { $indexOfCP: ["$awcentre", " - "] }] },
               ageGroup: "$age",
               gender: "$gender",
               schoolType: {
                  $cond: {
                     if: { $regexMatch: { input: "$awcentre", regex: /pilot/i } },
                     then: "pilot",
                     else: "controlled"
                  }
               }
            },
            count: { $sum: 1 }
         }
      },
      {
         $group: {
            _id: "$_id.state",
            data: {
               $push: {
                  ageGroup: "$_id.ageGroup",
                  gender: "$_id.gender",
                  schoolType: "$_id.schoolType",
                  count: "$count"
               }
            }
         }
      }
   ])
   let formattedData = {
      labels: ["3-4 years (M)", "3-4 years (F)", "4-5 years (M)", "4-5 years (F)", "5-6 years (M)", "5-6 years (F)"],
      datasets: []
   };

   const colors = {
      pilot: { male: "rgba(75,192,192,0.6)", female: "rgba(75,192,192,1)" },
      control: { male: "rgba(255,99,132,0.6)", female: "rgba(255,99,132,1)" }
   };

   response.forEach(stateData => {
      let pilotData = [0, 0, 0, 0, 0, 0]; // Default values
      let controlData = [0, 0, 0, 0, 0, 0];
      console.log(stateData)
      stateData.data.forEach(entry => {
         let index = formattedData.labels.indexOf(`${entry.ageGroup} years (${entry.gender.charAt(0).toUpperCase()})`);
         console.log(`${entry.ageGroup} years (${entry.gender.charAt(0).toUpperCase()})`);
         if (index !== -1) {
            if (entry.schoolType === "pilot") pilotData[index] = entry.count;
            else controlData[index] = entry.count;
         }
      });

      formattedData.datasets.push(
         {
            label: `${stateData._id} Pilot`,
            backgroundColor: colors.pilot.male,
            borderColor: colors.pilot.female,
            borderWidth: 1,
            data: pilotData
         },
         {
            label: `${stateData._id} Control`,
            backgroundColor: colors.control.male,
            borderColor: colors.control.female,
            borderWidth: 1,
            data: controlData
         }
      );
   });
   res.json(formattedData);
}


module.exports = { getKpis, getDomainWise, getGenderCount }