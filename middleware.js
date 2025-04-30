const Listing = require("./models/listing.js");
const { listingSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
const { reviewSchema } = require("./schema.js");
const review = require("./models/review.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

// Validation Middleware
module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  }
  next();
};

// Validate Review Middleware
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};


// onwer exits
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  // Check if listing exists
  if (!Listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  // Check if the logged-in user is the owner of the listing
  if (!listing.owner || !listing.owner.equals(req.user._id)) {
    req.flash("error", "You don't have permission to perform this action.");
    return res.redirect(`/listings/${id}`);
  }

  next();
};



// review handle 
module.exports.isListingOwnerReviewDelete = async (req, res, next) => {
  const { id, reviewId } = req.params; 
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }  
  if (!listing.owner.equals(res.locals.currentUser._id)) {
    req.flash("error", "Only the listing owner can delete reviews.");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

/// Prevent the listing owner from reviewing their own listing
module.exports.preventOwnerFromReviewing = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  // Prevent the owner from reviewing their own listing
  if (listing.owner.equals(res.locals.currentUser._id)) {
    req.flash("error", "You cannot review your own listing.");
    return res.redirect(`/listings/${id}`);
  }

  next();
};
