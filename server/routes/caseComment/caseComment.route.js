const express = require('express');

// Bring in Models & Helpers
const auth = require('../../middleware/auth');

const caseCommentController = require('./caseComment.controller');

const caseCommentRouter = express.Router();

caseCommentRouter.post('',auth, caseCommentController.commentCase);
caseCommentRouter.delete('/:id',auth, caseCommentController.deleteComment);

module.exports = caseCommentRouter;
