const { search, getSearchMetrics } = require('../services/searchService');

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
    const results = await search(query);
    const endTime = Date.now();
    
    return res.json({
      results,
      count: results.length,
      time: endTime - startTime
    });
  } catch (error) {
    console.error('Error in search controller:', error);
    return res.status(500).json({ 
      message: 'Error processing search request' 
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

module.exports = {
  searchDocuments,
  getMetrics
};