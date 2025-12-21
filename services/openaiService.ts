import OpenAI from "openai";
import { JobListing, JobAnalysis, Business, OpportunityAnalysis, RedditIdea, RedditAnalysis } from "../types";

const getClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API Key not found. Please set OPENAI_API_KEY.");
  }
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
};

const cleanJson = (text: string): string => {
  let cleanText = text.trim();
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.replace(/^```json/, '').replace(/```$/, '');
  } else if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```/, '').replace(/```$/, '');
  }
  return cleanText.trim();
};

export const searchJobs = async (
  query: string,
  location: string
): Promise<JobListing[]> => {
  const client = getClient();
  
  const prompt = `
    You are a Job Market Intelligence Agent.
    Task: Search for 15-20 realistic job postings for "${query}" in "${location}".
    
    For each job, extract or simulate realistic details found on major job boards (Indeed, LinkedIn, etc.):
    1. Job Title & Company Name.
    2. Realistic salary range (if typical for role).
    3. Source (e.g., Indeed, LinkedIn, Company Site).
    4. Key responsibilities snippet (2-3 sentences).
    5. Required skills (3-5 keywords).
    6. "AI Potential Score" (0-100): How easily can this role be automated or augmented by AI? (High score = high automation potential).

    IMPORTANT: Return ONLY a raw JSON array. Do not use Markdown formatting.
    JSON Structure:
    [
      {
        "id": "string (unique)",
        "title": "string",
        "company": "string",
        "location": "string",
        "salaryRange": "string (optional)",
        "postedDate": "string (e.g. '2 days ago')",
        "source": "string",
        "url": "string (optional mock url)",
        "snippet": "string",
        "skills": ["string"],
        "aiPotentialScore": number
      }
    ]
  `;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const text = response.choices[0]?.message?.content;
    if (text) {
      const parsed = JSON.parse(cleanJson(text));
      return Array.isArray(parsed) ? parsed : parsed.jobs || [];
    }
  } catch (e) {
    console.error("Failed to search jobs", e);
    return [];
  }
  return [];
};

export const analyzeJobDeepDive = async (job: JobListing): Promise<JobAnalysis | null> => {
  const client = getClient();

  const prompt = `
    Perform a deep-dive analysis on this job posting to create a "Job Market Intelligence Report".
    
    Job: ${job.title} at ${job.company}
    Snippet: ${job.snippet}
    
    Generate 3 distinct sections in JSON. Keep descriptions high-quality but concise.

    1. APPLICATION STRATEGY (For the human applicant):
       - Resume keywords
       - Cover letter points
       - Interview tips

    2. AI SERVICE OPPORTUNITY (JB Workflows):
       - Propose a specific AI Service that could replace or heavily augment this job.
       - Create a "Transformation Table" comparing Traditional vs AI.
       - Define Pricing & Cost models.
       - Estimate Market Opportunity.

    3. IMPLEMENTATION PLAN:
       - MVP Steps (Week 1-2)
       - Packaging Steps (Week 3-4)
       - GTM Steps (Week 5-6)
       - Brief Workflow Architecture description.

    Return JSON with this structure:
    {
      "applicationStrategy": {
        "resumeKeywords": ["string"],
        "coverLetterPoints": ["string"],
        "interviewTips": ["string"]
      },
      "aiServiceOpportunity": {
        "serviceName": "string",
        "description": "string",
        "transformationTable": [{ "aspect": "string", "traditionalRole": "string", "aiPoweredService": "string" }],
        "timeInvestment": { "traditional": "string", "aiAutomated": "string" },
        "scalability": { "human": "string", "ai": "string" },
        "costModel": { "traditional": "string", "aiService": "string" },
        "pricingModel": ["string"],
        "techStack": ["string"],
        "marketOpportunity": { "targetCustomer": "string", "marketSize": "string", "competitionLevel": "string" }
      },
      "implementationPlan": {
        "mvpSteps": ["string"],
        "packagingSteps": ["string"],
        "gtmSteps": ["string"],
        "workflowArchitecture": "string"
      }
    }
  `;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const text = response.choices[0]?.message?.content;
    if (text) {
      return JSON.parse(cleanJson(text)) as JobAnalysis;
    }
  } catch (e) {
    console.error("Failed to analyze job deep dive", e);
  }
  return null;
};

