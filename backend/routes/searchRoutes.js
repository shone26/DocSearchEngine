const express = require('express');
const { searchDocuments, getMetrics } = require('../controllers/searchController');

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

module.exports = router;