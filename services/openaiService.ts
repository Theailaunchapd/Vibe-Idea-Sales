import { JobListing, JobAnalysis, Business, OpportunityAnalysis, RedditIdea, RedditAnalysis } from "../types";

const API_BASE = '/api';

export const searchJobs = async (
  query: string,
  location: string
): Promise<JobListing[]> => {
  try {
    const response = await fetch(`${API_BASE}/search-jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, location })
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
  location: string
): Promise<Business[]> => {
  try {
    const response = await fetch(`${API_BASE}/search-businesses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ industry, location })
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
