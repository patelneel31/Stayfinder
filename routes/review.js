const express = require("express");
const router = express.Router({ mergeParams: true });

const { createReview, deleteReview } = require("../controllers/review");

const {
  isLoggedIn,
  validateReview,
  isListingOwnerReviewDelete,
  preventOwnerFromReviewing,
} = require("../middleware");

const wrapAsync = require("../utils/wrapAsync");

// Create Review 
router.post(
  "/",
  isLoggedIn,                 
  preventOwnerFromReviewing,  
  validateReview,            
  wrapAsync(createReview)     
);

// Delete Review (Only the listing owner can delete reviews)
router.delete(
  "/:reviewId",
  isLoggedIn,                     
  isListingOwnerReviewDelete,      
  wrapAsync(deleteReview)     
);

module.exports = router;
