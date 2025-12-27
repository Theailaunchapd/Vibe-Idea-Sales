import React, { useState } from 'react';
import { X, FileText, Code, Download, Copy, Check, Loader2 } from 'lucide-react';
import type { GeneratedDocument } from '../types';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: GeneratedDocument | null;
  isLoading: boolean;
  loadingType?: 'prd' | 'developer_guide';
}

export default function DocumentModal({
  isOpen,
  onClose,
  document,
  isLoading,
  loadingType
}: DocumentModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (document?.content) {
      await navigator.clipboard.writeText(document.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (document) {
      const blob = new Blob([document.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${document.title.replace(/\s+/g, '_')}.md`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getIcon = () => {
    if (isLoading) {
      return loadingType === 'prd' ? FileText : Code;
    }
    return document?.type === 'prd' ? FileText : Code;
  };

  const getTitle = () => {
    if (isLoading) {
      return loadingType === 'prd' ? 'Generating PRD...' : 'Generating Developer Guide...';
    }
    return document?.title || 'Document';
  };

  const Icon = getIcon();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${document?.type === 'prd' ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
              <Icon className={`w-5 h-5 ${document?.type === 'prd' ? 'text-blue-300' : 'text-purple-300'}`} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{getTitle()}</h2>
              {document && (
                <p className="text-sm text-slate-300">
                  {document.sourceType.charAt(0).toUpperCase() + document.sourceType.slice(1)} Source: {document.sourceName}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {document && !isLoading && (
              <>
                <button
                  onClick={handleCopy}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-sm">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span className="text-sm">Copy</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                  title="Download as Markdown"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Download</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {loadingType === 'prd' ? 'Creating Your PRD...' : 'Building Developer Guide...'}
              </h3>
              <p className="text-slate-600 text-center max-w-md">
                {loadingType === 'prd'
                  ? 'Our AI is crafting a comprehensive Product Requirements Document with market analysis, user personas, feature specifications, and go-to-market strategy.'
                  : 'Our AI is generating a detailed technical specification including architecture diagrams, database schemas, API specs, and implementation guides.'}
              </p>
              <p className="text-sm text-slate-500 mt-4">This may take 30-60 seconds...</p>
            </div>
          ) : document ? (
            <div className="prose prose-slate max-w-none">
              <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700 overflow-x-auto">
                  {document.content}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-20 text-slate-500">
              No document generated yet.
            </div>
          )}
        </div>

        {document && !isLoading && (
          <div className="border-t border-slate-200 px-6 py-4 bg-white flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Generated on {new Date(document.generatedAt).toLocaleString()}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Markdown'}
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download .md
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
