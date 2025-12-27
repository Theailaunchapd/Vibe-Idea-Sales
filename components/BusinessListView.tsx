import React from 'react';
import { Business } from '../types';
import { ScoreBadge } from './ScoreBadge';
import { Briefcase, MapPin, AlertCircle, Phone, Mail, Globe, Star, ChevronRight, Bookmark, BookmarkCheck } from 'lucide-react';

interface BusinessListViewProps {
  businesses: Business[];
  onBusinessClick: (business: Business) => void;
  savedBusinessIds?: Set<string>;
  onSave?: (business: Business) => void;
  onUnsave?: (businessId: string) => void;
}

export const BusinessListView: React.FC<BusinessListViewProps> = ({ businesses, onBusinessClick, savedBusinessIds, onSave, onUnsave }) => {
  const handleSaveClick = (e: React.MouseEvent, business: Business) => {
    e.stopPropagation();
    const isSaved = savedBusinessIds?.has(business.id);
    if (isSaved) {
      onUnsave?.(business.id);
    } else {
      onSave?.(business);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wide">
        <div className="col-span-3">Business</div>
        <div className="col-span-2">Location</div>
        <div className="col-span-3">Top Pain Point</div>
        <div className="col-span-2">Contact</div>
        <div className="col-span-1">Score</div>
        <div className="col-span-1"></div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-100">
        {businesses.map((business) => {
          const topPainPoint = business.painPoints[0];
          const isSaved = savedBusinessIds?.has(business.id);
          
          return (
            <div
              key={business.id}
              onClick={() => onBusinessClick(business)}
              className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-blue-50 cursor-pointer transition-colors group"
            >
              {/* Business Name & Industry */}
              <div className="col-span-3">
                <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                  {business.name}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Briefcase size={12} />
                  <span>{business.industry}</span>
                  {business.googleRating && (
                    <span className="flex items-center text-yellow-600 ml-1">
                      <Star size={12} className="mr-0.5 fill-yellow-500" />
                      {business.googleRating}
                    </span>
                  )}
                </div>
                {business.activeHiringRole && (
                  <div className="mt-1 inline-flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    Hiring: {business.activeHiringRole}
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="col-span-2 flex items-center text-sm text-gray-600">
                <MapPin size={14} className="mr-1 text-gray-400 flex-shrink-0" />
                <span className="truncate">{business.location}</span>
              </div>

              {/* Top Pain Point */}
              <div className="col-span-3">
                <div className="flex items-start text-sm">
                  <AlertCircle size={14} className="mr-2 mt-0.5 text-red-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 truncate">
                      {topPainPoint?.title || "Multiple operational issues"}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Impact: <span className="font-medium text-red-600">{topPainPoint?.impactLevel}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="col-span-2 flex flex-col gap-1 text-xs text-gray-600">
                {business.contactPhone && (
                  <div className="flex items-center truncate">
                    <Phone size={12} className="mr-1 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{business.contactPhone}</span>
                  </div>
                )}
                {business.contactEmail && (
                  <div className="flex items-center truncate">
                    <Mail size={12} className="mr-1 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{business.contactEmail}</span>
                  </div>
                )}
                {business.websiteUrl && (
                  <div className="flex items-center truncate">
                    <Globe size={12} className="mr-1 text-gray-400 flex-shrink-0" />
                    <span className="truncate text-blue-600">Website</span>
                  </div>
                )}
              </div>

              {/* Score */}
              <div className="col-span-1 flex items-center justify-center">
                <ScoreBadge score={business.negativeScore} />
              </div>

              {/* Action */}
              <div className="col-span-1 flex items-center justify-end gap-2">
                {(onSave || onUnsave) && (
                  <button
                    onClick={(e) => handleSaveClick(e, business)}
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
                <ChevronRight size={20} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
