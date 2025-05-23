// backend/controllers/searchController.js

const { search, getSearchMetrics } = require('../services/searchService');
const { initializeIndex } = require('../services/indexService');

/**
 * Handle search request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const searchDocuments = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ 
        message: 'Search query is required' 
      });
    }
    
    const startTime = Date.now();
    const searchResults = await search(query);
    const endTime = Date.now();
    
    // Extract actual results and debug info
    const { results, debug } = searchResults;
    
    return res.json({
      results,
      count: results.length,
      time: endTime - startTime,
      debug: debug // Include debug info in response
    });
  } catch (error) {
    console.error('Error in search controller:', error);
    return res.status(500).json({ 
      message: 'Error processing search request',
      error: error.message 
    });
  }
};

/**
 * Get search metrics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getMetrics = async (req, res) => {
  try {
    const metrics = await getSearchMetrics();
    return res.json(metrics);
  } catch (error) {
    console.error('Error getting metrics:', error);
    return res.status(500).json({
      message: 'Error retrieving search metrics'
    });
  }
};

/**
 * Force reindexing of all documents
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const reindexDocuments = async (req, res) => {
  try {
    console.log('Manual reindexing requested');
    await initializeIndex();
    
    const metrics = await getSearchMetrics();
    
    return res.json({
      message: 'Documents successfully reindexed',
      documentCount: metrics.documentCount
    });
  } catch (error) {
    console.error('Error reindexing documents:', error);
    return res.status(500).json({
      message: 'Error reindexing documents',
      error: error.message
    });
  }
};

module.exports = {
  searchDocuments,
  getMetrics,
  reindexDocuments
};