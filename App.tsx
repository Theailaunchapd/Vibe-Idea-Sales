import React, { useEffect, useMemo, useState } from 'react';
import { Business, CrmLead, JobListing, RedditIdea, SocialIdea, UserProfile } from './types';
import { searchJobs, searchBusinessOpportunities, scanRedditIdeas, scanSocialIdeas } from './services/openaiService';
import { JobCard } from './components/JobCard';
import { JobListView } from './components/JobListView';
import { BusinessCard } from './components/BusinessCard';
import { BusinessListView } from './components/BusinessListView';
import { Pagination } from './components/Pagination';
import { RedditIdeaCard } from './components/RedditIdeaCard';
import { SocialIdeaCard } from './components/SocialIdeaCard';
import { JobModal } from './components/JobModal';
import { OpportunityModal } from './components/OpportunityModal';
import { RedditIdeaModal } from './components/RedditIdeaModal';
import { SocialIdeaModal } from './components/SocialIdeaModal';
import { Vib3Hub } from './components/Vib3Hub';
import { LandingPage } from './components/LandingPage';
import { ProfileCreation } from './components/ProfileCreation';
import { ProfileDashboard } from './components/ProfileDashboard';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import VerifyEmailPage from './components/VerifyEmailPage';
import { Briefcase, Building2, ChevronDown, Flame, Loader2, MapPin, Twitter } from 'lucide-react';
import { clearUserProfile, ensureUserId, loadCrmLeads, mergeLead, saveCrmLeads, upsertLeadFromBusiness, upsertLeadFromSocial, upsertLeadFromJob } from './services/crmStorage';
import { TokenStorage, getCurrentUser, logout as authLogout, setupTokenRefresh, clearTokenRefresh, type SafeUser } from './services/authService';

type ViewState = 'landing' | 'login' | 'signup' | 'forgot-password' | 'reset-password' | 'verify-email' | 'profile' | 'dashboard' | 'vib3hub';
type SearchMode = 'jobs' | 'businesses' | 'reddit' | 'social';

