let mongoose = require("mongoose");
// const Joi = require("joi");
const categorySchema = new mongoose.Schema({
   categoryName: {
      type: String,
      required: true
   },
   structure: {
      type: Number,
      required: true
   },
   totalQuestions: {
      type: Number,
      required: true
   }
})

const Category = new mongoose.model("Category", categorySchema);

module.exports = Category;