const express = require('express');
const { getAllDocuments, getDocumentById } = require('../controllers/documentController');

const router = express.Router();

/**
 * @route   GET /api/documents
 * @desc    Get all documents
 * @access  Public
 */
router.get('/', getAllDocuments);

/**
 * @route   GET /api/documents/:id
 * @desc    Get document by ID
 * @access  Public
 */
router.get('/:id', getDocumentById);

module.exports = router;