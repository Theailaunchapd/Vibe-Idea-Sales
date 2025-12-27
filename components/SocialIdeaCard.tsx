import React from 'react';
import { SocialIdea } from '../types';
import { Heart, Repeat2, MessageCircle, Eye, Hash, ExternalLink } from 'lucide-react';

interface SocialIdeaCardProps {
  idea: SocialIdea;
  onClick: () => void;
}

export const SocialIdeaCard: React.FC<SocialIdeaCardProps> = ({ idea, onClick }) => {
  const categoryColors = {
    startup: 'bg-purple-100 text-purple-700 border-purple-200',
    saas: 'bg-blue-100 text-blue-700 border-blue-200',
    problem: 'bg-red-100 text-red-700 border-red-200',
    wish: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    general: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <div
      onClick={onClick}
      className="bg-white hover:bg-blue-50/30 border border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 rounded-xl p-5 cursor-pointer group relative overflow-hidden flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          X.COM SCOUT
        </div>
        <div className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${categoryColors[idea.category]}`}>
          {idea.category.toUpperCase()}
        </div>
      </div>

      {/* Author Info */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
          {idea.author.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-gray-900 truncate">{idea.author}</div>
          <a 
            href={idea.sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[10px] text-blue-600 hover:text-blue-800 hover:underline truncate flex items-center gap-1"
          >
            {idea.authorHandle} <ExternalLink size={10} />
          </a>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
        {idea.title}
      </h3>

      {/* Description (Tweet Text) */}
      <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-grow leading-relaxed">
        {idea.description}
      </p>

      {/* Engagement Stats */}
      <div className="flex items-center gap-3 text-xs font-medium text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-3">
        <div className="flex items-center gap-1">
          <Heart size={14} className="text-red-500" /> {idea.engagement.likes.toLocaleString()}
        </div>
        <div className="flex items-center gap-1">
          <Repeat2 size={14} className="text-green-500" /> {idea.engagement.retweets.toLocaleString()}
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle size={14} className="text-blue-500" /> {idea.engagement.replies}
        </div>
        {idea.engagement.views && (
          <div className="flex items-center gap-1">
            <Eye size={14} className="text-gray-400" /> {(idea.engagement.views / 1000).toFixed(1)}K
          </div>
        )}
      </div>

      {/* Hashtags */}
      {idea.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {idea.hashtags.slice(0, 3).map((tag, i) => (
            <span key={i} className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[10px] font-medium truncate max-w-[120px]">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Hover decoration */}
      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-100 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
    </div>
  );
};
