const express = require('express');

// Bring in Models & Helpers
const auth = require('../../middleware/auth');

const likeController = require('./like.controller');

const likeRouter = express.Router();

likeRouter.post('',auth, likeController.likePost);

module.exports = likeRouter;
