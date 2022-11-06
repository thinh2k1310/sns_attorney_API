const express =require('express');
const passport = require('passport');

const auth = require('../../middleware/auth');

const authController = require('./auth.controller');

const authRouter = express.Router();

authRouter.post('/login', authController.login);

authRouter.post('/register', authController.register);

authRouter.put('/validate', authController.validateWithOTP);

authRouter.put('/sendOTP', authController.sendOTP)

authRouter.post('/password/forgot',authController.forgotPassword);

authRouter.put('/password/reset/',authController.resetPassword);

authRouter.put('/password/change',auth,authController.changePassword);


module.exports = authRouter;
