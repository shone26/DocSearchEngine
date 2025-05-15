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
 * Get document by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    
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
    
    if (!document) {
      return res.status(404).json({
        message: 'Document not found'
      });
    }
    
    return res.json(document);
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