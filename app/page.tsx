"use client";

import { useState } from "react";
import Header from "@/components/Header";
import AuditForm from "@/components/AuditForm";
import ScoreCard from "@/components/ScoreCard";
import IssuesList, { Issue } from "@/components/IssuesList";

interface AuditResult {
  score: number;
  issues: Issue[];
  url: string;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");

  const handleAudit = async (url: string) => {
    setIsLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setResult(data);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Header />
      <AuditForm onSubmit={handleAudit} isLoading={isLoading} />

      {isLoading && (
        <div className="skeleton">
          <div className="skeleton__score">
            <div className="skeleton__text">
              <span className="skeleton__label">Analyzing page structure…</span>
              <div className="skeleton__dots">
                <span className="skeleton__dot" />
                <span className="skeleton__dot" />
                <span className="skeleton__dot" />
              </div>
            </div>
          </div>
          <div className="skeleton__issue" />
          <div className="skeleton__issue" />
          <div className="skeleton__issue" />
        </div>
      )}

      {error && !isLoading && (
        <div className="audit-form__error" style={{ marginTop: 24, textAlign: "center" }}>
          {error}
        </div>
      )}

      {result && !isLoading && (
        <div className="results">
          <div className="results__url-badge">
            <span className="results__url-text">
              <span className="results__url-dot" />
              {result.url}
            </span>
          </div>
          <ScoreCard score={result.score} />
          <IssuesList issues={result.issues} />
        </div>
      )}

      <footer className="footer">
        <p className="footer__text">
          AI Readiness Audit — Analyze your website&apos;s structure for AI discovery
        </p>
      </footer>
    </div>
  );
}
