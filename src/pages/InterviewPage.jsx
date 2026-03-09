import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useInterview from "../hooks/useInterview";
import Interview from "../components/Interview";
import Feedback from "../components/Feedback";
import Navbar from "../components/Navbar";

function InterviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = location.state?.role;

  const {
    currentQuestion,
    questions,
    answers,
    feedbacks,
    loading,
    currentFeedback,
    finished,
    started,
    totalQuestions,
    averageScore,
    performanceLevel,
    startInterview,
    submitAnswer,
    nextQuestion,
  } = useInterview();

  useEffect(() => {
    if (!role) {
      navigate("/dashboard");
      return;
    }
    startInterview(role);
  }, []);

  const progress = ((currentQuestion + (currentFeedback ? 1 : 0)) / totalQuestions) * 100;

  const getScoreColor = (score) => {
    if (score >= 8) return "var(--success)";
    if (score >= 5) return "var(--warning)";
    return "var(--error)";
  };

  const getLevelClass = (level) => {
    if (level === "Excellent") return "tag-excellent";
    if (level === "Good") return "tag-good";
    if (level === "Average") return "tag-average";
    return "tag-poor";
  };

  if (finished) {
    return (
      <div className="app-layout">
        <Navbar />
        <div className="page-container">
          <div className="card report-card">
            <div className="report-header">
              <h2>Interview Complete</h2>
              <p style={{ color: "var(--text-secondary)" }}>
                Here's how you performed as a {role}
              </p>
              <div
                className="report-final-score"
                style={{ color: getScoreColor(parseFloat(averageScore)) }}
              >
                {averageScore}/10
              </div>
              <span className={`report-level performance-tag ${getLevelClass(performanceLevel)}`}>
                {performanceLevel}
              </span>
            </div>

            {questions.map((q, i) => (
              <div className="report-qa" key={i}>
                <div className="report-qa-question">
                  Q{i + 1}: {q}
                </div>
                <div className="report-qa-answer">{answers[i]}</div>
                {feedbacks[i] && (
                  <Feedback feedback={feedbacks[i]} />
                )}
              </div>
            ))}

            <div className="report-actions">
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate("/dashboard")}
              >
                Back to Dashboard
              </button>
              <button
                className="btn btn-outline btn-lg"
                onClick={() => startInterview(role)}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Navbar />
      <div className="page-container">
        <div className="interview-header">
          <h1>{role} Interview</h1>
          <p>Answer each question thoughtfully. You'll get feedback after each response.</p>
        </div>

        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>

        {loading && !questions[currentQuestion] ? (
          <div className="loading-container">
            <div className="spinner spinner-dark spinner-lg"></div>
          </div>
        ) : questions[currentQuestion] ? (
          <Interview
            question={questions[currentQuestion]}
            questionCount={currentQuestion + 1}
            totalQuestions={totalQuestions}
            loading={loading}
            currentFeedback={currentFeedback}
            onSubmit={submitAnswer}
            onNext={nextQuestion}
            isLastQuestion={currentQuestion + 1 >= totalQuestions}
          />
        ) : null}
      </div>
    </div>
  );
}

export default InterviewPage;