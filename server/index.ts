import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import OpenAI from 'openai';
import authRoutes from './routes/auth';
import { securityHeaders } from './middleware/security';
import { apiRateLimiter } from './middleware/rateLimiter';

const app = express();

// Security middleware
app.use(securityHeaders);

// CORS configuration
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:5000',
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(cookieParser());

// Rate limiting for API endpoints
app.use('/api', apiRateLimiter);

// Authentication routes
app.use('/api/auth', authRoutes);

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const cleanJson = (text: string): string => {
  let cleanText = text.trim();
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.replace(/^```json/, '').replace(/```$/, '');
  } else if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```/, '').replace(/```$/, '');
  }
  return cleanText.trim();
};

app.post('/api/search-jobs', async (req, res) => {
  const { query, location, radius = 25 } = req.body;
  
  const prompt = `
    You are a Job Market Intelligence Agent.
    Task: Search for exactly 50 realistic job postings for "${query}" in "${location}" within a ${radius}-mile radius.
    
    For each job, extract or simulate realistic details found on major job boards (Indeed, LinkedIn, etc.):
    1. Job Title & Company Name.
    2. Realistic salary range (if typical for role).
    3. Source (e.g., Indeed, LinkedIn, Company Site).
    4. Key responsibilities snippet (2-3 sentences).
    5. Required skills (3-5 keywords).
    6. "AI Potential Score" (0-100): How easily can this role be automated or augmented by AI?
    7. Location should be within ${radius} miles of ${location}.

    Return JSON with structure:
    {
      "jobs": [
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
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const text = response.choices[0]?.message?.content;
    if (text) {
      const parsed = JSON.parse(cleanJson(text));
      res.json(Array.isArray(parsed) ? parsed : parsed.jobs || []);
    } else {
      res.json([]);
    }
  } catch (e) {
    console.error("Failed to search jobs", e);
    res.status(500).json({ error: "Failed to search jobs" });
  }
});

app.post('/api/search-businesses', async (req, res) => {
  const { industry, location, radius = 25 } = req.body;

  const prompt = `
    You are an AI Business Opportunity Analyzer.
    Task: Identify EXACTLY 100 UNIQUE struggling businesses in the "${industry}" industry within a ${radius}-mile radius of "${location}" that are likely hiring for operational roles.
    
    CRITICAL REQUIREMENTS:
    - Generate EXACTLY 100 businesses
    - Each business MUST be completely unique (different names, addresses, characteristics)
    - Vary business names creatively - use different naming patterns, owner names, locations within ${location}
    - Distribute businesses across different neighborhoods/areas within ${radius} miles of ${location}
    - Vary negative scores between 60-95
    - Create diverse pain points and review patterns
    - Use realistic but varied contact information
    
    For each business, simulate analysis of their online presence:
    1. Calculate a "Negative Score" (60-95)
    2. Identify 2-4 specific Pain Points
    3. Generate realistic Contact Info
    4. Include 2-3 representative "Negative Reviews" snippets
    5. Assign realistic hiring roles

    Return JSON with structure:
    {
      "businesses": [
        {
          "id": "unique_string_with_timestamp",
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
            { "title": "string", "impactLevel": "High/Medium/Low", "description": "string", "frequency": "string" }
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
    
    Remember: Create exactly 100 unique, diverse businesses within ${radius} miles of ${location}. No duplicates.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const text = response.choices[0]?.message?.content;
    if (text) {
      const parsed = JSON.parse(cleanJson(text));
      const businesses = Array.isArray(parsed) ? parsed : parsed.businesses || [];
      
      // Add timestamp to IDs to ensure uniqueness across queries
      const timestamp = Date.now();
      const uniqueBusinesses = businesses.map((biz: any, index: number) => ({
        ...biz,
        id: `${industry.toLowerCase().replace(/\s+/g, '-')}-${location.toLowerCase().replace(/\s+/g, '-')}-${timestamp}-${index}`
      }));
      
      res.json(uniqueBusinesses);
    } else {
      res.json([]);
    }
  } catch (e) {
    console.error("Failed to search businesses", e);
    res.status(500).json({ error: "Failed to search businesses" });
  }
});

app.post('/api/scan-reddit', async (req, res) => {
  const { subreddit, topic } = req.body;

  const prompt = `
    You are the VIB3 Reddit Scout.
    Task: Scan Reddit for posts in r/${subreddit || 'Startup_Ideas'} related to "${topic || 'saas idea'}".
    Target posts that signal high-potential business opportunities.

    Generate exactly 50 "Raw Idea Cards" in JSON.
    Keep descriptions ultra-concise.
    
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
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const text = response.choices[0]?.message?.content;
    if (text) {
      const parsed = JSON.parse(cleanJson(text));
      res.json(Array.isArray(parsed) ? parsed : parsed.ideas || []);
    } else {
      res.json([]);
    }
  } catch (e) {
    console.error("Failed to scan Reddit", e);
    res.status(500).json({ error: "Failed to scan Reddit" });
  }
});

app.post('/api/analyze-job', async (req, res) => {
  const { job } = req.body;

  const prompt = `
    Perform a deep-dive analysis on this job posting to create a "Job Market Intelligence Report".
    
    Job: ${job.title} at ${job.company}
    Snippet: ${job.snippet}
    
    Generate 3 distinct sections in JSON.

    Return JSON:
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
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const text = response.choices[0]?.message?.content;
    if (text) {
      res.json(JSON.parse(cleanJson(text)));
    } else {
      res.status(500).json({ error: "No response" });
    }
  } catch (e) {
    console.error("Failed to analyze job", e);
    res.status(500).json({ error: "Failed to analyze job" });
  }
});

app.post('/api/generate-opportunity-brief', async (req, res) => {
  const { business } = req.body;

  const prompt = `
    Create a formal "OPPORTUNITY BRIEF" for this business:
    Business: ${business.name}
    Negative Score: ${business.negativeScore}/100
    Pain Points: ${JSON.stringify(business.painPoints?.map((p: any) => p.title).slice(0, 3))}
    Reviews: ${JSON.stringify(business.reviews)}
    
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
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const text = response.choices[0]?.message?.content;
    if (text) {
      res.json(JSON.parse(cleanJson(text)));
    } else {
      res.status(500).json({ error: "No response" });
    }
  } catch (e) {
    console.error("Failed to generate brief", e);
    res.status(500).json({ error: "Failed to generate brief" });
  }
});

app.post('/api/analyze-reddit-idea', async (req, res) => {
  const { idea } = req.body;

  const prompt = `
    Analyze this Reddit idea and create a VIB3 Business Blueprint.
    Idea: ${idea.title}
    Problem: ${idea.problem}
    
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
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const text = response.choices[0]?.message?.content;
    if (text) {
      res.json(JSON.parse(cleanJson(text)));
    } else {
      res.status(500).json({ error: "No response" });
    }
  } catch (e) {
    console.error("Failed to analyze idea", e);
    res.status(500).json({ error: "Failed to analyze idea" });
  }
});

