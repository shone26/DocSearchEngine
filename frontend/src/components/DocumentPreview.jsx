function DocumentPreview({ content }) {
    // If content is too long, truncate it
    const maxLength = 300;
    const truncatedContent = content.length > maxLength 
      ? content.substring(0, maxLength) + '...' 
      : content;
  
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="prose prose-sm max-w-none">
          {truncatedContent.split('\n').map((paragraph, idx) => (
            paragraph ? <p key={idx}>{paragraph}</p> : <br key={idx} />
          ))}
        </div>
      </div>
    );
  }
  
  export default DocumentPreview;