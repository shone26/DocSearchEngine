const natural = require('natural');
// Remove this unnecessary import that's causing a circular dependency
// const { get } = require('../app');
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

/**
 * Tokenizes and stems the input text.
 * @param {string} text - The text to process.
 * @returns {Array} - An array of processed tokens.
 */
const processText = (text) => {
    if (!text) return [];
    console.log('Processing text input length:', text.length);

    // Convert to lowercase
    const lowercaseText = text.toLowerCase();

    // Tokenize the text
    const tokens = tokenizer.tokenize(lowercaseText);
    console.log(`Tokenized into ${tokens.length} tokens`);

    // Remove stop words and non-alphabetic tokens
    const stopWords = getStopWords();
    const filteredTokens = tokens.filter(token =>
        token.length > 2 && // Skip very short words
        !stopWords.has(token) && // Changed from includes to has since it's a Set
        /^[a-zA-Z]+$/.test(token) //  Only keep alphabetic tokens
    );

    console.log(`After filtering stop words: ${filteredTokens.length} tokens remain`);

    // Apply stemming
    const stemmedTokens = filteredTokens.map(token => stemmer.stem(token));
    console.log('First 10 stemmed tokens:', stemmedTokens.slice(0, 10));

    return stemmedTokens;
};

/**
 * Get set of stop words.
 * @returns {Set} - A set of stop words.
 */
const getStopWords = () => {
    const commonStopWords = [
        'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
        'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
        'could', 'did', 'do', 'does', 'doing', 'down', 'during',
        'each', 'few', 'for', 'from', 'further',
        'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
        'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself',
        'me', 'more', 'most', 'my', 'myself',
        'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
        'same', 'she', 'should', 'so', 'some', 'such',
        'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too',
        'under', 'until', 'up',
        'very',
        'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would',
        'you', 'your', 'yours', 'yourself', 'yourselves'
    ];

    return new Set(commonStopWords);
};

module.exports = { processText };