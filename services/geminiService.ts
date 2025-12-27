import { GoogleGenAI, Type } from "@google/genai";
import { JobListing, JobAnalysis, Business, OpportunityAnalysis, RedditIdea, RedditAnalysis } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please set process.env.API_KEY.");
  }
  return new GoogleGenAI({ apiKey });
};

const cleanJson = (text: string): string => {
  let cleanText = text.trim();
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.replace(/^```json/, '').replace(/```$/, '');
  } else if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```/, '').replace(/```$/, '');
  }
  return cleanText;
};

// --- Job Market Intelligence Functions ---

export const searchJobs = async (
  query: string,
  location: string
): Promise<JobListing[]> => {
  const ai = getClient();
  const modelId = "gemini-2.5-flash"; 
  
  const prompt = `
    You are a Job Market Intelligence Agent with web search capabilities.
    Task: Search for 15-20 REAL job postings for "${query}" in "${location}" using live data.
    
    Use web search to find actual job listings from major job boards (Indeed, LinkedIn, Glassdoor, ZipRecruiter, etc.).
    
    For each job, extract:
    1. Job Title & Company Name (real companies)
    2. Realistic salary range (if available)
    3. Source platform (e.g., Indeed, LinkedIn, Glassdoor) - MUST BE REAL
    4. URL - MUST be the actual URL to the job posting
    5. Key responsibilities snippet (2-3 sentences from the actual posting)
    6. Required skills (3-5 keywords from actual job posting)
    7. Posted date (e.g., "2 days ago", "1 week ago")
    8. "AI Potential Score" (0-100): How easily can this role be automated or augmented by AI? (High score = high automation potential)
    9. Full job description (if available from search results)

    CRITICAL: 
    - Use google search to find REAL job postings
    - Include actual URLs to the job listings
    - Source must be a real job board name
    
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
        "source": "string (e.g., 'Indeed', 'LinkedIn')",
        "url": "string (actual URL to job posting)",
        "snippet": "string (key responsibilities)",
        "fullDescription": "string (optional, full description if available)",
        "skills": ["string"],
        "aiPotentialScore": number
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    if (response.text) {
      const cleanText = cleanJson(response.text);
      return JSON.parse(cleanText);
    }
  } catch (e) {
    console.error("Failed to search jobs", e);
    return [];
  }
  return [];
};

export const analyzeJobDeepDive = async (job: JobListing): Promise<JobAnalysis | null> => {
  const ai = getClient();
  const modelId = "gemini-2.5-flash"; 

  const prompt = `
    Perform a comprehensive deep-dive analysis on this job posting to create a "Job Market Intelligence Report".
    
    Job: ${job.title} at ${job.company}
    Snippet: ${job.snippet}
    Full Description: ${job.fullDescription || 'Not available - use snippet'}
    Skills Required: ${job.skills.join(', ')}
    
    Your task is to:
    1. Analyze the FULL job description in detail
    2. Convert this job role into a viable AI-powered business service/product
    3. Create a comprehensive business plan
    4. Design an implementation guide
    5. Show key benefits focused on eliminating headcount costs for businesses
    
    Generate 3 distinct sections in JSON:

    1. APPLICATION STRATEGY (For the human applicant):
       - Resume keywords (5-8 keywords)
       - Cover letter points (3-5 compelling points)
       - Interview tips (4-6 actionable tips)

    2. AI SERVICE OPPORTUNITY (JB Workflows) - THE MAIN FOCUS:
       
       a) BUSINESS PLAN:
          - Executive Summary: 2-3 sentence overview of the AI service opportunity
          - Problem Statement: What pain point does hiring for this role indicate?
          - Proposed Solution: How can AI solve this better than hiring?
          - Revenue Model: How will you monetize this (subscription, usage-based, etc.)?
          - Target Market: Who will pay for this service?
       
       b) KEY BENEFITS (Focus on headcount elimination):
          Create 3-6 specific benefits showing how this AI service eliminates the need for hiring.
          Each benefit should have:
          - Benefit title (e.g., "24/7 Availability", "Zero Employee Turnover")
          - Impact description (what this means for the business)
          - Savings estimate (e.g., "$60K-80K/year per replaced hire")
       
       c) Propose a specific AI Service name and description
       d) Create a "Transformation Table" comparing Traditional Role vs AI Service (5-7 rows)
       e) Define Pricing & Cost models showing massive savings vs hiring
       f) Estimate Market Opportunity
       g) Suggest tech stack

    3. IMPLEMENTATION PLAN:
       - MVP Steps (Week 1-2): 4-6 concrete steps
       - Packaging Steps (Week 3-4): 4-6 steps to productize
       - GTM Steps (Week 5-6): 4-6 go-to-market actions
       - Brief Workflow Architecture description (2-3 sentences)
    
    Keep descriptions high-quality but concise to fit within generation limits.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        maxOutputTokens: 8192, 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            applicationStrategy: {
              type: Type.OBJECT,
              properties: {
                resumeKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                coverLetterPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                interviewTips: { type: Type.ARRAY, items: { type: Type.STRING } },
              }
            },
            aiServiceOpportunity: {
              type: Type.OBJECT,
              properties: {
                serviceName: { type: Type.STRING },
                description: { type: Type.STRING },
                businessPlan: {
                  type: Type.OBJECT,
                  properties: {
                    executiveSummary: { type: Type.STRING },
                    problemStatement: { type: Type.STRING },
                    proposedSolution: { type: Type.STRING },
                    revenueModel: { type: Type.STRING },
                    targetMarket: { type: Type.STRING },
                  }
                },
                keyBenefits: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      benefit: { type: Type.STRING },
                      impact: { type: Type.STRING },
                      savings: { type: Type.STRING },
                    }
                  }
                },
                transformationTable: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      aspect: { type: Type.STRING },
                      traditionalRole: { type: Type.STRING },
                      aiPoweredService: { type: Type.STRING },
                    }
                  }
                },
                timeInvestment: {
                  type: Type.OBJECT,
                  properties: { traditional: { type: Type.STRING }, aiAutomated: { type: Type.STRING } }
                },
                scalability: {
                  type: Type.OBJECT,
                  properties: { human: { type: Type.STRING }, ai: { type: Type.STRING } }
                },
                costModel: {
                  type: Type.OBJECT,
                  properties: { traditional: { type: Type.STRING }, aiService: { type: Type.STRING } }
                },
                pricingModel: { type: Type.ARRAY, items: { type: Type.STRING } },
                techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
                marketOpportunity: {
                  type: Type.OBJECT,
                  properties: {
                    targetCustomer: { type: Type.STRING },
                    marketSize: { type: Type.STRING },
                    competitionLevel: { type: Type.STRING },
                  }
                }
              }
            },
            implementationPlan: {
              type: Type.OBJECT,
              properties: {
                mvpSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
                packagingSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
                gtmSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
                workflowArchitecture: { type: Type.STRING },
              }
            }
          }
        }
      }
    });

    if (response.text) {
      const cleanText = cleanJson(response.text);
      return JSON.parse(cleanText) as JobAnalysis;
    }
  } catch (e) {
    console.error("Failed to analyze job deep dive", e);
  }
  return null;
};

