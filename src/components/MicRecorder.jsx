import { useState, useRef, useEffect, useCallback } from "react";

function MicRecorder({ onTranscript, onSend, disabled }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }

      finalTranscriptRef.current = final;
      const fullText = (final + interim).trim();
      setTranscript(fullText);

      if (onTranscript) {
        onTranscript(fullText);
      }
    };

    recognition.onerror = (event) => {
      // Silently handle errors — don't interrupt the UX
      if (event.error === "no-speech" || event.error === "aborted") {
        return;
      }
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || disabled) return;

    finalTranscriptRef.current = "";
    setTranscript("");

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      // Already started — ignore
    }
  }, [disabled]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
    } catch {
      // Already stopped
    }
    setIsListening(false);
  }, []);

  const handleSend = useCallback(() => {
    stopListening();
    const text = transcript.trim();
    if (text && onSend) {
      onSend(text);
      setTranscript("");
      finalTranscriptRef.current = "";
    }
  }, [transcript, onSend, stopListening]);

  const handleTextChange = (e) => {
    setTranscript(e.target.value);
    if (onTranscript) {
      onTranscript(e.target.value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!supported) {
    return (
      <div className="mic-recorder">
        <div className="mic-input-row">
          <textarea
            className="mic-textarea"
            placeholder="Speech recognition not supported in this browser. Type your answer instead..."
            value={transcript}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={3}
          />
          <button
            className="btn btn-primary mic-send-btn"
            onClick={handleSend}
            disabled={disabled || !transcript.trim()}
          >
            Send
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mic-recorder">
      {/* Transcript display / text input */}
      <div className="mic-input-row">
        <textarea
          className="mic-textarea"
          placeholder={isListening ? "Listening... speak now" : "Click the mic to speak, or type your answer..."}
          value={transcript}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={3}
        />
      </div>

      {/* Controls */}
      <div className="mic-controls">
        <button
          className={`mic-btn ${isListening ? "mic-btn-active" : ""}`}
          onClick={isListening ? stopListening : startListening}
          disabled={disabled}
          title={isListening ? "Stop recording" : "Start recording"}
        >
          {isListening ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          )}
        </button>

        {isListening && (
          <div className="mic-status">
            <span className="mic-pulse"></span>
            Listening...
          </div>
        )}

        <button
          className="btn btn-primary mic-send-btn"
          onClick={handleSend}
          disabled={disabled || !transcript.trim()}
        >
          Send Answer
        </button>
      </div>
    </div>
  );
}

export default MicRecorder;
