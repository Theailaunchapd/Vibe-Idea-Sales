import React, { useState } from 'react';
import { X, Mail, Phone, Copy, Check, Download, Loader2, MessageSquare } from 'lucide-react';
import { VibePitch } from '../services/openaiService';

interface PitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  pitch: VibePitch | null;
  isLoading: boolean;
}

const PitchModal: React.FC<PitchModalProps> = ({ isOpen, onClose, pitch, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  if (!isOpen) return null;

  const copyEmailToClipboard = () => {
    if (pitch?.email) {
      const emailText = `Subject: ${pitch.email.subject}\n\n${pitch.email.body}`;
      navigator.clipboard.writeText(emailText);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const copyPhoneScriptToClipboard = () => {
    if (pitch?.phoneScript) {
      const phoneText = `OPENING:\n${pitch.phoneScript.opening}\n\nVALUE PROPOSITION:\n${pitch.phoneScript.valueProposition}\n\nPAIN POINT ADDRESS:\n${pitch.phoneScript.painPointAddress}\n\nCALL TO ACTION:\n${pitch.phoneScript.callToAction}\n\nOBJECTION HANDLERS:\n${pitch.phoneScript.objectionHandlers.map(o => `- "${o.objection}": ${o.response}`).join('\n')}`;
      navigator.clipboard.writeText(phoneText);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const downloadAsText = () => {
    if (!pitch) return;
    
    const content = `# Vibe Pitch - ${pitch.businessName}
Generated: ${new Date(pitch.generatedAt).toLocaleString()}

## EMAIL PITCH
Subject: ${pitch.email.subject}

${pitch.email.body}

---

## PHONE SCRIPT

### Opening (First 10 seconds)
${pitch.phoneScript.opening}

### Value Proposition (30-second pitch)
${pitch.phoneScript.valueProposition}

### Addressing Pain Points
${pitch.phoneScript.painPointAddress}

### Call to Action
${pitch.phoneScript.callToAction}

### Objection Handlers
${pitch.phoneScript.objectionHandlers.map(o => `**"${o.objection}"**\n${o.response}`).join('\n\n')}
`;
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibe-pitch-${pitch.businessName.replace(/\s+/g, '-').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white border border-gray-200 w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-orange-500 to-pink-500 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <MessageSquare size={24} /> Vibe Pitch
              </h2>
              {pitch && (
                <p className="text-orange-100 mt-1">Converting pitch for {pitch.businessName}</p>
              )}
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
              <p className="text-gray-600 font-medium">Crafting your converting pitch...</p>
              <p className="text-gray-400 text-sm mt-2">This may take 15-30 seconds</p>
            </div>
          ) : pitch ? (
            <div className="p-6">
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setActiveTab('email')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                    activeTab === 'email' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Mail size={18} /> Email Pitch
                </button>
                <button
                  onClick={() => setActiveTab('phone')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                    activeTab === 'phone' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Phone size={18} /> Phone Script
                </button>
              </div>

              {activeTab === 'email' && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Subject Line</label>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{pitch.email.subject}</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 block">Email Body</label>
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                      {pitch.email.body}
                    </div>
                  </div>

                  <button
                    onClick={copyEmailToClipboard}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    {copiedEmail ? <Check size={18} /> : <Copy size={18} />}
                    {copiedEmail ? 'Copied!' : 'Copy Email to Clipboard'}
                  </button>
                </div>
              )}

              {activeTab === 'phone' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <label className="text-xs font-bold text-blue-600 uppercase tracking-wide flex items-center gap-1">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
                      Opening (First 10 seconds)
                    </label>
                    <p className="text-gray-700 mt-2">{pitch.phoneScript.opening}</p>
                  </div>

                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <label className="text-xs font-bold text-green-600 uppercase tracking-wide flex items-center gap-1">
                      <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
                      Value Proposition (30-second pitch)
                    </label>
                    <p className="text-gray-700 mt-2">{pitch.phoneScript.valueProposition}</p>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <label className="text-xs font-bold text-purple-600 uppercase tracking-wide flex items-center gap-1">
                      <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs">3</span>
                      Addressing Their Pain Points
                    </label>
                    <p className="text-gray-700 mt-2">{pitch.phoneScript.painPointAddress}</p>
                  </div>

                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                    <label className="text-xs font-bold text-orange-600 uppercase tracking-wide flex items-center gap-1">
                      <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs">4</span>
                      Call to Action
                    </label>
                    <p className="text-gray-700 mt-2">{pitch.phoneScript.callToAction}</p>
                  </div>

                  <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <label className="text-xs font-bold text-red-600 uppercase tracking-wide mb-3 block">
                      Objection Handlers
                    </label>
                    <div className="space-y-3">
                      {pitch.phoneScript.objectionHandlers.map((handler, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-3 border border-red-100">
                          <p className="text-sm font-semibold text-red-700">"{handler.objection}"</p>
                          <p className="text-sm text-gray-600 mt-1">{handler.response}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={copyPhoneScriptToClipboard}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    {copiedPhone ? <Check size={18} /> : <Copy size={18} />}
                    {copiedPhone ? 'Copied!' : 'Copy Phone Script to Clipboard'}
                  </button>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={downloadAsText}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Download size={18} /> Download Full Pitch (Markdown)
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <MessageSquare size={48} className="mb-4 opacity-50" />
              <p>Failed to generate pitch. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PitchModal;
