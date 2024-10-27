const mongoose = require("mongoose");
// const Joi = require("joi");
const resultSchema = new mongoose.Schema({
   userId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "Student"
   },
   questions: [{
      quesId: {
         type: mongoose.Schema.ObjectId,
         required: true,
         ref: "Assessment"
      },
      AnswerMarked: {
         type: [String],
         required: true
      }
   }]
})

const Result = new mongoose.model("Result", resultSchema);

module.exports = Result;