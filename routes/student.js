const express = require("express");
const { userRegister, getAll, patchAssessment } = require("../controller/studentController")

const router = express.Router();

router.get("/", getAll);
router.post("/", userRegister);
router.patch("/:userId", patchAssessment);

module.exports = router;