import React from 'react';
import { RedditIdea } from '../types';
import { MessageSquare, ArrowBigUp, Award, ExternalLink } from 'lucide-react';

interface RedditIdeaCardProps {
  idea: RedditIdea;
  onClick: () => void;
}

export const RedditIdeaCard: React.FC<RedditIdeaCardProps> = ({ idea, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white hover:bg-orange-50/30 border border-gray-200 hover:border-orange-300 hover:shadow-xl transition-all duration-300 rounded-xl p-5 cursor-pointer group relative overflow-hidden flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-3">
         <div className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
             <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
             REDDIT SCOUT
         </div>
         <span className="text-xs text-gray-400">{new Date(idea.extractionDate).toLocaleDateString()}</span>
      </div>

      <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2 mb-2">
        {idea.title}
      </h3>

      <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-grow leading-relaxed">
        {idea.problem}
      </p>

      {/* Engagement Stats */}
      <div className="flex items-center gap-4 text-xs font-medium text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-3">
          <div className="flex items-center gap-1">
              <ArrowBigUp size={16} className="text-orange-500" /> {idea.engagement.upvotes}
          </div>
          <div className="flex items-center gap-1">
              <MessageSquare size={14} className="text-blue-500" /> {idea.engagement.comments}
          </div>
          {idea.engagement.awards > 0 && (
             <div className="flex items-center gap-1 text-yellow-600">
                <Award size={14} /> {idea.engagement.awards}
             </div>
          )}
      </div>

      {/* Validation Signals */}
      <div className="flex flex-wrap gap-1.5 mt-auto">
         {idea.validationSignals.slice(0, 2).map((signal, i) => (
             <span key={i} className="px-2 py-1 bg-green-50 text-green-700 border border-green-100 rounded text-[10px] font-medium truncate max-w-full">
                 {signal}
             </span>
         ))}
      </div>
      
      {/* Hover decoration */}
      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-orange-100 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
    </div>
  );
};