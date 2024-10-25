const express = require("express");
const { addCategory, getAll, modifyCategory, deleteCategory } = require("../controller/categoryController");

const router = express.Router();

router.get("/", getAll);
router.post("/", addCategory);
router.put("/:id", modifyCategory);
router.delete("/:id", deleteCategory);

module.exports = router;