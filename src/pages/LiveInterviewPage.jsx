import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  startLiveInterview,
  sendLiveAnswer,
  finishLiveInterview,
} from "../services/api";
import Navbar from "../components/Navbar";
import ConversationView from "../components/ConversationView";
import MicRecorder from "../components/MicRecorder";
import InterviewReport from "../components/InterviewReport";

const TOTAL_QUESTIONS = 5;

function LiveInterviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = location.state?.role;

  const [sessionId, setSessionId] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [finished, setFinished] = useState(false);
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");

  const conversationEndRef = useRef(null);
  const hasStarted = useRef(false);

  // Scroll to bottom when conversation updates
  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation, currentQuestion, liveTranscript]);

  // Speak text using SpeechSynthesis
  const speakText = useCallback((text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        resolve();
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.lang = "en-US";

      // Pick a natural-sounding voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) => v.lang.startsWith("en") && v.name.includes("Google")
      ) || voices.find((v) => v.lang.startsWith("en"));
      if (preferred) {
        utterance.voice = preferred;
      }

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => {
        setSpeaking(false);
        resolve();
      };
      utterance.onerror = () => {
        setSpeaking(false);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }, []);

  // Start the interview
  useEffect(() => {
    if (!role) {
      navigate("/dashboard");
      return;
    }

    if (hasStarted.current) return;
    hasStarted.current = true;

    const init = async () => {
      setLoading(true);
      try {
        const res = await startLiveInterview({ role });
        const { sessionId: sid, question } = res.data;
        setSessionId(sid);
        setCurrentQuestion(question);
        setConversation([{ question, answer: "" }]);
        setQuestionNumber(1);

        // Read the question aloud
        await speakText(question);
      } catch (err) {
        console.error("Failed to start live interview:", err);
      } finally {
        setLoading(false);
      }
    };

    // Load voices first (Chrome loads them async)
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      setTimeout(init, 200);
    } else {
      init();
    }
  }, [role, navigate, speakText]);

  // Handle sending answer
  const handleSendAnswer = useCallback(
    async (answerText) => {
      if (!answerText.trim() || !sessionId || loading) return;

      // Update conversation with the answer
      setConversation((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0) {
          updated[lastIdx] = { ...updated[lastIdx], answer: answerText };
        }
        return updated;
      });

      setLiveTranscript("");
      setLoading(true);

      try {
        // Check if this was the last question
        if (questionNumber >= TOTAL_QUESTIONS) {
          // Send the last answer
          await sendLiveAnswer({ sessionId, answer: answerText });

          // Generate report
          setReportLoading(true);
          setFinished(true);

          const reportRes = await finishLiveInterview({ sessionId });
          setReport(reportRes.data.report);

          // Update conversation with full data from server
          if (reportRes.data.conversation) {
            setConversation(reportRes.data.conversation);
          }

          setReportLoading(false);
        } else {
          // Get next question
          const res = await sendLiveAnswer({ sessionId, answer: answerText });

          if (res.data.finished) {
            setReportLoading(true);
            setFinished(true);

            const reportRes = await finishLiveInterview({ sessionId });
            setReport(reportRes.data.report);
            if (reportRes.data.conversation) {
              setConversation(reportRes.data.conversation);
            }
            setReportLoading(false);
          } else {
            const nextQ = res.data.question;
            setCurrentQuestion(nextQ);
            setQuestionNumber((prev) => prev + 1);
            setConversation((prev) => [...prev, { question: nextQ, answer: "" }]);

            // Read new question aloud
            await speakText(nextQ);
          }
        }
      } catch (err) {
        console.error("Failed to send answer:", err);
      } finally {
        setLoading(false);
      }
    },
    [sessionId, questionNumber, loading, speakText]
  );

  // Stop speech on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Progress
  const progress = (questionNumber / TOTAL_QUESTIONS) * 100;

  // ---- REPORT VIEW ----
  if (finished) {
    return (
      <div className="app-layout">
        <Navbar />
        <div className="page-container">
          <div className="card report-card">
            {reportLoading ? (
              <div className="loading-container">
                <div style={{ textAlign: "center" }}>
                  <div
                    className="spinner spinner-dark spinner-lg"
                    style={{ margin: "0 auto 12px" }}
                  ></div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                    Analyzing your interview performance...
                  </p>
                </div>
              </div>
            ) : (
              <>
                <InterviewReport
                  report={report}
                  conversation={conversation}
                  role={role}
                />
                <div className="report-actions">
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => navigate("/dashboard")}
                  >
                    Back to Dashboard
                  </button>
                  <button
                    className="btn btn-outline btn-lg"
                    onClick={() => {
                      hasStarted.current = false;
                      setFinished(false);
                      setReport(null);
                      setConversation([]);
                      setQuestionNumber(1);
                      setSessionId(null);
                      setCurrentQuestion("");
                      hasStarted.current = false;

                      // Re-trigger start
                      setTimeout(() => {
                        hasStarted.current = false;
                        window.location.reload();
                      }, 0);
                    }}
                  >
                    Retake Interview
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---- LIVE INTERVIEW VIEW ----
  return (
    <div className="app-layout">
      <Navbar />
      <div className="page-container">
        {/* Header */}
        <div className="live-interview-header">
          <div className="live-header-left">
            <h1>Live Interview</h1>
            <p>{role}</p>
          </div>
          <div className="live-header-right">
            <span className="live-badge">
              <span className="live-dot"></span>
              LIVE
            </span>
            <span className="question-counter">
              Q{questionNumber}/{TOTAL_QUESTIONS}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>

        {/* Loading state */}
        {loading && conversation.length === 0 ? (
          <div className="loading-container">
            <div style={{ textAlign: "center" }}>
              <div
                className="spinner spinner-dark spinner-lg"
                style={{ margin: "0 auto 12px" }}
              ></div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                Starting your live interview...
              </p>
            </div>
          </div>
        ) : (
          <div className="live-interview-body">
            {/* Conversation */}
            <div className="conversation-container card">
              <ConversationView
                conversation={conversation}
                currentQuestion={currentQuestion}
                isListening={false}
              />

              {/* Speaking indicator */}
              {speaking && (
                <div className="speaking-indicator">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                  AI is speaking...
                </div>
              )}

              {/* Loading next question */}
              {loading && conversation.length > 0 && (
                <div className="thinking-indicator">
                  <div className="spinner spinner-dark" style={{ width: 16, height: 16 }}></div>
                  Interviewer is thinking...
                </div>
              )}

              <div ref={conversationEndRef} />
            </div>

            {/* Mic / Input */}
            <div className="mic-section card">
              <MicRecorder
                onTranscript={setLiveTranscript}
                onSend={handleSendAnswer}
                disabled={loading || speaking}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LiveInterviewPage;