app.post('/api/generate-cold-email', async (req, res) => {
  const { job, analysis } = req.body;

  const prompt = `
    Write a cold sales email to the Hiring Manager at "${job.company || 'Target Company'}".
    
    Context:
    - They are hiring for: "${job.title || 'the role'}"
    - You are offering: "${analysis?.aiServiceOpportunity?.serviceName || 'AI Automation Solutions'}"
    
    Goal: Persuade them to automate this role with your AI service instead of hiring a human.
    Style: Professional, concise (under 150 words), high-impact.

    Return JSON:
    {
      "subject": "Email Subject Line",
      "body": "Email Body Text"
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const text = response.choices[0]?.message?.content;
    if (text) {
      res.json(JSON.parse(cleanJson(text)));
    } else {
      res.status(500).json({ error: "No response" });
    }
  } catch (e) {
    console.error("Failed to generate email", e);
    res.status(500).json({ error: "Failed to generate email" });
  }
});

app.post('/api/generate-website', async (req, res) => {
  const { job } = req.body;

  const prompt = `
    Create a Landing Page for a new AI Service Agency targeting companies hiring for "${job.title}".
    
    Context:
    - Service Name: Auto${job.title?.replace(/\s+/g, '') || 'Service'}.ai
    - Target Audience: Companies like ${job.company}.
    - Value Prop: Automate your ${job.title} needs with AI. Save 80% on overhead.
    
    Requirements:
    - Single HTML file with Tailwind CSS CDN.
    - Modern, high-conversion SaaS aesthetic.
    - Sections: Hero, How it Works, Savings Calculator, Testimonials, CTA.
    - Return ONLY raw HTML code, no markdown.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }]
    });

    let text = response.choices[0]?.message?.content;
    if (text) {
      if (text.startsWith('```html')) text = text.replace(/^```html/, '').replace(/```$/, '');
      else if (text.startsWith('```')) text = text.replace(/^```/, '').replace(/```$/, '');
      res.json({ code: text.trim() });
    } else {
      res.status(500).json({ error: "No response" });
    }
  } catch (e) {
    console.error("Failed to generate website", e);
    res.status(500).json({ error: "Failed to generate website" });
  }
});

