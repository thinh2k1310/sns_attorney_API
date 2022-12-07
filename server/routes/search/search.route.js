const express = require('express');

const searchController = require('./search.controller');

const searchRouter = express.Router();

searchRouter.post('/all', searchController.searchAll);
searchRouter.post('/posts', searchController.searchPost);
searchRouter.post('/users', searchController.searchUser);
searchRouter.post('/attorneys', searchController.getAttorneys)

module.exports = searchRouter;
