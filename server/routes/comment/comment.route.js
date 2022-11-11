const express = require('express');

// Bring in Models & Helpers
const auth = require('../../middleware/auth');

const commentController = require('./comment.controller');

const commentRouter = express.Router();

commentRouter.post('',auth, commentController.commentPost);
commentRouter.put('',auth, commentController.editComment);
commentRouter.delete('/:id',auth, commentController.deleteComment);

module.exports = commentRouter;
