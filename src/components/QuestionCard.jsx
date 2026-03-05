function QuestionCard({ question, questionCount }) {
  return (
    <div>
      <h3>Question {questionCount}</h3>
      <p>{question}</p>
    </div>
  );
}

export default QuestionCard;