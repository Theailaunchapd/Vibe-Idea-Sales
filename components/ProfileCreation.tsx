
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { User, Briefcase, Zap, ArrowRight, Sparkles, ChevronLeft, Check, ShieldCheck } from 'lucide-react';

interface ProfileCreationProps {
  onComplete: (profile: UserProfile) => void;
  onBack: () => void;
}

export const ProfileCreation: React.FC<ProfileCreationProps> = ({ onComplete, onBack }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const focusOptions = ['SaaS Automation', 'Agency Growth', 'Lead Gen', 'Content AI', 'B2B Sales', 'No-Code Tools'];

  const toggleFocus = (option: string) => {
    if (selectedFocus.includes(option)) {
      setSelectedFocus(selectedFocus.filter(f => f !== option));
    } else {
      if (selectedFocus.length < 3) {
        setSelectedFocus([...selectedFocus, option]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && role && selectedFocus.length > 0) {
      setIsSubmitting(true);
      // Simulate "Setting up workspace" delay
      setTimeout(() => {
        onComplete({ 
            name, 
            role, 
            focus: selectedFocus,
            avatarInitial: name.charAt(0).toUpperCase()
        });
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-3xl opacity-50" />
          <div className="absolute top-[40%] right-[0%] w-[40%] h-[40%] bg-purple-100 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl border border-gray-100 p-8 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        <button 
            onClick={onBack}
            className="absolute top-6 left-6 text-gray-400 hover:text-gray-900 transition-colors"
        >
            <ChevronLeft size={20} />
        </button>

        <div className="text-center mb-8 pt-4">
            <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Sparkles size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Agent Identity</h2>
            <p className="text-gray-500 text-sm mt-2">Initialize your profile to access the Vib3 Intelligence Dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
                <div className="relative group">
                    <User className="absolute top-3.5 left-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full Name"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                </div>

                <div className="relative group">
                    <Briefcase className="absolute top-3.5 left-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                        type="text" 
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="Primary Role (e.g. Founder)"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                    <Zap size={14} className="text-yellow-500" /> Focus Areas (Max 3)
                </label>
                <div className="flex flex-wrap gap-2">
                    {focusOptions.map(option => {
                        const isSelected = selectedFocus.includes(option);
                        return (
                            <button
                                key={option}
                                type="button"
                                onClick={() => toggleFocus(option)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                    isSelected 
                                    ? 'bg-black text-white border-black shadow-md' 
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
            </div>

            <button 
                type="submit"
                disabled={!name || !role || selectedFocus.length === 0 || isSubmitting}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-xl flex items-center justify-center gap-2 transition-all ${
                    !name || !role || selectedFocus.length === 0 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-95'
                }`}
            >
                {isSubmitting ? (
                    <>
                        <ShieldCheck className="animate-pulse" /> Setting up Workspace...
                    </>
                ) : (
                    <>
                        Initialize Dashboard <ArrowRight size={18} />
                    </>
                )}
            </button>

            <p className="text-center text-xs text-gray-400">
                Secure access for AI-powered sales intelligence.
            </p>
        </form>
      </div>
    </div>
  );
};
