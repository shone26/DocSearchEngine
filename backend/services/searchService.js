const { processText } = require('../utils/textProcessor');
const { tfidf } = require('../utils/tfidf');
const { 
  getInvertedIndex, 
  getDocumentTerms, 
  getDocumentContents, 
  getAllDocuments 
} = require('./indexService');
const { db } = require('../config/db');

/**
 * Search for documents matching the query
 * @param {string} query - The search query
 * @returns {Promise<Array>} - Array of search results
 */
const search = async (query) => {
  try {
    // Check cache first
    const cachedResults = await checkCache(query);
    if (cachedResults) {
      console.log(`Retrieved results for "${query}" from cache`);
      return JSON.parse(cachedResults);
    }
    
    console.log(`Searching for: "${query}"`);
    
    // Process the query text
    const queryTerms = processText(query);
    
    if (queryTerms.length === 0) {
      return [];
    }
    
    const invertedIndex = getInvertedIndex();
    const documentTerms = getDocumentTerms();
    const documentContents = getDocumentContents();
    const allDocuments = getAllDocuments();
    
    // Initialize document scores
    const scores = {};
    allDocuments.forEach(doc => {
      scores[doc] = 0;
    });
    
    // Calculate TF-IDF score for each query term and each document
    queryTerms.forEach(term => {
      // Skip terms not in the index
      if (!invertedIndex[term]) {
        return;
      }
      
      // Get documents containing this term
      const docsWithTerm = Object.keys(invertedIndex[term]);
      
      docsWithTerm.forEach(doc => {
        // Calculate TF-IDF score for this term in this document
        const termScore = tfidf(
          term,
          documentTerms[doc],
          Object.values(documentTerms)
        );
        
        // Add to document score
        scores[doc] += termScore;
      });
    });
    
    // Convert scores to array of results
    const results = Object.entries(scores)
      .map(([docId, score]) => {
        // Skip documents with zero score
        if (score === 0) {
          return null;
        }
        
        // Get document content
        const content = documentContents[docId];
        
        // Extract context snippet that contains query terms
        const context = extractContext(content, queryTerms);
        
        return {
          id: docId,
          title: docId.replace(/_/g, ' ').replace('.txt', ''),
          score,
          context
        };
      })
      .filter(result => result !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Limit to top 10 results
    
    // Cache the results
    await cacheResults(query, results);
    
    return results;
  } catch (error) {
    console.error('Error in search:', error);
    throw error;
  }
};

/**
 * Extract context snippet from document content
 * @param {string} content - Document content
 * @param {string[]} queryTerms - Query terms
 * @returns {string} - Context snippet
 */
const extractContext = (content, queryTerms) => {
  if (!content) return '';
  
  // Convert content to lowercase for case-insensitive matching
  const lowerContent = content.toLowerCase();
  
  // Find the best match position for the first query term
  let bestPos = -1;
  let bestTerm = '';
  
  queryTerms.forEach(term => {
    const pos = lowerContent.indexOf(term);
    if (pos !== -1 && (bestPos === -1 || pos < bestPos)) {
      bestPos = pos;
      bestTerm = term;
    }
  });
  
  // If no term found, return beginning of content
  if (bestPos === -1) {
    return content.substring(0, 200) + '...';
  }
  
  // Calculate start and end positions for context
  const contextSize = 200;
  let startPos = Math.max(0, bestPos - contextSize / 2);
  let endPos = Math.min(content.length, bestPos + bestTerm.length + contextSize / 2);
  
  // Adjust to word boundaries
  while (startPos > 0 && content[startPos] !== ' ' && content[startPos] !== '\n') {
    startPos--;
  }
  
  while (endPos < content.length && content[endPos] !== ' ' && content[endPos] !== '\n') {
    endPos++;
  }
  
  // Extract context
  let context = content.substring(startPos, endPos);
  
  // Add ellipsis if needed
  if (startPos > 0) {
    context = '...' + context;
  }
  
  if (endPos < content.length) {
    context = context + '...';
  }
  
  // Highlight matching terms
  queryTerms.forEach(term => {
    const regex = new RegExp(term, 'gi');
    context = context.replace(regex, match => `<mark>${match}</mark>`);
  });
  
  return context;
};

/**
 * Check cache for search query
 * @param {string} query - The search query
 * @returns {Promise<string|null>} - Cached results or null
 */
const checkCache = (query) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT results FROM search_cache WHERE query = ? AND created_at > datetime("now", "-1 hour")',
      [query.toLowerCase()],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row.results : null);
        }
      }
    );
  });
};

/**
 * Cache search results
 * @param {string} query - The search query
 * @param {Array} results - Search results
 * @returns {Promise<void>}
 */
const cacheResults = (query, results) => {
  return new Promise((resolve, reject) => {
    const resultsJson = JSON.stringify(results);
    
    db.run(
      'INSERT OR REPLACE INTO search_cache (query, results) VALUES (?, ?)',
      [query.toLowerCase(), resultsJson],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

/**
 * Get search performance metrics
 * @returns {Promise<Object>} - Performance metrics
 */
const getSearchMetrics = async () => {
  try {
    // Get cache hit rate
    const cacheStats = await new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) as total FROM search_cache',
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
    
    return {
      cacheSize: cacheStats.total,
      indexSize: Object.keys(getInvertedIndex()).length,
      documentCount: getAllDocuments().length
    };
  } catch (error) {
    console.error('Error getting search metrics:', error);
    throw error;
  }
};

module.exports = {
  search,
  getSearchMetrics
};
