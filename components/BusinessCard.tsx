import React from 'react';
import { Business } from '../types';
import { ScoreBadge } from './ScoreBadge';
import { Briefcase, MapPin, AlertCircle, Star, Bookmark, BookmarkCheck } from 'lucide-react';

interface BusinessCardProps {
  business: Business;
  onClick: () => void;
  isSaved?: boolean;
  onSave?: (business: Business) => void;
  onUnsave?: (businessId: string) => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ business, onClick, isSaved, onSave, onUnsave }) => {
  const topPainPoint = business.painPoints[0];

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) {
      onUnsave?.(business.id);
    } else {
      onSave?.(business);
    }
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white hover:bg-gray-50 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 rounded-xl p-5 cursor-pointer group relative overflow-hidden shadow-sm"
    >
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {business.name}
          </h3>
          <div className="flex items-center text-gray-500 text-xs mt-1 space-x-3">
            <span className="flex items-center"><Briefcase size={12} className="mr-1" /> {business.industry}</span>
            <span className="flex items-center"><MapPin size={12} className="mr-1" /> {business.location}</span>
            {business.googleRating && (
                <span className="flex items-center text-yellow-500"><Star size={12} className="mr-1 fill-yellow-500" /> {business.googleRating}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ScoreBadge score={business.negativeScore} />
          {(onSave || onUnsave) && (
            <button
              onClick={handleSaveClick}
              className={`p-2 rounded-lg transition-all ${
                isSaved
                  ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isSaved ? 'Saved to CRM' : 'Save to CRM'}
            >
              {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
          <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Top Pain Point</p>
          <div className="flex items-start text-sm text-gray-700">
            <AlertCircle size={16} className="mr-2 mt-0.5 text-red-500 flex-shrink-0" />
            {topPainPoint?.title || "Multiple operational issues"}
          </div>
        </div>

        {business.activeHiringRole && (
          <div className="flex items-center justify-between text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded border border-blue-100">
            <span>Hiring: <span className="font-semibold">{business.activeHiringRole}</span></span>
          </div>
        )}
      </div>
    </div>
  );
};