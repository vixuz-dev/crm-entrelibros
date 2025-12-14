import React from 'react';

const SkeletonLoader = ({ className = '', lines = 1, showAvatar = false }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="flex space-x-4">
        {showAvatar && (
          <div className="rounded-full bg-gray-300 h-12 w-12"></div>
        )}
        <div className="flex-1 space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={`h-4 bg-gray-300 rounded ${
                i === lines - 1 ? 'w-3/4' : 'w-full'
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6 mb-6"></div>
      <div className="h-32 bg-gray-300 rounded"></div>
    </div>
  );
};

export default SkeletonLoader;

