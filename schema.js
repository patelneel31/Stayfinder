const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().required().min(0),
    // image: Joi.object({
    //   filename: Joi.string().required(),
    //   url: Joi.string().allow("", null) 
    // }).required()
  }).unknown(true) 
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().min(3).required()
  }).required()
});
