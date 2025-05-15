// backend/routes/searchRoutes.js

const express = require('express');
const { searchDocuments, getMetrics, reindexDocuments } = require('../controllers/searchController');

const router = express.Router();

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search documents
 *     description: Search for documents based on a keyword query
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query
 *     responses:
 *       200:
 *         description: A list of documents matching the query
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       score:
 *                         type: number
 *                       context:
 *                         type: string
 *                 count:
 *                   type: integer
 *                 time:
 *                   type: integer
 *       400:
 *         description: Search query is required
 *       500:
 *         description: Error processing search request
 */
router.get('/', searchDocuments);

/**
 * @swagger
 * /api/search/metrics:
 *   get:
 *     summary: Get search metrics
 *     description: Get statistics about the search system
 *     responses:
 *       200:
 *         description: Search metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cacheSize:
 *                   type: integer
 *                 indexSize:
 *                   type: integer
 *                 documentCount:
 *                   type: integer
 *       500:
 *         description: Error retrieving search metrics
 */
router.get('/metrics', getMetrics);

/**
 * @swagger
 * /api/search/reindex:
 *   post:
 *     summary: Re-index all documents
 *     description: Force re-indexing of all documents, including new files
 *     responses:
 *       200:
 *         description: Documents indexed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 documentCount:
 *                   type: integer
 *       500:
 *         description: Error during indexing
 */
router.post('/reindex', reindexDocuments);

module.exports = router;