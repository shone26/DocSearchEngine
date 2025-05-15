const express = require('express');
const { searchDocuments, getMetrics } = require('../controllers/searchController');

const router = express.Router();

/**
 * @route   GET /api/search
 * @desc    Search documents
 * @access  Public
 */
router.get('/', searchDocuments);

/**
 * @route   GET /api/search/metrics
 * @desc    Get search metrics
 * @access  Public
 */
router.get('/metrics', getMetrics);

module.exports = router;