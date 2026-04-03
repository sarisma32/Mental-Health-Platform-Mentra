import React from 'react';

export const StarRating = ({ rating, onRate, size = 'lg' }) => {
  const [hovered, setHovered] = React.useState(0);
  return (
    <div className="flex space-x-1">
      {[1,2,3,4,5].map(star => (
        <button key={star} type="button"
          onClick={() => onRate && onRate(star)}
          onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}
          className={`${size === 'lg' ? 'text-4xl' : 'text-2xl'} cursor-pointer hover:scale-110 transition-transform ${star <= (hovered || rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
      ))}
    </div>
  );
};

export const SubStarRating = ({ rating, onRate }) => {
  const [hovered, setHovered] = React.useState(0);
  return (
    <div className="flex space-x-0.5">
      {[1,2,3,4,5].map(star => (
        <button key={star} type="button" onClick={() => onRate(star)}
          onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}
          className={`text-2xl cursor-pointer hover:scale-110 transition-transform ${star <= (hovered || rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
      ))}
    </div>
  );
};
