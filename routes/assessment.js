const express = require("express");
const { submitAssessment } = require("../controller/assessmentController")

const router = express.Router();

router.post("/:userId", userRegister);

module.exports = router;