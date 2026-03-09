function ConversationView({ conversation, currentQuestion, isListening }) {
  return (
    <div className="conversation-view">
      {conversation.map((turn, index) => (
        <div className="conversation-turn" key={index}>
          {/* AI Question */}
          <div className="conversation-bubble ai-bubble">
            <div className="bubble-avatar">AI</div>
            <div className="bubble-content">
              <div className="bubble-label">Interviewer</div>
              <p>{turn.question}</p>
            </div>
          </div>

          {/* User Answer */}
          {turn.answer && (
            <div className="conversation-bubble user-bubble">
              <div className="bubble-content">
                <div className="bubble-label">You</div>
                <p>{turn.answer}</p>
              </div>
              <div className="bubble-avatar user-avatar">You</div>
            </div>
          )}
        </div>
      ))}

      {/* Current question being asked (no answer yet) */}
      {currentQuestion && !conversation.find((t) => t.question === currentQuestion && !t.answer) && (
        <div className="conversation-turn">
          <div className="conversation-bubble ai-bubble">
            <div className="bubble-avatar">AI</div>
            <div className="bubble-content">
              <div className="bubble-label">Interviewer</div>
              <p>{currentQuestion}</p>
            </div>
          </div>
        </div>
      )}

      {/* Listening indicator */}
      {isListening && (
        <div className="conversation-turn">
          <div className="conversation-bubble user-bubble">
            <div className="bubble-content">
              <div className="bubble-label">You</div>
              <div className="listening-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <div className="bubble-avatar user-avatar">You</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConversationView;
