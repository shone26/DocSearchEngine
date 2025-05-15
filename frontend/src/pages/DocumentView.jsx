import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { FaArrowLeft } from 'react-icons/fa';

function DocumentView() {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await api.get(`/documents/${id}`);
        setDocument(response.data);
      } catch (err) {
        console.error('Error fetching document:', err);
        setError('Failed to load document. It may not exist or has been removed.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

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

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center text-blue-600 hover:underline mb-4">
        <FaArrowLeft className="mr-2" />
        Back to search
      </Link>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold">{document.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Document ID: {document.id}
          </p>
        </div>
        
        <div className="p-6">
          <div className="prose prose-lg max-w-none">
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