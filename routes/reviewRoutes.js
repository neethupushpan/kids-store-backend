const express = require('express');
const reviewRouter = express.Router();
const authUser = require('../middlewares/authUser');
const {
  createReview,
  getProductReviews,
  getUserReviews,
  deleteReview,
} = require('../controllers/reviewController');

// POST /api/reviews
reviewRouter.post('/', authUser, createReview);

// GET /api/reviews/:productId
reviewRouter.get('/:productId', getProductReviews);

// GET /api/reviews/my
reviewRouter.get('/my', authUser, getUserReviews);

// DELETE /api/reviews/:id
reviewRouter.delete('/:id', authUser, deleteReview);

module.exports = reviewRouter;
