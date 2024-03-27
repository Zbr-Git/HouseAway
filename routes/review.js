const express = require('express');
const router = express.Router({ mergeParams: true });
const Review = require('../models/review.js');
const Listing = require('../models/listing.js');
const wrapAsync = require('../utils/wrapAsync.js');
const { validateReview } = require('../middleware.js');
// Reviews
// Post Route
router.post(
  '/',
  validateReview,
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);

    const newReview = new Review(req.body.review);
    await newReview.save();

    listing.reviews.push(newReview);
    await listing.save();

    res.redirect(`/listings/${req.params.id}`); // Redirect to the listing page
  })
);

//Delete Review Route
router.delete(
  '/:reviewId',
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}#reviews`);
  })
);

module.exports = router;
