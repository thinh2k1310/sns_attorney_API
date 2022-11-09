const express = require('express');

const userController = require('./user.controller');
const auth = require('../../middleware/auth');

const userRouter = express.Router();

userRouter.get('/profile', auth, userController.getProfile);
userRouter.put('/profile', auth, userController.updateUserProfile);


module.exports = userRouter;