// --- Business Opportunity Functions ---

export const searchBusinessOpportunities = async (
    industry: string,
    location: string
): Promise<Business[]> => {
    const ai = getClient();
    const modelId = "gemini-2.5-flash";

    // Simulating Phase 1 & 2: Search Jobs -> Extract Companies -> Analyze Reviews -> Score
    const prompt = `
      You are an AI Business Opportunity Analyzer.
      Task: Identify 100 struggling businesses in the "${industry}" industry in "${location}" that are likely hiring for operational roles (Receptionist, Customer Service, Admin).
      
      For each business, simulate a deep analysis of their online presence (Google/Yelp Reviews, Website):
      1. Calculate a "Negative Score" (0-100) based on:
         - Review Volume & Recency (20pts)
         - Severity of Complaints (30pts) e.g. "rude staff", "no answer"
         - Response Rate (20pts) e.g. no responses = high opportunity
         - Website Quality (15pts) e.g. outdated, no booking
         - Hiring Activity (15pts) e.g. hiring for same role repeatedly
      
      2. Identify specific Pain Points.
      3. Extract Contact Info (Website, Email, Phone) - Simulate realistic data if direct scraping isn't possible, but try to be accurate for real businesses.
      4. Include 2 representative "Negative Reviews" snippets.

      Output ONLY JSON.
      JSON Structure:
      [
        {
          "id": "unique_string",
          "name": "Business Name",
          "industry": "${industry}",
          "location": "${location}",
          "googleRating": number (e.g. 3.2),
          "negativeScore": number (0-100),
          "negativeScoreBreakdown": {
             "reviewVolume": number,
             "severity": number,
             "responseRate": number,
             "websiteQuality": number,
             "hiringActivity": number
          },
          "activeHiringRole": "string (e.g. Front Desk Agent)",
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
    `;

    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            // Removed googleSearch tool to prevent conversational response and ensure strict JSON
        });

        if (response.text) {
            return JSON.parse(cleanJson(response.text));
        }
    } catch (e) {
        console.error("Failed to search business opportunities", e);
    }
    return [];
};

