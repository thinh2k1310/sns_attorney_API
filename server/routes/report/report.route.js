const express = require('express');

// Bring in Models & Helpers
const auth = require('../../middleware/auth');

const reportController = require('./report.controller');

const reportRouter = express.Router();

reportRouter.post('',auth, reportController.report);
reportRouter.get('',auth, reportController.getAllReport);
reportRouter.get('/summary', auth, reportController.getSummaryReport);
reportRouter.get('/:id',auth, reportController.getAllUserReport);
reportRouter.delete('/:id',auth, reportController.deleteAReport);
reportRouter.delete('/all/:id',auth, reportController.deleteUserReport);

module.exports = reportRouter;
