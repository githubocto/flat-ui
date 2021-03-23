import React from 'react';

const Loader = () => {
  return (
    <svg className="animate-pulse w-12 text-indigo-500" viewBox="0 0 25 10">
      <circle
        r="2"
        cx="5"
        cy="5"
        fill="currentColor"
        className="animate-bounce"
      />
      <circle
        r="2"
        cx="12"
        cy="5"
        fill="currentColor"
        className="animate-bounce"
        style={{ animationDelay: '0.3s' }}
      />
      <circle
        r="2"
        cx="19"
        cy="5"
        fill="currentColor"
        className="animate-bounce"
        style={{ animationDelay: '0.6s' }}
      />
    </svg>
  );
};
export { Loader };
