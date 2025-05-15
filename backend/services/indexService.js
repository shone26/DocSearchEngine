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
        // First check if we have any documents in the database.
        const documents = await getDocumentsFromDB();

        if (document.length === 0) {
            // if not, load from the filesystem
            await loadDocumentsFromFile();
        } else {
            // Otherwise build index from DB
            buildIndexFromDocuments(documents);
        }
        console.log(`Inverted index built with ${Object.keys(invertedIndex).length} unique terms.`);
    } catch (error) {
        console.error('Error initializing inverted index:', error);
    }
};

/**
 * Get documents from the database.
 * @returns {Promise<Array>} - Array of documents
 */

const getDocumentsFromDB = () => {
    return new Promise((resolve, reject) => {
        db.matchAll('SELECT * FROM documents', (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

/**
 * Load documents from files in the data directory.
 */

const loadDocumentsFromFile = async () => {
    const documentDir = path.join(__dirname, '../data/documents');

    // Create directory if it does not exist
    if (fs.existsSync(documentDir)) {
        fs.mkdirSync(documentDir, { recursive: true });
        console.log('Document directory created:', documentDir);

        // create some sample documents for testing
        createSampleDocuments();

    }


    // Read all files in the directory
    const files = fs.readdirSync(documentDir).filter(file => file.endsWith('.txt'));

    for (const file of files) {
        const filePath = path.join(documentDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const title = file.replace('.txt', '');

        // Insert document into database
        await insertDocumentToDB(title, content, filePath);

        // Process the document content
        const terms = processText(content);
        documentTerms[title] = terms;
        documentContents[title] = content;

        // Update the inverted index
        updateInvertedIndex(terms, title);
    }
};

/**
 * Create sample documents for testing.
 */

const createSampleDocuments = () => {
    const documentsDir = path.join(__dirname, '../data/documents');

    // Sample document topics
    const topics = [
        'Introduction to Artificial Intelligence',
        'Web Development Basics',
        'Data Structures and Algorithms',
        'Machine Learning Fundamentals',
        'Database Systems Overview',
        'Modern JavaScript Frameworks',
        'Cloud Computing Services',
        'Mobile App Development',
        'Computer Networks',
        'Cybersecurity Principles',
        'Operating Systems Architecture',
        'Software Engineering Practices',
        'User Experience Design',
        'Big Data Analytics',
        'Internet of Things',
        'Blockchain Technology',
        'Quantum Computing',
        'Augmented and Virtual Reality',
        'Natural Language Processing',
        'Robotics and Automation'
      ];

      // Create sample content for each topic
      topics.forEach((topic, index) => {
        const fileName = `sample_doc_${index + 1}.txt`;
        const filePath = path.join(documentsDir, fileName);

        // Generate content with relevant keywords for the topic
        const content = generateSampleContent(topic);

        fs.writeFileSync(filePath, content);
        console.log(`Sample document created: ${fileName}`);
      });
}

/**
 * Generate sample content for a given topic.
 * @param {string} topic - The topic for which to generate content.
 */
const generateSampleContent = (topic) => {
    const paragraph = [];

    // Add topic as title
    paragraph.push(`# ${topic}\n`);

    // First paragraph with introduction
    paragraphs.push(`${topic} is an important area in computer science and technology. This document provides an overview of key concepts and applications in this field.`);

    // Generate 2-5 paragraphs of content
    const numParagraphs = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < numParagraphs; i++) {
        paragraph.push(paragraph);
    }

    // Conclusion paragraph
    paragraphs.push(`In conclusion, ${topic} continues to evolve and offers many exciting opportunities for research and application in various domains.`);
    return paragraphs.join('\n\n');
};

/**
 * Generate a paragraph for a specific topic
 * @param {string} topic - The topic
 * @param {number} paragraphIndex - Index of the paragraph
 * @returns {string} - Generated paragraph
 */
const generateParagraphForTopic = (topic, paragraphIndex) => {
    // Keywords related to topics
    const topicKeywords = {
      'Introduction to Artificial Intelligence': ['machine learning', 'neural networks', 'expert systems', 'knowledge representation', 'problem solving', 'reasoning', 'perception', 'natural language understanding'],
      'Web Development Basics': ['HTML', 'CSS', 'JavaScript', 'responsive design', 'frontend', 'backend', 'API', 'HTTP', 'DOM', 'frameworks'],
      'Data Structures and Algorithms': ['arrays', 'linked lists', 'trees', 'graphs', 'sorting', 'searching', 'dynamic programming', 'complexity analysis', 'big O notation'],
      'Machine Learning Fundamentals': ['supervised learning', 'unsupervised learning', 'reinforcement learning', 'classification', 'regression', 'clustering', 'overfitting', 'training data'],
      'Database Systems Overview': ['SQL', 'NoSQL', 'relational databases', 'ACID properties', 'indexing', 'normalization', 'query optimization', 'transactions'],
      'Modern JavaScript Frameworks': ['React', 'Angular', 'Vue', 'Node.js', 'Express', 'components', 'state management', 'routing', 'hooks', 'virtual DOM'],
      'Cloud Computing Services': ['IaaS', 'PaaS', 'SaaS', 'public cloud', 'private cloud', 'hybrid cloud', 'scalability', 'AWS', 'Azure', 'Google Cloud'],
      'Mobile App Development': ['native apps', 'hybrid apps', 'React Native', 'Flutter', 'iOS', 'Android', 'responsive design', 'app store', 'user experience'],
      'Computer Networks': ['TCP/IP', 'OSI model', 'routing', 'switching', 'protocols', 'IP addressing', 'subnetting', 'network security', 'DNS'],
      'Cybersecurity Principles': ['encryption', 'authentication', 'authorization', 'firewalls', 'penetration testing', 'vulnerability assessment', 'intrusion detection', 'security policies'],
      'Operating Systems Architecture': ['kernel', 'process management', 'memory management', 'file systems', 'I/O systems', 'virtualization', 'scheduling algorithms', 'concurrency'],
      'Software Engineering Practices': ['agile methodology', 'scrum', 'version control', 'continuous integration', 'testing', 'code review', 'design patterns', 'documentation'],
      'User Experience Design': ['user research', 'wireframing', 'prototyping', 'usability testing', 'information architecture', 'interaction design', 'accessibility', 'user-centered design'],
      'Big Data Analytics': ['Hadoop', 'Spark', 'data warehousing', 'data lakes', 'batch processing', 'stream processing', 'data visualization', 'ETL'],
      'Internet of Things': ['sensors', 'actuators', 'connectivity', 'embedded systems', 'MQTT', 'edge computing', 'smart devices', 'IoT platforms'],
      'Blockchain Technology': ['distributed ledger', 'cryptocurrencies', 'smart contracts', 'consensus algorithms', 'mining', 'tokens', 'decentralization', 'public and private keys'],
      'Quantum Computing': ['qubits', 'superposition', 'entanglement', 'quantum gates', 'quantum algorithms', 'quantum supremacy', 'decoherence', 'quantum error correction'],
      'Augmented and Virtual Reality': ['immersive experiences', 'mixed reality', 'AR glasses', 'VR headsets', '3D modeling', 'spatial computing', 'gesture recognition', 'haptic feedback'],
      'Natural Language Processing': ['text classification', 'sentiment analysis', 'named entity recognition', 'machine translation', 'speech recognition', 'language modeling', 'text generation'],
      'Robotics and Automation': ['robot kinematics', 'machine vision', 'autonomous systems', 'robot learning', 'human-robot interaction', 'industrial robots', 'drones', 'robot operating system']
    };


// Get keywords for the topic
  const keywords = topicKeywords[topic] || [];
  
  // Select some keywords for this paragraph
  const selectedKeywords = [];
  for (let i = 0; i < 3; i++) {
    const keyword = keywords[Math.floor(Math.random() * keywords.length)];
    if (!selectedKeywords.includes(keyword)) {
      selectedKeywords.push(keyword);
    }
  }
  
  // Generate paragraph based on paragraph index
  let paragraph;
  switch (paragraphIndex) {
    case 0:
      paragraph = `One of the key aspects of ${topic} is understanding the fundamentals. This includes concepts such as ${selectedKeywords[0]} and ${selectedKeywords[1]}. These form the building blocks for more advanced topics in this field.`;
      break;
    case 1:
      paragraph = `Applications of ${topic} can be found in various domains. For instance, ${selectedKeywords[0]} is widely used in industry for solving complex problems. Similarly, ${selectedKeywords[1]} and ${selectedKeywords[2]} have significant implications for how we approach modern technological challenges.`;
      break;
    case 2:
      paragraph = `The evolution of ${topic} has been remarkable over the years. Recent advancements in ${selectedKeywords[0]} have pushed the boundaries of what's possible. Furthermore, the integration of ${selectedKeywords[1]} with other technologies has opened new avenues for innovation.`;
      break;
    case 3:
      paragraph = `Challenges in ${topic} include addressing issues related to ${selectedKeywords[0]} and optimizing ${selectedKeywords[1]} for better performance. Researchers are actively working on overcoming these challenges to make the technology more robust and efficient.`;
      break;
    case 4:
      paragraph = `Future trends in ${topic} point toward greater adoption of ${selectedKeywords[0]} and more sophisticated implementations of ${selectedKeywords[1]}. As technology continues to advance, we can expect to see novel applications that leverage the power of ${selectedKeywords[2]} in unprecedented ways.`;
      break;
    default:
      paragraph = `The impact of ${topic} on society cannot be overstated. From enhancing productivity through ${selectedKeywords[0]} to improving quality of life via ${selectedKeywords[1]}, the benefits are numerous and far-reaching.`;
  }
  
  return paragraph;
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
    db.run(
      'INSERT INTO documents (title, content, path) VALUES (?, ?, ?)',
      [title, content, filePath],
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
 * Build inverted index from database documents
 * @param {Array} documents - Array of document objects
 */
const buildIndexFromDocuments = (documents) => {
  documents.forEach(doc => {
    const { title, content } = doc;
    const terms = processText(content);
    
    documentTerms[title] = terms;
    documentContents[title] = content;
    updateInvertedIndex(title, terms);
  });
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
  return Object.keys(documentTerms);
};

module.exports = {
  initializeIndex,
  getInvertedIndex,
  getDocumentTerms,
  getDocumentContents,
  getAllDocuments
};