export const generateOpportunityBrief = async (business: Business): Promise<OpportunityAnalysis | null> => {
  const ai = getClient();
  const modelId = "gemini-2.5-flash";

  const prompt = `
    Create a formal "OPPORTUNITY BRIEF" for this business:
    Business: ${business.name}
    Negative Score: ${business.negativeScore}/100
    Pain Points: ${JSON.stringify(business.painPoints.map(p => p.title).slice(0, 3))}
    Reviews Snippet: ${JSON.stringify(business.reviews)}
    
    Generate tailored AI Service Recommendations.
    Include "Supporting Data" derived from the score/pain points (e.g. "45% of reviews mention X").
    
    Output JSON strictly matching the schema. Keep descriptions concise to avoid truncation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: { 
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pitchAngle: { type: Type.STRING },
            primaryRecommendation: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                category: { type: Type.STRING },
                description: { type: Type.STRING },
                pricingEstimate: { type: Type.STRING },
                roiDescription: { type: Type.STRING },
              }
            },
            secondaryRecommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                }
              }
            },
            saasPotential: {
              type: Type.OBJECT,
              properties: {
                isViable: { type: Type.BOOLEAN },
                reasoning: { type: Type.STRING },
                potentialProductName: { type: Type.STRING },
              }
            },
            implementationPlan: {
                type: Type.OBJECT,
                properties: {
                    techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
                    timeline: { type: Type.STRING },
                    pricingStructure: { type: Type.STRING },
                    expectedRoi: { type: Type.STRING }
                }
            },
            supportingData: {
                type: Type.OBJECT,
                properties: {
                    negativeReviewStat: { type: Type.STRING },
                    hiringStat: { type: Type.STRING },
                    websiteGap: { type: Type.STRING },
                    responseStat: { type: Type.STRING }
                }
            },
            techStack: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(cleanJson(response.text));
    }
  } catch (e) {
    console.error("Failed to generate opportunity brief", e);
  }
  return null;
};

// --- Reddit Scout Functions ---

export const scanRedditIdeas = async (subreddit: string, topic: string): Promise<RedditIdea[]> => {
  const ai = getClient();
  const modelId = "gemini-2.5-flash";

  const prompt = `
    You are the VIB3 Reddit Scout.
    Task: Scan Reddit (simulate the scan) for posts in r/${subreddit || 'Startup_Ideas'} related to "${topic || 'saas idea'}".
    Target posts that signal high-potential business opportunities: "I wish there was", "I'd pay for", "Why doesn't X exist".
    
    Generate 20-25 "Raw Idea Cards" in JSON.
    CRITICAL: Keep descriptions ultra-concise (under 15 words) to ensure the full list fits in the response.
    
    Output JSON ONLY.
    Structure:
    [
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
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: { maxOutputTokens: 8192 }
    });

    if (response.text) {
      return JSON.parse(cleanJson(response.text));
    }
  } catch (e) {
    console.error("Failed to scan Reddit ideas", e);
  }
  return [];
};

