// backend/services/indexService.js

const fs = require('fs');
const path = require('path');
const { db } = require('../config/db');
const { processText } = require('../utils/textProcessor');

// In-Memory inverted index
let invertedIndex = {};
let documentTerms = {};
let documentContents = {};

/**
 * Initialize the inverted index from the document collection.
 */
const initializeIndex = async () => {
    console.log('Initializing inverted index...');

    try {
        // Clear existing index data
        invertedIndex = {};
        documentTerms = {};
        documentContents = {};
        
        // First load documents from the database
        const documents = await getDocumentsFromDb();
        if (documents.length > 0) {
            console.log(`Found ${documents.length} documents in database`);
            buildIndexFromDocuments(documents);
        }
        
        // Also check for any new documents in the filesystem
        console.log('Checking for new documents in filesystem...');
        await loadNewDocumentsFromFiles();
        
        console.log(`Inverted index built with ${Object.keys(invertedIndex).length} unique terms.`);
        // Log some sample terms from the index
        const sampleTerms = Object.keys(invertedIndex).slice(0, 10);
        console.log('Sample terms in index:', sampleTerms);
    } catch (error) {
        console.error('Error initializing inverted index:', error);
    }
};

/**
 * Get documents from the database.
 * @returns {Promise<Array>} - Array of documents
 */
const getDocumentsFromDb = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM documents', (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows || []);
            }
        });
    });
};

/**
 * Get list of existing document titles from database
 * @returns {Promise<Array>} - Array of document title objects
 */
const getExistingDocumentTitles = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT title FROM documents', (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows || []);
            }
        });
    });
};

/**
 * Load new documents from files that don't exist in the database yet
 */
const loadNewDocumentsFromFiles = async () => {
    const documentsDir = path.join(__dirname, '../data/documents');
    console.log('Documents directory path:', documentsDir);

    // Create directory if it does not exist
    if (!fs.existsSync(documentsDir)) {
        fs.mkdirSync(documentsDir, { recursive: true });
        console.log('Document directory created:', documentsDir);
    }

    // Get list of existing document titles from database
    const existingDocs = await getExistingDocumentTitles();
    const existingTitles = new Set(existingDocs.map(doc => doc.title));
    console.log('Existing document titles in database:', Array.from(existingTitles));

    // Read all files in the directory (don't recurse into subdirectories)
    const files = fs.readdirSync(documentsDir)
        .filter(file => file.endsWith('.txt'));
        
    console.log(`Found ${files.length} document files in directory:`, files);

    let newDocumentsAdded = 0;
    
    for (const file of files) {
        try {
            // Skip files that already exist in the database
            if (existingTitles.has(file)) {
                console.log(`Skipping existing document: ${file}`);
                continue;
            }
            
            const filePath = path.join(documentsDir, file);
            
            // Skip directories
            if (fs.lstatSync(filePath).isDirectory()) {
                console.log(`Skipping directory: ${filePath}`);
                continue;
            }
            
            const content = fs.readFileSync(filePath, 'utf-8');
            console.log(`Processing new document: ${file} (${content.length} bytes)`);

            // Insert document into database
            await insertDocument(file, content, filePath);
            newDocumentsAdded++;

            // Process the document content
            const terms = processText(content);
            console.log(`Extracted ${terms.length} terms from document ${file}`);
            documentTerms[file] = terms;
            documentContents[file] = content;

            // Update the inverted index
            updateInvertedIndex(file, terms);
            console.log(`Updated inverted index with document ${file}`);
        } catch (error) {
            console.error(`Error processing document ${file}:`, error);
            // Continue with next document instead of failing
        }
    }
    
    console.log(`Added ${newDocumentsAdded} new documents to the index`);
    
    // Verify all documents were processed
    const documentIds = Object.keys(documentTerms);
    console.log(`Total documents indexed: ${documentIds.length}. Document IDs:`, documentIds);
};

/**
 * Load documents from files in the data directory.
 * This function is used when database is empty.
 */
