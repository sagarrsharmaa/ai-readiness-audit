import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

interface Issue {
  id: string;
  title: string;
  severity: "critical" | "warning" | "info";
  description: string;
  recommendation: string;
  pointsDeducted: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Fetch the target page
    let html: string;
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; AIReadinessAudit/1.0; +https://ai-readiness-audit.vercel.app)",
        },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) {
        return NextResponse.json(
          { error: `Failed to fetch URL (HTTP ${res.status})` },
          { status: 400 }
        );
      }
      html = await res.text();
    } catch {
      return NextResponse.json(
        { error: "Could not reach the URL. Please check the address and try again." },
        { status: 400 }
      );
    }

    const $ = cheerio.load(html);
    const issues: Issue[] = [];
    let score = 100;

    // ── Check 1: Structured Data (JSON-LD / Microdata) ──
    const jsonLd = $('script[type="application/ld+json"]');
    const hasMicrodata = $("[itemscope]").length > 0;
    const hasRdfa = $("[typeof]").length > 0;

    if (jsonLd.length === 0 && !hasMicrodata && !hasRdfa) {
      const pts = 25;
      score -= pts;
      issues.push({
        id: "structured-data",
        title: "No Structured Data Found",
        severity: "critical",
        description:
          "The page has no JSON-LD, Microdata, or RDFa markup. AI systems and search engines rely on structured data to understand page content, entity relationships, and context.",
        recommendation:
          "Add JSON-LD structured data (Schema.org) to describe your organization, products, articles, or FAQs. This is the single highest-impact change for AI readiness.",
        pointsDeducted: pts,
      });
    } else if (jsonLd.length > 0) {
      // Validate JSON-LD is parseable
      let validJsonLd = false;
      jsonLd.each((_, el) => {
        try {
          JSON.parse($(el).html() || "");
          validJsonLd = true;
        } catch {
          /* invalid JSON-LD */
        }
      });
      if (!validJsonLd) {
        const pts = 15;
        score -= pts;
        issues.push({
          id: "structured-data-invalid",
          title: "Invalid Structured Data",
          severity: "warning",
          description:
            "JSON-LD structured data was found but contains invalid JSON. AI crawlers will ignore malformed structured data.",
          recommendation:
            "Validate your JSON-LD at https://validator.schema.org and fix any syntax errors.",
          pointsDeducted: pts,
        });
      }
    }

    // ── Check 2: FAQ Content ──
    const hasFaqSchema = html.includes('"FAQPage"') || html.includes('"faqpage"');
    const hasDetailsElements = $("details").length > 0;
    const headingsWithQuestions = $("h2, h3, h4")
      .filter((_, el) => /\?/.test($(el).text()))
      .length;
    const hasFaqSection =
      $("*")
        .filter(
          (_, el) =>
            /faq|frequently asked|questions/i.test($(el).attr("id") || "") ||
            /faq|frequently asked|questions/i.test($(el).attr("class") || "")
        )
        .length > 0;

    if (!hasFaqSchema && !hasDetailsElements && headingsWithQuestions === 0 && !hasFaqSection) {
      const pts = 20;
      score -= pts;
      issues.push({
        id: "faq-missing",
        title: "No FAQ or Q&A Content Detected",
        severity: "warning",
        description:
          "No FAQ schema, expandable Q&A sections, or question-formatted headings were found. AI assistants heavily prioritize FAQ-style content for direct answers.",
        recommendation:
          "Add an FAQ section with common questions using <details>/<summary> elements or FAQPage Schema.org markup. This directly feeds AI-generated answers.",
        pointsDeducted: pts,
      });
    }

    // ── Check 3: Heading Hierarchy ──
    const h1Count = $("h1").length;
    const h2Count = $("h2").length;
    const h3Count = $("h3").length;
    const allHeadings = $("h1, h2, h3, h4, h5, h6");

    let headingPts = 0;
    const headingMessages: string[] = [];

    if (h1Count === 0) {
      headingPts += 10;
      headingMessages.push("No H1 tag found");
    } else if (h1Count > 1) {
      headingPts += 5;
      headingMessages.push(`Multiple H1 tags found (${h1Count})`);
    }

    if (h2Count === 0 && allHeadings.length > 1) {
      headingPts += 5;
      headingMessages.push("No H2 tags — content lacks section structure");
    }

    // Check for skipped heading levels
    let prevLevel = 0;
    let hasSkippedLevel = false;
    allHeadings.each((_, el) => {
      const level = parseInt(el.tagName.replace("h", ""), 10);
      if (prevLevel > 0 && level > prevLevel + 1) {
        hasSkippedLevel = true;
      }
      prevLevel = level;
    });

    if (hasSkippedLevel) {
      headingPts += 5;
      headingMessages.push("Heading levels are skipped (e.g., H1 → H3)");
    }

    if (headingPts > 0) {
      score -= headingPts;
      issues.push({
        id: "heading-hierarchy",
        title: "Weak Heading Structure",
        severity: headingPts >= 10 ? "critical" : "warning",
        description: `Issues detected: ${headingMessages.join("; ")}. A clean heading hierarchy helps AI systems build a content outline and understand topic relationships.`,
        recommendation:
          "Use a single H1 for the main topic, H2s for major sections, and H3s for subsections. Never skip levels. Each heading should be descriptive and content-rich.",
        pointsDeducted: headingPts,
      });
    }

    // ── Check 4: Meta Description ──
    const metaDesc = $('meta[name="description"]').attr("content") || "";
    const ogDesc = $('meta[property="og:description"]').attr("content") || "";

    if (!metaDesc && !ogDesc) {
      const pts = 15;
      score -= pts;
      issues.push({
        id: "meta-description",
        title: "Missing Meta Description",
        severity: "critical",
        description:
          "No meta description or Open Graph description was found. AI systems use meta descriptions as a concise summary of page content for indexing and snippet generation.",
        recommendation:
          "Add a <meta name=\"description\"> tag with a compelling 120–160 character summary of the page content.",
        pointsDeducted: pts,
      });
    } else if (metaDesc.length < 50 || metaDesc.length > 160) {
      const pts = 5;
      score -= pts;
      issues.push({
        id: "meta-description-length",
        title: "Meta Description Length Issue",
        severity: "info",
        description: `Meta description is ${metaDesc.length} characters. Optimal range is 120–160 characters. ${metaDesc.length < 50 ? "Too short to be informative." : "May be truncated in results."}`,
        recommendation:
          "Revise the meta description to be between 120–160 characters, clearly summarizing the page's primary content.",
        pointsDeducted: pts,
      });
    }

    // ── Check 5: Semantic HTML ──
    const semanticTags = ["article", "section", "nav", "main", "aside", "header", "footer"];
    const foundSemantic = semanticTags.filter((tag) => $(tag).length > 0);
    const missingKey = semanticTags
      .filter((t) => ["main", "nav", "article"].includes(t))
      .filter((t) => !foundSemantic.includes(t));

    if (foundSemantic.length <= 1) {
      const pts = 20;
      score -= pts;
      issues.push({
        id: "semantic-html",
        title: "Poor Semantic HTML Structure",
        severity: "critical",
        description:
          "The page uses very few semantic HTML elements. AI crawlers rely on <main>, <article>, <nav>, and <section> tags to identify content boundaries and page structure.",
        recommendation:
          "Wrap your primary content in <main>, use <article> for standalone content, <nav> for navigation, and <section> for thematic groupings.",
        pointsDeducted: pts,
      });
    } else if (missingKey.length > 0) {
      const pts = 10;
      score -= pts;
      issues.push({
        id: "semantic-html-partial",
        title: "Incomplete Semantic Markup",
        severity: "warning",
        description: `Missing key semantic elements: ${missingKey.map((t) => `<${t}>`).join(", ")}. These elements help AI systems distinguish navigation from content and identify the primary content area.`,
        recommendation: `Add the missing semantic elements (${missingKey.join(", ")}) to give AI systems clearer content boundaries.`,
        pointsDeducted: pts,
      });
    }

    // Clamp score
    score = Math.max(0, Math.min(100, score));

    // Sort issues by severity
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return NextResponse.json({ score, issues, url });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
