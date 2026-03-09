import { useState } from "react";
import QuestionCard from "./QuestionCard";
import Feedback from "./Feedback";

function Interview({
  question,
  questionCount,
  totalQuestions,
  loading,
  currentFeedback,
  onSubmit,
  onNext,
  isLastQuestion,
}) {
  const [answer, setAnswer] = useState("");

  const handleSubmit = () => {
    if (!answer.trim()) return;
    onSubmit(answer);
  };

  const handleNext = () => {
    setAnswer("");
    onNext();
  };

  return (
    <div className="fade-in">
      <QuestionCard
        question={question}
        questionCount={questionCount}
        totalQuestions={totalQuestions}
      />

      {!currentFeedback && (
        <div className="answer-area">
          <textarea
            className="answer-textarea"
            rows="6"
            placeholder="Type your answer here..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={loading}
          />
          <div className="answer-actions">
            <button
              className="btn btn-primary btn-lg"
              onClick={handleSubmit}
              disabled={loading || !answer.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Evaluating...
                </>
              ) : (
                "Submit Answer"
              )}
            </button>
          </div>
        </div>
      )}

      {currentFeedback && (
        <>
          <Feedback feedback={currentFeedback} />
          <div className="answer-actions">
            <button
              className="btn btn-accent btn-lg"
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Loading...
                </>
              ) : isLastQuestion ? (
                "Finish Interview"
              ) : (
                "Next Question →"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Interview;