export const searchBusinessOpportunities = async (
    industry: string,
    location: string
): Promise<Business[]> => {
    const client = getClient();

    const prompt = `
      You are an AI Business Opportunity Analyzer.
      Task: Identify 10-15 struggling businesses in the "${industry}" industry in "${location}" that are likely hiring for operational roles (Receptionist, Customer Service, Admin).
      
      For each business, simulate a deep analysis of their online presence (Google/Yelp Reviews, Website):
      1. Calculate a "Negative Score" (0-100) based on:
         - Review Volume & Recency (20pts)
         - Severity of Complaints (30pts) e.g. "rude staff", "no answer"
         - Response Rate (20pts) e.g. no responses = high opportunity
         - Website Quality (15pts) e.g. outdated, no booking
         - Hiring Activity (15pts) e.g. hiring for same role repeatedly
      
      2. Identify specific Pain Points.
      3. Extract Contact Info (Website, Email, Phone) - Simulate realistic data.
      4. Include 2 representative "Negative Reviews" snippets.

      Return JSON with structure:
      {
        "businesses": [
          {
            "id": "unique_string",
            "name": "Business Name",
            "industry": "${industry}",
            "location": "${location}",
            "googleRating": number,
            "negativeScore": number,
            "negativeScoreBreakdown": {
               "reviewVolume": number,
               "severity": number,
               "responseRate": number,
               "websiteQuality": number,
               "hiringActivity": number
            },
            "activeHiringRole": "string",
            "painPoints": [
              { "title": "string", "impactLevel": "High/Medium", "description": "string", "frequency": "string" }
            ],
            "websiteUrl": "string",
            "contactPhone": "string",
            "contactEmail": "string",
            "reviews": [
               { "text": "string", "source": "Google/Yelp", "rating": number }
            ]
          }
        ]
      }
    `;

    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });

        const text = response.choices[0]?.message?.content;
        if (text) {
            const parsed = JSON.parse(cleanJson(text));
            return Array.isArray(parsed) ? parsed : parsed.businesses || [];
        }
    } catch (e) {
        console.error("Failed to search business opportunities", e);
    }
    return [];
};

export const generateOpportunityBrief = async (business: Business): Promise<OpportunityAnalysis | null> => {
  const client = getClient();

  const prompt = `
    Create a formal "OPPORTUNITY BRIEF" for this business:
    Business: ${business.name}
    Negative Score: ${business.negativeScore}/100
    Pain Points: ${JSON.stringify(business.painPoints.map(p => p.title).slice(0, 3))}
    Reviews Snippet: ${JSON.stringify(business.reviews)}
    
    Generate tailored AI Service Recommendations.
    Include "Supporting Data" derived from the score/pain points.
    
    Return JSON:
    {
      "pitchAngle": "string",
      "primaryRecommendation": {
        "name": "string",
        "category": "string",
        "description": "string",
        "pricingEstimate": "string",
        "roiDescription": "string"
      },
      "secondaryRecommendations": [{ "name": "string", "description": "string" }],
      "saasPotential": {
        "isViable": boolean,
        "reasoning": "string",
        "potentialProductName": "string"
      },
      "implementationPlan": {
        "techStack": ["string"],
        "timeline": "string",
        "pricingStructure": "string",
        "expectedRoi": "string"
      },
      "supportingData": {
        "negativeReviewStat": "string",
        "hiringStat": "string",
        "websiteGap": "string",
        "responseStat": "string"
      },
      "techStack": ["string"]
    }
  `;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const text = response.choices[0]?.message?.content;
    if (text) {
      return JSON.parse(cleanJson(text));
    }
  } catch (e) {
    console.error("Failed to generate opportunity brief", e);
  }
  return null;
};

export const scanRedditIdeas = async (subreddit: string, topic: string): Promise<RedditIdea[]> => {
  const client = getClient();

  const prompt = `
    You are the VIB3 Reddit Scout.
    Task: Scan Reddit (simulate the scan) for posts in r/${subreddit || 'Startup_Ideas'} related to "${topic || 'saas idea'}".
    Target posts that signal high-potential business opportunities: "I wish there was", "I'd pay for", "Why doesn't X exist".
    
    Generate 20-25 "Raw Idea Cards" in JSON.
    Keep descriptions ultra-concise (under 15 words).
    
    Return JSON:
    {
      "ideas": [
        {
          "id": "VIB3-RDDT-...",
          "sourceUrl": "https://reddit.com/r/...",
          "title": "Post Title",
          "problem": "Extracted problem statement (concise)",
          "solution": "Proposed solution (optional, concise)",
          "engagement": { "upvotes": number, "comments": number, "awards": number, "sentiment": "positive/mixed" },
          "validationSignals": ["signal 1", "signal 2"],
          "extractionDate": "ISO date"
        }
      ]
    }
  `;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const text = response.choices[0]?.message?.content;
    if (text) {
      const parsed = JSON.parse(cleanJson(text));
      return Array.isArray(parsed) ? parsed : parsed.ideas || [];
    }
  } catch (e) {
    console.error("Failed to scan Reddit ideas", e);
  }
  return [];
};

