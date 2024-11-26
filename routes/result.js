const express = require("express");
const { submitAssessment, getAll, getAllWithNoUserDetails } = require("../controller/resultController");

const router = express.Router();

router.get("/", getAll);
router.post("/", submitAssessment);
router.get("/special", getAllWithNoUserDetails);
// router.patch("/:userId", patchAssessment);

module.exports = router;