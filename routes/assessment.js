const express = require("express");
const { addNewQuestion, getQuestionAgeWise, getAll, deleteQuestion, getQuestionById } = require("../controller/assessmentController")

const router = express.Router();

router.post("/", addNewQuestion);
router.get("/", getAll);
router.post("/agewise", getQuestionAgeWise);
router.delete("/:id", deleteQuestion);
router.get("/:id", getQuestionById);

module.exports = router;