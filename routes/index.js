const express = require('express');

const router = express.Router();

//Router
const authRouter = require('./auth/auth.route');

router.use('/auth', authRouter);

module.exports = router;