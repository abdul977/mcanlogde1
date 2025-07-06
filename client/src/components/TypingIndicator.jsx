import React from 'react';

const TypingIndicator = ({ userName, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="flex items-center space-x-2 px-4 py-2 text-gray-500 text-sm">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
      </div>
      <span className="text-xs">
        {userName ? `${userName} is typing...` : 'Someone is typing...'}
      </span>
    </div>
  );
};

export default TypingIndicator;
