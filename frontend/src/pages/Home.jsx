
import { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import ResultsList from '../components/ResultsList';
import api from '../services/api';

function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTime, setSearchTime] = useState(null);
  const [searchMetrics, setSearchMetrics] = useState(null);
  // Add state for the full response and reindexing
  const [response, setResponse] = useState(null);
  const [reindexing, setReindexing] = useState(false);

  useEffect(() => {
    // Fetch search metrics on component mount
    const fetchMetrics = async () => {
      try {
        const response = await api.get('/search/metrics');
        setSearchMetrics(response.data);
      } catch (err) {
        console.error('Error fetching metrics:', err);
      }
    };

    fetchMetrics();
  }, []);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
  
    setQuery(searchQuery);
    setLoading(true);
    setError(null);
  
    try {
      const response = await api.get('/search', {
        params: { query: searchQuery }
      });
  
      setResults(response.data.results);
      setSearchTime(response.data.time);
      setResponse(response.data); // Store the full response for debugging
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Add reindex function
  const handleReindex = async () => {
    setReindexing(true);
    try {
      const response = await api.post('/search/reindex');
      console.log('Reindexing response:', response.data);
      
      // Refresh metrics after reindexing
      const metricsResponse = await api.get('/search/metrics');
      setSearchMetrics(metricsResponse.data);
      
      // Show success message
      alert(`Reindexing successful! ${response.data.documentCount} documents indexed.`);
    } catch (err) {
      console.error('Reindexing error:', err);
      alert('An error occurred while reindexing documents.');
    } finally {
      setReindexing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Document Retrieval System</h1>
        <p className="text-lg text-gray-600">
          Search through our collection of documents using keywords and phrases
        </p>
      </div>

      <SearchBar onSearch={handleSearch} />

      {loading && (
        <div className="flex justify-center my-8">
          <div className="loading-spinner"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="mt-2 mb-4 text-sm text-gray-500">
          Found {results.length} results in {searchTime}ms
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <div className="text-center my-8 p-6 bg-gray-100 rounded-lg">
          <p className="text-lg text-gray-600">No documents found matching "{query}"</p>
          <p className="text-sm text-gray-500 mt-2">Try using different keywords or simplifying your search</p>
          
          {/* Debug information */}
          {response?.debug && (
            <div className="mt-4 p-4 bg-gray-200 rounded text-left">
              <h3 className="font-bold mb-2">Debug Information:</h3>
              <p>Total Documents: {response.debug.totalDocuments}</p>
              <p>Index Size: {response.debug.indexSize} terms</p>
              <p>Processed Query Terms: {response.debug.queryTerms.join(', ')}</p>
              <p>Matching Terms in Index: {response.debug.matchingTerms.join(', ') || 'None'}</p>
              <p>Total Results Before Filtering: {response.debug.totalResults}</p>
              <p>Results After Filtering: {response.debug.filteredResults}</p>
            </div>
          )}
        </div>
      )}

      {!loading && results.length > 0 && (
        <ResultsList results={results} query={query} />
      )}

      {searchMetrics && (
        <div className="mt-12 p-4 bg-gray-100 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-blue-600">System Information</h2>
            <button
              onClick={handleReindex}
              disabled={reindexing}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {reindexing ? 'Reindexing...' : 'Re-index Documents'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-medium text-blue-600">Documents</h3>
              <p className="text-3xl font-bold text-gray-700">{searchMetrics.documentCount}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-medium text-blue-600">Index Size</h3>
              <p className="text-3xl font-bold text-gray-700">{searchMetrics.indexSize} terms</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-medium text-blue-600">Cache Size</h3>
              <p className="text-3xl font-bold text-gray-700">{searchMetrics.cacheSize} queries</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;