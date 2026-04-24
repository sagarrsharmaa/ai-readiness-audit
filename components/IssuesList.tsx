export interface Issue {
  id: string;
  title: string;
  severity: "critical" | "warning" | "info";
  description: string;
  recommendation: string;
  pointsDeducted: number;
}

interface IssuesListProps {
  issues: Issue[];
}

export default function IssuesList({ issues }: IssuesListProps) {
  if (issues.length === 0) {
    return (
      <div className="issues">
        <div className="issues__header">
          <h2 className="issues__title">Findings</h2>
          <span className="issues__count">0 issues</span>
        </div>
        <div className="issue-card" style={{ textAlign: "center", padding: "32px" }}>
          <p style={{ color: "var(--accent-green)", fontWeight: 600 }}>
            ✓ No issues found — this page looks great!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="issues">
      <div className="issues__header">
        <h2 className="issues__title">Findings</h2>
        <span className="issues__count">
          {issues.length} issue{issues.length !== 1 ? "s" : ""} found
        </span>
      </div>
      <div className="issues__list">
        {issues.map((issue) => (
          <div key={issue.id} className="issue-card">
            <div className="issue-card__top">
              <span className={`issue-card__severity issue-card__severity--${issue.severity}`}>
                {issue.severity}
              </span>
              <span className="issue-card__title">{issue.title}</span>
              <span className="issue-card__points">-{issue.pointsDeducted} pts</span>
            </div>
            <p className="issue-card__description">{issue.description}</p>
            <div className="issue-card__recommendation">
              <strong>Fix: </strong>
              {issue.recommendation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
