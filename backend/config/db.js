const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = path.join(__dirname, '../data/document_retrieval.db');

const initializeDatabase = () => {
    db.serialize(()=>
    {
        // Create documents table
        db.run(`
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                path TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create cache table for search queries
        db.run(`
            CREATE TABLE IF NOT EXISTS cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                query TEXT NOT NULL UNIQUE,
                results TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Database initialized successfully');
    });
    module.exports = {
        db,
        initializeDatabase
    };
}
