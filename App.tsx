import React, { useEffect, useMemo, useState } from 'react';
import { Business, CrmLead, JobListing, RedditIdea, UserProfile } from './types';
import { searchJobs, searchBusinessOpportunities, scanRedditIdeas } from './services/openaiService';
import { JobCard } from './components/JobCard';
import { BusinessCard } from './components/BusinessCard';
import { RedditIdeaCard } from './components/RedditIdeaCard';
import { JobModal } from './components/JobModal';
import { OpportunityModal } from './components/OpportunityModal';
import { RedditIdeaModal } from './components/RedditIdeaModal';
import { Vib3Hub } from './components/Vib3Hub';
import { LandingPage } from './components/LandingPage';
import { ProfileCreation } from './components/ProfileCreation';
import { ProfileDashboard } from './components/ProfileDashboard';
import { Briefcase, Building2, ChevronDown, Flame, Loader2, MapPin } from 'lucide-react';
import { clearUserProfile, ensureUserId, loadCrmLeads, mergeLead, saveCrmLeads, upsertLeadFromBusiness } from './services/crmStorage';

type ViewState = 'landing' | 'profile' | 'dashboard' | 'vib3hub';
type SearchMode = 'jobs' | 'businesses' | 'reddit';

const App: React.FC = () => {
  const [appView, setAppView] = useState<ViewState | 'account'>('landing');
  const [searchMode, setSearchMode] = useState<SearchMode>('jobs');
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  
  // User Profile State (with persistence)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('vib3_user');
      const parsed = saved ? JSON.parse(saved) : null;
      return ensureUserId(parsed);
    } catch (e) {
      return null;
    }
  });

  // Saved Leads CRM (per-user)
  const userId = userProfile?.id || null;
  const [crmLeads, setCrmLeads] = useState<CrmLead[]>(() => (userId ? loadCrmLeads(userId) : []));

  useEffect(() => {
    if (!userId) {
      setCrmLeads([]);
      return;
    }
    setCrmLeads(loadCrmLeads(userId));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    try {
      saveCrmLeads(userId, crmLeads);
    } catch {
      // ignore
    }
  }, [userId, crmLeads]);

  // Data State
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [redditIdeas, setRedditIdeas] = useState<RedditIdea[]>([]);
  
  // Selection State
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [selectedRedditIdea, setSelectedRedditIdea] = useState<RedditIdea | null>(null);
  
  // Vib3 Hub State (Active Item)
  const [activeHubItem, setActiveHubItem] = useState<JobListing | Business | null>(null);

  const handleGetStarted = () => {
      if (userProfile) {
          setAppView('dashboard');
      } else {
          setAppView('profile');
      }
  };

  const handleProfileComplete = (profile: UserProfile) => {
      const ensured = ensureUserId(profile) || profile;
      localStorage.setItem('vib3_user', JSON.stringify(ensured));
      setUserProfile(ensured);
      setAppView('dashboard');
  };

  const crmBusinessIdSet = useMemo(() => new Set(crmLeads.map((l) => l.businessId)), [crmLeads]);

  const saveBusinessLead = (business: Business) => {
    if (!userId) return;
    setCrmLeads((prev) => {
      const existing = prev.find((l) => l.businessId === business.id);
      if (existing) {
        return prev.map((l) => (l.id === existing.id ? mergeLead(l, { business }) : l));
      }
      return [upsertLeadFromBusiness({ ownerUserId: userId, business }), ...prev];
    });
  };

  const unsaveBusinessLead = (businessId: string) => {
    if (!userId) return;
    setCrmLeads((prev) => prev.filter((l) => l.businessId !== businessId));
  };

  const updateCrmLead = (leadId: string, patch: Partial<CrmLead>) => {
    if (!userId) return;
    setCrmLeads((prev) => prev.map((l) => (l.id === leadId ? mergeLead(l, patch) : l)));
  };

  const deleteCrmLead = (leadId: string) => {
    if (!userId) return;
    setCrmLeads((prev) => prev.filter((l) => l.id !== leadId));
  };

  const updateUserProfile = (patch: Partial<UserProfile>) => {
    if (!userProfile) return;
    const updated: UserProfile = ensureUserId({ ...userProfile, ...patch }) || { ...userProfile, ...patch };
    try {
      localStorage.setItem('vib3_user', JSON.stringify(updated));
    } catch {
      // ignore
    }
    setUserProfile(updated);
  };

  const handleSignOut = () => {
    clearUserProfile();
    setUserProfile(null);
    setCrmLeads([]);
    setAppView('landing');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query && searchMode !== 'reddit') return; // Reddit search can have default

    setLoading(true);
    setJobs([]);
    setBusinesses([]);
    setRedditIdeas([]);

    try {
      if (searchMode === 'jobs') {
          const results = await searchJobs(query, location);
          setJobs(results);
      } else if (searchMode === 'businesses') {
          // For businesses, query is the Industry
          const results = await searchBusinessOpportunities(query, location);
          setBusinesses(results);
      } else {
          // Reddit Search
          // Query can be "subreddit" or "topic" - let's treat query as Topic, location as Subreddit (optional)
          const results = await scanRedditIdeas(location, query); // Swapped for UX: Location input acts as Subreddit
          setRedditIdeas(results);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenVib3Hub = (item: JobListing | Business) => {
      let hubPayload: any = item;
      
      if ('name' in item) { // It's a Business
          // Adapting Business to the JobListing structure that Vib3Hub expects
          hubPayload = {
              title: item.activeHiringRole || 'Operational Role',
              company: item.name || 'Target Business',
              // Use pain points as the "snippet" to give context to the generator
              snippet: item.painPoints && item.painPoints.length > 0 
                ? `Key issues: ${item.painPoints.map(p => p.title).join(', ')}. ${item.painPoints[0].description}`
                : 'Business operations improvement opportunity.',
              analysis: {
                  aiServiceOpportunity: {
                      serviceName: item.opportunity?.primaryRecommendation?.name || 'AI Solution',
                      description: item.opportunity?.primaryRecommendation?.description || 'Custom AI Automation Service',
                  }
              }
          }
      }

      setActiveHubItem(hubPayload);
      setSelectedJob(null); 
      setSelectedBusiness(null);
      setAppView('vib3hub');
  };

  const handleBackToDashboard = () => {
      setAppView('dashboard');
      setActiveHubItem(null);
  };

  // ROUTING VIEWS
  if (appView === 'landing') {
      return <LandingPage onEnterApp={handleGetStarted} />;
  }

  if (appView === 'profile') {
      return <ProfileCreation onComplete={handleProfileComplete} onBack={() => setAppView('landing')} />;
  }

  if (appView === 'account' && userProfile) {
      return (
        <ProfileDashboard
          profile={userProfile}
          leads={crmLeads}
          onBack={() => setAppView('dashboard')}
          onUpdateProfile={updateUserProfile}
          onSignOut={handleSignOut}
          onUpdateLead={updateCrmLead}
          onDeleteLead={deleteCrmLead}
        />
      );
  }

  if (appView === 'vib3hub' && activeHubItem) {
      return (
          <Vib3Hub 
            business={activeHubItem as JobListing} 
            opportunity={(activeHubItem as any).analysis}
            onBack={handleBackToDashboard} 
          />
      );
  }

  // DASHBOARD VIEW
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setAppView('landing')}>
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-xs font-bold">V3</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Vib3 Idea Sales</h1>
          </div>
          
          <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto">
                  <button 
                    onClick={() => setSearchMode('jobs')}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${searchMode === 'jobs' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                      Job Market
                  </button>
                  <button 
                    onClick={() => setSearchMode('businesses')}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${searchMode === 'businesses' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                      Business Leads
                  </button>
                  <button 
                    onClick={() => setSearchMode('reddit')}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center gap-1 ${searchMode === 'reddit' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                      <Flame size={12} className={searchMode === 'reddit' ? 'text-orange-500' : ''} /> Trend Ideas
                  </button>
              </div>

              {/* User Profile Mini Display */}
              {userProfile && (
                  <>
                      {/* Mobile */}
                      <button
                        onClick={() => setAppView('account')}
                        className="md:hidden w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm"
                        aria-label="Open profile"
                      >
                        {userProfile.avatarInitial}
                      </button>

                      {/* Desktop */}
                      <button
                        onClick={() => setAppView('account')}
                        className="hidden md:flex items-center gap-2 pl-4 border-l border-gray-200 hover:bg-gray-50 rounded-xl pr-2 py-1 transition-colors"
                        aria-label="Open profile"
                      >
                          <div className="text-right hidden lg:block">
                              <div className="text-xs font-bold text-gray-900">{userProfile.name}</div>
                              <div className="text-[10px] text-gray-500 uppercase font-medium">{userProfile.role}</div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                              {userProfile.avatarInitial}
                          </div>
                          <ChevronDown size={14} className="text-gray-400" />
                      </button>
                  </>
              )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Search Section */}
        <section className="mb-12 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            {searchMode === 'jobs' && (
                <>Turn <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Job Postings</span> into AI Businesses</>
            )}
            {searchMode === 'businesses' && (
                <>Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Struggling Businesses</span> to Fix</>
            )}
            {searchMode === 'reddit' && (
                <>Scout <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500">Viral Trends</span> on Reddit</>
            )}
          </h2>
          <p className="text-gray-500 mb-8 text-lg font-light">
            {searchMode === 'jobs' && `Welcome Agent ${userProfile?.name.split(' ')[0] || ''}. Search jobs to discover automation opportunities.`}
            {searchMode === 'businesses' && `Welcome Agent ${userProfile?.name.split(' ')[0] || ''}. Identify businesses with operational pain points.`}
            {searchMode === 'reddit' && `Welcome Agent ${userProfile?.name.split(' ')[0] || ''}. Discover high-potential business ideas.`}
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 bg-white p-2 rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/50 relative overflow-hidden">
             <div className={`absolute inset-0 bg-gradient-to-r pointer-events-none opacity-20 ${
                 searchMode === 'jobs' ? 'from-blue-50 to-purple-50' : 
                 searchMode === 'businesses' ? 'from-orange-50 to-red-50' : 
                 'from-orange-100 to-yellow-50'
             }`} />
            
            <div className="flex-1 relative">
              <div className="absolute left-4 top-3.5 text-gray-400">
                  {searchMode === 'jobs' && <Briefcase className="w-5 h-5" />}
                  {searchMode === 'businesses' && <Building2 className="w-5 h-5" />}
                  {searchMode === 'reddit' && <Flame className="w-5 h-5" />}
              </div>
              <input
                type="text"
                placeholder={
                    searchMode === 'jobs' ? "Job Title (e.g. Receptionist)" : 
                    searchMode === 'businesses' ? "Industry (e.g. Dentists)" :
                    "Topic (e.g. SaaS Ideas)"
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent border-none py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:ring-0 focus:outline-none"
              />
            </div>
             <div className="w-px bg-gray-200 hidden sm:block my-2"></div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={
                    searchMode === 'jobs' ? "Location (e.g. New York)" : 
                    searchMode === 'businesses' ? "Location (e.g. New York)" :
                    "Subreddit (Optional, e.g. startup_ideas)"
                }
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent border-none py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:ring-0 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading || (searchMode !== 'reddit' && (!query || !location))}
              className={`text-white px-8 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg ${
                  searchMode === 'jobs' ? 'bg-black hover:bg-gray-800' : 
                  searchMode === 'businesses' ? 'bg-orange-600 hover:bg-orange-500' :
                  'bg-orange-500 hover:bg-orange-400'
              }`}
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (searchMode === 'reddit' ? 'Scout' : 'Search')}
            </button>
          </form>
        </section>

        {/* Results Area */}
        {searchMode === 'jobs' && jobs.length > 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="flex justify-between items-center px-2">
                 <h3 className="font-semibold text-gray-700">Found {jobs.length} Opportunities</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                    <JobCard
                        key={job.id}
                        job={job}
                        onClick={() => setSelectedJob(job)}
                    />
                ))}
             </div>
          </div>
        )}

        {searchMode === 'businesses' && businesses.length > 0 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex justify-between items-center px-2">
                    <h3 className="font-semibold text-gray-700">Identified {businesses.length} Struggling Businesses</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {businesses.map((biz) => (
                        <BusinessCard 
                            key={biz.id}
                            business={biz}
                            onClick={() => setSelectedBusiness(biz)}
                        />
                    ))}
                </div>
            </div>
        )}

        {searchMode === 'reddit' && redditIdeas.length > 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex justify-between items-center px-2">
                    <h3 className="font-semibold text-gray-700">Scouted {redditIdeas.length} Viral Ideas</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {redditIdeas.map((idea) => (
                        <RedditIdeaCard 
                            key={idea.id}
                            idea={idea}
                            onClick={() => setSelectedRedditIdea(idea)}
                        />
                    ))}
                </div>
            </div>
        )}

        {!loading && jobs.length === 0 && businesses.length === 0 && redditIdeas.length === 0 && (
            <div className="mt-20 text-center text-gray-400">
                <div className="inline-block p-4 rounded-full bg-white border border-gray-100 mb-4 shadow-sm">
                    {searchMode === 'jobs' ? <Briefcase size={32} className="opacity-20 text-black" /> : 
                     searchMode === 'businesses' ? <Building2 size={32} className="opacity-20 text-black" /> :
                     <Flame size={32} className="opacity-20 text-black" />
                    }
                </div>
                <p>Start searching to analyze {
                    searchMode === 'jobs' ? 'the job market' : 
                    searchMode === 'businesses' ? 'local businesses' :
                    'Reddit trends'
                }.</p>
            </div>
        )}
      </main>

      {/* Modals */}
      {selectedJob && (
        <JobModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onCreateVib3Pitch={() => handleOpenVib3Hub(selectedJob)}
        />
      )}

      {selectedBusiness && (
          <OpportunityModal 
            business={selectedBusiness}
            onClose={() => setSelectedBusiness(null)}
            onCreatePitch={() => handleOpenVib3Hub(selectedBusiness)}
            isSaved={crmBusinessIdSet.has(selectedBusiness.id)}
            onSaveLead={saveBusinessLead}
            onUnsaveLead={unsaveBusinessLead}
          />
      )}

      {selectedRedditIdea && (
          <RedditIdeaModal
            idea={selectedRedditIdea}
            onClose={() => setSelectedRedditIdea(null)}
          />
      )}
    </div>
  );
};

export default App;