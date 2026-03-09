function QuestionCard({ question, questionCount, totalQuestions }) {
  return (
    <div className="question-card">
      <div className="question-counter">
        Question {questionCount} of {totalQuestions}
      </div>
      <h3>{question}</h3>
    </div>
  );
}

export default QuestionCard;