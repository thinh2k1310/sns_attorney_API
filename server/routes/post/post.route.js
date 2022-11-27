const express = require('express');
const upload = require('../../services/multer');

// Bring in Models & Helpers
const auth = require('../../middleware/auth');

const postController = require('./post.controller');

const postRouter = express.Router();

postRouter.post('/create',auth,upload.array('media'), postController.createPost);
postRouter.get('/:id', auth, postController.getDetailPost);
postRouter.post('/news', postController.fetchNewsFeed);
postRouter.get('/:id/comments', auth, postController.getPostComments);
postRouter.delete('/:id', auth, postController.deletePost);
postRouter.put('/:id', auth, postController.updatePost);

module.exports = postRouter;
