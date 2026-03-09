import { useState } from "react";
import {
  generateQuestion,
  submitAnswer as submitAnswerAPI,
  getSkillReport as getSkillReportAPI,
  saveInterview,
} from "../services/api";

const TOTAL_QUESTIONS = 5;

const parseFeedback = (raw) => {
  const scoreMatch = raw.match(/Score:\s*(\d+)\s*\/\s*10/i);
  const skillMatch = raw.match(/Skill:\s*(.*?)(?:\n|$)/i);
  const strengthMatch = raw.match(/Strength:\s*([\s\S]*?)(?=Improvement:|$)/i);
  const improvementMatch = raw.match(/Improvement:\s*([\s\S]*?)(?=Verdict:|$)/i);
  const verdictMatch = raw.match(/Verdict:\s*([\s\S]*?)$/i);

  return {
    score: scoreMatch ? parseInt(scoreMatch[1]) : 0,
    skill: skillMatch ? skillMatch[1].trim() : "",
    strength: strengthMatch ? strengthMatch[1].trim() : "",
    improvement: improvementMatch ? improvementMatch[1].trim() : "",
    verdict: verdictMatch ? verdictMatch[1].trim() : "",
    raw,
  };
};

const useInterview = () => {
  const [role, setRole] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [rawFeedbacks, setRawFeedbacks] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);
  const [skillReport, setSkillReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  const startInterview = async (selectedRole) => {
    setRole(selectedRole);
    setCurrentQuestion(0);
    setQuestions([]);
    setAnswers([]);
    setFeedbacks([]);
    setRawFeedbacks([]);
    setScores([]);
    setCurrentFeedback(null);
    setFinished(false);
    setLoading(true);
    setStarted(true);
    setSkillReport(null);

    try {
      const res = await generateQuestion({
        role: selectedRole,
        questionNumber: 1,
        previousQuestions: [],
        previousAnswers: [],
      });
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
      const res = await submitAnswerAPI({
        role,
        question: questions[currentQuestion],
        answer,
        questionNumber: currentQuestion + 1,
      });

      const parsed = parseFeedback(res.data.feedback);

      const newAnswers = [...answers, answer];
      const newFeedbacks = [...feedbacks, parsed];
      const newRawFeedbacks = [...rawFeedbacks, res.data.feedback];
      const newScores = [...scores, parsed.score];

      setAnswers(newAnswers);
      setFeedbacks(newFeedbacks);
      setRawFeedbacks(newRawFeedbacks);
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
      const res = await generateQuestion({
        role,
        questionNumber: currentQuestion + 2,
        previousQuestions: questions,
        previousAnswers: answers,
      });
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

    setFinished(true);
    setReportLoading(true);

    try {
      // Get AI skill report
      const reportRes = await getSkillReportAPI({
        role,
        questions,
        answers,
        feedbacks: rawFeedbacks,
      });
      setSkillReport(reportRes.data.report);

      // Save interview with report
      await saveInterview({
        role,
        score: avg,
        skillReport: reportRes.data.report,
      });
    } catch (err) {
      console.error("Failed to generate report:", err);
      // Save without report
      await saveInterview({ role, score: avg }).catch(() => {});
    } finally {
      setReportLoading(false);
    }
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
    skillReport,
    reportLoading,
    startInterview,
    submitAnswer,
    nextQuestion,
    finishInterview,
  };
};

export default useInterview;