export const analyzeRedditIdea = async (idea: RedditIdea): Promise<RedditAnalysis | null> => {
  const client = getClient();

  const prompt = `
    Analyze this Reddit idea and create a VIB3 Business Blueprint.
    Idea: ${idea.title}
    Problem: ${idea.problem}
    
    Generate a complete report including:
    1. Scores (Viability, Tech Feasibility, etc.)
    2. Execution Roadmap (90-day)
    3. Tech Stack Recommendation
    4. Market Intelligence (Keywords, Competitors)
    5. Landing Page Spec
    
    Return JSON:
    {
      "ideaName": "string",
      "oneLiner": "string",
      "scores": {
        "marketViability": number,
        "technicalFeasibility": number,
        "validationStrength": number,
        "executionSpeed": number,
        "composite": number
      },
      "difficulty": "string",
      "mvpCost": "string",
      "mvpTimeline": "string",
      "businessModel": "string",
      "marketIntel": {
        "keywords": [{ "keyword": "string", "volume": number, "difficulty": number }],
        "competitors": [{ "name": "string", "weakness": "string" }],
        "seoScore": number
      },
      "executionRoadmap": {
        "phases": [{ "name": "string", "duration": "string", "tasks": [{ "task": "string", "deliverable": "string" }] }]
      },
      "techStack": {
        "stackName": "string",
        "justification": "string",
        "frontend": "string",
        "backend": "string",
        "database": "string",
        "setupSteps": ["string"]
      },
      "landingPage": {
        "headline": "string",
        "subheadline": "string",
        "features": ["string"],
        "cta": "string",
        "colorPalette": ["string"]
      }
    }
  `;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const text = response.choices[0]?.message?.content;
    if (text) {
      return JSON.parse(cleanJson(text));
    }
  } catch (e) {
    console.error("Failed to analyze Reddit idea", e);
  }
  return null;
};

export const generateColdEmail = async (job: JobListing, analysis: JobAnalysis): Promise<{ subject: string; body: string } | null> => {
  const client = getClient();

  const companyName = job.company ? job.company.substring(0, 100) : "Target Company";
  const jobTitle = job.title ? job.title.substring(0, 100) : "the role";
  const serviceName = analysis?.aiServiceOpportunity?.serviceName 
    ? analysis.aiServiceOpportunity.serviceName.substring(0, 100) 
    : "AI Automation Solutions";

  const prompt = `
    You are an expert B2B Copywriter.
    Write a cold sales email to the Hiring Manager at "${companyName}".
    
    Context:
    - They are hiring for: "${jobTitle}"
    - You are offering: "${serviceName}"
    
    Goal: Persuade them to automate this role with your AI service instead of hiring a human.
    Style: Professional, concise (under 150 words), high-impact.

    Return JSON:
    {
      "subject": "Email Subject Line",
      "body": "Email Body Text"
    }
  `;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const text = response.choices[0]?.message?.content;
    if (text) {
      return JSON.parse(cleanJson(text));
    }
  } catch (e) {
    console.error("Failed to generate cold email", e);
  }
  return null;
};

export const generateWebsiteCode = async (job: JobListing): Promise<string | null> => {
  const client = getClient();

  const prompt = `
    Create a Landing Page for a new AI Service Agency targeting companies hiring for "${job.title}".
    
    Context:
    - Service Name: Auto${job.title.replace(/\s+/g, '')}.ai
    - Target Audience: Companies like ${job.company}.
    - Value Prop: Automate your ${job.title} needs with AI. Save 80% on overhead.
    
    Requirements:
    - Single HTML file with Tailwind CSS CDN.
    - Modern, high-conversion SaaS aesthetic.
    - Sections: Hero, How it Works, Savings Calculator, Testimonials, CTA.
    - Return ONLY raw HTML code, no markdown.
  `;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }]
    });

    const text = response.choices[0]?.message?.content;
    if (text) {
      let cleanText = text.trim();
      if (cleanText.startsWith('```html')) cleanText = cleanText.replace(/^```html/, '').replace(/```$/, '');
      else if (cleanText.startsWith('```')) cleanText = cleanText.replace(/^```/, '').replace(/```$/, '');
      return cleanText;
    }
  } catch (e) {
    console.error("Failed to generate website code", e);
  }
  return null;
};

export const generateDemoScript = async (job: JobListing, analysis: JobAnalysis): Promise<string | null> => {
    const client = getClient();

    const prompt = `
      Write a Demo Script for the AI Service: ${analysis?.aiServiceOpportunity?.serviceName || 'AI Service'}.
      
      Scenario: Simulating the AI performing the core tasks of a ${job.title}.
      Snippet: ${job.snippet.substring(0, 300)}
      
      Format: Dialogue/Screenplay format.
    `;

    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }]
        });
        return response.choices[0]?.message?.content || null;
    } catch (e) {
        console.error("Failed to generate demo script", e);
    }
    return null;
}
