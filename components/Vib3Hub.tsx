import React, { useState } from 'react';
import { JobListing, JobAnalysis } from '../types';
import { generateColdEmail, generateWorkflowDemo, generateDemoScript, WorkflowDemo } from '../services/openaiService';
import { ArrowLeft, Mail, PlayCircle, Loader2, Copy, Check, Zap, AlertCircle, Inbox, Brain, CheckCircle, Send, Clock, FileText, Users, Database, Sparkles, ArrowRight, X, TrendingUp, Workflow } from 'lucide-react';

interface Vib3HubProps {
  business: JobListing; // Renamed locally for compatibility but it's a JobListing now
  opportunity: JobAnalysis | undefined;
  onBack: () => void;
}

type Tab = 'email' | 'workflow' | 'demo';

const iconMap: { [key: string]: React.ReactNode } = {
  inbox: <Inbox size={20} />,
  zap: <Zap size={20} />,
  brain: <Brain size={20} />,
  checkCircle: <CheckCircle size={20} />,
  send: <Send size={20} />,
  clock: <Clock size={20} />,
  fileText: <FileText size={20} />,
  users: <Users size={20} />,
  database: <Database size={20} />,
  sparkles: <Sparkles size={20} />,
};

export const Vib3Hub: React.FC<Vib3HubProps> = ({ business: job, opportunity: analysis, onBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [emailContent, setEmailContent] = useState<{ subject: string; body: string } | null>(null);
  const [workflowDemo, setWorkflowDemo] = useState<WorkflowDemo | null>(null);
  const [demoScript, setDemoScript] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [animatingStep, setAnimatingStep] = useState<number | null>(null);

  // Generators
  const handleGenerateEmail = async () => {
    // We allow generation even if analysis is partial, using fallbacks in service
    setError(null);
    setLoading(true);
    try {
        const result = await generateColdEmail(job, analysis as JobAnalysis);
        if (result) {
            setEmailContent(result);
        } else {
            setError("Failed to generate pitch. Please try again.");
        }
    } catch (e) {
        setError("An unexpected error occurred.");
    } finally {
        setLoading(false);
    }
  };

  const handleGenerateWorkflowDemo = async () => {
    setError(null);
    setLoading(true);
    try {
        const result = await generateWorkflowDemo(job, analysis as JobAnalysis);
        if (result) {
            setWorkflowDemo(result);
            runWorkflowAnimation(result.workflow.length);
        } else {
            setError("Failed to generate workflow demo. Please try again.");
        }
    } catch (e) {
        setError("An unexpected error occurred.");
    } finally {
        setLoading(false);
    }
  };

  const runWorkflowAnimation = (stepCount: number) => {
    setAnimatingStep(0);
    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current >= stepCount) {
        clearInterval(interval);
        setAnimatingStep(null);
      } else {
        setAnimatingStep(current);
      }
    }, 800);
  };

  const handleGenerateDemo = async () => {
    setError(null);
    setLoading(true);
    try {
        const result = await generateDemoScript(job, analysis as JobAnalysis);
        if (result) {
            setDemoScript(result);
        } else {
             setError("Failed to generate demo script.");
        }
    } catch (e) {
        setError("An unexpected error occurred.");
    } finally {
        setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 text-gray-900 min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur sticky top-0 z-30 px-6 py-4 flex items-center gap-4">
        <button 
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors"
        >
            <ArrowLeft size={20} />
        </button>
        <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-violet-600">Vib3 Hub</span> 
                <span className="text-gray-400">/</span> 
                <span className="text-gray-900">{analysis?.aiServiceOpportunity?.serviceName || 'AI Service'}</span>
            </h1>
            <p className="text-xs text-gray-500">Creating Assets for: <span className="font-semibold text-gray-700">{job.title} at {job.company}</span></p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-64 border-r border-gray-200 bg-white hidden sm:flex flex-col p-4 gap-2">
            <button 
                onClick={() => setActiveTab('email')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'email' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
                <Mail size={18} /> Pitch Hiring Manager
            </button>
            <button 
                onClick={() => setActiveTab('workflow')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'workflow' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
                <Workflow size={18} /> Workflow Demo
            </button>
            <button 
                onClick={() => setActiveTab('demo')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'demo' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
                <PlayCircle size={18} /> Service Demo
            </button>
        </div>

        {/* Mobile Nav */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around z-50">
             <button onClick={() => setActiveTab('email')} className={`p-2 rounded-lg ${activeTab === 'email' ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}><Mail /></button>
             <button onClick={() => setActiveTab('workflow')} className={`p-2 rounded-lg ${activeTab === 'workflow' ? 'text-purple-600 bg-purple-50' : 'text-gray-500'}`}><Workflow /></button>
             <button onClick={() => setActiveTab('demo')} className={`p-2 rounded-lg ${activeTab === 'demo' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-500'}`}><PlayCircle /></button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50 relative">
            
            {/* Email Tab */}
            {activeTab === 'email' && (
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">B2B Pitch Generator</h2>
                            <p className="text-gray-500">Persuade the hiring manager to automate instead of hire.</p>
                        </div>
                        <button 
                            onClick={handleGenerateEmail}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 shadow-md"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />} 
                            {emailContent ? 'Regenerate Pitch' : 'Generate Pitch'}
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-center gap-2">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    {emailContent && !loading ? (
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xl relative group animate-in fade-in slide-in-from-bottom-2">
                             <button 
                                onClick={() => copyToClipboard(`Subject: ${emailContent.subject}\n\n${emailContent.body}`)}
                                className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
                             >
                                {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                             </button>

                            <div className="mb-4">
                                <span className="text-xs text-gray-400 uppercase font-bold">Subject Line</span>
                                <div className="text-lg font-medium text-gray-900 mt-1 select-all">{emailContent.subject}</div>
                            </div>
                            <div className="w-full h-px bg-gray-100 my-4" />
                            <div>
                                <span className="text-xs text-gray-400 uppercase font-bold">Email Body</span>
                                <div className="text-gray-700 mt-2 whitespace-pre-wrap font-sans leading-relaxed select-all">
                                    {emailContent.body}
                                </div>
                            </div>
                        </div>
                    ) : loading ? (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <Loader2 className="animate-spin w-8 h-8 mx-auto mb-2 text-blue-600" />
                                <p>Analyzing job snippet & crafting pitch...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl text-gray-400 bg-white">
                            <p>Generate a pitch to send to {job.company}.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Workflow Demo Tab */}
            {activeTab === 'workflow' && (
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Workflow Demo Creator</h2>
                            <p className="text-gray-500">Generate a visual demo to show customers how your AI service works.</p>
                        </div>
                        <button 
                            onClick={handleGenerateWorkflowDemo}
                            disabled={loading}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 shadow-md"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                            {workflowDemo ? 'Regenerate Demo' : 'Create Demo'}
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-center gap-2">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    {workflowDemo && !loading ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                            {/* Header Card */}
                            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 rounded-2xl text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
                                <div className="relative z-10">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-4 border border-white/10">
                                        <Sparkles size={12} className="text-yellow-300" /> CUSTOMER PITCH DEMO
                                    </div>
                                    <h2 className="text-3xl font-bold mb-2">{workflowDemo.serviceName}</h2>
                                    <p className="text-purple-100 text-lg">{workflowDemo.tagline}</p>
                                </div>
                            </div>

                            {/* Workflow Steps */}
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Workflow className="text-purple-600" size={20} /> How It Works
                                </h3>
                                <div className="space-y-4">
                                    {workflowDemo.workflow.map((step, idx) => (
                                        <div 
                                            key={idx} 
                                            className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-500 ${
                                                animatingStep !== null && idx <= animatingStep 
                                                    ? 'bg-purple-50 border-purple-200 shadow-md' 
                                                    : 'bg-gray-50 border-gray-100'
                                            }`}
                                        >
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                                                animatingStep !== null && idx <= animatingStep 
                                                    ? 'bg-purple-600 text-white shadow-lg' 
                                                    : 'bg-gray-200 text-gray-500'
                                            }`}>
                                                {iconMap[step.icon] || <Zap size={20} />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold text-purple-600">STEP {step.step}</span>
                                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{step.duration}</span>
                                                </div>
                                                <h4 className="font-bold text-gray-900">{step.title}</h4>
                                                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                                                <p className="text-xs text-purple-600 mt-2 font-medium">{step.automation}</p>
                                            </div>
                                            {animatingStep !== null && idx <= animatingStep && (
                                                <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => runWorkflowAnimation(workflowDemo.workflow.length)}
                                    className="mt-6 w-full py-3 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    <PlayCircle size={18} /> Replay Animation
                                </button>
                            </div>

                            {/* Metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                                    <Clock className="mx-auto text-blue-500 mb-2" size={24} />
                                    <div className="text-xl font-bold text-gray-900">{workflowDemo.metrics.timesSaved}</div>
                                    <div className="text-xs text-gray-500">Time Saved</div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                                    <TrendingUp className="mx-auto text-green-500 mb-2" size={24} />
                                    <div className="text-xl font-bold text-gray-900">{workflowDemo.metrics.costReduction}</div>
                                    <div className="text-xs text-gray-500">Cost Reduction</div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                                    <CheckCircle className="mx-auto text-purple-500 mb-2" size={24} />
                                    <div className="text-xl font-bold text-gray-900">{workflowDemo.metrics.accuracy}</div>
                                    <div className="text-xs text-gray-500">Accuracy</div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                                    <Zap className="mx-auto text-orange-500 mb-2" size={24} />
                                    <div className="text-xl font-bold text-gray-900">{workflowDemo.metrics.availability}</div>
                                    <div className="text-xs text-gray-500">Availability</div>
                                </div>
                            </div>

                            {/* Before/After */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                                    <h4 className="font-bold text-red-800 mb-4 flex items-center gap-2">
                                        <X className="text-red-500" size={18} /> {workflowDemo.beforeAfter.before.title}
                                    </h4>
                                    <ul className="space-y-2">
                                        {workflowDemo.beforeAfter.before.items.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                                                <X size={14} className="text-red-400 mt-1 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                                    <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                                        <CheckCircle className="text-green-500" size={18} /> {workflowDemo.beforeAfter.after.title}
                                    </h4>
                                    <ul className="space-y-2">
                                        {workflowDemo.beforeAfter.after.items.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                                                <CheckCircle size={14} className="text-green-500 mt-1 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-xl text-center">
                                <p className="text-white font-medium text-lg">{workflowDemo.callToAction}</p>
                                <button className="mt-4 bg-white text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center gap-2 mx-auto">
                                    Schedule Demo <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    ) : loading ? (
                        <div className="h-64 flex items-center justify-center text-gray-500 bg-white rounded-xl border border-gray-200">
                            <div className="text-center">
                                <Loader2 className="animate-spin w-8 h-8 mx-auto mb-2 text-purple-600" />
                                <p>Creating workflow demo for your pitch...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl text-gray-400 bg-white">
                            <div className="text-center">
                                <Workflow size={48} className="mx-auto mb-4 opacity-50" />
                                <p>Create a visual demo to show {job.company} how your AI replaces the {job.title} role.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Demo Tab */}
            {activeTab === 'demo' && (
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Simulation Script</h2>
                            <p className="text-gray-500">A script demonstrating how your AI Service handles the job tasks.</p>
                        </div>
                        <button 
                            onClick={handleGenerateDemo}
                            disabled={loading}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 shadow-md"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                            {demoScript ? 'Regenerate' : 'Create Script'}
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-center gap-2">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    {demoScript && !loading ? (
                        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-xl relative animate-in fade-in slide-in-from-bottom-2">
                             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-t-xl" />
                             <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                <PlayCircle className="mr-2 text-emerald-600" /> AI Task Simulation
                             </h3>
                            <div className="space-y-4 font-mono text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {demoScript}
                            </div>
                        </div>
                    ) : loading ? (
                         <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <Loader2 className="animate-spin w-8 h-8 mx-auto mb-2 text-emerald-600" />
                                <p>Simulating AI logic...</p>
                            </div>
                        </div>
                    ) : (
                         <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl text-gray-400 bg-white">
                             <p>Generate a script showing the AI doing the job.</p>
                        </div>
                    )}
                </div>
            )}

        </div>
      </div>
    </div>
  );
};