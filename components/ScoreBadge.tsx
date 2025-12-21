import React from 'react';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, size = 'md' }) => {
  let colorClass = 'bg-green-500 text-white';
  
  if (score >= 80) {
    colorClass = 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]';
  } else if (score >= 60) {
    colorClass = 'bg-orange-500 text-white';
  } else if (score >= 40) {
    colorClass = 'bg-yellow-500 text-black';
  }

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-24 h-24 text-3xl font-bold',
  };

  return (
    <div className={`rounded-full flex items-center justify-center font-bold ${colorClass} ${sizeClasses[size]}`}>
      {score}
    </div>
  );
};