const loadDocumentsFromFiles = async () => {
    const documentsDir = path.join(__dirname, '../data/documents');
    console.log('Documents directory path:', documentsDir);

    // Create directory if it does not exist
    if (!fs.existsSync(documentsDir)) {
        fs.mkdirSync(documentsDir, { recursive: true });
        console.log('Document directory created:', documentsDir);
    }

    // Read all files in the directory (don't recurse into subdirectories)
    const files = fs.readdirSync(documentsDir)
        .filter(file => file.endsWith('.txt'));
        
    console.log(`Found ${files.length} document files in directory:`, files);

    for (const file of files) {
        try {
            const filePath = path.join(documentsDir, file);
            
            // Skip directories
            if (fs.lstatSync(filePath).isDirectory()) {
                console.log(`Skipping directory: ${filePath}`);
                continue;
            }
            
            const content = fs.readFileSync(filePath, 'utf-8');
            console.log(`Processing document: ${file} (${content.length} bytes)`);

            // Insert document into database
            await insertDocument(file, content, filePath);

            // Process the document content
            const terms = processText(content);
            console.log(`Extracted ${terms.length} terms from document ${file}`);
            documentTerms[file] = terms;
            documentContents[file] = content;

            // Update the inverted index
            updateInvertedIndex(file, terms);
            console.log(`Updated inverted index with document ${file}`);
        } catch (error) {
            console.error(`Error processing document ${file}:`, error);
            // Continue with next document instead of failing
        }
    }
    
    // Verify all documents were processed
    const documentIds = Object.keys(documentTerms);
    console.log(`Total documents indexed: ${documentIds.length}. Document IDs:`, documentIds);
};

/**
 * Insert a document into the database
 * @param {string} title - Document title
 * @param {string} content - Document content
 * @param {string} filePath - Path to the document file
 * @returns {Promise<void>}
 */
const insertDocument = (title, content, filePath) => {
    return new Promise((resolve, reject) => {
        console.log(`Inserting document into database: ${title}`);
        
        db.run(
            'INSERT INTO documents (title, content, path) VALUES (?, ?, ?)',
            [title, content, filePath],
            function (err) {
                if (err) {
                    console.error(`Database insertion error for ${title}:`, err);
                    reject(err);
                } else {
                    console.log(`Document inserted successfully: ${title}, ID: ${this.lastID}`);
                    resolve(this.lastID);
                }
            }
        );
    });
};

/**
 * Build inverted index from database documents
 * @param {Array} documents - Array of document objects
 */
const buildIndexFromDocuments = (documents) => {
    console.log(`Building index from ${documents.length} database documents`);
    
    documents.forEach(doc => {
        try {
            const { id, title, content } = doc;
            
            console.log(`Processing database document: ${title} (ID: ${id})`);
            
            const terms = processText(content);
            console.log(`Extracted ${terms.length} terms from document ${title}`);
            
            documentTerms[title] = terms;
            documentContents[title] = content;
            updateInvertedIndex(title, terms);
            
            console.log(`Updated inverted index with document ${title}`);
        } catch (error) {
            console.error(`Error processing database document:`, error);
            // Continue processing other documents
        }
    });
    
    // Verify multiple documents were processed
    const documentIds = Object.keys(documentTerms);
    console.log(`Processed ${documentIds.length} documents from database. Document IDs:`, documentIds);
};

/**
 * Update inverted index with terms from a document
 * @param {string} docId - Document identifier
 * @param {string[]} terms - Array of terms in the document
 */
const updateInvertedIndex = (docId, terms) => {
    // Count term frequency in document
    const termFrequency = {};

    terms.forEach(term => {
        if (!termFrequency[term]) {
            termFrequency[term] = 0;
        }
        termFrequency[term]++;
    });

    // Update inverted index
    Object.keys(termFrequency).forEach(term => {
        if (!invertedIndex[term]) {
            invertedIndex[term] = {};
        }
        invertedIndex[term][docId] = termFrequency[term];
    });
};

/**
 * Get the inverted index
 * @returns {Object} - The inverted index
 */
const getInvertedIndex = () => {
    return invertedIndex;
};

/**
 * Get document terms
 * @returns {Object} - Document terms map
 */
const getDocumentTerms = () => {
    return documentTerms;
};

/**
 * Get document contents
 * @returns {Object} - Document contents map
 */
const getDocumentContents = () => {
    return documentContents;
};

/**
 * Get list of all documents
 * @returns {string[]} - Array of document IDs
 */
const getAllDocuments = () => {
    const documentIds = Object.keys(documentTerms);
    console.log(`getAllDocuments returning ${documentIds.length} document IDs:`, documentIds);
    return documentIds;
};

module.exports = {
    initializeIndex,
    getInvertedIndex,
    getDocumentTerms,
    getDocumentContents,
    getAllDocuments
};