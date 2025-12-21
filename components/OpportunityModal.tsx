import React, { useEffect, useState } from 'react';
import { Business, OpportunityAnalysis } from '../types';
import { generateOpportunityBrief } from '../services/geminiService';
import { ScoreBadge } from './ScoreBadge';
import { X, CheckCircle, Zap, Server, TrendingUp, Loader2, Globe, Phone, Mail, Star, ExternalLink, ArrowRight, BarChart3, Clock, DollarSign, PieChart } from 'lucide-react';

interface OpportunityModalProps {
  business: Business;
  onClose: () => void;
  onCreatePitch: () => void;
}

export const OpportunityModal: React.FC<OpportunityModalProps> = ({ business, onClose, onCreatePitch }) => {
  const [analysis, setAnalysis] = useState<OpportunityAnalysis | null>(business.opportunity || null);
  const [loading, setLoading] = useState(!business.opportunity);

  useEffect(() => {
    if (!analysis && loading) {
      const fetchAnalysis = async () => {
        try {
            const result = await generateOpportunityBrief(business);
            setAnalysis(result);
            business.opportunity = result || undefined; // Cache it
        } catch (error) {
            console.error("Error generating brief", error);
        } finally {
            setLoading(false);
        }
      };
      fetchAnalysis();
    }
  }, [business]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white border border-gray-200 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-100 p-6 flex justify-between items-start">
            <div className="flex-1 pr-4">
                <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">{business.name}</h2>
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs border border-gray-200 text-gray-600 font-medium">
                        {business.industry}
                    </span>
                </div>
                
                {/* Contact & Rating Info */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 inline-block">
                    {business.googleRating && (
                        <div className="flex items-center text-yellow-600 font-medium">
                            <Star size={14} className="mr-1.5 fill-yellow-500 text-yellow-500" /> 
                            {business.googleRating}
                        </div>
                    )}
                    {business.websiteUrl && (
                        <a href={business.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-blue-600 transition-colors group">
                            <Globe size={14} className="mr-1.5 text-gray-400 group-hover:text-blue-600" /> 
                            Website <ExternalLink size={10} className="ml-1 opacity-50" />
                        </a>
                    )}
                    {business.contactPhone && (
                        <div className="flex items-center select-all">
                            <Phone size={14} className="mr-1.5 text-gray-400" /> 
                            {business.contactPhone}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-6 flex-shrink-0">
                <div className="text-right hidden sm:block">
                    <div className="text-xs text-red-500 uppercase font-bold tracking-wide mb-1">Negative Score</div>
                    <ScoreBadge score={business.negativeScore} size="lg" />
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900">
                    <X size={24} />
                </button>
            </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-8 bg-gray-50/50">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
                    <p className="text-gray-500 animate-pulse font-medium">Analyzing negative reviews & calculating opportunity...</p>
                </div>
            ) : analysis ? (
                <>
                    {/* Brief Header - Pitch Angle */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
                        <h3 className="flex items-center text-blue-200 font-bold mb-3 uppercase tracking-wider text-sm">
                            <Zap className="w-4 h-4 mr-2" /> Strategic Pitch Angle
                        </h3>
                        <p className="text-xl md:text-2xl font-light leading-relaxed italic">"{analysis.pitchAngle}"</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Left Col: Diagnostic Data */}
                        <div className="space-y-6 lg:col-span-1">
                            
                            {/* Score Breakdown */}
                            {business.negativeScoreBreakdown && (
                                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                                        <PieChart size={16} className="mr-2 text-gray-400" /> Negative Score Breakdown
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-600">Severity of Complaints</span>
                                            <span className="font-bold">{business.negativeScoreBreakdown.severity}/30</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${(business.negativeScoreBreakdown.severity / 30) * 100}%` }}></div>
                                        </div>

                                        <div className="flex justify-between text-xs pt-1">
                                            <span className="text-gray-600">Response Rate</span>
                                            <span className="font-bold">{business.negativeScoreBreakdown.responseRate}/20</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${(business.negativeScoreBreakdown.responseRate / 20) * 100}%` }}></div>
                                        </div>

                                        <div className="flex justify-between text-xs pt-1">
                                            <span className="text-gray-600">Review Volume</span>
                                            <span className="font-bold">{business.negativeScoreBreakdown.reviewVolume}/20</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: `${(business.negativeScoreBreakdown.reviewVolume / 20) * 100}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Supporting Data / Evidence */}
                            {analysis.supportingData && (
                                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                                        <BarChart3 size={16} className="mr-2 text-gray-400" /> Supporting Evidence
                                    </h3>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex items-start gap-2">
                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                            <span className="text-gray-600">{analysis.supportingData.negativeReviewStat}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                            <span className="text-gray-600">{analysis.supportingData.hiringStat}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                            <span className="text-gray-600">{analysis.supportingData.responseStat}</span>
                                        </li>
                                    </ul>
                                </div>
                            )}

                            {/* Top Pain Points */}
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-900 mb-4">Critical Pain Points</h3>
                                <div className="space-y-3">
                                    {business.painPoints.slice(0, 3).map((pp, idx) => (
                                        <div key={idx} className="bg-red-50 p-3 rounded-lg border-l-4 border-red-500">
                                            <div className="font-semibold text-gray-900 text-xs mb-1">{pp.title}</div>
                                            <div className="text-xs text-gray-500">{pp.frequency}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Col: Recommendations & Plan */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Recommended Solution Card */}
                            <div className="bg-white border border-emerald-100 rounded-xl p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-sm">
                                    PRIMARY RECOMMENDATION
                                </div>
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                                        <CheckCircle size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{analysis.primaryRecommendation.name}</h3>
                                        <span className="text-sm text-emerald-600 font-medium">{analysis.primaryRecommendation.category}</span>
                                    </div>
                                </div>
                                <p className="text-gray-600 mb-6 leading-relaxed">{analysis.primaryRecommendation.description}</p>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-3 rounded border border-gray-200 flex items-center gap-3">
                                        <div className="p-2 bg-white rounded shadow-sm"><DollarSign size={16} className="text-gray-400" /></div>
                                        <div>
                                            <div className="text-xs text-gray-400 uppercase font-bold">Estimated Pricing</div>
                                            <div className="text-gray-900 font-mono text-sm">{analysis.primaryRecommendation.pricingEstimate}</div>
                                        </div>
                                    </div>
                                    <div className="bg-emerald-50/50 p-3 rounded border border-emerald-100 flex items-center gap-3">
                                        <div className="p-2 bg-white rounded shadow-sm"><TrendingUp size={16} className="text-emerald-500" /></div>
                                        <div>
                                            <div className="text-xs text-emerald-600 uppercase font-bold">Client ROI</div>
                                            <div className="text-emerald-800 text-sm font-medium">{analysis.primaryRecommendation.roiDescription}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Implementation Plan */}
                            {analysis.implementationPlan && (
                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Server size={18} className="text-blue-500" /> Implementation Blueprint
                                    </h3>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div>
                                            <div className="text-xs text-gray-400 uppercase font-bold mb-2">Tech Stack</div>
                                            <div className="flex flex-wrap gap-2">
                                                {analysis.implementationPlan.techStack.map((tech, i) => (
                                                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded border border-gray-200 font-mono">{tech}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 uppercase font-bold mb-2">Timeline</div>
                                            <div className="flex items-center text-sm text-gray-700 font-medium">
                                                <Clock size={16} className="mr-2 text-gray-400" /> {analysis.implementationPlan.timeline}
                                            </div>
                                        </div>
                                        <div className="sm:col-span-2 bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                                            <span className="font-bold text-gray-900 mr-2">Pricing Strategy:</span>
                                            {analysis.implementationPlan.pricingStructure}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SaaS Potential */}
                            <div className={`p-5 rounded-xl border flex items-start gap-4 ${analysis.saasPotential.isViable ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
                                <div className={`p-2 rounded-lg ${analysis.saasPotential.isViable ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-500'}`}>
                                    <TrendingUp size={20} />
                                </div>
                                <div>
                                    <h4 className={`font-bold ${analysis.saasPotential.isViable ? 'text-purple-800' : 'text-gray-700'}`}>
                                        {analysis.saasPotential.isViable ? 'High SaaS Scalability Detected' : 'Custom Service Focus'}
                                    </h4>
                                    <p className="text-sm text-gray-600 mt-1">{analysis.saasPotential.reasoning}</p>
                                    {analysis.saasPotential.potentialProductName && (
                                        <div className="mt-2 text-xs font-mono font-bold text-purple-600">
                                            Product Concept: {analysis.saasPotential.potentialProductName}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Action Button */}
                            <div className="pt-4">
                                <button 
                                    onClick={onCreatePitch}
                                    className="w-full py-4 bg-black hover:bg-gray-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 group"
                                >
                                    <Zap className="fill-white" /> Launch Vib3 Hub & Create Pitch <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <p className="text-center text-gray-400 text-xs mt-3">
                                    Generates sales email, website mockup, and demo script instantly.
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center text-red-500">Failed to load analysis.</div>
            )}
        </div>
      </div>
    </div>
  );
};
