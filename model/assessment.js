const mongoose = require("mongoose");
// const Joi = require("joi");

// Define the main Assessment schema
const assessmentSchema = new mongoose.Schema({
   ageGroup: {
      type: String,  // E.g., '6-8', '9-12', etc.
      required: true,
   },
   quesCategory: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "Category"
   },
   question: {
      structure: {
         type: Number,
         required: true
      },
      questionText: {
         type: String,
         required: true,
      },
      questionType: {
         type: String, // Can be 'single-choice' or 'multiple-choice'
         required: true,
      },
      questionImage: {
         before: {
            type: String
         },
         after: {
            type: String
         }
      },
      questionSound: {
         type: String
      },
      questionSoundText: {
         type: String
      },
      questionOnlyText: {
         type: String
      },
      answerImage: {
         type: String
      },
      totalOptions: {
         type: Number
      },
      option: {
         type: Object,  // List of options for the question
         required: true,
      },
      correctAnswer: {
         type: [String], // Array to handle single or multiple correct answers
         required: true,
      },
   }
});

// Create the Assessment model
const Assessment = mongoose.model('Assessment', assessmentSchema);

module.exports = Assessment;