export const analyzeRedditIdea = async (idea: RedditIdea): Promise<RedditAnalysis | null> => {
  const ai = getClient();
  const modelId = "gemini-2.5-flash";

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
    
    Output strict JSON compatible with the RedditAnalysis interface.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ideaName: { type: Type.STRING },
            oneLiner: { type: Type.STRING },
            scores: {
              type: Type.OBJECT,
              properties: {
                marketViability: { type: Type.NUMBER },
                technicalFeasibility: { type: Type.NUMBER },
                validationStrength: { type: Type.NUMBER },
                executionSpeed: { type: Type.NUMBER },
                composite: { type: Type.NUMBER }
              }
            },
            difficulty: { type: Type.STRING },
            mvpCost: { type: Type.STRING },
            mvpTimeline: { type: Type.STRING },
            businessModel: { type: Type.STRING },
            marketIntel: {
              type: Type.OBJECT,
              properties: {
                keywords: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { keyword: { type: Type.STRING }, volume: { type: Type.NUMBER }, difficulty: { type: Type.NUMBER } } } },
                competitors: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, weakness: { type: Type.STRING } } } },
                seoScore: { type: Type.NUMBER }
              }
            },
            executionRoadmap: {
              type: Type.OBJECT,
              properties: {
                phases: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      duration: { type: Type.STRING },
                      tasks: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { task: { type: Type.STRING }, deliverable: { type: Type.STRING } } } }
                    }
                  }
                }
              }
            },
            techStack: {
              type: Type.OBJECT,
              properties: {
                stackName: { type: Type.STRING },
                justification: { type: Type.STRING },
                frontend: { type: Type.STRING },
                backend: { type: Type.STRING },
                database: { type: Type.STRING },
                setupSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            landingPage: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING },
                subheadline: { type: Type.STRING },
                features: { type: Type.ARRAY, items: { type: Type.STRING } },
                cta: { type: Type.STRING },
                colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(cleanJson(response.text));
    }
  } catch (e) {
    console.error("Failed to analyze Reddit idea", e);
  }
  return null;
};

// --- Vib3 Hub Functions (Updated for Job Context) ---

export const generateColdEmail = async (job: JobListing, analysis: JobAnalysis): Promise<{ subject: string; body: string } | null> => {
  const ai = getClient();
  const modelId = "gemini-2.5-flash";

  // Use safer variable access with fallbacks
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

    Output ONLY a valid JSON object with this structure:
    {
      "subject": "Email Subject Line",
      "body": "Email Body Text"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        maxOutputTokens: 2000,
        responseMimeType: "application/json"
      }
    });

    if (response.text) {
      return JSON.parse(cleanJson(response.text));
    }
  } catch (e) {
    console.error("Failed to generate cold email", e);
  }
  return null;
};

export const generateWebsiteCode = async (job: JobListing): Promise<string | null> => {
  const ai = getClient();
  const modelId = "gemini-3-pro-preview"; 

  const prompt = `
    Create a Landing Page for a new AI Service Agency targeting companies hiring for "${job.title}".
    
    Context:
    - Service Name: Auto${job.title.replace(/\s+/g, '')}.ai
    - Target Audience: Companies like ${job.company}.
    - Value Prop: Automate your ${job.title} needs with AI. Save 80% on overhead.
    
    Requirements:
    - Single HTML file with Tailwind CSS.
    - Modern, high-conversion SaaS aesthetic.
    - Sections: Hero, How it Works, Savings Calculator, Testimonials, CTA.
    - Return ONLY raw HTML.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    if (response.text) {
      let cleanText = response.text.trim();
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
    const ai = getClient();
    const modelId = "gemini-2.5-flash";

    const prompt = `
      Write a Demo Script for the AI Service: ${analysis?.aiServiceOpportunity?.serviceName || 'AI Service'}.
      
      Scenario: Simulating the AI performing the core tasks of a ${job.title}.
      Snippet: ${job.snippet.substring(0, 300)}
      
      Format: Dialogue/Screenplay format.
    `;

    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            config: { maxOutputTokens: 2000 }
        });
        return response.text || null;
    } catch (e) {
        console.error("Failed to generate demo script", e);
    }
    return null;
}