import { Link } from 'react-router-dom';
import RelevanceIndicator from './RelevanceIndicator';

function ResultsList({ results, query }) {
  return (
    <div className="space-y-6">
      {results.map((result) => (
        <div key={result.id} className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <Link to={`/document/${result.id}`} className="text-xl font-medium text-blue-600 hover:underline">
                  {result.title}
                </Link>
                <p className="text-sm text-gray-500 mt-1">
                  Document ID: {result.id}
                </p>
              </div>
              <RelevanceIndicator score={result.score} />
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50">
            <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: result.context }}></p>
            <div className="mt-3">
              <Link to={`/document/${result.id}`} className="text-sm text-blue-600 hover:underline">
                View full document &rarr;
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ResultsList;
