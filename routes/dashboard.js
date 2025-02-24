const express = require("express");
const { getKpis, getDomainWise, getGenderCount } = require("../controller/dashboardController");

const router = express.Router();

router.get("/kpis", getKpis);
router.get("/domains", getDomainWise)
router.get("/gendercount", getGenderCount)

module.exports = router;