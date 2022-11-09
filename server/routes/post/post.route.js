const express = require('express');
const upload = require('../../services/multer');

// Bring in Models & Helpers
const auth = require('../../middleware/auth');

const postController = require('./post.controller');

const postRouter = express.Router();

postRouter.post('/create',auth,upload.array('image'), postController.createPost);

module.exports = postRouter;
