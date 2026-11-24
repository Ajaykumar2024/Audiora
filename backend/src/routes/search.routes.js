const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');

// Public search endpoint - no authentication required
router.get('/', searchController.search);

module.exports = router;
