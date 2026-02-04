import React, { useState, useEffect, useContext, useRef } from "react";
import { Headphones, HeadphoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatContext } from "@/App";
import CustomTooltip from "./CustomTooltip";
import "./VoiceConversation.css";

export default function VoiceConversation({ onTranscriptComplete, isEnabled, onToggle }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);

  const { recognitionRef, synthRef, currentUtteranceRef, isEnabledRef, isMountedRef, isRecognitionActiveRef, setVisulizerValue } = useContext(ChatContext);

  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const rafIdRef = useRef(null);
  const audioContextRef = useRef(null);

  // Keep refs in sync
  useEffect(() => {
    isEnabledRef.current = isEnabled;
  }, [isEnabled]);

  // Detect support and clean up on unmount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition || !window.speechSynthesis) {
      setIsSupported(false);
      console.warn("Speech recognition or synthesis is not supported in this browser");
    }

    return () => {
      console.log("Component unmounting, cleaning up...");
      isMountedRef.current = false;

      if (recognitionRef.current && isRecognitionActiveRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (error) {
          console.error("Error stopping recognition:", error);
        }
      }

      if (synthRef.current) {
        synthRef.current?.cancel();
      }
    };
  }, []);

  const initializeRecognition = () => {
    if (recognitionRef.current) {
      return recognitionRef.current;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition || !window.speechSynthesis) {
      setIsSupported(false);
      console.warn("Speech recognition or synthesis is not supported in this browser");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      console.log("Recognition started");
      isRecognitionActiveRef.current = true;
      setIsListening(true);
      startVolumeMeter();
    };

    recognition.onresult = (event) => {
      console.log("Recognition result received");
      let interimTranscript = "";
      let newFinalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];

        if (result.isFinal) {
          newFinalTranscript += result[0].transcript + " ";
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (newFinalTranscript) {
        const finalText = newFinalTranscript.trim();

        if (finalText) {
          setTranscript(finalText);
          setTimeout(() => {
            setTranscript("");
          }, 1000)
          if (onTranscriptComplete) {
            onTranscriptComplete(finalText);
          }
        }
      } else if (interimTranscript) {
        setTranscript(interimTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.log("Speech recognition error:", event.error);

      if (event.error === "not-allowed") {
        isRecognitionActiveRef.current = false;
        setIsListening(false);
        console.error("Microphone permission denied");
      }
    };

    recognition.onend = () => {
      console.log("Recognition ended, isEnabled:", isEnabledRef.current);
      isRecognitionActiveRef.current = false;

      if (isEnabledRef.current && isMountedRef.current) {
        console.log("Attempting to restart recognition...");
        setTimeout(() => {
          if (isEnabledRef.current && isMountedRef.current && !isRecognitionActiveRef.current) {
            const activeRecognition = recognitionRef.current;
            if (activeRecognition) {
              try {
                activeRecognition.start();
                console.log("Recognition restarted successfully");
              } catch (error) {
                console.error("Failed to restart recognition:", error);
                setIsListening(false);
              }
            }
          }
        }, 100);
      } else {
        setIsListening(false);
      }

      stopVolumeMeter();
    };

    recognitionRef.current = recognition;
    return recognition;
  };

  // Stop speaking function
  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current?.cancel();
    }
    currentUtteranceRef.current = null;
  };

  // Start/stop continuous listening based on isEnabled
  useEffect(() => {
    if (isEnabled) {
      console.log("Enabling voice conversation...");
      setTranscript("");

      const recognition = initializeRecognition();
      if (!recognition) {
        return;
      }

      if (!isRecognitionActiveRef.current) {
        try {
          recognition.start();
          console.log("Started recognition");
        } catch (error) {
          console.error("Failed to start recognition:", error);
        }
      }
    } else {
      if (isRecognitionActiveRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          console.log("Stopped recognition");
        } catch (error) {
          console.error("Failed to stop recognition:", error);
        }
      }

      setTranscript("");
      setIsListening(false);

      stopSpeaking();
    }
  }, [isEnabled]);

  // Load voices on mount (required for some browsers)
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis?.getVoices() || [];
    };

    loadVoices();

    if (window?.speechSynthesis?.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Handle toggle
  const handleToggle = () => {
    if (onToggle) {
      onToggle(!isEnabled);
    }
  };

  const startVolumeMeter = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      source.connect(analyser);
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      audioContextRef.current = audioContext;

      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let values = 0;
        for (let i = 0; i < bufferLength; i++) {
          values += dataArray[i];
        }
        const average = values / bufferLength;
        setVisulizerValue(average);
        rafIdRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err) {
      console.error("Mic error:", err);
    }
  };

  const stopVolumeMeter = () => {
    cancelAnimationFrame(rafIdRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  return (
    <>
      {/* Live transcript display */}
      {isEnabled && isListening && transcript && (
        <div className="voice-conversation__transcript-popover">
          <div className="voice-conversation__transcript-header">
            <div className="voice-conversation__status">
              <span className="voice-conversation__status-indicator" />
              <span className="voice-conversation__status-text">Listening...</span>
            </div>
          </div>

          <p className="voice-conversation__transcript-text">{transcript}</p>

          <p className="voice-conversation__transcript-hint">Auto-sends when speech completes</p>
        </div>
      )}

      {/* Audio output toggle button */}
      <CustomTooltip
        content={
          !isSupported
            ? "Voice conversation not supported"
            : isEnabled
              ? "Voice conversation active (click to disable)"
              : "Enable voice conversation"
        }
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          disabled={!isSupported}
          className={`voice-conversation__button${isEnabled ? " voice-conversation__button--enabled" : ""}${
            !isSupported ? " voice-conversation__button--disabled" : ""
          }`}
        >
          {isEnabled ? (
            <Headphones className="voice-conversation__icon" />
          ) : (
            <HeadphoneOff className="voice-conversation__icon" />
          )}
        </Button>
      </CustomTooltip>
    </>
  );
}
