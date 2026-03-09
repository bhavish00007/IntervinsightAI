function Feedback({ feedback }) {
  const { score, strength, improvement } = feedback;

  const getScoreClass = (s) => {
    if (s >= 8) return "score-high";
    if (s >= 5) return "score-mid";
    return "score-low";
  };

  return (
    <div className="feedback-card fade-in">
      <div className="feedback-header">
        <div className={`score-badge ${getScoreClass(score)}`}>
          {score}/10
        </div>
        <div>
          <div className="feedback-score-label">Performance Score</div>
          <div className="feedback-score-value">
            {score >= 8 ? "Great job!" : score >= 5 ? "Decent effort" : "Keep practicing"}
          </div>
        </div>
      </div>

      {strength && (
        <div className="feedback-section">
          <div className="feedback-section-label strength">Strength</div>
          <p>{strength}</p>
        </div>
      )}

      {improvement && (
        <div className="feedback-section">
          <div className="feedback-section-label improvement">Improvement</div>
          <p>{improvement}</p>
        </div>
      )}
    </div>
  );
}

export default Feedback;