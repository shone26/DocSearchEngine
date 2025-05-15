
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FaArrowLeft } from 'react-icons/fa';

function DocumentView() {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        console.log(`Fetching document with ID or title: ${id}`);
        
        try {
          // Direct attempt to get document
          const response = await api.get(`/documents/${id}`);
          console.log('Document fetch successful:', response.data);
          setDocument(response.data);
          return;
        } catch (directError) {
          console.error('Error with direct document fetch:', directError);
          // Continue to try search-based retrieval
        }
        
        // If direct fetch fails, try searching for the document
        try {
          // Convert document ID to a suitable search query
          // For example, if id is 'sample_doc_2.txt', search for 'sample doc 2'
          const searchQuery = id
            .replace(/\.txt$/, '')    // Remove .txt extension
            .replace(/_/g, ' ');      // Replace underscores with spaces
            
          console.log(`Searching for document with query: ${searchQuery}`);
          
          const searchResponse = await api.get('/search', {
            params: { query: searchQuery }
          });
          
          console.log('Search results:', searchResponse.data.results);
          
          if (searchResponse.data.results && searchResponse.data.results.length > 0) {
            // Find most relevant result (highest score)
            const bestMatch = searchResponse.data.results[0];
            
            // Get the full document content using the ID from search results
            const docResponse = await api.get(`/documents/${bestMatch.id}`);
            console.log('Retrieved document from search results:', docResponse.data);
            setDocument(docResponse.data);
            return;
          }
        } catch (searchError) {
          console.error('Error with search-based retrieval:', searchError);
        }
        
        // If we get here, all approaches have failed
        setError('Document not found. It may have been removed or renamed.');
      } catch (err) {
        console.error('General error fetching document:', err);
        setError('Failed to load document. An error occurred while fetching the document.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:underline mb-4">
          <FaArrowLeft className="mr-2" />
          Back to search
        </Link>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!document) {
    return null;
  }

  // Format the title for display (remove .txt and replace underscores with spaces)
  const displayTitle = document.title
    .replace(/\.txt$/, '')
    .replace(/_/g, ' ');

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center text-blue-600 hover:underline mb-4">
        <FaArrowLeft className="mr-2" />
        Back to search
      </Link>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-700">{displayTitle}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Document ID: {document.id === -1 ? document.title : document.id}
          </p>
        </div>
        
        <div className="p-6">
          <div className="prose prose-lg max-w-none text-gray-700">
            {document.content.split('\n').map((paragraph, idx) => (
              paragraph ? <p key={idx}>{paragraph}</p> : <br key={idx} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentView;