import { useState } from "react";
import { generateQuestion, submitAnswer as submitAnswerAPI, saveInterview } from "../services/api";

const TOTAL_QUESTIONS = 3;

const parseFeedback = (raw) => {
  const scoreMatch = raw.match(/Score:\s*(\d+)\s*\/\s*10/i);
  const strengthMatch = raw.match(/Strength:\s*([\s\S]*?)(?=Improvement:|$)/i);
  const improvementMatch = raw.match(/Improvement:\s*([\s\S]*?)$/i);

  return {
    score: scoreMatch ? parseInt(scoreMatch[1]) : 0,
    strength: strengthMatch ? strengthMatch[1].trim() : "",
    improvement: improvementMatch ? improvementMatch[1].trim() : "",
    raw,
  };
};

const useInterview = () => {
  const [role, setRole] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);

  const startInterview = async (selectedRole) => {
    setRole(selectedRole);
    setCurrentQuestion(0);
    setQuestions([]);
    setAnswers([]);
    setFeedbacks([]);
    setScores([]);
    setCurrentFeedback(null);
    setFinished(false);
    setLoading(true);
    setStarted(true);

    try {
      const res = await generateQuestion({ role: selectedRole });
      setQuestions([res.data.question]);
      setCurrentQuestion(0);
    } catch (err) {
      console.error("Failed to start interview:", err);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (answer) => {
    setLoading(true);
    setCurrentFeedback(null);

    try {
      const res = await submitAnswerAPI({ role, answer });
      const parsed = parseFeedback(res.data.feedback);

      const newAnswers = [...answers, answer];
      const newFeedbacks = [...feedbacks, parsed];
      const newScores = [...scores, parsed.score];

      setAnswers(newAnswers);
      setFeedbacks(newFeedbacks);
      setScores(newScores);
      setCurrentFeedback(parsed);
    } catch (err) {
      console.error("Failed to submit answer:", err);
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = async () => {
    if (currentQuestion + 1 >= TOTAL_QUESTIONS) {
      await finishInterview();
      return;
    }

    setLoading(true);
    setCurrentFeedback(null);

    try {
      const res = await generateQuestion({ role });
      setQuestions((prev) => [...prev, res.data.question]);
      setCurrentQuestion((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to get next question:", err);
    } finally {
      setLoading(false);
    }
  };

  const finishInterview = async () => {
    const total = scores.reduce((a, b) => a + b, 0);
    const avg = scores.length > 0 ? total / scores.length : 0;

    try {
      await saveInterview({ role, score: avg });
    } catch (err) {
      console.error("Failed to save interview:", err);
    }

    setFinished(true);
  };

  const getPerformanceLevel = (avg) => {
    if (avg >= 8) return "Excellent";
    if (avg >= 6) return "Good";
    if (avg >= 4) return "Average";
    return "Needs Improvement";
  };

  const averageScore = scores.length > 0
    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
    : 0;

  return {
    role,
    currentQuestion,
    questions,
    answers,
    feedbacks,
    scores,
    loading,
    currentFeedback,
    finished,
    started,
    totalQuestions: TOTAL_QUESTIONS,
    averageScore,
    performanceLevel: getPerformanceLevel(parseFloat(averageScore)),
    startInterview,
    submitAnswer,
    nextQuestion,
    finishInterview,
  };
};

export default useInterview;
