import React from 'react';
import { JobListing } from '../types';
import { Building2, MapPin, Clock, DollarSign, Sparkles } from 'lucide-react';

interface JobCardProps {
  job: JobListing;
  onClick: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onClick }) => {
  const score = job.aiPotentialScore || 50;
  let scoreColor = 'bg-gray-100 text-gray-600';
  if (score > 75) scoreColor = 'bg-green-100 text-green-700 border-green-200';
  else if (score > 50) scoreColor = 'bg-blue-100 text-blue-700 border-blue-200';

  return (
    <div 
      onClick={onClick}
      className="bg-white hover:bg-gray-50 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 rounded-xl p-5 cursor-pointer group relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
           <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {job.title}
          </h3>
          <p className="text-sm font-medium text-gray-700 flex items-center mt-1">
             <Building2 size={14} className="mr-1.5 text-gray-400" /> {job.company}
          </p>
        </div>
        <div className={`px-2 py-1 rounded-lg text-xs font-bold border ${scoreColor} flex flex-col items-center min-w-[50px]`}>
            <span>{score}%</span>
            <span className="text-[9px] uppercase font-normal opacity-80">AI Pot.</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs text-gray-500 mb-4">
        <span className="flex items-center"><MapPin size={12} className="mr-1" /> {job.location}</span>
        {job.salaryRange && <span className="flex items-center"><DollarSign size={12} className="mr-1" /> {job.salaryRange}</span>}
        <span className="flex items-center"><Clock size={12} className="mr-1" /> {job.postedDate}</span>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-3">
        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
          {job.snippet}
        </p>
      </div>

      <div className="flex flex-wrap gap-1">
        {job.skills.slice(0, 3).map((skill, i) => (
           <span key={i} className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[10px] text-gray-500 font-medium shadow-sm">
             {skill}
           </span>
        ))}
        {job.skills.length > 3 && (
            <span className="px-2 py-0.5 text-[10px] text-gray-400">+ {job.skills.length - 3} more</span>
        )}
      </div>
      
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-3xl -mr-4 -mt-4 opacity-50 pointer-events-none group-hover:opacity-100 transition-opacity" />
    </div>
  );
};
