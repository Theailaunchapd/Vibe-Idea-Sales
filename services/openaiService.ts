import { JobListing, JobAnalysis, Business, OpportunityAnalysis, RedditIdea, RedditAnalysis, SocialIdea, SocialAnalysis, GeneratedDocument } from "../types";

const API_BASE = '/api';

export const searchJobs = async (
  query: string,
  location: string,
  radius: number = 25
): Promise<JobListing[]> => {
  try {
    const response = await fetch(`${API_BASE}/search-jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, location, radius })
    });
    if (!response.ok) throw new Error('Failed to search jobs');
    return await response.json();
  } catch (e) {
    console.error("Failed to search jobs", e);
    return [];
  }
};

export const analyzeJobDeepDive = async (job: JobListing): Promise<JobAnalysis | null> => {
  try {
    const response = await fetch(`${API_BASE}/analyze-job`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job })
    });
    if (!response.ok) throw new Error('Failed to analyze job');
    return await response.json();
  } catch (e) {
    console.error("Failed to analyze job", e);
    return null;
  }
};

export const searchBusinessOpportunities = async (
  industry: string,
  location: string,
  radius: number = 25
): Promise<Business[]> => {
  try {
    const response = await fetch(`${API_BASE}/search-businesses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ industry, location, radius })
    });
    if (!response.ok) throw new Error('Failed to search businesses');
    return await response.json();
  } catch (e) {
    console.error("Failed to search businesses", e);
    return [];
  }
};

export const generateOpportunityBrief = async (business: Business): Promise<OpportunityAnalysis | null> => {
  try {
    const response = await fetch(`${API_BASE}/generate-opportunity-brief`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ business })
    });
    if (!response.ok) throw new Error('Failed to generate brief');
    return await response.json();
  } catch (e) {
    console.error("Failed to generate brief", e);
    return null;
  }
};

export const scanRedditIdeas = async (subreddit: string, topic: string): Promise<RedditIdea[]> => {
  try {
    const response = await fetch(`${API_BASE}/scan-reddit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subreddit, topic })
    });
    if (!response.ok) throw new Error('Failed to scan reddit');
    return await response.json();
  } catch (e) {
    console.error("Failed to scan reddit", e);
    return [];
  }
};

export const analyzeRedditIdea = async (idea: RedditIdea): Promise<RedditAnalysis | null> => {
  try {
    const response = await fetch(`${API_BASE}/analyze-reddit-idea`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea })
    });
    if (!response.ok) throw new Error('Failed to analyze idea');
    return await response.json();
  } catch (e) {
    console.error("Failed to analyze idea", e);
    return null;
  }
};

export const generateColdEmail = async (job: JobListing, analysis: JobAnalysis): Promise<{ subject: string; body: string } | null> => {
  try {
    const response = await fetch(`${API_BASE}/generate-cold-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job, analysis })
    });
    if (!response.ok) throw new Error('Failed to generate email');
    return await response.json();
  } catch (e) {
    console.error("Failed to generate email", e);
    return null;
  }
};

export const generateWebsiteCode = async (job: JobListing): Promise<string | null> => {
  try {
    const response = await fetch(`${API_BASE}/generate-website`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job })
    });
    if (!response.ok) throw new Error('Failed to generate website');
    const data = await response.json();
    return data.code || null;
  } catch (e) {
    console.error("Failed to generate website", e);
    return null;
  }
};

export interface WorkflowDemo {
  serviceName: string;
  tagline: string;
  workflow: {
    step: number;
    title: string;
    description: string;
    icon: string;
    duration: string;
    automation: string;
  }[];
  metrics: {
    timesSaved: string;
    costReduction: string;
    accuracy: string;
    availability: string;
  };
  beforeAfter: {
    before: { title: string; items: string[] };
    after: { title: string; items: string[] };
  };
  callToAction: string;
}

export const generateWorkflowDemo = async (job: JobListing, analysis: JobAnalysis): Promise<WorkflowDemo | null> => {
  try {
    const response = await fetch(`${API_BASE}/generate-workflow-demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job, analysis })
    });
    if (!response.ok) throw new Error('Failed to generate workflow demo');
    return await response.json();
  } catch (e) {
    console.error("Failed to generate workflow demo", e);
    return null;
  }
};

export const generateDemoScript = async (job: JobListing, analysis: JobAnalysis): Promise<string | null> => {
  try {
    const response = await fetch(`${API_BASE}/generate-demo-script`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job, analysis })
    });
    if (!response.ok) throw new Error('Failed to generate script');
    const data = await response.json();
    return data.script || null;
  } catch (e) {
    console.error("Failed to generate script", e);
    return null;
  }
};

export const scanSocialIdeas = async (topic: string): Promise<SocialIdea[]> => {
  try {
    const response = await fetch(`${API_BASE}/scan-social`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic })
    });
    if (!response.ok) throw new Error('Failed to scan social media');
    return await response.json();
  } catch (e) {
    console.error("Failed to scan social media", e);
    return [];
  }
};

export const analyzeSocialIdea = async (idea: SocialIdea): Promise<SocialAnalysis | null> => {
  try {
    const response = await fetch(`${API_BASE}/analyze-social-idea`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea })
    });
    if (!response.ok) throw new Error('Failed to analyze social idea');
    return await response.json();
  } catch (e) {
    console.error("Failed to analyze social idea", e);
    return null;
  }
};

const safeSerialize = (data: any): any => {
  try {
    return JSON.parse(JSON.stringify(data));
  } catch (e) {
    console.warn("Serialization failed, returning empty object", e);
    return {};
  }
};

export const generatePRD = async (
  opportunity: any,
  sourceType: 'business' | 'social' | 'reddit' | 'job',
  sourceName: string
): Promise<GeneratedDocument | null> => {
  try {
    const safeOpportunity = safeSerialize(opportunity);
    const response = await fetch(`${API_BASE}/generate-prd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ opportunity: safeOpportunity, sourceType, sourceName })
    });
    if (!response.ok) throw new Error('Failed to generate PRD');
    return await response.json();
  } catch (e) {
    console.error("Failed to generate PRD", e);
    return null;
  }
};

export const generateDeveloperGuide = async (
  opportunity: any,
  sourceType: 'business' | 'social' | 'reddit' | 'job',
  sourceName: string
): Promise<GeneratedDocument | null> => {
  try {
    const safeOpportunity = safeSerialize(opportunity);
    const response = await fetch(`${API_BASE}/generate-developer-guide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ opportunity: safeOpportunity, sourceType, sourceName })
    });
    if (!response.ok) throw new Error('Failed to generate Developer Guide');
    return await response.json();
  } catch (e) {
    console.error("Failed to generate Developer Guide", e);
    return null;
  }
};

export interface VibePitch {
  businessName: string;
  email: {
    subject: string;
    body: string;
  };
  phoneScript: {
    opening: string;
    valueProposition: string;
    painPointAddress: string;
    callToAction: string;
    objectionHandlers: { objection: string; response: string }[];
  };
  generatedAt: string;
}

export const generateVibePitch = async (opportunity: any): Promise<VibePitch | null> => {
  try {
    const safeOpportunity = safeSerialize(opportunity);
    const response = await fetch(`${API_BASE}/generate-vibe-pitch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ opportunity: safeOpportunity })
    });
    if (!response.ok) throw new Error('Failed to generate Vibe Pitch');
    return await response.json();
  } catch (e) {
    console.error("Failed to generate Vibe Pitch", e);
    return null;
  }
};
