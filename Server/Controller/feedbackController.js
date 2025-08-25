const { Review, Question } = require("../Model/productFeedback");

// POST /api/review
const addReview = async (req, res) => {
  try {
    const { productId, comment } = req.body;
    const userId = req.user.id;

    const review = new Review({ productId, userId, comment });
    await review.save();

    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/question
const addQuestion = async (req, res) => {
  try {
    const { productId, question } = req.body;
    const userId = req.user.id;

    const newQuestion = new Question({ productId, userId, question });
    await newQuestion.save();

    res.status(201).json({ success: true, question: newQuestion });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/review/:productId
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).populate("userId", "name");
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/question/:productId
const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ productId: req.params.productId }).populate("userId", "name");
    res.json({ success: true, questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  addReview,
  addQuestion,
  getReviews,
  getQuestions,
};
