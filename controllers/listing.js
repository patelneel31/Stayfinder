const Listing = require("../models/listing");
const { cloudinary } = require("../cloudConfig");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const { Query } = require("mongoose");

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// Fetch all listings
module.exports.index = async (req, res) => {
  try {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
  } catch (err) {
    req.flash("error", "Cannot fetch listings right now.");
    res.redirect("/listings");
  }
};

// Show a specific listing
module.exports.show = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("owner");

    if (!listing) {
      req.flash("error", "Listing not found.");
      return res.redirect("/listings");
    }

    res.render("listings/show", { listing });
  } catch (err) {
    req.flash("error", "Something went wrong.");
    res.redirect("/listings");
  }
};

// Render the form to create a new listing
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};

// create a new listing
module.exports.create = async (req, res) => {
  try {
    const { listing } = req.body;

    // Geocode the location using Mapbox
    const response = await geocodingClient
      .forwardGeocode({
        query: listing.location, 
        limit: 1,
      })
      .send();

    const newListing = new Listing(listing);
    newListing.owner = req.user._id;
    // Set geometry from Mapbox geocoding result
    newListing.geometry = response.body.features[0]?.geometry || {
      type: "Point",
      coordinates: [0, 0],
    };
    // If file is uploaded (Cloudinary), store image info
    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }
    await newListing.save();
    req.flash("success", "New listing created!");
    res.redirect("/listings");
  } catch (err) {
    console.error("Listing creation failed:", err);
    req.flash("error", "Failed to create listing.");
    res.redirect("/listings/new");
  }
};


// Render the edit form for a specific listing
module.exports.renderEditForm = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      req.flash("error", "Listing not found.");
      return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace(
      "/upload",
      "/upload/h_300,w_250"
    );
    res.render("listings/edit", { listing, originalImageUrl });
  } catch (err) {
    req.flash("error", "Cannot fetch listing to edit.");
    res.redirect("/listings");
  }
};

// Update a listing
module.exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing not found.");
      return res.redirect("/listings");
    }

    // Update the image if a new one was uploaded
    if (req.file) {
      if (listing.image && listing.image.filename) {
        await cloudinary.uploader.destroy(listing.image.filename);
      }
      listing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    // Update other listing details
    const { title, description, price, country, location } = req.body.listing;
    listing.title = title;
    listing.description = description;
    listing.price = price;
    listing.country = country;
    listing.location = location;

    await listing.save();
    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    req.flash("error", "Failed to update listing.");
    res.redirect("/listings");
  }
};

// Delete a listing
module.exports.delete = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      req.flash("error", "Listing not found.");
      return res.redirect("/listings");
    }

    // Delete associated image from Cloudinary
    if (listing.image && listing.image.filename) {
      await cloudinary.uploader.destroy(listing.image.filename);
    }

    await listing.deleteOne();
    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
  } catch (err) {
    req.flash("error", "Failed to delete listing.");
    res.redirect("/listings");
  }
};
