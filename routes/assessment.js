const express = require("express");
const { addNewQuestion, getQuestionAgeWise } = require("../controller/assessmentController")

const router = express.Router();

router.post("/", addNewQuestion);
router.post("/agewise", getQuestionAgeWise);

module.exports = router;