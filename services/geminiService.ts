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
    Perform a deep-dive analysis on this job posting to create a "Job Market Intelligence Report".
    
    Job: ${job.title} at ${job.company}
    Snippet: ${job.snippet}
    
    Generate 3 distinct sections in JSON. Keep descriptions high-quality but concise to fit within generation limits.

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