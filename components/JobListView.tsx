import React from 'react';
import { JobListing } from '../types';
import { Briefcase, MapPin, DollarSign, Clock, ChevronRight, ExternalLink } from 'lucide-react';

interface JobListViewProps {
  jobs: JobListing[];
  onJobClick: (job: JobListing) => void;
}

export const JobListView: React.FC<JobListViewProps> = ({ jobs, onJobClick }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wide">
        <div className="col-span-4">Position</div>
        <div className="col-span-2">Location</div>
        <div className="col-span-2">Salary</div>
        <div className="col-span-2">Posted</div>
        <div className="col-span-1">AI Score</div>
        <div className="col-span-1"></div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
        {jobs.map((job) => {
          return (
            <div
              key={job.id}
              onClick={() => onJobClick(job)}
              className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-blue-50 cursor-pointer transition-colors group"
            >
              {/* Job Title & Company */}
              <div className="col-span-4">
                <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                  {job.title}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Briefcase size={12} />
                  <span className="truncate">{job.company}</span>
                </div>
                {job.source && (
                  <div className="mt-1 flex items-center text-xs text-gray-400">
                    <ExternalLink size={10} className="mr-1" />
                    {job.source}
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="col-span-2 flex items-center text-sm text-gray-600">
                <MapPin size={14} className="mr-1 text-gray-400 flex-shrink-0" />
                <span className="truncate">{job.location}</span>
              </div>

              {/* Salary */}
              <div className="col-span-2 flex items-center text-sm text-gray-700">
                {job.salaryRange ? (
                  <>
                    <DollarSign size={14} className="mr-1 text-green-600 flex-shrink-0" />
                    <span className="truncate font-medium">{job.salaryRange}</span>
                  </>
                ) : (
                  <span className="text-gray-400 text-xs">Not specified</span>
                )}
              </div>

              {/* Posted Date */}
              <div className="col-span-2 flex items-center text-sm text-gray-600">
                <Clock size={14} className="mr-1 text-gray-400 flex-shrink-0" />
                <span className="truncate">{job.postedDate}</span>
              </div>

              {/* AI Potential Score */}
              <div className="col-span-1 flex items-center justify-center">
                <div className={`px-2 py-1 rounded-md text-xs font-bold ${
                  job.aiPotentialScore >= 80
                    ? 'bg-green-100 text-green-700'
                    : job.aiPotentialScore >= 60
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {job.aiPotentialScore}
                </div>
              </div>

              {/* Action Arrow */}
              <div className="col-span-1 flex items-center justify-end">
                <ChevronRight size={20} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
