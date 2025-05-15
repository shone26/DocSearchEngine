const { db } = require('../config/db');
const path = require('path');
const fs = require('fs');

/**
 * Get all documents
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getAllDocuments = async (req, res) => {
  try {
    const documents = await new Promise((resolve, reject) => {
      db.all(
        'SELECT id, title, path, created_at FROM documents',
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
    
    return res.json(documents);
  } catch (error) {
    console.error('Error getting documents:', error);
    return res.status(500).json({
      message: 'Error retrieving documents'
    });
  }
};

/**
 * Get document by ID or title
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching document with ID or title: ${id}`);
    
    // First try to get document by numeric ID
    if (!isNaN(id)) {
      const document = await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM documents WHERE id = ?',
          [id],
          (err, row) => {
            if (err) {
              reject(err);
            } else {
              resolve(row);
            }
          }
        );
      });
      
      if (document) {
        console.log(`Found document by numeric ID: ${id}`);
        return res.json(document);
      }
    }
    
    // If not found by numeric ID, try by title/filename
    const document = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM documents WHERE title = ?',
        [id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
    
    if (document) {
      console.log(`Found document by title: ${id}`);
      return res.json(document);
    }
    
    // If still not found, try to read directly from filesystem
    // This is useful for sample documents that might not be in DB
    const documentsDir = path.join(__dirname, '../data/documents');
    const filePath = path.join(documentsDir, id);
    
    console.log(`Checking filesystem for document: ${filePath}`);
    
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        console.log(`Found document in filesystem: ${id}`);
        
        // Return document data in same format as DB would
        return res.json({
          id: -1, // Use -1 to indicate file-based document
          title: id,
          content: content,
          path: filePath,
          created_at: new Date().toISOString()
        });
      } catch (readError) {
        console.error(`Error reading file ${filePath}:`, readError);
      }
    }
    
    // If not found in DB or filesystem, also check tmp directory
    const tmpDir = path.join(documentsDir, 'tmp');
    const tmpFilePath = path.join(tmpDir, id);
    
    console.log(`Checking tmp directory for document: ${tmpFilePath}`);
    
    if (fs.existsSync(tmpFilePath)) {
      try {
        const content = fs.readFileSync(tmpFilePath, 'utf-8');
        console.log(`Found document in tmp directory: ${id}`);
        
        // Return document data in same format as DB would
        return res.json({
          id: -1, // Use -1 to indicate file-based document
          title: id,
          content: content,
          path: tmpFilePath,
          created_at: new Date().toISOString()
        });
      } catch (readError) {
        console.error(`Error reading file ${tmpFilePath}:`, readError);
      }
    }
    
    // Document not found anywhere
    console.log(`Document not found: ${id}`);
    return res.status(404).json({
      message: 'Document not found'
    });
  } catch (error) {
    console.error('Error getting document:', error);
    return res.status(500).json({
      message: 'Error retrieving document'
    });
  }
};

module.exports = {
  getAllDocuments,
  getDocumentById
};