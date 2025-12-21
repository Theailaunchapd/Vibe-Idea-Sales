import React, { useState } from 'react';
import { JobListing, JobAnalysis } from '../types';
import { generateColdEmail, generateWebsiteCode, generateDemoScript } from '../services/openaiService';
import { ArrowLeft, Mail, Monitor, PlayCircle, Loader2, Copy, RefreshCw, Check, Code, Zap, AlertCircle } from 'lucide-react';

interface Vib3HubProps {
  business: JobListing; // Renamed locally for compatibility but it's a JobListing now
  opportunity: JobAnalysis | undefined;
  onBack: () => void;
}

type Tab = 'email' | 'website' | 'demo';

export const Vib3Hub: React.FC<Vib3HubProps> = ({ business: job, opportunity: analysis, onBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Content States
  const [emailContent, setEmailContent] = useState<{ subject: string; body: string } | null>(null);
  const [websiteCode, setWebsiteCode] = useState<string | null>(null);
  const [demoScript, setDemoScript] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleGenerateWebsite = async () => {
    setError(null);
    setLoading(true);
    try {
        const result = await generateWebsiteCode(job);
        if (result) {
            setWebsiteCode(result);
        } else {
            setError("Failed to generate website. Please try again.");
        }
    } catch (e) {
        setError("An unexpected error occurred.");
    } finally {
        setLoading(false);
    }
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
                onClick={() => setActiveTab('website')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'website' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
                <Monitor size={18} /> Agency Landing Page
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
             <button onClick={() => setActiveTab('website')} className={`p-2 rounded-lg ${activeTab === 'website' ? 'text-purple-600 bg-purple-50' : 'text-gray-500'}`}><Monitor /></button>
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

            {/* Website Tab */}
            {activeTab === 'website' && (
                <div className="h-full flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                         <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Agency Landing Page</h2>
                            <p className="text-gray-500">Create a landing page for your new AI Service Agency.</p>
                        </div>
                        <div className="flex gap-2">
                            {websiteCode && (
                                <button 
                                    onClick={() => setShowCode(!showCode)}
                                    className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                                >
                                    <Code size={16} /> {showCode ? 'View Preview' : 'View Code'}
                                </button>
                            )}
                            <button 
                                onClick={handleGenerateWebsite}
                                disabled={loading}
                                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 shadow-md"
                            >
                                {loading ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                                {websiteCode ? 'Redesign' : 'Build Site'}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 mb-4 flex items-center gap-2">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    {websiteCode && !loading ? (
                        <div className="flex-1 bg-white rounded-xl overflow-hidden border border-gray-200 relative shadow-2xl animate-in fade-in">
                             {showCode ? (
                                 <pre className="p-4 text-xs text-gray-300 font-mono h-full overflow-auto bg-gray-900">
                                     {websiteCode}
                                 </pre>
                             ) : (
                                <iframe 
                                    srcDoc={websiteCode} 
                                    className="w-full h-full bg-white" 
                                    title="Website Preview"
                                    sandbox="allow-scripts"
                                />
                             )}
                        </div>
                    ) : loading ? (
                        <div className="flex-1 flex items-center justify-center text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm">
                             <div className="text-center">
                                <Loader2 className="animate-spin w-8 h-8 mx-auto mb-2 text-purple-600" />
                                <p>Designing high-conversion landing page...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl text-gray-400 bg-white">
                             <p>Create a site for 'Auto{job.title.replace(/\s+/g, '')}.ai'.</p>
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