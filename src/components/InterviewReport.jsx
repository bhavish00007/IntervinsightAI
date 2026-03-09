function InterviewReport({ report, conversation, role }) {
  if (!report) return null;

  const avgScore = (
    (report.technicalScore + report.communicationScore + report.problemSolvingScore) / 3
  ).toFixed(1);

  const getScoreColor = (score) => {
    if (score >= 8) return "var(--success)";
    if (score >= 5) return "var(--warning)";
    return "var(--error)";
  };

  const getRecommendationClass = (rec) => {
    const r = (rec || "").toLowerCase();
    if (r === "hire") return "verdict-hire";
    if (r === "lean hire") return "verdict-leaning-hire";
    if (r === "lean no hire") return "verdict-leaning-no-hire";
    if (r === "no hire") return "verdict-no-hire";
    return "verdict-leaning-hire";
  };

  const scores = [
    { label: "Technical", value: report.technicalScore },
    { label: "Communication", value: report.communicationScore },
    { label: "Problem Solving", value: report.problemSolvingScore },
  ];

  return (
    <div className="interview-report">
      {/* Header */}
      <div className="report-header" style={{ textAlign: "center", marginBottom: "24px" }}>
        <h2>Interview Report</h2>
        <p style={{ color: "var(--text-secondary)" }}>{role} — Live Interview Analysis</p>
        <div
          className="report-final-score"
          style={{ color: getScoreColor(parseFloat(avgScore)) }}
        >
          {avgScore}/10
        </div>
      </div>

      {/* Recommendation Banner */}
      <div className={`report-verdict-banner ${getRecommendationClass(report.hiringRecommendation)}`}>
        {report.hiringRecommendation}
      </div>

      {/* Summary */}
      {report.summary && (
        <div className="report-summary">{report.summary}</div>
      )}

      {/* Score Breakdown */}
      <h3 className="report-section-title">Score Breakdown</h3>
      <div className="skill-bars">
        {scores.map((s) => (
          <div className="skill-bar-item" key={s.label}>
            <div className="skill-bar-header">
              <span className="skill-bar-name">{s.label}</span>
              <span
                className="skill-bar-rating"
                style={{ background: getScoreColor(s.value) }}
              >
                {s.value}/10
              </span>
            </div>
            <div className="skill-bar-track">
              <div
                className="skill-bar-fill"
                style={{
                  width: `${(s.value / 10) * 100}%`,
                  background: getScoreColor(s.value),
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Strengths & Weaknesses */}
      <div className="report-two-col">
        <div className="report-col">
          <h3 className="report-section-title">Strengths</h3>
          <ul className="report-list">
            {(report.strengths || []).map((s, i) => (
              <li className="report-list-item" key={i}>
                <span className="dot green"></span>
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="report-col">
          <h3 className="report-section-title">Areas to Improve</h3>
          <ul className="report-list">
            {(report.weaknesses || []).map((w, i) => (
              <li className="report-list-item" key={i}>
                <span className="dot red"></span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Conversation Review */}
      {conversation && conversation.length > 0 && (
        <>
          <h3 className="report-section-title" style={{ marginTop: "28px" }}>
            Conversation Transcript
          </h3>
          <div className="report-transcript">
            {conversation.map((turn, i) => (
              <div className="transcript-turn" key={i}>
                <div className="transcript-q">
                  <strong>Q{i + 1}:</strong> {turn.question}
                </div>
                {turn.answer && (
                  <div className="transcript-a">
                    <strong>Your answer:</strong> {turn.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default InterviewReport;
