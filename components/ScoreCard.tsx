"use client";

import { useEffect, useState } from "react";

interface ScoreCardProps {
  score: number;
}

function getScoreInfo(score: number) {
  if (score >= 85) return { class: "score--excellent", rating: "Excellent", desc: "This site is well-structured for AI comprehension and next-gen search." };
  if (score >= 70) return { class: "score--good", rating: "Good", desc: "Solid foundation, but a few improvements could boost AI discoverability." };
  if (score >= 50) return { class: "score--fair", rating: "Fair", desc: "Some structural gaps may limit how well AI systems understand this content." };
  if (score >= 30) return { class: "score--poor", rating: "Needs Work", desc: "Significant issues with content structure for AI readability." };
  return { class: "score--critical", rating: "Critical", desc: "Major structural problems — AI systems will struggle to parse this content." };
}

export default function ScoreCard({ score }: ScoreCardProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const info = getScoreInfo(score);

  const radius = 76;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className={`score-card ${info.class}`}>
      <div className="score-card__gauge">
        <svg viewBox="0 0 180 180">
          <circle className="score-card__gauge-bg" cx="90" cy="90" r={radius} />
          <circle
            className="score-card__gauge-fill"
            cx="90"
            cy="90"
            r={radius}
            stroke="var(--gauge-color)"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="score-card__gauge-value">
          <div className="score-card__score-number">{animatedScore}</div>
          <div className="score-card__score-label">out of 100</div>
        </div>
      </div>
      <div className="score-card__rating">{info.rating}</div>
      <p className="score-card__description">{info.desc}</p>
    </div>
  );
}
