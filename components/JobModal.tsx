import React, { useEffect, useState } from 'react';
import { JobListing, JobAnalysis } from '../types';
import { analyzeJobDeepDive } from '../services/openaiService';
import { X, Briefcase, Bot, Hammer, Loader2, CheckCircle2, ChevronRight, Zap, ArrowRight, DollarSign, Clock, LayoutGrid, Sparkles, Server, ExternalLink, TrendingUp, Target, Bookmark, BookmarkCheck } from 'lucide-react';

interface JobModalProps {
  job: JobListing;
  onClose: () => void;
  onCreateVib3Pitch: () => void;
  isSaved?: boolean;
  onSaveLead?: (job: JobListing) => void;
  onUnsaveLead?: (jobId: string) => void;
}

type Tab = 'job-ops' | 'jb-workflows' | 'implementation';

export const JobModal: React.FC<JobModalProps> = ({ job, onClose, onCreateVib3Pitch, isSaved, onSaveLead, onUnsaveLead }) => {
  const [activeTab, setActiveTab] = useState<Tab>('job-ops');
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(job.analysis || null);
  const [loading, setLoading] = useState(!job.analysis);

  useEffect(() => {
    if (!analysis && loading) {
      const fetchData = async () => {
        const result = await analyzeJobDeepDive(job);
        if (result) {
            setAnalysis(result);
            job.analysis = result; // Cache it
        }
        setLoading(false);
      };
      fetchData();
    }
  }, [job]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-white border-b border-gray-100 p-6 flex justify-between items-start z-10">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
               <span className="font-semibold text-gray-700">{job.company}</span>
               <span className="w-1 h-1 rounded-full bg-gray-300"></span>
               <span>{job.location}</span>
               {job.salaryRange && (
                   <>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-green-600 font-medium">{job.salaryRange}</span>
                   </>
               )}
            </div>
            {job.url && (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors border border-blue-200"
              >
                <span className="font-semibold">Source:</span> {job.source} <ExternalLink size={14} />
              </a>
            )}
          </div>
          <div className="flex items-center gap-2">
            {(onSaveLead || onUnsaveLead) && (
              <button
                onClick={() => {
                  if (isSaved) onUnsaveLead?.(job.id);
                  else onSaveLead?.(job);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  isSaved
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                {isSaved ? 'Saved to CRM' : 'Save to CRM'}
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50/50 px-6 sticky top-0">
          <button 
            onClick={() => setActiveTab('job-ops')}
            className={`py-4 px-6 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'job-ops' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Briefcase size={16} /> Job Opportunities
          </button>
          <button 
            onClick={() => setActiveTab('jb-workflows')}
            className={`py-4 px-6 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'jb-workflows' ? 'border-purple-600 text-purple-600 bg-purple-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Bot size={16} /> JB Workflows (AI Ops)
          </button>
          <button 
            onClick={() => setActiveTab('implementation')}
            className={`py-4 px-6 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'implementation' ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Hammer size={16} /> AI Implementation
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6 sm:p-8">
            {loading ? (
                 <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
                    <p className="text-gray-500 animate-pulse font-medium">Analyzing job structure & designing AI replacement...</p>
                 </div>
            ) : analysis ? (
                <div className="max-w-4xl mx-auto">
                    
                    {/* TAB 1: JOB OPS */}
                    {activeTab === 'job-ops' && analysis.applicationStrategy && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Briefcase className="text-blue-500" size={20} /> Application Strategy
                                </h3>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="text-xs uppercase font-bold text-gray-400 mb-3">Resume Keywords</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.applicationStrategy.resumeKeywords.map((kw, i) => (
                                                <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-100">
                                                    {kw}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-xs uppercase font-bold text-gray-400 mb-3">Cover Letter Hooks</h4>
                                        <ul className="space-y-2">
                                            {analysis.applicationStrategy.coverLetterPoints.map((pt, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                    <CheckCircle2 size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                                    {pt}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl text-white shadow-lg">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <LayoutGrid size={20} className="text-blue-400" /> Interview Prep
                                </h3>
                                <div className="space-y-4">
                                     {analysis.applicationStrategy.interviewTips.map((tip, i) => (
                                         <div key={i} className="bg-white/10 p-4 rounded-lg border border-white/10 backdrop-blur-sm">
                                             <div className="flex gap-3">
                                                 <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                     {i + 1}
                                                 </div>
                                                 <p className="text-sm text-gray-200">{tip}</p>
                                             </div>
                                         </div>
                                     ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: JB WORKFLOWS (AI OPS) */}
                    {activeTab === 'jb-workflows' && (
                        analysis?.aiServiceOpportunity ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                             
                             {/* AI Service Header */}
                             <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
                                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
                                 <div className="relative z-10">
                                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-4 border border-white/10">
                                         <Sparkles size={12} className="text-yellow-300" /> AI BUSINESS OPPORTUNITY
                                     </div>
                                     <h2 className="text-3xl font-bold mb-2">{analysis.aiServiceOpportunity.serviceName}</h2>
                                     <p className="text-purple-100 max-w-2xl text-lg">{analysis.aiServiceOpportunity.description}</p>
                                 </div>
                             </div>

                             {/* Business Plan Section */}
                             {analysis.aiServiceOpportunity.businessPlan && (
                                 <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                     <h3 className="font-bold text-gray-900 text-xl mb-6 flex items-center gap-2">
                                         <Briefcase className="text-purple-600" size={22} /> Business Plan
                                     </h3>
                                     <div className="space-y-4">
                                         <div>
                                             <h4 className="text-xs uppercase font-bold text-gray-400 mb-2">Executive Summary</h4>
                                             <p className="text-gray-700 leading-relaxed">{analysis.aiServiceOpportunity.businessPlan.executiveSummary}</p>
                                         </div>
                                         <div className="grid md:grid-cols-2 gap-4">
                                             <div>
                                                 <h4 className="text-xs uppercase font-bold text-gray-400 mb-2">Problem Statement</h4>
                                                 <p className="text-sm text-gray-600 leading-relaxed">{analysis.aiServiceOpportunity.businessPlan.problemStatement}</p>
                                             </div>
                                             <div>
                                                 <h4 className="text-xs uppercase font-bold text-gray-400 mb-2">Proposed Solution</h4>
                                                 <p className="text-sm text-gray-600 leading-relaxed">{analysis.aiServiceOpportunity.businessPlan.proposedSolution}</p>
                                             </div>
                                         </div>
                                         <div className="grid md:grid-cols-2 gap-4">
                                             <div>
                                                 <h4 className="text-xs uppercase font-bold text-gray-400 mb-2">Revenue Model</h4>
                                                 <p className="text-sm text-gray-600 leading-relaxed">{analysis.aiServiceOpportunity.businessPlan.revenueModel}</p>
                                             </div>
                                             <div>
                                                 <h4 className="text-xs uppercase font-bold text-gray-400 mb-2">Target Market</h4>
                                                 <p className="text-sm text-gray-600 leading-relaxed">{analysis.aiServiceOpportunity.businessPlan.targetMarket}</p>
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             )}

                             {/* Key Benefits - Headcount Elimination */}
                             {analysis.aiServiceOpportunity.keyBenefits && analysis.aiServiceOpportunity.keyBenefits.length > 0 && (
                                 <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm">
                                     <h3 className="font-bold text-gray-900 text-xl mb-4 flex items-center gap-2">
                                         <TrendingUp className="text-green-600" size={22} /> Key Benefits: Eliminate Headcount
                                     </h3>
                                     <div className="grid md:grid-cols-3 gap-4">
                                         {analysis.aiServiceOpportunity.keyBenefits.map((benefit, idx) => (
                                             <div key={idx} className="bg-white p-4 rounded-lg border border-green-100">
                                                 <div className="flex items-start gap-3">
                                                     <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                         <Target className="text-green-600" size={16} />
                                                     </div>
                                                     <div className="flex-1">
                                                         <h4 className="font-bold text-gray-900 mb-1">{benefit.benefit}</h4>
                                                         <p className="text-xs text-gray-600 mb-2">{benefit.impact}</p>
                                                         <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full text-xs font-bold text-green-700">
                                                             <DollarSign size={12} /> {benefit.savings}
                                                         </div>
                                                     </div>
                                                 </div>
                                             </div>
                                         ))}
                                     </div>
                                 </div>
                             )}

                             {/* Transformation Table */}
                             <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                 <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                     <h3 className="font-bold text-gray-900">Transformation Analysis</h3>
                                 </div>
                                 <div className="overflow-x-auto">
                                     <table className="w-full text-sm text-left">
                                         <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                             <tr>
                                                 <th className="px-6 py-3 w-1/4">Aspect</th>
                                                 <th className="px-6 py-3 w-1/3">Traditional Role</th>
                                                 <th className="px-6 py-3 w-1/3 text-purple-600">AI-Powered Service</th>
                                             </tr>
                                         </thead>
                                         <tbody className="divide-y divide-gray-100">
                                             {analysis.aiServiceOpportunity.transformationTable?.map((row, i) => (
                                                 <tr key={i} className="hover:bg-gray-50/50">
                                                     <td className="px-6 py-4 font-medium text-gray-900">{row.aspect}</td>
                                                     <td className="px-6 py-4 text-gray-600">{row.traditionalRole}</td>
                                                     <td className="px-6 py-4 text-purple-700 font-medium bg-purple-50/30">{row.aiPoweredService}</td>
                                                 </tr>
                                             ))}
                                         </tbody>
                                     </table>
                                 </div>
                             </div>

                             {/* Business Model Grid */}
                             <div className="grid md:grid-cols-2 gap-6">
                                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                     <h4 className="flex items-center gap-2 font-bold text-gray-900 mb-4">
                                         <DollarSign size={18} className="text-green-500" /> Cost & Pricing Model
                                     </h4>
                                     <div className="space-y-4">
                                         <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                             <span className="text-sm text-gray-500">Traditional Cost</span>
                                             <span className="font-mono font-bold text-gray-900">{analysis.aiServiceOpportunity.costModel?.traditional}</span>
                                         </div>
                                         <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                                             <span className="text-sm text-green-700">AI Service Cost</span>
                                             <span className="font-mono font-bold text-green-700">{analysis.aiServiceOpportunity.costModel?.aiService}</span>
                                         </div>
                                         <div className="pt-2">
                                             <p className="text-xs font-bold text-gray-400 uppercase mb-2">Suggested Pricing Tiers</p>
                                             <div className="flex flex-wrap gap-2">
                                                 {analysis.aiServiceOpportunity.pricingModel?.map((price, i) => (
                                                     <span key={i} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600 font-mono shadow-sm">{price}</span>
                                                 ))}
                                             </div>
                                         </div>
                                     </div>
                                 </div>

                                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                     <h4 className="flex items-center gap-2 font-bold text-gray-900 mb-4">
                                         <Clock size={18} className="text-orange-500" /> Efficiency & Scale
                                     </h4>
                                     <div className="grid grid-cols-2 gap-4 mb-4">
                                          <div className="p-3 bg-gray-50 rounded-lg text-center">
                                              <div className="text-xs text-gray-500 uppercase">Human Time</div>
                                              <div className="font-bold text-gray-900 mt-1">{analysis.aiServiceOpportunity.timeInvestment?.traditional}</div>
                                          </div>
                                          <div className="p-3 bg-purple-50 rounded-lg text-center border border-purple-100">
                                              <div className="text-xs text-purple-600 uppercase">AI Time</div>
                                              <div className="font-bold text-purple-700 mt-1">{analysis.aiServiceOpportunity.timeInvestment?.aiAutomated}</div>
                                          </div>
                                     </div>
                                     <div>
                                         <p className="text-xs font-bold text-gray-400 uppercase mb-2">Market Stats</p>
                                         <div className="text-sm text-gray-600">
                                             <p>Target: {analysis.aiServiceOpportunity.marketOpportunity?.targetCustomer}</p>
                                             <p className="mt-1">Competition: <span className="font-medium text-gray-900">{analysis.aiServiceOpportunity.marketOpportunity?.competitionLevel}</span></p>
                                         </div>
                                     </div>
                                 </div>
                             </div>

                             <button 
                                onClick={onCreateVib3Pitch}
                                className="w-full py-4 bg-black text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-3 group"
                             >
                                <Zap className="fill-white" size={20} /> Launch AI Service in Vib3 Hub <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                             </button>
                        </div>
                        ) : <div className="p-8 text-center text-gray-500">No AI workflow analysis available.</div>
                    )}

                    {/* TAB 3: IMPLEMENTATION */}
                    {activeTab === 'implementation' && (
                        analysis?.implementationPlan ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            
                            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Hammer className="text-emerald-600" size={20} /> Build Guide: {analysis.aiServiceOpportunity?.serviceName}
                                </h3>

                                <div className="space-y-8">
                                    {/* Phase 1 */}
                                    <div className="relative pl-8 border-l-2 border-emerald-100">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                                        <h4 className="text-emerald-800 font-bold mb-1">Phase 1: MVP Development (Week 1-2)</h4>
                                        <ul className="space-y-3 mt-4">
                                            {analysis.implementationPlan.mvpSteps.map((step, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                                    <span className="font-mono text-emerald-600 font-bold mt-0.5">{i+1}.</span>
                                                    {step}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Phase 2 */}
                                    <div className="relative pl-8 border-l-2 border-blue-100">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
                                        <h4 className="text-blue-800 font-bold mb-1">Phase 2: Packaging & Pricing (Week 3-4)</h4>
                                        <ul className="space-y-3 mt-4">
                                            {analysis.implementationPlan.packagingSteps.map((step, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                                    <span className="font-mono text-blue-600 font-bold mt-0.5">{i+1}.</span>
                                                    {step}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Phase 3 */}
                                    <div className="relative pl-8 border-l-2 border-purple-100">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-purple-500 border-2 border-white shadow-sm" />
                                        <h4 className="text-purple-800 font-bold mb-1">Phase 3: Go-to-Market (Week 5-6)</h4>
                                        <ul className="space-y-3 mt-4">
                                            {analysis.implementationPlan.gtmSteps.map((step, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                                    <span className="font-mono text-purple-600 font-bold mt-0.5">{i+1}.</span>
                                                    {step}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                             <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg">
                                 <h4 className="font-bold flex items-center gap-2 mb-4">
                                     <Server size={18} className="text-orange-400" /> Technical Architecture
                                 </h4>
                                 <p className="text-gray-300 text-sm leading-relaxed font-mono">
                                     {analysis.implementationPlan.workflowArchitecture}
                                 </p>
                                 <div className="flex flex-wrap gap-2 mt-4">
                                     {analysis.aiServiceOpportunity?.techStack?.map((tech, i) => (
                                         <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-xs text-blue-300 border border-white/10">
                                             {tech}
                                         </span>
                                     ))}
                                 </div>
                             </div>
                        </div>
                        ) : <div className="p-8 text-center text-gray-500">No implementation plan available.</div>
                    )}
                </div>
            ) : (
                <div className="text-center text-red-500 mt-20">Unable to load deep-dive analysis.</div>
            )}
        </div>
      </div>
    </div>
  );
};