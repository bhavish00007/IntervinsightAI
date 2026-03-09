function SkillReport({ report }) {
  if (!report) return null;

  const { overallVerdict, summary, skillBreakdown, topStrengths, criticalGaps, recommendation } = report;

  const getVerdictClass = (verdict) => {
    if (!verdict) return "tag-average";
    const v = verdict.toLowerCase();
    if (v.includes("hire") && !v.includes("no")) return "tag-excellent";
    if (v.includes("lean hire")) return "tag-good";
    if (v.includes("lean no")) return "tag-average";
    return "tag-poor";
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return "var(--success)";
    if (rating >= 6) return "var(--accent)";
    if (rating >= 4) return "var(--warning)";
    return "var(--error)";
  };

  return (
    <div className="skill-report fade-in-up">
      {/* Verdict Banner */}
      <div className="report-verdict-banner">
        <span className={`performance-tag ${getVerdictClass(overallVerdict)}`} style={{ fontSize: "0.875rem", padding: "6px 20px" }}>
          {overallVerdict}
        </span>
      </div>

      {/* Summary */}
      {summary && (
        <div className="report-summary">
          <p>{summary}</p>
        </div>
      )}

      {/* Skill Breakdown */}
      {skillBreakdown && skillBreakdown.length > 0 && (
        <div className="skill-breakdown">
          <h3 className="report-section-title">Skill Breakdown</h3>
          <div className="skill-bars">
            {skillBreakdown.map((item, i) => (
              <div className="skill-bar-item" key={i}>
                <div className="skill-bar-header">
                  <span className="skill-bar-name">{item.skill}</span>
                  <span className="skill-bar-rating" style={{ color: getRatingColor(item.rating) }}>
                    {item.rating}/10
                  </span>
                </div>
                <div className="skill-bar-track">
                  <div
                    className="skill-bar-fill"
                    style={{
                      width: `${(item.rating / 10) * 100}%`,
                      background: getRatingColor(item.rating),
                    }}
                  />
                </div>
                {item.comment && <p className="skill-bar-comment">{item.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Gaps */}
      <div className="report-two-col">
        {topStrengths && topStrengths.length > 0 && (
          <div className="report-col">
            <h3 className="report-section-title" style={{ color: "var(--success)" }}>Top Strengths</h3>
            <ul className="report-list">
              {topStrengths.map((s, i) => (
                <li key={i} className="report-list-item strength">{s}</li>
              ))}
            </ul>
          </div>
        )}

        {criticalGaps && criticalGaps.length > 0 && (
          <div className="report-col">
            <h3 className="report-section-title" style={{ color: "var(--error)" }}>Areas to Improve</h3>
            <ul className="report-list">
              {criticalGaps.map((g, i) => (
                <li key={i} className="report-list-item gap">{g}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Recommendation */}
      {recommendation && (
        <div className="report-recommendation">
          <h3 className="report-section-title">Recommendation</h3>
          <p>{recommendation}</p>
        </div>
      )}
    </div>
  );
}

export default SkillReport;
