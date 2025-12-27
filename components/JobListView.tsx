import React from 'react';
import { JobListing } from '../types';
import { Briefcase, MapPin, DollarSign, Clock, ChevronRight, ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react';

interface JobListViewProps {
  jobs: JobListing[];
  onJobClick: (job: JobListing) => void;
  savedJobIds?: Set<string | undefined>;
  onSave?: (job: JobListing) => void;
  onUnsave?: (jobId: string) => void;
}

export const JobListView: React.FC<JobListViewProps> = ({ jobs, onJobClick, savedJobIds, onSave, onUnsave }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wide">
        <div className="col-span-4">Position</div>
        <div className="col-span-2">Location</div>
        <div className="col-span-2">Salary</div>
        <div className="col-span-2">Posted</div>
        <div className="col-span-1">AI Score</div>
        <div className="col-span-1">Save</div>
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

              {/* Save Button */}
              <div className="col-span-1 flex items-center justify-center">
                {(onSave || onUnsave) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (savedJobIds?.has(job.id)) {
                        onUnsave?.(job.id);
                      } else {
                        onSave?.(job);
                      }
                    }}
                    className={`p-1.5 rounded-lg transition-all ${
                      savedJobIds?.has(job.id)
                        ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={savedJobIds?.has(job.id) ? 'Saved to CRM' : 'Save to CRM'}
                  >
                    {savedJobIds?.has(job.id) ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
