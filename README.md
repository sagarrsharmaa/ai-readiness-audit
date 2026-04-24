# AI Readiness Audit

A web tool that analyzes any website's HTML structure and scores how well it's prepared for AI-powered search engines, LLM crawlers, and next-gen discovery.

## Live Demo

> Deploy to Vercel: `vercel --prod` or connect this repo to [vercel.com](https://vercel.com)

## What It Checks

| Check | What It Looks For | Max Impact |
|-------|-------------------|------------|
| **Structured Data** | JSON-LD, Microdata, RDFa markup | -25 pts |
| **FAQ Content** | FAQ schema, `<details>` elements, question headings | -20 pts |
| **Heading Hierarchy** | Single H1, proper H1→H2→H3 nesting | -20 pts |
| **Meta Description** | Presence and optimal length (120–160 chars) | -15 pts |
| **Semantic HTML** | `<main>`, `<article>`, `<nav>`, `<section>` usage | -20 pts |

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Cheerio** — server-side HTML parsing (no headless browser)
- **Vanilla CSS** — dark theme with glassmorphism

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

Or push to GitHub and import at [vercel.com/new](https://vercel.com/new).

## Project Structure

```
app/
├── layout.tsx            — Root layout, metadata
├── page.tsx              — Main page (client component)
├── globals.css           — Full design system
└── api/audit/route.ts    — POST endpoint — real HTML analysis
components/
├── Header.tsx            — Branding header
├── AuditForm.tsx         — URL input form
├── ScoreCard.tsx         — Animated radial score gauge
└── IssuesList.tsx        — Issue cards with severity
TECHNICAL_EXPLANATION.md  — Part 2 written explanation
```
