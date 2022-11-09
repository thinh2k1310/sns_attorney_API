const express = require('express');

const router = express.Router();

//Router
const authRouter = require('./auth/auth.route');
const postRouter = require('./post/post.route');

router.use('/auth', authRouter);
router.use('/post', postRouter);

module.exports = router;