const App: React.FC = () => {
  const [appView, setAppView] = useState<ViewState | 'account'>('landing');
  const [searchMode, setSearchMode] = useState<SearchMode>('jobs');
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState<number>(25);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [resetToken, setResetToken] = useState<string>('');
  const [verificationToken, setVerificationToken] = useState<string>('');

  // Authentication State
  const [authenticatedUser, setAuthenticatedUser] = useState<SafeUser | null>(null);
  const [requiresVerification, setRequiresVerification] = useState(false);

  // User Profile State (with persistence) - for backward compatibility with existing localStorage data
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('vib3_user');
      const parsed = saved ? JSON.parse(saved) : null;
      return ensureUserId(parsed);
    } catch (e) {
      return null;
    }
  });

  // Check for existing authentication session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check URL for reset/verification tokens
        const urlParams = new URLSearchParams(window.location.search);
        const resetTokenParam = urlParams.get('token');
        const action = urlParams.get('action');

        if (resetTokenParam && action === 'reset-password') {
          setResetToken(resetTokenParam);
          setAppView('reset-password');
          setAuthLoading(false);
          return;
        }

        if (resetTokenParam && action === 'verify-email') {
          setVerificationToken(resetTokenParam);
          setAppView('verify-email');
          setAuthLoading(false);
          return;
        }

        // Check for existing session
        if (TokenStorage.hasValidToken()) {
          const user = await getCurrentUser();
          setAuthenticatedUser(user);
          setRequiresVerification(!user.emailVerified);
          setupTokenRefresh();

          // If user is authenticated, go to dashboard
          if (appView === 'landing') {
            setAppView('dashboard');
          }
        } else {
          // No valid token, check if there's old localStorage profile
          if (userProfile) {
            // Keep them on dashboard with old profile for backward compatibility
            setAppView('dashboard');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        TokenStorage.clearTokens();
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();

    // Cleanup token refresh on unmount
    return () => {
      clearTokenRefresh();
    };
  }, []);

  // Saved Leads CRM (per-user) - use authenticated user ID if available, otherwise fall back to old profile ID or generate guest ID
  const userId = useMemo(() => {
    if (authenticatedUser?.id) return authenticatedUser.id;
    if (userProfile?.id) return userProfile.id;
    // Generate a guest ID for anonymous users so CRM still works
    let guestId = localStorage.getItem('vib3_guest_id');
    if (!guestId) {
      guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem('vib3_guest_id', guestId);
    }
    return guestId;
  }, [authenticatedUser?.id, userProfile?.id]);
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
  const [socialIdeas, setSocialIdeas] = useState<SocialIdea[]>([]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  
  // Selection State
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [selectedRedditIdea, setSelectedRedditIdea] = useState<RedditIdea | null>(null);
  const [selectedSocialIdea, setSelectedSocialIdea] = useState<SocialIdea | null>(null);
  
  // Vib3 Hub State (Active Item)
  const [activeHubItem, setActiveHubItem] = useState<JobListing | Business | null>(null);

  const handleGetStarted = () => {
      // Go directly to dashboard without requiring login
      setAppView('dashboard');
  };

  const handleProfileComplete = (profile: UserProfile) => {
      const ensured = ensureUserId(profile) || profile;
      localStorage.setItem('vib3_user', JSON.stringify(ensured));
      setUserProfile(ensured);
      setAppView('dashboard');
  };

  // Authentication Handlers
  const handleLoginSuccess = (user: SafeUser, needsVerification: boolean) => {
    setAuthenticatedUser(user);
    setRequiresVerification(needsVerification);
    setupTokenRefresh();

    if (needsVerification) {
      setAppView('verify-email');
    } else {
      setAppView('dashboard');
    }
  };

  const handleSignupSuccess = (user: SafeUser, needsVerification: boolean) => {
    setAuthenticatedUser(user);
    setRequiresVerification(needsVerification);
    setupTokenRefresh();

    // Always show verification page after signup
    setAppView('verify-email');
  };

  const handleVerificationSuccess = () => {
    setRequiresVerification(false);
    setAppView('dashboard');
  };

  const handleResetPasswordSuccess = () => {
    setResetToken('');
    setAppView('login');
  };

  const crmBusinessIdSet = useMemo(() => new Set(crmLeads.filter(l => l.businessId).map((l) => l.businessId)), [crmLeads]);
  const crmSocialIdSet = useMemo(() => new Set(crmLeads.filter(l => l.socialId).map((l) => l.socialId)), [crmLeads]);
  const crmJobIdSet = useMemo(() => new Set(crmLeads.filter(l => l.jobId).map((l) => l.jobId)), [crmLeads]);

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

  const saveSocialLead = (socialIdea: SocialIdea) => {
    if (!userId) return;
    setCrmLeads((prev) => {
      const existing = prev.find((l) => l.socialId === socialIdea.id);
      if (existing) {
        return prev.map((l) => (l.id === existing.id ? mergeLead(l, { socialIdea }) : l));
      }
      return [upsertLeadFromSocial({ ownerUserId: userId, socialIdea }), ...prev];
    });
  };

  const unsaveSocialLead = (socialId: string) => {
    if (!userId) return;
    setCrmLeads((prev) => prev.filter((l) => l.socialId !== socialId));
  };

  const saveJobLead = (job: JobListing) => {
    if (!userId) return;
    setCrmLeads((prev) => {
      const existing = prev.find((l) => l.jobId === job.id);
      if (existing) {
        return prev.map((l) => (l.id === existing.id ? mergeLead(l, { job }) : l));
      }
      return [upsertLeadFromJob({ ownerUserId: userId, job }), ...prev];
    });
  };

  const unsaveJobLead = (jobId: string) => {
    if (!userId) return;
    setCrmLeads((prev) => prev.filter((l) => l.jobId !== jobId));
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

  const handleSignOut = async () => {
    try {
      await authLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }

    clearTokenRefresh();
    setAuthenticatedUser(null);
    setRequiresVerification(false);
    clearUserProfile();
    setUserProfile(null);
    setCrmLeads([]);
    setAppView('landing');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query && searchMode !== 'reddit' && searchMode !== 'social') return; // Reddit and Social search can have defaults

    setLoading(true);
    setJobs([]);
    setBusinesses([]);
    setRedditIdeas([]);
    setSocialIdeas([]);
    setCurrentPage(1); // Reset to first page on new search

    try {
      if (searchMode === 'jobs') {
          const results = await searchJobs(query, location, radius);
          setJobs(results);
      } else if (searchMode === 'businesses') {
          // For businesses, query is the Industry
          const results = await searchBusinessOpportunities(query, location, radius);
          setBusinesses(results);
      } else if (searchMode === 'reddit') {
          // Reddit Search
          // Query can be "subreddit" or "topic" - let's treat query as Topic, location as Subreddit (optional)
          const results = await scanRedditIdeas(location, query); // Swapped for UX: Location input acts as Subreddit
          setRedditIdeas(results);
      } else {
          // Social Search
          const results = await scanSocialIdeas(query || 'business ideas, startup ideas, things I wish existed');
          setSocialIdeas(results);
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
  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Authentication Views
  if (appView === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onNavigateToSignup={() => setAppView('signup')}
        onNavigateToForgotPassword={() => setAppView('forgot-password')}
      />
    );
  }

  if (appView === 'signup') {
    return (
      <SignupPage
        onSignupSuccess={handleSignupSuccess}
        onNavigateToLogin={() => setAppView('login')}
      />
    );
  }

  if (appView === 'forgot-password') {
    return (
      <ForgotPasswordPage
        onNavigateToLogin={() => setAppView('login')}
      />
    );
  }

  if (appView === 'reset-password') {
    return (
      <ResetPasswordPage
        token={resetToken}
        onResetSuccess={handleResetPasswordSuccess}
        onNavigateToLogin={() => setAppView('login')}
      />
    );
  }

  if (appView === 'verify-email') {
    return (
      <VerifyEmailPage
        token={verificationToken}
        userEmail={authenticatedUser?.email}
        onVerificationSuccess={handleVerificationSuccess}
        onNavigateToDashboard={() => setAppView('dashboard')}
      />
    );
  }

  if (appView === 'landing') {
      return <LandingPage onEnterApp={handleGetStarted} />;
  }

  if (appView === 'profile') {
      return <ProfileCreation onComplete={handleProfileComplete} onBack={() => setAppView('landing')} />;
  }

  if (appView === 'account' && (userProfile || authenticatedUser)) {
      // Use authenticated user data if available, otherwise fall back to userProfile
      const displayProfile = authenticatedUser ? {
        id: authenticatedUser.id,
        name: authenticatedUser.name,
        role: authenticatedUser.role || '',
        focus: authenticatedUser.focus || [],
        services: authenticatedUser.services || [],
        topics: authenticatedUser.topics || [],
        avatarInitial: authenticatedUser.avatarInitial || authenticatedUser.name.charAt(0).toUpperCase()
      } : userProfile;

      if (!displayProfile) return null;

      return (
        <ProfileDashboard
          profile={displayProfile}
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
                      <Flame size={12} className={searchMode === 'reddit' ? 'text-orange-500' : ''} /> Trends
                  </button>
                  <button
                    onClick={() => setSearchMode('social')}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center gap-1 ${searchMode === 'social' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                      <Twitter size={12} className={searchMode === 'social' ? 'text-blue-500' : ''} /> Social
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
            {searchMode === 'social' && (
                <>Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">Business Ideas</span> on X.com</>
            )}
          </h2>
          <p className="text-gray-500 mb-8 text-lg font-light">
            {searchMode === 'jobs' && `Welcome Agent ${userProfile?.name.split(' ')[0] || ''}. Search jobs to discover automation opportunities.`}
            {searchMode === 'businesses' && `Welcome Agent ${userProfile?.name.split(' ')[0] || ''}. Identify businesses with operational pain points.`}
            {searchMode === 'reddit' && `Welcome Agent ${userProfile?.name.split(' ')[0] || ''}. Discover high-potential business ideas.`}
            {searchMode === 'social' && `Welcome Agent ${userProfile?.name.split(' ')[0] || ''}. Scan X.com for startup ideas and AI service opportunities.`}
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 bg-white p-2 rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/50 relative overflow-hidden">
             <div className={`absolute inset-0 bg-gradient-to-r pointer-events-none opacity-20 ${
                 searchMode === 'jobs' ? 'from-blue-50 to-purple-50' :
                 searchMode === 'businesses' ? 'from-orange-50 to-red-50' :
                 searchMode === 'reddit' ? 'from-orange-100 to-yellow-50' :
                 'from-blue-100 to-cyan-50'
             }`} />

            <div className="flex-1 relative">
              <div className="absolute left-4 top-3.5 text-gray-400">
                  {searchMode === 'jobs' && <Briefcase className="w-5 h-5" />}
                  {searchMode === 'businesses' && <Building2 className="w-5 h-5" />}
                  {searchMode === 'reddit' && <Flame className="w-5 h-5" />}
                  {searchMode === 'social' && <Twitter className="w-5 h-5" />}
              </div>
              <input
                type="text"
                placeholder={
                    searchMode === 'jobs' ? "Job Title (e.g. Receptionist)" :
                    searchMode === 'businesses' ? "Industry (e.g. Dentists)" :
                    searchMode === 'reddit' ? "Topic (e.g. SaaS Ideas)" :
                    "Search topic (e.g. AI tools, startup ideas)"
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent border-none py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:ring-0 focus:outline-none"
              />
            </div>
             {searchMode !== 'social' && <div className="w-px bg-gray-200 hidden sm:block my-2"></div>}
            {searchMode !== 'social' && (
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
            )}
            {/* Radius selector for jobs and businesses */}
            {(searchMode === 'jobs' || searchMode === 'businesses') && (
              <>
                <div className="w-px bg-gray-200 hidden sm:block my-2"></div>
                <div className="flex-none relative min-w-[140px]">
                  <select
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="w-full bg-transparent border-none py-3 px-4 text-gray-900 focus:ring-0 focus:outline-none cursor-pointer appearance-none pr-8"
                  >
                    <option value={25}>Within 25 miles</option>
                    <option value={50}>Within 50 miles</option>
                    <option value={100}>Within 100 miles</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </>
            )}
            <button
              type="submit"
              disabled={loading || (searchMode === 'jobs' && (!query || !location)) || (searchMode === 'businesses' && (!query || !location))}
              className={`text-white px-8 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg ${
                  searchMode === 'jobs' ? 'bg-black hover:bg-gray-800' :
                  searchMode === 'businesses' ? 'bg-orange-600 hover:bg-orange-500' :
                  searchMode === 'reddit' ? 'bg-orange-500 hover:bg-orange-400' :
                  'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (searchMode === 'reddit' || searchMode === 'social' ? 'Scout' : 'Search')}
            </button>
          </form>
        </section>

        {/* Results Area */}
        {searchMode === 'jobs' && jobs.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="flex justify-between items-center px-2">
                 <h3 className="font-semibold text-gray-700">Found {jobs.length} Opportunities</h3>
             </div>

             <JobListView
               jobs={jobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
               onJobClick={setSelectedJob}
               savedJobIds={crmJobIdSet}
               onSave={saveJobLead}
               onUnsave={unsaveJobLead}
             />

             {jobs.length > itemsPerPage && (
               <Pagination
                 currentPage={currentPage}
                 totalPages={Math.ceil(jobs.length / itemsPerPage)}
                 totalItems={jobs.length}
                 itemsPerPage={itemsPerPage}
                 onPageChange={setCurrentPage}
               />
             )}
          </div>
        )}

        {searchMode === 'businesses' && businesses.length > 0 && (
             <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex justify-between items-center px-2">
                    <h3 className="font-semibold text-gray-700">Identified {businesses.length} Struggling Businesses</h3>
                </div>
                
                <BusinessListView 
                  businesses={businesses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
                  onBusinessClick={setSelectedBusiness}
                  savedBusinessIds={crmBusinessIdSet}
                  onSave={saveBusinessLead}
                  onUnsave={unsaveBusinessLead}
                />
                
                {businesses.length > itemsPerPage && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(businesses.length / itemsPerPage)}
                    totalItems={businesses.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                )}
            </div>
        )}

        {searchMode === 'reddit' && redditIdeas.length > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex justify-between items-center px-2">
                    <h3 className="font-semibold text-gray-700">Scouted {redditIdeas.length} Viral Ideas</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[800px] overflow-y-auto pr-2">
                    {redditIdeas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((idea) => (
                        <RedditIdeaCard
                            key={idea.id}
                            idea={idea}
                            onClick={() => setSelectedRedditIdea(idea)}
                        />
                    ))}
                </div>

                {redditIdeas.length > itemsPerPage && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(redditIdeas.length / itemsPerPage)}
                    totalItems={redditIdeas.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                )}
            </div>
        )}

        {searchMode === 'social' && socialIdeas.length > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex justify-between items-center px-2">
                    <h3 className="font-semibold text-gray-700">Found {socialIdeas.length} Business Ideas on X.com</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[800px] overflow-y-auto pr-2">
                    {socialIdeas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((idea) => (
                        <SocialIdeaCard
                            key={idea.id}
                            idea={idea}
                            onClick={() => setSelectedSocialIdea(idea)}
                            isSaved={crmSocialIdSet.has(idea.id)}
                            onSave={saveSocialLead}
                            onUnsave={unsaveSocialLead}
                        />
                    ))}
                </div>

                {socialIdeas.length > itemsPerPage && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(socialIdeas.length / itemsPerPage)}
                    totalItems={socialIdeas.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                )}
            </div>
        )}

        {!loading && jobs.length === 0 && businesses.length === 0 && redditIdeas.length === 0 && socialIdeas.length === 0 && (
            <div className="mt-20 text-center text-gray-400">
                <div className="inline-block p-4 rounded-full bg-white border border-gray-100 mb-4 shadow-sm">
                    {searchMode === 'jobs' ? <Briefcase size={32} className="opacity-20 text-black" /> :
                     searchMode === 'businesses' ? <Building2 size={32} className="opacity-20 text-black" /> :
                     searchMode === 'reddit' ? <Flame size={32} className="opacity-20 text-black" /> :
                     <Twitter size={32} className="opacity-20 text-black" />
                    }
                </div>
                <p>Start searching to analyze {
                    searchMode === 'jobs' ? 'the job market' :
                    searchMode === 'businesses' ? 'local businesses' :
                    searchMode === 'reddit' ? 'Reddit trends' :
                    'social media for ideas'
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
          isSaved={crmJobIdSet.has(selectedJob.id)}
          onSaveLead={saveJobLead}
          onUnsaveLead={unsaveJobLead}
        />
      )}

      {selectedBusiness && (
          <OpportunityModal 
            business={selectedBusiness}
            onClose={() => setSelectedBusiness(null)}
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

      {selectedSocialIdea && (
          <SocialIdeaModal
            idea={selectedSocialIdea}
            onClose={() => setSelectedSocialIdea(null)}
            isSaved={crmSocialIdSet.has(selectedSocialIdea.id)}
            onSaveLead={saveSocialLead}
            onUnsaveLead={unsaveSocialLead}
          />
      )}
    </div>
  );
};

export default App;