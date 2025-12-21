import React, { useEffect, useState } from 'react';
import { RedditIdea, RedditAnalysis } from '../types';
import { analyzeRedditIdea } from '../services/openaiService';
import { X, Loader2, Target, Zap, TrendingUp, Code2, Rocket, Globe, Palette } from 'lucide-react';
import { ScoreBadge } from './ScoreBadge';

interface RedditIdeaModalProps {
  idea: RedditIdea;
  onClose: () => void;
}

export const RedditIdeaModal: React.FC<RedditIdeaModalProps> = ({ idea, onClose }) => {
  const [analysis, setAnalysis] = useState<RedditAnalysis | null>(idea.analysis || null);
  const [loading, setLoading] = useState(!idea.analysis);
  const [activeTab, setActiveTab] = useState<'blueprint' | 'roadmap' | 'tech'>('blueprint');

  useEffect(() => {
    if (!analysis && loading) {
      const fetchData = async () => {
        const result = await analyzeRedditIdea(idea);
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
        <div className="bg-white border-b border-gray-100 p-6 flex justify-between items-start z-10">
            <div>
                 <div className="flex items-center gap-2 mb-2">
                     <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded uppercase tracking-wide">Reddit Scout Analysis</span>
                     {analysis?.difficulty && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded border border-gray-200">{analysis.difficulty}</span>}
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900">{analysis?.ideaName || idea.title}</h2>
                 <p className="text-gray-500 text-sm mt-1">{analysis?.oneLiner || idea.problem}</p>
            </div>
            <div className="flex items-center gap-4">
                 {analysis && (
                     <div className="text-center hidden sm:block">
                         <div className="text-[10px] uppercase font-bold text-gray-400">Score</div>
                         <ScoreBadge score={analysis.scores.composite} />
                     </div>
                 )}
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-colors">
                    <X size={24} />
                </button>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50/50 px-6 sticky top-0">
             <button onClick={() => setActiveTab('blueprint')} className={`py-4 px-6 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'blueprint' ? 'border-orange-500 text-orange-600 bg-orange-50/50' : 'border-transparent text-gray-500'}`}>
                <Target size={16} /> Blueprint & Scores
             </button>
             <button onClick={() => setActiveTab('roadmap')} className={`py-4 px-6 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'roadmap' ? 'border-blue-500 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500'}`}>
                <Rocket size={16} /> 90-Day Roadmap
             </button>
             <button onClick={() => setActiveTab('tech')} className={`py-4 px-6 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'tech' ? 'border-purple-500 text-purple-600 bg-purple-50/50' : 'border-transparent text-gray-500'}`}>
                <Code2 size={16} /> Tech Stack
             </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6 sm:p-8">
            {loading ? (
                 <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <Loader2 className="animate-spin text-orange-500 w-12 h-12" />
                    <p className="text-gray-500 animate-pulse font-medium">Scouting Reddit signals & building roadmap...</p>
                 </div>
            ) : analysis ? (
                <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* BLUEPRINT TAB */}
                    {activeTab === 'blueprint' && (
                        <>
                            {/* Score Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <ScoreCard label="Market Viability" score={analysis.scores.marketViability} color="blue" />
                                <ScoreCard label="Tech Feasibility" score={analysis.scores.technicalFeasibility} color="green" />
                                <ScoreCard label="Validation" score={analysis.scores.validationStrength} color="orange" />
                                <ScoreCard label="Execution Speed" score={analysis.scores.executionSpeed} color="purple" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp size={18} /> Market Intel</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-xs font-bold text-gray-400 uppercase">Top Keywords</span>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {analysis.marketIntel?.keywords.slice(0, 5).map((kw, i) => (
                                                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200">{kw.keyword}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-gray-400 uppercase">Competitors</span>
                                            <ul className="mt-2 space-y-2">
                                                {analysis.marketIntel?.competitors.map((comp, i) => (
                                                    <li key={i} className="text-sm text-gray-700 flex justify-between">
                                                        <span className="font-medium">{comp.name}</span>
                                                        <span className="text-xs text-red-500">Weakness: {comp.weakness}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Globe size={18} /> Landing Page Concept</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="p-3 bg-gray-50 rounded border border-gray-100">
                                            <span className="block text-xs font-bold text-gray-400 uppercase mb-1">Headline</span>
                                            <span className="font-serif italic text-gray-800 text-lg">"{analysis.landingPage?.headline}"</span>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded border border-gray-100">
                                            <span className="block text-xs font-bold text-gray-400 uppercase mb-1">CTA Button</span>
                                            <span className="bg-black text-white px-3 py-1 rounded text-xs font-bold">{analysis.landingPage?.cta}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-gray-400 uppercase">Colors</span>
                                            <div className="flex gap-2 mt-1">
                                                {analysis.landingPage?.colorPalette.map((color, i) => (
                                                    <div key={i} className="w-8 h-8 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: color }} title={color} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ROADMAP TAB */}
                    {activeTab === 'roadmap' && (
                        <div className="space-y-6">
                            {analysis.executionRoadmap?.phases.map((phase, i) => (
                                <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                                     <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-blue-400 to-purple-500" />
                                     <div className="flex justify-between items-center mb-4">
                                         <h3 className="font-bold text-lg text-gray-900">{phase.name}</h3>
                                         <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">{phase.duration}</span>
                                     </div>
                                     <div className="space-y-3">
                                         {phase.tasks.map((task, j) => (
                                             <div key={j} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                                                 <div className="w-5 h-5 rounded-full bg-white border border-gray-300 flex items-center justify-center text-xs font-bold text-gray-400 mt-0.5">{j+1}</div>
                                                 <div>
                                                     <p className="text-sm font-medium text-gray-800">{task.task}</p>
                                                     <p className="text-xs text-gray-500 mt-1">Deliverable: {task.deliverable}</p>
                                                 </div>
                                             </div>
                                         ))}
                                     </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* TECH TAB */}
                    {activeTab === 'tech' && analysis.techStack && (
                        <div className="bg-gray-900 text-white p-8 rounded-2xl shadow-xl">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xl font-bold flex items-center gap-2"><Code2 className="text-green-400" /> {analysis.techStack.stackName}</h3>
                                    <p className="text-gray-400 text-sm mt-1">{analysis.techStack.justification}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white/10 p-4 rounded-xl border border-white/5">
                                    <span className="text-xs text-gray-400 uppercase font-bold">Frontend</span>
                                    <div className="text-lg font-mono text-blue-300 mt-1">{analysis.techStack.frontend}</div>
                                </div>
                                <div className="bg-white/10 p-4 rounded-xl border border-white/5">
                                    <span className="text-xs text-gray-400 uppercase font-bold">Backend</span>
                                    <div className="text-lg font-mono text-purple-300 mt-1">{analysis.techStack.backend}</div>
                                </div>
                                <div className="bg-white/10 p-4 rounded-xl border border-white/5">
                                    <span className="text-xs text-gray-400 uppercase font-bold">Database</span>
                                    <div className="text-lg font-mono text-green-300 mt-1">{analysis.techStack.database}</div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-white mb-4">Setup Checklist</h4>
                                <ul className="space-y-3">
                                    {analysis.techStack.setupSteps.map((step, i) => (
                                        <li key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                                            <Zap size={14} className="text-yellow-400" /> {step}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                </div>
            ) : (
                <div className="text-center text-red-500">Failed to load analysis.</div>
            )}
        </div>
      </div>
    </div>
  );
};

const ScoreCard = ({ label, score, color }: { label: string, score: number, color: string }) => {
    // Simple color mapping
    const colors: Record<string, string> = {
        blue: 'text-blue-600 bg-blue-50',
        green: 'text-green-600 bg-green-50',
        orange: 'text-orange-600 bg-orange-50',
        purple: 'text-purple-600 bg-purple-50'
    };

    return (
        <div className={`p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center ${colors[color] || 'bg-gray-50'}`}>
            <span className="text-3xl font-bold mb-1">{score}</span>
            <span className="text-[10px] uppercase font-bold tracking-wide opacity-80">{label}</span>
        </div>
    );
};