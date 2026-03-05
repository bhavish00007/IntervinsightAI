import { useState, useEffect } from "react";
import axios from "axios";

function App() {

  const [role, setRole] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  const [questionCount, setQuestionCount] = useState(0);
  const [interviewFinished, setInterviewFinished] = useState(false);

  const [scores, setScores] = useState([]);
  const [finalScore, setFinalScore] = useState(null);

  const [history, setHistory] = useState([]);

  // -----------------------------
  // Fetch Interview History
  // -----------------------------
  const fetchHistory = async () => {
    const res = await axios.get("http://localhost:5001/history");
    setHistory(res.data);
  };

  // Load history when page opens
  useEffect(() => {
    fetchHistory();
  }, []);

  // -----------------------------
  // Start Interview
  // -----------------------------
  const handleStart = async () => {

    if (!role) {
      alert("Please select a role");
      return;
    }

    const response = await axios.post("http://localhost:5001/generate", {
      role
    });

    setQuestion(response.data.question);
    setAnswer("");
    setFeedback("");
    setQuestionCount(1);
    setInterviewFinished(false);
    setScores([]);
    setFinalScore(null);
  };

  // -----------------------------
  // Submit Answer
  // -----------------------------
  const handleSubmit = async () => {

    if (!answer) {
      alert("Please write your answer");
      return;
    }

    const response = await axios.post("http://localhost:5001/generate", {
      role,
      answer
    });

    setFeedback(response.data.feedback);

    // Extract score from AI response
    const match = response.data.feedback.match(/Score:\s*(\d+)/);

    let updatedScores = [...scores];

    if (match) {
      const score = parseInt(match[1]);
      updatedScores.push(score);
      setScores(updatedScores);
    }

    // -----------------------------
    // Load next question
    // -----------------------------
    if (questionCount < 3) {

      const next = await axios.post("http://localhost:5001/generate", {
        role
      });

      setTimeout(() => {

        setQuestion(next.data.question);
        setAnswer("");
        setFeedback("");
        setQuestionCount(questionCount + 1);

      }, 2000);

    }

    // -----------------------------
    // Finish Interview
    // -----------------------------
    else {

      const total = updatedScores.reduce((a, b) => a + b, 0);
      const avg = total / updatedScores.length;

      setFinalScore(avg.toFixed(1));
      setInterviewFinished(true);
      setQuestion("");

      // Save interview result
      await axios.post("http://localhost:5001/saveInterview", {
        role,
        score: avg
      });

      fetchHistory();
    }
  };

  return (

    <div style={{ padding: "40px", fontFamily: "Arial" }}>

      <h1>IntervInsight AI</h1>

      {/* Role Selector */}
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="">Select Role</option>
        <option value="Frontend Developer">Frontend Developer</option>
        <option value="Backend Developer">Backend Developer</option>
        <option value="Full Stack Developer">Full Stack Developer</option>
      </select>

      <br /><br />

      <button onClick={handleStart}>
        Start Interview
      </button>

      <br /><br />

      {/* Question Section */}
      {question && (

        <div>

          <h3>Question {questionCount}</h3>
          <p>{question}</p>

          <textarea
            rows="5"
            cols="50"
            placeholder="Write your answer here..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />

          <br /><br />

          <button onClick={handleSubmit}>
            Submit Answer
          </button>

        </div>

      )}

      <br />

      {/* Feedback */}
      {feedback && (

        <div>

          <h3>Feedback</h3>
          <p>{feedback}</p>

        </div>

      )}

      {/* Final Result */}
      {interviewFinished && (

        <div>

          <h2>Interview Completed 🎉</h2>
          <h3>Final Score: {finalScore} / 10</h3>

        </div>

      )}

      <br />

      {/* Interview History */}
      <h2>Interview History</h2>

      {history.map((item, index) => (

        <div
          key={index}
          style={{
            border: "1px solid #ddd",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "5px"
          }}
        >

          <strong>{item.role}</strong>

          <p>Score: {item.score.toFixed(1)} / 10</p>

        </div>

      ))}

    </div>

  );
}

export default App;