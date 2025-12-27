import React, { useEffect, useState } from 'react';
import { SocialIdea, SocialAnalysis, GeneratedDocument } from '../types';
import { analyzeSocialIdea, generatePRD, generateDeveloperGuide } from '../services/openaiService';
import { X, Loader2, Sparkles, Rocket, TrendingUp, Code2, DollarSign, Target, Zap, FileText, Code, ExternalLink, MessageSquare, Send, Bookmark, BookmarkCheck } from 'lucide-react';
import { ScoreBadge } from './ScoreBadge';
import DocumentModal from './DocumentModal';

interface SocialIdeaModalProps {
  idea: SocialIdea;
  onClose: () => void;
  isSaved?: boolean;
  onSaveLead?: (idea: SocialIdea) => void;
  onUnsaveLead?: (ideaId: string) => void;
}

export const SocialIdeaModal: React.FC<SocialIdeaModalProps> = ({ idea, onClose, isSaved, onSaveLead, onUnsaveLead }) => {
  const [analysis, setAnalysis] = useState<SocialAnalysis | null>(idea.analysis || null);
  const [loading, setLoading] = useState(!idea.analysis);
  const [activeTab, setActiveTab] = useState<'opportunity' | 'implementation' | 'market'>('opportunity');
  const [showDocModal, setShowDocModal] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState<GeneratedDocument | null>(null);
  const [docLoading, setDocLoading] = useState(false);
  const [docLoadingType, setDocLoadingType] = useState<'prd' | 'developer_guide'>('prd');

  const handleGeneratePRD = async () => {
    setDocLoadingType('prd');
    setDocLoading(true);
    setShowDocModal(true);
    setGeneratedDoc(null);
    const opportunityData = {
      ideaName: analysis?.ideaName || idea.title,
      oneLiner: analysis?.oneLiner || idea.description,
      author: idea.author,
      authorHandle: idea.authorHandle,
      engagement: idea.engagement,
      hashtags: idea.hashtags,
      category: idea.category,
      aiServiceOpportunity: analysis?.aiServiceOpportunity,
      scores: analysis?.scores,
      difficulty: analysis?.difficulty,
      mvpCost: analysis?.mvpCost,
      mvpTimeline: analysis?.mvpTimeline,
      implementationPlan: analysis?.implementationPlan,
      techStack: analysis?.techStack,
      marketIntelligence: analysis?.marketIntelligence,
      monetizationStrategy: analysis?.monetizationStrategy
    };
    const doc = await generatePRD(opportunityData, 'social', analysis?.ideaName || idea.title);
    setGeneratedDoc(doc);
    setDocLoading(false);
  };

  const handleGenerateDevGuide = async () => {
    setDocLoadingType('developer_guide');
    setDocLoading(true);
    setShowDocModal(true);
    setGeneratedDoc(null);
    const opportunityData = {
      ideaName: analysis?.ideaName || idea.title,
      oneLiner: analysis?.oneLiner || idea.description,
      author: idea.author,
      authorHandle: idea.authorHandle,
      engagement: idea.engagement,
      hashtags: idea.hashtags,
      category: idea.category,
      aiServiceOpportunity: analysis?.aiServiceOpportunity,
      scores: analysis?.scores,
      difficulty: analysis?.difficulty,
      mvpCost: analysis?.mvpCost,
      mvpTimeline: analysis?.mvpTimeline,
      implementationPlan: analysis?.implementationPlan,
      techStack: analysis?.techStack,
      marketIntelligence: analysis?.marketIntelligence,
      monetizationStrategy: analysis?.monetizationStrategy
    };
    const doc = await generateDeveloperGuide(opportunityData, 'social', analysis?.ideaName || idea.title);
    setGeneratedDoc(doc);
    setDocLoading(false);
  };

  useEffect(() => {
    if (!analysis && loading) {
      const fetchData = async () => {
        const result = await analyzeSocialIdea(idea);
        if (result) {
          setAnalysis(result);
          idea.analysis = result; // Cache it
        }
        setLoading(false);
      };
      fetchData();
    }
  }, [idea]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 p-6 flex justify-between items-start z-10">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded uppercase tracking-wide">X.com Analysis</span>
              {analysis?.difficulty && (
                <span className="px-2 py-0.5 bg-white text-gray-700 text-xs font-medium rounded border border-gray-200">
                  {analysis.difficulty}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{analysis?.ideaName || idea.title}</h2>
            <p className="text-gray-600 text-sm mt-1">{analysis?.oneLiner || idea.description}</p>
            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
              <span className="font-medium">{idea.author}</span>
              <span>•</span>
              <a 
                href={idea.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
              >
                {idea.authorHandle} <ExternalLink size={12} />
              </a>
            </div>
            
            {/* Action buttons to engage with the post */}
            <div className="flex items-center gap-2 mt-4">
              <a
                href={idea.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                <ExternalLink size={14} />
                View Post on X
              </a>
              <a
                href={`https://twitter.com/intent/tweet?in_reply_to=${idea.sourceUrl.split('/').pop()}&text=`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
              >
                <MessageSquare size={14} />
                Reply
              </a>
              <a
                href={`https://twitter.com/messages/compose?recipient_id=${idea.authorHandle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600 transition-colors"
              >
                <Send size={14} />
                DM Author
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {analysis && (
              <div className="text-center hidden sm:block">
                <div className="text-[10px] uppercase font-bold text-gray-400">Composite</div>
                <ScoreBadge score={analysis.scores.composite} />
              </div>
            )}
            {(onSaveLead || onUnsaveLead) && (
              <button
                onClick={() => {
                  if (isSaved) onUnsaveLead?.(idea.id);
                  else onSaveLead?.(idea);
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
            <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full text-gray-400 hover:text-gray-900 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50/50 px-6 sticky top-0">
          <button
            onClick={() => setActiveTab('opportunity')}
            className={`py-4 px-6 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'opportunity' ? 'border-blue-500 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500'}`}
          >
            <Sparkles size={16} /> AI Service Opportunity
          </button>
          <button
            onClick={() => setActiveTab('implementation')}
            className={`py-4 px-6 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'implementation' ? 'border-purple-500 text-purple-600 bg-purple-50/50' : 'border-transparent text-gray-500'}`}
          >
            <Rocket size={16} /> Implementation Plan
          </button>
          <button
            onClick={() => setActiveTab('market')}
            className={`py-4 px-6 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'market' ? 'border-green-500 text-green-600 bg-green-50/50' : 'border-transparent text-gray-500'}`}
          >
            <TrendingUp size={16} /> Market & Monetization
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6 sm:p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Loader2 className="animate-spin text-blue-500 w-12 h-12" />
              <p className="text-gray-500 animate-pulse font-medium">Analyzing social signals & creating AI service blueprint...</p>
            </div>
          ) : analysis ? (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* OPPORTUNITY TAB */}
              {activeTab === 'opportunity' && (
                <>
                  {/* Score Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ScoreCard label="Viral Potential" score={analysis.scores.viralPotential} color="blue" />
                    <ScoreCard label="Market Demand" score={analysis.scores.marketDemand} color="green" />
                    <ScoreCard label="Tech Feasibility" score={analysis.scores.technicalFeasibility} color="purple" />
                    <ScoreCard label="AI Readiness" score={analysis.scores.aiReadiness} color="orange" />
                  </div>

                  {/* AI Service Opportunity */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Sparkles size={20} className="text-blue-500" /> AI Service Concept
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase block mb-2">Service Name</span>
                        <h4 className="text-xl font-bold text-gray-900">{analysis.aiServiceOpportunity.serviceName}</h4>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase block mb-2">Description</span>
                        <p className="text-sm text-gray-700 leading-relaxed">{analysis.aiServiceOpportunity.description}</p>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs font-bold text-gray-400 uppercase block mb-2">Value Proposition</span>
                          <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded border border-blue-100">
                            {analysis.aiServiceOpportunity.valueProposition}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-gray-400 uppercase block mb-2">Target Audience</span>
                          <p className="text-sm text-gray-700 bg-green-50 p-3 rounded border border-green-100">
                            {analysis.aiServiceOpportunity.targetAudience}
                          </p>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase block mb-2">Pricing Models</span>
                        <div className="flex flex-wrap gap-2">
                          {analysis.aiServiceOpportunity.pricingModel.map((model, i) => (
                            <span key={i} className="px-3 py-1.5 bg-purple-50 text-purple-700 text-sm font-medium rounded border border-purple-200">
                              {model}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="text-xs font-bold text-gray-400 uppercase mb-1">Difficulty</div>
                      <div className="text-2xl font-bold text-gray-900">{analysis.difficulty}</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="text-xs font-bold text-gray-400 uppercase mb-1">MVP Cost</div>
                      <div className="text-2xl font-bold text-green-600">{analysis.mvpCost}</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="text-xs font-bold text-gray-400 uppercase mb-1">MVP Timeline</div>
                      <div className="text-2xl font-bold text-blue-600">{analysis.mvpTimeline}</div>
                    </div>
                  </div>
                </>
              )}

              {/* IMPLEMENTATION TAB */}
              {activeTab === 'implementation' && (
                <>
                  {/* Implementation Phases */}
                  <div className="space-y-6">
                    <PhaseCard title="Phase 1: Foundation" steps={analysis.implementationPlan.phase1} color="blue" />
                    <PhaseCard title="Phase 2: Development" steps={analysis.implementationPlan.phase2} color="purple" />
                    <PhaseCard title="Phase 3: Launch & Scale" steps={analysis.implementationPlan.phase3} color="green" />
                  </div>

                  {/* Tech Stack */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Code2 size={20} className="text-purple-500" /> Technology Stack
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <TechStackItem label="Frontend" value={analysis.techStack.frontend} />
                      <TechStackItem label="Backend" value={analysis.techStack.backend} />
                      <TechStackItem label="AI/ML" value={analysis.techStack.ai} />
                      <TechStackItem label="Database" value={analysis.techStack.database} />
                    </div>
                  </div>
                </>
              )}

              {/* MARKET TAB */}
              {activeTab === 'market' && (
                <>
                  {/* Market Intelligence */}
                  {analysis.marketIntelligence && (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Target size={20} className="text-green-500" /> Market Intelligence
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <span className="text-xs font-bold text-gray-400 uppercase block mb-2">Market Size</span>
                          <p className="text-lg font-semibold text-gray-900">{analysis.marketIntelligence.marketSize}</p>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-gray-400 uppercase block mb-2">Key Competitors</span>
                          <div className="space-y-2">
                            {analysis.marketIntelligence.competitors.map((comp, i) => (
                              <div key={i} className="flex justify-between items-start p-3 bg-gray-50 rounded border border-gray-100">
                                <span className="font-medium text-gray-900">{comp.name}</span>
                                <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">Weak: {comp.weakness}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-gray-400 uppercase block mb-2">Your Differentiators</span>
                          <ul className="space-y-2">
                            {analysis.marketIntelligence.differentiators.map((diff, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <Zap size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{diff}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Monetization Strategy */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <DollarSign size={20} className="text-green-500" /> Monetization Strategy
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase block mb-2">Revenue Model</span>
                        <p className="text-sm font-semibold text-gray-900 bg-green-50 p-3 rounded border border-green-100">
                          {analysis.monetizationStrategy.revenueModel}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase block mb-2">Recommended Pricing</span>
                        <p className="text-sm font-semibold text-gray-900 bg-blue-50 p-3 rounded border border-blue-100">
                          {analysis.monetizationStrategy.pricing}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase block mb-2">Customer LTV</span>
                        <p className="text-sm font-semibold text-gray-900 bg-purple-50 p-3 rounded border border-purple-100">
                          {analysis.monetizationStrategy.ltv}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Document Generation Buttons */}
                  <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 rounded-xl border border-slate-200">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText size={16} className="text-blue-500" /> Generate Implementation Documents
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Create comprehensive PRD and Developer Guide to build this AI service.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleGeneratePRD}
                        disabled={docLoading}
                        className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <FileText size={16} /> Generate PRD
                      </button>
                      <button
                        onClick={handleGenerateDevGuide}
                        disabled={docLoading}
                        className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Code size={16} /> Generate Dev Guide
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">Failed to load analysis</p>
            </div>
          )}
        </div>

        <DocumentModal
          isOpen={showDocModal}
          onClose={() => setShowDocModal(false)}
          document={generatedDoc}
          isLoading={docLoading}
          loadingType={docLoadingType}
        />
      </div>
    </div>
  );
};

// Helper Components
interface ScoreCardProps {
  label: string;
  score: number;
  color: 'blue' | 'green' | 'orange' | 'purple';
}

const ScoreCard: React.FC<ScoreCardProps> = ({ label, score, color }) => {
  const colorClasses = {
    blue: 'from-blue-400 to-blue-600 text-blue-600',
    green: 'from-green-400 to-green-600 text-green-600',
    orange: 'from-orange-400 to-orange-600 text-orange-600',
    purple: 'from-purple-400 to-purple-600 text-purple-600',
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <div className="text-xs font-bold text-gray-400 uppercase mb-2">{label}</div>
      <div className={`text-3xl font-bold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}>
        {score}
      </div>
    </div>
  );
};

interface PhaseCardProps {
  title: string;
  steps: string[];
  color: 'blue' | 'purple' | 'green';
}

const PhaseCard: React.FC<PhaseCardProps> = ({ title, steps, color }) => {
  const colorClasses = {
    blue: 'bg-blue-400',
    purple: 'bg-purple-400',
    green: 'bg-green-400',
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
      <div className={`absolute top-0 left-0 h-full w-1 ${colorClasses[color]}`} />
      <h4 className="font-bold text-gray-900 mb-4 ml-4">{title}</h4>
      <ul className="space-y-2 ml-4">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
              {i + 1}
            </span>
            <span className="text-sm text-gray-700">{step}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

interface TechStackItemProps {
  label: string;
  value: string;
}

const TechStackItem: React.FC<TechStackItemProps> = ({ label, value }) => (
  <div className="p-3 bg-gray-50 rounded border border-gray-100">
    <span className="text-xs font-bold text-gray-400 uppercase block mb-1">{label}</span>
    <span className="text-sm font-medium text-gray-900">{value}</span>
  </div>
);
