const express = require('express');

// Bring in Models & Helpers
const auth = require('../../middleware/auth');

const reviewController = require('./review.controller');

const reviewRouter = express.Router();

reviewRouter.post('',auth, reviewController.reviewCase);
reviewRouter.get('/:userId',auth, reviewController.getAllReviews);

module.exports = reviewRouter;
