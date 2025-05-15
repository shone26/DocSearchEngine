function RelevanceIndicator({ score }) {
    // Normalize the score for display (assuming score is between 0 and 1)
    const normalizedScore = Math.min(Math.max(score, 0), 1);
    const percentage = Math.round(normalizedScore * 100);
    
    // Determine color based on score
    let colorClass;
    if (normalizedScore >= 0.7) {
      colorClass = 'bg-green-500'; // High relevance
    } else if (normalizedScore >= 0.4) {
      colorClass = 'bg-yellow-500'; // Medium relevance
    } else {
      colorClass = 'bg-red-500'; // Low relevance
    }
    
    return (
      <div className="flex items-center">
        <div className="text-xs font-medium text-gray-500 mr-2">Relevance</div>
        <div className="h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${colorClass}`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="ml-2 text-xs font-medium text-gray-500">{percentage}%</div>
      </div>
    );
  }
  
  export default RelevanceIndicator;