app.post('/api/generate-demo-script', async (req, res) => {
  const { job, analysis } = req.body;

  const prompt = `
    Write a Demo Script for the AI Service: ${analysis?.aiServiceOpportunity?.serviceName || 'AI Service'}.
    
    Scenario: Simulating the AI performing the core tasks of a ${job.title}.
    Snippet: ${job.snippet?.substring(0, 300) || ''}
    
    Format: Dialogue/Screenplay format.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    res.json({ script: response.choices[0]?.message?.content || '' });
  } catch (e) {
    console.error("Failed to generate demo script", e);
    res.status(500).json({ error: "Failed to generate demo script" });
  }
});

app.post('/api/generate-workflow-demo', async (req, res) => {
  const { job, analysis } = req.body;

  const prompt = `
    Create a visual workflow demo for the AI Service: "${analysis?.aiServiceOpportunity?.serviceName || 'AI Automation Service'}".
    
    This demo will be shown to the hiring manager at ${job.company} to convince them to use AI instead of hiring a ${job.title}.
    
    Generate a step-by-step workflow showing how the AI handles the core tasks.
    
    Return JSON with structure:
    {
      "serviceName": "Name of the AI Service",
      "tagline": "Short compelling tagline (10 words max)",
      "workflow": [
        {
          "step": 1,
          "title": "Step title (3-5 words)",
          "description": "What happens in this step (1-2 sentences)",
          "icon": "one of: inbox, zap, brain, checkCircle, send, clock, fileText, users, database, sparkles",
          "duration": "Time estimate (e.g., '2 seconds', 'instant')",
          "automation": "What the AI does automatically"
        }
      ],
      "metrics": {
        "timesSaved": "e.g., '40 hours/week'",
        "costReduction": "e.g., '80%'",
        "accuracy": "e.g., '99.5%'",
        "availability": "e.g., '24/7'"
      },
      "beforeAfter": {
        "before": {
          "title": "Without AI",
          "items": ["pain point 1", "pain point 2", "pain point 3"]
        },
        "after": {
          "title": "With ${analysis?.aiServiceOpportunity?.serviceName || 'AI Service'}",
          "items": ["benefit 1", "benefit 2", "benefit 3"]
        }
      },
      "callToAction": "Compelling CTA text for scheduling a demo"
    }
    
    Make it specific to the ${job.title} role and the tasks mentioned. Create 4-6 workflow steps.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const text = response.choices[0]?.message?.content;
    if (text) {
      res.json(JSON.parse(cleanJson(text)));
    } else {
      res.status(500).json({ error: "No response" });
    }
  } catch (e) {
    console.error("Failed to generate workflow demo", e);
    res.status(500).json({ error: "Failed to generate workflow demo" });
  }
});

