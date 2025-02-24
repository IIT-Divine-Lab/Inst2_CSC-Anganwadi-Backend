const mongoose = require("mongoose");
// const Joi = require("joi");

// Define the main Assessment schema
const dashboardSchema = new mongoose.Schema({
   assessId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "Result"
   },
   userId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "Student"
   },
   ageGroup: {
      type: String
   },
   gender: {
      type: String
   },
   attemptedQuestions: {
      type: Number
   },
   correctAnswers: {
      type: Number
   },
   maxCorrectAnswers: {
      type: Number
   },
   state: {
      type: String
   },
   district: {
      type: String
   },
   anganwadi: {
      type: String
   },
   schoolType: {
      type: String
   }
});

// Create the Assessment model
const Dashboard = mongoose.model('Dashboard', dashboardSchema);

module.exports = Dashboard;