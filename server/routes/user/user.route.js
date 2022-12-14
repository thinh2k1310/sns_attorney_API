const express = require('express');

const userController = require('./user.controller');
const auth = require('../../middleware/auth');
const upload = require('../../services/multer');

const userRouter = express.Router();

userRouter.get('/:id', auth, userController.getProfile);
userRouter.post('/:id/block', auth, userController.blockUser);
userRouter.put('/profile', auth, userController.updateUserProfile);
userRouter.put('/avatar',auth,upload.array('media'), userController.updateAvatar);
userRouter.put('/cover',auth,upload.array('media'), userController.updateCover);


module.exports = userRouter;