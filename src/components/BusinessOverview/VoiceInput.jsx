import React, { useState, useRef, useEffect } from "react";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./VoiceInput.css";
import CustomTooltip from "./CustomTooltip";

export default function VoiceInput({ onTranscriptComplete }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const hasResultsRef = useRef(false);

  // Detect support on mount and clean up on unmount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      console.warn("Speech recognition is not supported in this browser");
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (error) {
          console.error("Error cleaning up recognition:", error);
        } finally {
          recognitionRef.current = null;
        }
      }
    };
  }, []);

  const initializeRecognition = () => {
    if (recognitionRef.current) {
      return recognitionRef.current;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      console.warn("Speech recognition is not supported in this browser");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      console.log("Speech recognition started");
      hasResultsRef.current = false;
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let newFinalTranscript = "";

      hasResultsRef.current = true;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];

        if (result.isFinal) {
          newFinalTranscript += result[0].transcript + " ";
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (newFinalTranscript) {
        finalTranscriptRef.current += newFinalTranscript;
      }

      const currentTranscript = finalTranscriptRef.current + interimTranscript;
      setTranscript(currentTranscript);

      if (currentTranscript.trim()) {
        setShowTranscript(true);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);

      if (
        event.error === "no-speech" ||
        event.error === "audio-capture" ||
        event.error === "not-allowed" ||
        event.error === "aborted" ||
        event.error === "network"
      ) {
        setIsListening(false);
        setShowTranscript(false);
        setTranscript("");
        finalTranscriptRef.current = "";
      }
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    return recognition;
  };

  const startListening = () => {
    const recognition = initializeRecognition();
    if (!recognition) return;

    // Reset state
    setTranscript("");
    finalTranscriptRef.current = "";
    setShowTranscript(false);
    hasResultsRef.current = false;

    try {
      if (isListening) {
        recognition.abort();
      }

      setTimeout(() => {
        try {
          recognition.start();
          setIsListening(true);
        } catch (error) {
          if (error.name === "InvalidStateError") {
            console.log("Recognition already active, restarting...");
            try {
              recognition.abort();
            } catch (abortError) {
              console.error("Failed to restart recognition:", abortError);
            }
            setTimeout(() => {
              try {
                recognition.start();
                setIsListening(true);
              } catch (restartError) {
                console.error("Failed to restart recognition:", restartError);
                setIsListening(false);
              }
            }, 100);
          } else {
            console.error("Failed to start recognition:", error);
            setIsListening(false);
          }
        }
      }, 100);
    } catch (error) {
      console.error("Failed to start recognition:", error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    try {
      recognition.abort();
      setIsListening(false);

      setTimeout(() => {
        const finalText = finalTranscriptRef.current.trim() || transcript.trim();

        if (finalText && onTranscriptComplete) {
          onTranscriptComplete(finalText);
        }

        setShowTranscript(false);
        setTranscript("");
        finalTranscriptRef.current = "";
      }, 300);
    } catch (error) {
      console.error("Failed to stop recognition:", error);
      setIsListening(false);
    }
  };

  const handleMicClick = async () => {
    if (!isSupported) {
      alert("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
      return;
    }

    if (!isListening) {
      startListening();
    } else {
      stopListening();
    }
  };

  return (
    <>
      {/* Live transcript display */}
      {(showTranscript || (isListening && transcript)) && (
        <div className="voice-input__transcript-popover">
          <div className="voice-input__transcript-header">
            {isListening && (
              <span className="voice-input__status">
                <span className="voice-input__status-indicator"></span>
                <span className="voice-input__status-text">Listening...</span>
              </span>
            )}
            {!isListening && transcript && <span className="voice-input__final-label">Final transcript</span>}
          </div>
          <p className="voice-input__transcript-text">{transcript || "Waiting for speech..."}</p>
        </div>
      )}

      {/* Microphone button */}
      <CustomTooltip
        content={
          !isSupported
            ? "Speech recognition not supported"
            : isListening
              ? "Stop recording"
              : "Start recording"
        }
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMicClick}
          disabled={!isSupported}
          className={`voice-input__button${isListening ? " voice-input__button--listening" : ""}${
            !isSupported ? " voice-input__button--disabled" : ""
          }`}
        >
          <Mic className="voice-input__icon" />
        </Button>
      </CustomTooltip>
    </>
  );
}
