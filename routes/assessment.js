const express = require("express");
const { addNewQuestion, getQuestionAgeWise, getAll, deleteQuestion, getQuestionById, modifyQuestion } = require("../controller/assessmentController");
const multer = require("multer");

const router = express.Router();

// const storage = multer.diskStorage({
//    destination: (req, file, cb) => {
//       cb(null, "uploads/"); // Save files in "uploads" folder
//    },
//    filename: (req, file, cb) => {
//       cb(null, `${Date.now()}_${file.originalname}`);
//    }
// });

// const upload = multer({ storage });
const upload = multer({
   storage: multer.memoryStorage(),
   limits: {
      fieldSize: 100 * 1024 * 1024
   }
});

router.post("/", upload.any(), addNewQuestion);
router.put("/:id", upload.any(), modifyQuestion);
router.get("/", getAll);
router.post("/agewise", getQuestionAgeWise);
router.delete("/:id", deleteQuestion);
router.get("/:id", getQuestionById);

module.exports = router;