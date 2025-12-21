import React from 'react';
import { Sparkles, Briefcase, Building2, Flame, ArrowRight, Zap, CheckCircle2, BarChart3 } from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-lg">
              <Sparkles className="text-white w-4 h-4" />
            </div>
            <span className="text-xl font-bold tracking-tight">Vib3 Sales</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-gray-500 hover:text-black transition-colors hidden sm:block">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-500 hover:text-black transition-colors hidden sm:block">How it Works</a>
            <button 
              onClick={onEnterApp}
              className="bg-black text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              Launch Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            VIB3 AI Agent Now Live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl mx-auto leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Turn Market Chaos into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500">Profitable AI Agencies.</span>
          </h1>
          
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
            The all-in-one intelligence platform that scans job boards, reviews, and Reddit to identify high-value opportunities—then builds the pitch, assets, and plan for you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <button 
              onClick={onEnterApp}
              className="w-full sm:w-auto px-8 py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 group"
            >
              Start Scouting for Free <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={onEnterApp} className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
              <Zap size={20} className="text-gray-400" /> Watch Demo
            </button>
          </div>

          {/* Social Proof */}
          <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col items-center gap-4 opacity-70">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Powering Next-Gen Founders</p>
            <div className="flex gap-8 grayscale opacity-50">
               {/* Simple Placeholder Logos */}
               <div className="font-bold text-xl text-gray-400">Acme.ai</div>
               <div className="font-bold text-xl text-gray-400">ScaleUp</div>
               <div className="font-bold text-xl text-gray-400">Ventures</div>
               <div className="font-bold text-xl text-gray-400">Founders</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-gray-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Three Engines. One Platform.</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Vib3 Sales doesn't just find data. It analyzes market gaps and hands you the blueprint to monetize them.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Briefcase className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Job Market Intelligence</h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Analyze job postings to find companies hiring for roles you can automate. We generate the resume keywords AND the AI service proposal to pitch them.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <CheckCircle2 size={16} className="text-blue-500" /> Application Strategy
                </li>
                <li className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <CheckCircle2 size={16} className="text-blue-500" /> AI Service Blueprint
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl transition-all group relative overflow-hidden">
               <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="text-orange-600" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Business Opportunity Analyzer</h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Identify struggling local businesses based on negative reviews and operational pain points. Get a scored lead list ready for outreach.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <CheckCircle2 size={16} className="text-orange-500" /> Negative Score Algorithm
                </li>
                <li className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <CheckCircle2 size={16} className="text-orange-500" /> Pain Point Extraction
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Flame className="text-yellow-600" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Reddit Trend Scout</h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Scan subreddits for "I wish this existed" posts. We validate the demand, score the idea, and build your 90-day execution roadmap.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <CheckCircle2 size={16} className="text-yellow-500" /> Viral Signal Detection
                </li>
                <li className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <CheckCircle2 size={16} className="text-yellow-500" /> MVP Tech Stack Plan
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">From Search to Service in Minutes</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Vib3 Sales streamlines the entire agency creation workflow.</p>
          </div>

          <div className="relative">
             {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />

            <div className="grid md:grid-cols-3 gap-8 relative z-10">
              {/* Step 1 */}
              <div className="bg-white p-6 text-center">
                <div className="w-16 h-16 mx-auto bg-black text-white rounded-full flex items-center justify-center text-xl font-bold mb-6 shadow-xl border-4 border-white">1</div>
                <h3 className="text-xl font-bold mb-2">Scout Opportunities</h3>
                <p className="text-gray-500 text-sm">Search job boards, business listings, or Reddit trends to find high-value gaps.</p>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-6 text-center">
                <div className="w-16 h-16 mx-auto bg-black text-white rounded-full flex items-center justify-center text-xl font-bold mb-6 shadow-xl border-4 border-white">2</div>
                <h3 className="text-xl font-bold mb-2">AI Analysis</h3>
                <p className="text-gray-500 text-sm">Our agents deep-dive into data to generate scores, pain points, and solution blueprints.</p>
              </div>

               {/* Step 3 */}
               <div className="bg-white p-6 text-center">
                <div className="w-16 h-16 mx-auto bg-black text-white rounded-full flex items-center justify-center text-xl font-bold mb-6 shadow-xl border-4 border-white">3</div>
                <h3 className="text-xl font-bold mb-2">Launch Assets</h3>
                <p className="text-gray-500 text-sm">Use the Vib3 Hub to auto-generate pitches, websites, and demo scripts instantly.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-black text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gray-800 to-black opacity-50" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Ready to build your empire?</h2>
          <p className="text-xl text-gray-400 mb-10">
            Join thousands of smart entrepreneurs using AI to find their next big win.
          </p>
          <button 
            onClick={onEnterApp}
            className="px-10 py-5 bg-white text-black rounded-xl font-bold text-xl hover:bg-gray-100 transition-all shadow-2xl hover:scale-105 active:scale-95"
          >
            Launch Dashboard Now
          </button>
          <p className="mt-6 text-sm text-gray-500">No credit card required • Instant access</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
           <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center">
              <Sparkles className="text-white w-3 h-3" />
            </div>
            <span className="text-lg font-bold tracking-tight">Vib3 Sales</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-500">
            <a href="#" className="hover:text-black">Privacy</a>
            <a href="#" className="hover:text-black">Terms</a>
            <a href="#" className="hover:text-black">Twitter</a>
          </div>
          <div className="mt-4 md:mt-0 text-sm text-gray-400">
            © 2024 Vib3 Sales Inc.
          </div>
        </div>
      </footer>
    </div>
  );
};