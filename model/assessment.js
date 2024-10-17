const mongoose = require("mongoose");
// const Joi = require("joi");

const mongoose = require('mongoose');

// Define the schema for a question object
const questionSchema = new mongoose.Schema({
   questionText: {
      type: String,
      required: true,
   },
   questionType: {
      type: String, // Can be 'single-choice' or 'multiple-choice'
      required: true,
   },
   options: [{
      type: String,  // List of options for the question
      required: true,
   }],
   correctAnswer: {
      type: [String], // Array to handle single or multiple correct answers
      required: true,
   },
});

// Define the main Assessment schema
const assessmentSchema = new mongoose.Schema({
   userId: {
      type: mongoose.Schema.ObjectId,
      required: true,
   },
   ageGroup: {
      type: String,  // E.g., '6-8', '9-12', etc.
      required: true,
   },
   questions: [questionSchema]  // Array of question objects
});

// Create the Assessment model
const Assessment = mongoose.model('Assessment', assessmentSchema);

module.exports = Assessment;