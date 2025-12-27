
export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryRange?: string;
  postedDate: string;
  source: string; // e.g. "LinkedIn", "Indeed"
  url?: string;
  snippet: string; // Key responsibilities summary
  skills: string[];
  aiPotentialScore: number; // 0-100, how easily AI can augment/replace
  analysis?: JobAnalysis;
}

export interface JobAnalysis {
  // Tab 1: Job Opportunities
  applicationStrategy: {
    resumeKeywords: string[];
    coverLetterPoints: string[];
    interviewTips: string[];
  };

  // Tab 2: AI Business Opportunities (JB Workflows)
  aiServiceOpportunity: {
    serviceName: string;
    description: string;
    transformationTable: {
      aspect: string;
      traditionalRole: string;
      aiPoweredService: string;
    }[];
    timeInvestment: {
      traditional: string; // e.g. "40h/week"
      aiAutomated: string; // e.g. "Instant / 24/7"
    };
    scalability: {
      human: string;
      ai: string;
    };
    costModel: {
      traditional: string;
      aiService: string; // e.g. "$499/mo subscription"
    };
    pricingModel: string[];
    techStack: string[];
    marketOpportunity: {
      targetCustomer: string;
      marketSize: string;
      competitionLevel: 'Low' | 'Medium' | 'High';
    };
  };

  // Tab 3: AI Implementation Report
  implementationPlan: {
    mvpSteps: string[]; // Phase 1
    packagingSteps: string[]; // Phase 2
    gtmSteps: string[]; // Phase 3
    workflowArchitecture: string;
  };
}

export interface Business {
  id: string;
  name: string;
  industry: string;
  location: string;
  googleRating?: number;
  negativeScore: number; // 0-100
  negativeScoreBreakdown?: {
    reviewVolume: number; // /20
    severity: number; // /30
    responseRate: number; // /20
    websiteQuality: number; // /15
    hiringActivity: number; // /15
  };
  painPoints: {
    title: string;
    impactLevel: string;
    description: string;
    frequency: string;
  }[];
  activeHiringRole?: string;
  websiteUrl?: string;
  contactPhone?: string;
  contactEmail?: string;
  reviews: {
    text: string;
    source: string;
    rating: number;
  }[];
  opportunity?: OpportunityAnalysis;
}

export interface OpportunityAnalysis {
  pitchAngle: string;
  primaryRecommendation: {
    name: string;
    category: string;
    description: string;
    pricingEstimate: string;
    roiDescription: string;
  };
  secondaryRecommendations: {
    name: string;
    description: string;
  }[];
  saasPotential: {
    isViable: boolean;
    reasoning: string;
    potentialProductName?: string;
  };
  implementationPlan: {
     techStack: string[];
     timeline: string;
     pricingStructure: string;
     expectedRoi: string;
  };
  supportingData: {
      negativeReviewStat: string; // e.g. "45% of reviews mention phone issues"
      hiringStat: string; // e.g. "Hiring for 3rd receptionist"
      websiteGap: string; // e.g. "No online booking"
      responseStat: string; // e.g. "Avg response time 5 days"
  };
  techStack: string[]; // Keeping for legacy compatibility if needed
}

// --- Reddit Scout Types ---

export interface RedditIdea {
  id: string;
  sourceUrl: string;
  title: string;
  problem: string;
  solution?: string;
  engagement: {
    upvotes: number;
    comments: number;
    awards: number;
    sentiment: 'positive' | 'mixed' | 'negative';
  };
  validationSignals: string[];
  extractionDate: string;
  analysis?: RedditAnalysis;
}

export interface RedditAnalysis {
  ideaName: string;
  oneLiner: string;
  scores: {
    marketViability: number;
    technicalFeasibility: number;
    validationStrength: number;
    executionSpeed: number;
    composite: number;
  };
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  mvpCost: string;
  mvpTimeline: string;
  businessModel: string;
  marketIntel?: MarketIntelligence;
  executionRoadmap?: ExecutionRoadmap;
  techStack?: TechStackRecommendation;
  landingPage?: LandingPageSpec;
}

export interface MarketIntelligence {
  keywords: { keyword: string; volume: number; difficulty: number }[];
  competitors: { name: string; weakness: string }[];
  seoScore: number;
}

export interface ExecutionRoadmap {
  phases: {
    name: string;
    duration: string;
    tasks: { task: string; deliverable: string }[];
  }[];
}

export interface TechStackRecommendation {
  stackName: string;
  justification: string;
  frontend: string;
  backend: string;
  database: string;
  setupSteps: string[];
}

export interface LandingPageSpec {
  headline: string;
  subheadline: string;
  features: string[];
  cta: string;
  colorPalette: string[];
}

// --- User Profile ---

export interface UserProfile {
  name: string;
  role: string;
  focus: string[];
  services: string[];
  topics: string[];
  avatarInitial?: string;
}