app.post('/api/scan-social', async (req, res) => {
  const { topic } = req.body;

  const prompt = `
    You are the VIB3 Social Media Scout for X.com (Twitter).
    Task: Scan X.com for posts related to "${topic || 'business ideas, startup ideas, things I wish existed'}".

    Focus on finding posts that mention:
    - Startup ideas or business opportunities
    - "I wish there was..." or "Someone should build..."
    - Problems that need solving
    - Pain points in existing services
    - Suggestions for new AI-powered services
    - Entrepreneurial discussions

    Generate exactly 50 realistic X.com posts that represent business opportunities.
    Each post should feel authentic and include realistic engagement metrics.

    Return JSON:
    {
      "ideas": [
        {
          "id": "VIB3-X-[unique-id]",
          "sourceUrl": "https://x.com/[username]/status/[id]",
          "author": "Full Name",
          "authorHandle": "@username",
          "title": "Short title summarizing the idea (max 60 chars)",
          "description": "The full post text (concise, twitter-style)",
          "engagement": {
            "likes": number,
            "retweets": number,
            "replies": number,
            "views": number,
            "sentiment": "positive/mixed/negative"
          },
          "extractionDate": "ISO date",
          "hashtags": ["#tag1", "#tag2"],
          "category": "startup|saas|problem|wish|general"
        }
      ]
    }

    Make the posts feel authentic - vary engagement levels, include realistic hashtags,
    and ensure diverse perspectives on business ideas that could be turned into AI services.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const text = response.choices[0]?.message?.content;
    if (text) {
      const parsed = JSON.parse(cleanJson(text));
      res.json(Array.isArray(parsed) ? parsed : parsed.ideas || []);
    } else {
      res.json([]);
    }
  } catch (e: any) {
    console.error("Failed to scan social media:", e?.message || e);
    res.status(500).json({ error: "Failed to scan social media", details: e?.message });
  }
});

app.post('/api/generate-prd', async (req, res) => {
  const { opportunity, sourceType, sourceName } = req.body;

  const prompt = `
    You are a Senior Product Manager creating a comprehensive Product Requirements Document (PRD).
    
    Based on this business opportunity/idea:
    ${JSON.stringify(opportunity, null, 2)}
    
    Source Type: ${sourceType}
    Source Name: ${sourceName}
    
    Generate a COMPLETE, PROFESSIONAL PRD in Markdown format following this structure:
    
    # Product Requirements Document (PRD)
    
    ## Document Control
    - Product Name, Version, Date, Author, Status
    
    ## 1. Executive Summary
    - Product Overview (2-3 paragraphs)
    - Vision Statement
    - Success Metrics (KPIs, launch target, success criteria)
    
    ## 2. Market Analysis
    - Target Market (primary/secondary audience, demographics, market size)
    - Market Opportunity (size, growth rate, trends, gaps)
    - Competitive Analysis (table with competitors, strengths, weaknesses)
    
    ## 3. Problem Statement
    - User Pain Points (3-5 detailed pain points with impact, frequency)
    - Business Problem
    
    ## 4. Product Solution
    - Value Proposition (For/Who/The/Is a/That/Unlike/Our product statement)
    - Core Features (5-8 features with descriptions, user stories, priority, complexity)
    - Feature Prioritization Matrix
    
    ## 5. User Personas
    - 2-3 detailed personas with demographics, goals, pain points, behaviors
    
    ## 6. User Workflows & User Stories
    - Primary workflows with step-by-step flows
    - User stories organized by epics
    
    ## 7. Functional Requirements
    - System capabilities (user management, core functionality, data management, notifications)
    - Business rules
    
    ## 8. Non-Functional Requirements
    - Performance, Scalability, Security, Reliability, Compatibility, Usability
    
    ## 9. UX Requirements
    - Design principles, branding guidelines, UI components
    
    ## 10. Revenue Model & Monetization
    - Revenue streams, pricing tiers, financial projections, CAC/LTV
    
    ## 11. Go-to-Market Strategy
    - Launch phases, marketing channels, sales strategy
    
    ## 12. Product Roadmap
    - MVP features, V1.1, V1.2, V2.0 plans
    
    ## 13. Success Criteria & KPIs
    - Launch metrics, 6-month and 12-month goals
    
    ## 14. Risks & Mitigations
    - Technical, business, and market risks with mitigation strategies
    
    ## 15. Timeline & Milestones
    - Development timeline, key milestones
    
    Make the PRD specific to the opportunity provided. Use realistic estimates, actual market data where possible, and make it immediately actionable for a development team.
    Return ONLY the markdown content, no JSON wrapper.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 8000
    });

    let text = response.choices[0]?.message?.content || '';
    if (text.startsWith('```markdown')) text = text.replace(/^```markdown\n?/, '').replace(/```$/, '');
    else if (text.startsWith('```')) text = text.replace(/^```\n?/, '').replace(/```$/, '');
    
    res.json({
      type: 'prd',
      title: `PRD - ${sourceName}`,
      content: text.trim(),
      generatedAt: new Date().toISOString(),
      sourceType,
      sourceName
    });
  } catch (e) {
    console.error("Failed to generate PRD", e);
    res.status(500).json({ error: "Failed to generate PRD" });
  }
});

