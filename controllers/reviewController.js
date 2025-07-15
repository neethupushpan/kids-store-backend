const Review = require('../models/reviewModel');

// ✅ Create a new review
exports.createReview = async (req, res) => {
  try {
    const user = req.user._id;
    const { product, rating, comment } = req.body;

    if (!product || !rating || !comment) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

 const review = new Review({
  product,
  user: req.user._id,
  rating,
  comment,
});


    await review.save();

    res.status(201).json({ message: 'Review submitted', review });
  } catch (err) {
    console.error('❌ Failed to create review:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// ✅ Get all reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (err) {
    console.error('❌ getProductReviews error:', err.message);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// ✅ Get reviews by logged-in user
exports.getUserReviews = async (req, res) => {
  try {
    const user = req.user._id;

    const reviews = await Review.find({ user })
      .populate('product', 'name image');

    res.status(200).json(reviews);
  } catch (err) {
    console.error('❌ getUserReviews error:', err.message);
    res.status(500).json({ error: 'Failed to fetch your reviews' });
  }
};

// ✅ Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const user = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    if (review.user.toString() !== user.toString()) {
      return res.status(403).json({ error: 'Unauthorized to delete this review' });
    }

    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({ message: 'Review deleted' });
  } catch (err) {
    console.error('❌ deleteReview error:', err.message);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};
