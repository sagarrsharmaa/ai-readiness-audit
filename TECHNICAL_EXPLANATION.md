# How I'd Explain This AI Readiness Audit to a Technical Founder

## What It Does

This tool takes any website URL, fetches the live HTML, and runs five rule-based checks against it to produce an "AI Readiness Score" out of 100. The score tells you how well-structured your page is for AI systems — think LLM-powered search (Perplexity, ChatGPT Browse, Google AI Overviews), voice assistants, and retrieval-augmented generation pipelines that crawl the web.

## What It Actually Checks

1. **Structured Data (JSON-LD / Schema.org)**: Does the page embed machine-readable metadata? This is the single biggest signal. If your product page has `Product` schema with price, availability, and reviews, an AI can extract and cite that directly. No schema means the AI is guessing from raw HTML.

2. **FAQ Content**: AI assistants love Q&A format. If your page has a FAQ section — whether via `<details>` elements, question-formatted headings, or FAQPage schema — it becomes a prime candidate for direct-answer citations.

3. **Heading Hierarchy**: A clean H1 → H2 → H3 structure acts like a table of contents for crawlers. Skipped levels or multiple H1s fragment the content graph and make it harder for AI to build a coherent topic model of the page.

4. **Meta Description**: This is the AI's TL;DR of your page. A missing or poorly-sized meta description means the AI has to generate its own summary, which is less accurate and less likely to rank your content.

5. **Semantic HTML**: Using `<main>`, `<article>`, `<nav>`, and `<section>` tags gives AI systems explicit content boundaries. Without them, the crawler has to infer where the content starts and the nav ends — and it often gets it wrong.

## Why This Matters Now

Traditional SEO optimized for Google's PageRank and keyword matching. AI search is different — it parses, summarizes, and cites. If your content isn't structured for machine comprehension, you won't appear in AI-generated answers, period.

This isn't theoretical. Google's AI Overviews, Bing Copilot, and Perplexity are already pulling structured content preferentially. Sites with clean schema and semantic markup get cited; sites without it get summarized poorly or skipped entirely.

## Technical Implementation

The tool is a Next.js app with a single API route. When a URL is submitted, the server fetches the page and parses the DOM using Cheerio (a lightweight server-side HTML parser — no headless browser overhead). Each check runs against the parsed DOM, deducts points based on severity, and returns the score with actionable fix recommendations. The entire audit completes in under 2 seconds.

No AI models are called. The scoring is deterministic and rule-based — we're auditing *for* AI readiness, not using AI to do it. This keeps it fast, free, and predictable.
