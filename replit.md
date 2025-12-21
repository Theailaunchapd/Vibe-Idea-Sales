# Vib3 Sales

## Overview
Vib3 Sales is an AI-powered intelligence platform that scans job boards, reviews, and Reddit to identify high-value business opportunities. It helps users turn market chaos into profitable AI agencies by building pitches, assets, and plans automatically.

## Tech Stack
- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS (CDN)
- **Icons**: Lucide React
- **AI**: Google Gemini API (@google/genai)

## Project Structure
```
/
├── components/          # React components
│   ├── BusinessCard.tsx
│   ├── JobCard.tsx
│   ├── JobModal.tsx
│   ├── LandingPage.tsx
│   ├── OpportunityModal.tsx
│   ├── ProfileCreation.tsx
│   ├── RedditIdeaCard.tsx
│   ├── RedditIdeaModal.tsx
│   ├── ScoreBadge.tsx
│   └── Vib3Hub.tsx
├── services/
│   └── geminiService.ts  # Gemini AI integration
├── App.tsx              # Main app component
├── index.tsx            # Entry point
├── index.html           # HTML template
├── types.ts             # TypeScript types
├── vite.config.ts       # Vite configuration
└── package.json         # Dependencies
```

## Development
- **Start Dev Server**: `npm run dev` (runs on port 5000)
- **Build**: `npm run build`
- **Preview**: `npm run preview`

## Environment Variables
- `GEMINI_API_KEY`: Required for AI features

## Recent Changes
- December 21, 2025: Initial setup and configuration for Replit environment
