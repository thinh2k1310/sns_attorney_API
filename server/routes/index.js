const express = require('express');

const router = express.Router();

//Router
const authRouter = require('./auth/auth.route');
const postRouter = require('./post/post.route');
const userRouter = require('./user/user.route');
const likeRouter = require('./like/like.route');
const commentRouter = require('./comment/comment.route');
const searchRouter = require('./search/search.route');
const friendRouter = require('./friend/friend.route');
const caseRouter = require('./case/case.route');
const reviewRouter = require('./review/review.route');
const caseCommentRouter = require('./caseComment/caseComment.route');

router.use('/auth', authRouter);
router.use('/post', postRouter);
router.use('/user', userRouter);
router.use('/like', likeRouter);
router.use('/comment', commentRouter);
router.use('/search',searchRouter);
router.use('/friend', friendRouter);
router.use('/case', caseRouter);
router.use('/review', reviewRouter);
router.use('/caseComment', caseCommentRouter);


module.exports = router;