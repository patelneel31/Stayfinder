const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const listingSchema = new Schema({
  title: {
    type: String,
    required: [true, "Title is required."],
  },
  description: {
    type: String,
    required: [true, "Description is required."],
  },
  image: {
    url: {
      type: String,
    },
    filename: {
      type: String,
    },
  },
  price: {
    type: Number,
    required: [true, "Price is required."],
    min: [0, "Price cannot be negative."],
  },
  location: {
    type: String,
    required: [true, "Location is required."],
  },
  country: {
    type: String,
    required: [true, "Country is required."],
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  
  geometry:  {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
});

// Middleware: Delete associated reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: { $in: doc.reviews },
    });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
