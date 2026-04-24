"use client";

import { useState, FormEvent } from "react";

interface AuditFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export default function AuditForm({ onSubmit, isLoading }: AuditFormProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    let cleanUrl = url.trim();
    if (!cleanUrl) {
      setError("Please enter a URL to audit.");
      return;
    }

    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = "https://" + cleanUrl;
    }

    try {
      new URL(cleanUrl);
    } catch {
      setError("Please enter a valid URL (e.g., example.com).");
      return;
    }

    onSubmit(cleanUrl);
  };

  return (
    <form className="audit-form" onSubmit={handleSubmit}>
      <div className="audit-form__wrapper">
        <div className="audit-form__input-group">
          <input
            id="url-input"
            type="text"
            className="audit-form__input"
            placeholder="Enter a website URL — e.g., example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            autoComplete="url"
            spellCheck={false}
          />
          <button
            id="audit-button"
            type="submit"
            className={`audit-form__button ${isLoading ? "audit-form__button--loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>Auditing<span className="audit-form__spinner" /></>
            ) : (
              "Run Audit"
            )}
          </button>
        </div>
        {error && <div className="audit-form__error">{error}</div>}
      </div>
    </form>
  );
}
