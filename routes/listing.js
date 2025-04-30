const express = require("express");
const router = express.Router();
const listings = require("../controllers/listing");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner, validateListing } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudConfig"); 
const upload = multer({ storage }); 

// Routes for listings
router
  .route("/")
  .get(wrapAsync(listings.index)) 
  .post(
    isLoggedIn,
    upload.single("image"), 
    validateListing,
    wrapAsync(listings.create) 
  );

router.get("/new", isLoggedIn, listings.renderNewForm); 

router
  .route("/:id")
  .get(wrapAsync(listings.show)) 
  .put(
    isLoggedIn,
    isOwner,
    upload.single("image"),
    validateListing,
    wrapAsync(listings.update)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listings.delete)); 

router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listings.renderEditForm)
); // Render edit form for a listing

module.exports = router;
