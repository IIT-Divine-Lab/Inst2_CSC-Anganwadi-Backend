const express = require("express");
const { submitAssessment } = require("../controller/resultController");

const router = express.Router();

// router.get("/", getAll);
router.post("/", submitAssessment);
// router.patch("/:userId", patchAssessment);

module.exports = router;