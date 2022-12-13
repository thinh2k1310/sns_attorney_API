const express = require('express');
const passport = require('passport');

const moderatorController = require('./moderator.controller');
const auth = require('../../middleware/auth');

const moderatorRouter = express.Router();

moderatorRouter.get('/', auth, moderatorController.getModerators);
moderatorRouter.post('/', auth, moderatorController.createModerator);
moderatorRouter.delete('/:id', auth, moderatorController.deleteModerator);
moderatorRouter.patch('/:id', auth, moderatorController.updateModerator);

module.exports = moderatorRouter;