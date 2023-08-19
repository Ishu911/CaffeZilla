const express = require("express");
const router = express.Router({mergeParams: true});
const catchAsync = require("../utils/CatchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const Review = require("../models/review");
const {reviewSchema} = require("../schemas.js");
const {isLoggedIn} = require("../middleware")
const {validateReview, isReviewAuthor} = require("../middleware")
const reviews = require("../controllers/reviews")


router.post("/", isLoggedIn,validateReview, catchAsync(reviews.createReview));

router.delete("/:reviewId", isLoggedIn , isReviewAuthor,catchAsync( reviews.deleteReview));

module.exports = router;