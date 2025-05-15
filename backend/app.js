const express = require('express'); 
const cors = require('cors');
const morgan = require('morgan');
const documentRoutes = require('./routes/documentRoutes');
const searchRoutes = require('./routes/searchRoutes');
const { initializeDatabase } = require('./config/db');
const { initializeIndex } = require('./services/indexService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

//initialize the database
initializeDatabase();


// Initialize inverted index
initializeIndex();

// Routes
app.use('/api/documents', documentRoutes);
app.use('/api/search', searchRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('Welcome to the Document Search API. Document Retrieval System API is running');
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


module.exports = app;