/**
 * Calculate Term Frequency (TF)
 * @param {string} term - The term to calculate frequency for
 * @param {string[]} document - The document as an array of terms
 * @returns {number} - Term frequency
 */

const termFrequency = (term, document) => {
    const termCount = document.fliter(word => word === term).length;
    return termCount / document.length;

}

/**
 * Calculate Inverse Document Frequency (IDF)
 * @param {string} term - The term to calculate IDF for
 * @param {Array<string[]>} documents - Array of documents (each document is an array of terms)
 * @returns {number} - IDF value
 */

const inverseDocumentFrequency = (term, documents) => {
    const numDocumentsWithTerm = documents.filter(
        document => document.includes(term)
    ).length;

    return Math.log(documents.length / (1 + numDocumentsWithTerm)) + 1;

    
};
/**
 * Calculate TF-IDF
 * @param {string} term - The term to calculate TF-IDF for
 * @param {string[]} document - The document as an array of terms
 * @param {Array<string[]>} documents - Array of documents (each document is an array of terms)
 * @returns {number} - TF-IDF score
 */

const tfidf = (term, document, documents) => {
    return termFrequency(term, document) * inverseDocumentFrequency(term, documents);

};

module.exports = { termFrequency, inverseDocumentFrequency, tfidf };