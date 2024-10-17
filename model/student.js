let mongoose = require("mongoose");
// const Joi = require("joi");
const studentSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true
   },
   age: {
      type: String,
      required: true
   },
   rollno: {
      type: Number,
      required: true
   },
   class: {
      type: String,
   },
   gender: {
      type: String,
      enum: ["male", "female"]
   },
   awcentre: {
      type: String,
      required: true
   },
   assessId: {
      type: mongoose.Schema.ObjectId
   }
})

const Student = new mongoose.model("Student", studentSchema);

module.exports = Student;