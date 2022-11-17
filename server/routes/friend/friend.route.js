const express = require('express');

// Bring in Models & Helpers
const auth = require('../../middleware/auth');

const friendController = require('./friend.controller');

const friendRouter = express.Router();

friendRouter.post('/request',auth, friendController.sendFriendRequest);
friendRouter.post('/request/:requestId/accept', auth, friendController.acceptRequest);
friendRouter.delete('/request/:requestId/cancel', auth, friendController.cancelRequest);
friendRouter.get('/request/', auth, friendController.getAllFriendRequests);
friendRouter.delete('/cancel', auth, friendController.cancelFriendShip);

module.exports = friendRouter;
