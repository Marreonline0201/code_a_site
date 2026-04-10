# TapSafe — Agent Instructions

## What We're Building

A website where users enter their zip code and get a plain-English breakdown of what's in their tap water, what it means for their specific household, and exactly what to do about it.

The core problem: The EPA requires every water utility to publish annual water quality reports, but they're full of incomprehensible technical language. People are drinking water with detected contaminants and have no idea — not because the data is hidden, but because it's unreadable. We fix that with AI.

---

## Tech Stack

- **Frontend:** Next.js
- **Backend:** Next.js API routes
- **Database:** Supabase
- **AI:** Claude API for explanation, personalization, and checklist generation. Always use model `claude-sonnet-4-20250514`
- **Water Data:** EPA Envirofacts API and SDWIS (Safe Drinking Water Information System)
- **Filter Data:** NSF International public certification database

All secrets and API keys are handled via environment variables. Never hardcode them.

---

## Data Sources

### EPA / SDWIS

- Source: EPA Envirofacts API, pulling from the SDWIS database
- Used to: look up water systems by zip code, retrieve contaminant levels, violations, and 10-year violation history
- No API key required

### Claude API

- Used for all AI reasoning: translating contaminant data into plain English, personalizing risk by household, generating action checklists
- API key stored in environment variables

### NSF International

- Public database of certified water filters
- Used to match certified filter products to specific contaminants

---

## Features

### Feature 1: Water Quality Explainer (CORE)

- User enters zip code
- Backend fetches their water system and contaminant data from EPA
- Claude translates each contaminant into plain English:
  - What is it?
  - What does it do to the body?
  - Is the detected level concerning or within safe range?

### Feature 2: Household Personalizer (CORE)

- User selects who lives in their home:
  - Infant (under 1)
  - Toddler (1–5)
  - Pregnant person
  - Elderly (65+)
  - Immunocompromised
  - None of the above
- Claude adjusts the entire risk explanation based on selection
- Example: lead at a given level is a footnote for healthy adults, a serious concern for toddlers

### Feature 3: Filter Recommender

- Based on the user's specific contaminant profile, recommend filter type:
  - Pitcher filter — good for chlorine, some metals
  - Under-sink carbon filter — good for VOCs, chlorine
  - Reverse osmosis — removes PFAS, arsenic, nitrates, heavy metals
- Explain why their specific contaminants require that filter type
- Important: a standard pitcher filter does NOT remove PFAS or arsenic

### Feature 4: Historical Trend

- Pull 10 years of violation history for the user's water system
- Display as a chart showing whether water quality is improving or worsening over time

### Feature 5: Action Checklist

- Claude generates a specific, prioritized list of immediate actions tailored to the user's contaminants and household composition

### Feature 6: Shareable Report Card

- Clean exportable summary of the user's water quality report
- Shareable as an image or link

---

## Key AI Prompting Guidelines

- Never be alarmist — contextualize risk accurately
- Never be dismissive — if something is a real concern, say so clearly
- Always translate technical units (ppb, ppm, MCL) into plain language
- Always end with actionable next steps
- Adjust tone and risk framing based on household composition

---

## Design & UI Guidelines

**Theme:** Stylized water theme throughout. Think clean, fluid, calming — deep blues, aquas, soft whites. Motion and depth where appropriate (subtle wave animations, fluid transitions).

**IMPORTANT — UI Rule:** Before making any UI or design changes, always ask for an image or design reference first. Do not freestyle visual decisions. The aesthetic should be cohesive and intentional across every page and component.

General principles:

- Mobile-first, responsive
- Clean and trustworthy — this is a health product
- Avoid clinical/sterile UI; it should feel approachable, not alarming
- Typography should be readable and calm

---

## Project Structure

```
/app
  /api               # Next.js API routes (backend)
  /components        # Reusable UI components
  /lib               # Utility functions, API clients, helpers
  /styles            # Global styles
  page.tsx           # Home / zip code entry
```

---

## Build Order

1. Zip code lookup + contaminant data fetching (get EPA data flowing)
2. Claude integration — plain English contaminant explanation
3. Household personalizer — adjust risk by who lives in the home
4. Action checklist — fast add once AI prompt is working
5. Historical trend chart — same data source, query across years
6. Filter recommender — map contaminants to NSF-certified filter types
7. Shareable report card — styled export of existing content
