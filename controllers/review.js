const Listing = require("../models/listing");
const Review = require("../models/review");
const ExpressError = require("../utils/ExpressError");

// Handle Review Creation (Allowing multiple reviews for a user)
module.exports.createReview = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ExpressError(404, "Listing not found");

  // Prevent the owner from reviewing their own listing
  if (listing.owner.equals(req.user._id)) {
    req.flash("error", "You cannot review your own listing.");
    return res.redirect(`/listings/${listing._id}`);
  }

  // Create the new review
  const review = new Review(req.body.review);
  review.author = req.user._id;
  review.listing = listing._id;

  listing.reviews.push(review); 

  await review.save();
  await listing.save();
  
  req.flash("success", "New review added");
  res.redirect(`/listings/${listing._id}`);
};


module.exports.deleteReview = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) throw new ExpressError(404, "Listing not found");

  listing.reviews.pull(reviewId);
  await listing.save();
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review deleted");
  res.redirect(`/listings/${id}`);
};
