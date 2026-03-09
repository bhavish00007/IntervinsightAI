function History({ history }) {
  const getTag = (score) => {
    if (score >= 8) return { label: "Excellent", className: "tag-excellent" };
    if (score >= 6) return { label: "Good", className: "tag-good" };
    if (score >= 4) return { label: "Average", className: "tag-average" };
    return { label: "Needs Work", className: "tag-poor" };
  };

  const getScoreColor = (score) => {
    if (score >= 8) return "var(--success)";
    if (score >= 6) return "var(--accent)";
    if (score >= 4) return "var(--warning)";
    return "var(--error)";
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!history || history.length === 0) {
    return (
      <div className="empty-state">
        <p>No interviews yet. Start your first one!</p>
      </div>
    );
  }

  return (
    <div className="history-list">
      {history.map((item, index) => {
        const tag = getTag(item.score);
        const scorePercent = (item.score / 10) * 100;

        return (
          <div className="history-item" key={index}>
            <div className="history-item-info">
              <span className="history-item-role">{item.role}</span>
              <span className="history-item-date">
                {item.date ? formatDate(item.date) : "—"}
              </span>
            </div>
            <div className="history-item-right">
              <div className="score-bar-container">
                <div
                  className="score-bar"
                  style={{
                    width: `${scorePercent}%`,
                    background: getScoreColor(item.score),
                  }}
                />
              </div>
              <span
                className="history-score"
                style={{ color: getScoreColor(item.score) }}
              >
                {item.score.toFixed(1)}
              </span>
              <span className={`performance-tag ${tag.className}`}>
                {tag.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default History;