export default function Header() {
  return (
    <header className="header">
      <div className="header__brand">
        <div className="header__icon">🔍</div>
        <h1 className="header__title">AI Readiness Audit</h1>
      </div>
      <p className="header__subtitle">
        Enter any URL to analyze how well your website is structured for AI
        discovery, LLM comprehension, and next-gen search engines.
      </p>
    </header>
  );
}