app.post('/api/generate-developer-guide', async (req, res) => {
  const { opportunity, sourceType, sourceName } = req.body;

  const prompt = `
    You are a Senior Software Architect creating a comprehensive Developer Guide & Technical Specification.
    
    Based on this business opportunity/idea:
    ${JSON.stringify(opportunity, null, 2)}
    
    Source Type: ${sourceType}
    Source Name: ${sourceName}
    
    Generate a COMPLETE, PROFESSIONAL Developer Guide in Markdown format following this structure:
    
    # Developer Guide & Technical Specification
    
    ## Document Control
    - Product Name, Version, Date, Lead Architect, Status
    
    ## 1. System Overview
    - Product Description
    - System Architecture Diagram (use ASCII art)
    - Key Components (Frontend, Backend, Database, Cache, etc.)
    - Technical Requirements (scalability, performance, availability)
    
    ## 2. Architecture
    - Overall Architecture Pattern (with rationale)
    - System Components detailed breakdown (Frontend, API Gateway, Application, Data, Background Jobs layers)
    - Data Flow Diagram
    - Scalability Strategy
    
    ## 3. Technology Stack
    - Frontend (framework, language, build tools, UI libraries, state management, testing)
    - Backend (runtime, framework, database, ORM, cache, auth, queues)
    - DevOps & Infrastructure (cloud, containers, CI/CD, monitoring)
    - Development Tools (version control, code quality, IDEs)
    
    ## 4. Development Environment Setup
    - Prerequisites (required software versions)
    - Initial Setup (clone, install, env vars with examples)
    - Database Setup commands
    - Start Development Servers commands
    - Verification steps
    
    ## 5. Database Schema
    - Design Philosophy
    - ERD diagram (ASCII art)
    - Detailed Table Schemas with SQL CREATE statements for:
      - users, sessions, and core business tables
    - Indexes Strategy
    - Migration commands
    
    ## 6. API Specifications
    - API Overview (base URLs, versioning)
    - Authentication Flow
    - Detailed Endpoints with:
      - Request/Response JSON examples
      - Validation rules
      - Error responses
    
    ## 7. Frontend Architecture
    - Component hierarchy
    - State management approach
    - Routing structure
    - Key components breakdown
    
    ## 8. Backend Architecture
    - Service layer design
    - Repository pattern
    - Middleware chain
    - Error handling strategy
    
    ## 9. Authentication & Authorization
    - Auth flow diagrams
    - JWT structure
    - Role-based access control
    - OAuth integration
    
    ## 10. Security
    - Data encryption
    - Input validation
    - Rate limiting
    - Security headers
    
    ## 11. Testing Strategy
    - Unit tests (examples)
    - Integration tests
    - E2E tests
    - Coverage requirements
    
    ## 12. Deployment & DevOps
    - CI/CD pipeline
    - Environment configurations
    - Docker setup
    - Kubernetes/scaling
    
    ## 13. Monitoring & Logging
    - Logging strategy
    - APM setup
    - Alerting rules
    - Dashboard metrics
    
    ## 14. Error Handling
    - Error codes
    - Exception handling patterns
    - User-facing error messages
    
    ## 15. Code Standards
    - Naming conventions
    - File structure
    - Code review checklist
    - Git workflow
    
    Make everything specific to the opportunity. Include actual code examples, SQL schemas, and architecture diagrams.
    Return ONLY the markdown content, no JSON wrapper.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 8000
    });

    let text = response.choices[0]?.message?.content || '';
    if (text.startsWith('```markdown')) text = text.replace(/^```markdown\n?/, '').replace(/```$/, '');
    else if (text.startsWith('```')) text = text.replace(/^```\n?/, '').replace(/```$/, '');
    
    res.json({
      type: 'developer_guide',
      title: `Developer Guide - ${sourceName}`,
      content: text.trim(),
      generatedAt: new Date().toISOString(),
      sourceType,
      sourceName
    });
  } catch (e) {
    console.error("Failed to generate Developer Guide", e);
    res.status(500).json({ error: "Failed to generate Developer Guide" });
  }
});

