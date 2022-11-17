const express = require('express');

// Bring in Models & Helpers
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

const caseController = require('./case.controller');

const caseRouter = express.Router();

caseRouter.post('/request',auth, role.checkRole(role.ROLES.Attorney), caseController.sendDefenceRequest);
caseRouter.put('/request/:requestId/accept', auth, caseController.acceptCase);
caseRouter.delete('/request/:requestId/cancel', auth, caseController.cancelRequest);
caseRouter.get('/request/', auth, caseController.getAllDefenceRequests);
caseRouter.get('/list', auth, caseController.getAllCases);
caseRouter.put('/:caseId/cancel', auth, caseController.cancelCase);
caseRouter.put('/:caseId/complete', auth, role.checkRole(role.ROLES.User), caseController.completeCase);


module.exports = caseRouter;
