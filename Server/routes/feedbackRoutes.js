const express = require("express");
const router = express.Router();
const {
  addReview,
  addQuestion,
  getReviews,
  getQuestions,
} = require("../Controller/feedbackController");
const authMiddleware = require("../Middleware/userAuth");

router.post("/review", authMiddleware, addReview);
router.post("/question", authMiddleware, addQuestion);
router.get("/review/:productId", getReviews);
router.get("/question/:productId", getQuestions);

module.exports = router;