app.post('/api/generate-vibe-pitch', async (req, res) => {
  const { opportunity } = req.body;

  const prompt = `
    You are an elite B2B sales copywriter and cold outreach expert.
    Task: Create a high-converting pitch email and phone script for an AI services agency reaching out to a business.

    Business Details:
    - Business Name: ${opportunity.businessName || 'Target Business'}
    - Industry: ${opportunity.industry || 'Unknown'}
    - Location: ${opportunity.location || 'Unknown'}
    - Pain Points: ${JSON.stringify(opportunity.painPoints || [])}
    - Recommended Solution: ${opportunity.primaryRecommendation || opportunity.pitchAngle || 'AI automation solution'}
    - Implementation Plan: ${JSON.stringify(opportunity.implementationPlan || {})}

    Create a COMPELLING pitch that:
    1. Opens with a pattern interrupt that grabs attention
    2. References their specific pain points (from reviews/data)
    3. Positions your AI solution as the obvious fix
    4. Uses social proof and urgency
    5. Has a clear, low-friction call to action

    Return JSON with this EXACT structure:
    {
      "email": {
        "subject": "Compelling subject line (max 50 chars, creates curiosity)",
        "body": "Full email body with personalization tokens. Use short paragraphs. Include specific numbers/results. End with soft CTA."
      },
      "phoneScript": {
        "opening": "First 10 seconds - pattern interrupt and permission to continue",
        "valueProposition": "30-second pitch connecting their pain to your solution",
        "painPointAddress": "How to bring up their specific pain points naturally",
        "callToAction": "Soft close for next step (meeting, demo, etc)",
        "objectionHandlers": [
          {"objection": "We're too busy", "response": "Response to this objection"},
          {"objection": "We already have something", "response": "Response to this objection"},
          {"objection": "Send me an email", "response": "Response to this objection"},
          {"objection": "Not interested", "response": "Response to this objection"}
        ]
      }
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 3000
    });

    const text = response.choices[0]?.message?.content || '{}';
    const cleaned = cleanJson(text);
    const parsed = JSON.parse(cleaned);

    res.json({
      businessName: opportunity.businessName || 'Target Business',
      email: parsed.email,
      phoneScript: parsed.phoneScript,
      generatedAt: new Date().toISOString()
    });
  } catch (e) {
    console.error("Failed to generate Vibe Pitch", e);
    res.status(500).json({ error: "Failed to generate Vibe Pitch" });
  }
});

app.post('/api/analyze-social-idea', async (req, res) => {
  const { idea } = req.body;

  const prompt = `
    You are the VIB3 AI Service Architect.
    Task: Analyze this X.com post and create a comprehensive AI service business plan.

    Post Details:
    - Author: ${idea.author} (@${idea.authorHandle})
    - Content: ${idea.description}
    - Engagement: ${idea.engagement.likes} likes, ${idea.engagement.retweets} retweets

    Your job is to:
    1. Extract the core business idea from this social post
    2. Design how to turn it into an AI-powered service
    3. Create a complete implementation roadmap
    4. Provide market intelligence and monetization strategy

    Return JSON with this EXACT structure:
    {
      "ideaName": "AI Service Name",
      "oneLiner": "One sentence value proposition",
      "aiServiceOpportunity": {
        "serviceName": "Name of the AI Service",
        "description": "Detailed description (2-3 sentences)",
        "valueProposition": "Why this AI service solves the problem better",
        "targetAudience": "Who would pay for this",
        "pricingModel": ["Subscription $X/mo", "Pay-per-use $Y/action", "Enterprise $Z/year"]
      },
      "scores": {
        "viralPotential": number 0-100,
        "marketDemand": number 0-100,
        "technicalFeasibility": number 0-100,
        "aiReadiness": number 0-100,
        "composite": number 0-100 (average of above)
      },
      "difficulty": "Beginner|Intermediate|Advanced|Expert",
      "mvpCost": "Estimated cost string",
      "mvpTimeline": "Timeline string",
      "implementationPlan": {
        "phase1": ["Step 1", "Step 2", "Step 3"],
        "phase2": ["Step 1", "Step 2", "Step 3"],
        "phase3": ["Step 1", "Step 2", "Step 3"]
      },
      "techStack": {
        "frontend": "Technology recommendation",
        "backend": "Technology recommendation",
        "ai": "AI/ML tools needed",
        "database": "Database recommendation"
      },
      "marketIntelligence": {
        "competitors": [{"name": "Competitor", "weakness": "Their weakness"}],
        "differentiators": ["Unique advantage 1", "Unique advantage 2"],
        "marketSize": "Estimated market size"
      },
      "monetizationStrategy": {
        "revenueModel": "Primary revenue model",
        "pricing": "Recommended pricing",
        "ltv": "Estimated customer lifetime value"
      }
    }

    Focus on making this a viable AI service that could be built and monetized.
    Be specific about the AI components and how they create value.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const text = response.choices[0]?.message?.content;
    if (text) {
      res.json(JSON.parse(cleanJson(text)));
    } else {
      res.status(500).json({ error: "No response" });
    }
  } catch (e) {
    console.error("Failed to analyze social idea", e);
    res.status(500).json({ error: "Failed to analyze social idea" });
  }
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on port ${PORT}`);
});
