import React, { useContext, useEffect, useRef, useState } from "react";
import { X, FileText, Copy, Check, SendIcon, Paperclip, Loader2 } from "lucide-react";
import VoiceInput from "./VoiceInput";
import VoiceConversation from "./VoiceConversation";
import { ChatContext } from "@/App";
import { ErrorToast } from "../General/toastVarient";
import "./ChatInput.css";

export default function PasteInputComponent({ handleSubmitText, sidebarOpen, isMobile = false }) {
  const [inputValue, setInputValue] = useState("");
  const [pastedContents, setPastedContents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModalIndex, setActiveModalIndex] = useState(0);
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [copied, setCopied] = useState(false);
  const { voiceConversationEnabled, setVoiceConversationEnabled } = useContext(ChatContext);
  const [isSupported, setIsSupported] = useState(true);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const MIN_LINES = 1;
  const MAX_LINES = 10;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || typeof window === "undefined") {
      return;
    }

    const computedStyle = window.getComputedStyle(textarea);
    const lineHeight = parseFloat(computedStyle.lineHeight) || 20;
    const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
    const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
    const minHeight = lineHeight * MIN_LINES + paddingTop + paddingBottom;
    const maxHeight = lineHeight * MAX_LINES + paddingTop + paddingBottom;
    textarea.style.height = "auto";

    const scrollHeight = sidebarOpen || isMobile ? textarea.scrollHeight : 56;
    const nextHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);

    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
  }, [inputValue]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition || !window.speechSynthesis) {
      setIsSupported(false);
      console.warn("Speech recognition or synthesis is not supported in this browser");
    }
  }, []);

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    if (pastedText.length > 200) {
      setPastedContents((prev) => [...prev, pastedText]);
    } else {
      setInputValue((prev) => prev + pastedText);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        return;
      } else {
        e.preventDefault();
        handleSubmit();
      }
    }
  };

  const handleSubmit = () => {
    let combinedContent = "";
    const allPastedContent = pastedContents.map((content) => content).join("\n\n");

    if (inputValue && pastedContents.length > 0) {
      combinedContent = `${inputValue}\n\n${allPastedContent}`;
    } else {
      combinedContent = inputValue || allPastedContent;
    }

    const preparedMessage = combinedContent.trim();
    const hasAttachments = pendingAttachments?.length > 0;

    if (!preparedMessage && !hasAttachments) {
      return;
    }

    handleSubmitText(inputValue, { attachment: pendingAttachments });
    setInputValue("");
    setPendingAttachments([]);
    setPastedContents([]);
  };

  const handleVoiceTranscript = (transcript) => {
    setInputValue((prev) => {
      return prev ? `${prev} ${transcript}` : transcript;
    });
  };

  // Handle voice conversation transcript (auto-send)
  const handleVoiceConversationTranscript = (transcript) => {
    if (transcript.trim()) {
      handleSubmitText(transcript, { attachment: pendingAttachments });
      setPendingAttachments([]);
    }
  };

  const triggerAttachmentPicker = () => {
    if (voiceConversationEnabled) return;
    fileInputRef.current?.click();
  };

  const handleAttachmentChange = (event) => {
    const files = event.target.files;
    if (files?.length) {
      handleAttachmentUpload(files);
    }
    event.target.value = "";
  };

  const normalizeAttachmentPayloadBefore = (apiResponse) => {
    if (!apiResponse) {
      return [];
    }

    return apiResponse.map((payload) => {
      const safeName = payload?.name || payload?.original_name || payload?.file_name || "attachment";
      const file = payload;
      const mime_type = payload?.mime_type || "";
      const size = Number(payload?.size || 0);
      const extension = payload?.extension || (safeName.includes(".") ? safeName.split(".").pop() : "");

      return { name: safeName, file, mime_type, size, extension };
    });
  };

  const handleAttachmentUpload = async (files = []) => {
    const selectedFiles = Array.from(files || []);
    if (!selectedFiles.length) return;

    try {
      const normalized = normalizeAttachmentPayloadBefore(selectedFiles);

      if (!normalized.length) {
        throw new Error("Unable to attach the selected files. Please try again.");
      }

      setPendingAttachments((prev) => [...prev, ...normalized]);
    } catch (error) {
      console.error("Attachment upload failed:", error);
      ErrorToast(error?.message || "Unable to upload files right now.");
    }
  };

  const handleRemovePendingAttachment = (index) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const hasPendingAttachments = pendingAttachments && pendingAttachments.length > 0;
  const disableSendButton = (inputValue.trim() === "" && pastedContents.length === 0 && !hasPendingAttachments) || voiceConversationEnabled;

  const truncateText = (text, maxLength = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const openModal = (index = 0) => {
    setActiveModalIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const copyToClipboard = async () => {
    try {
      const allPastedContent = pastedContents.map((content) => content).join("\n\n");
      await navigator.clipboard.writeText(allPastedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const clearAllContent = () => {
    setInputValue("");
    setPastedContents([]);
    setIsModalOpen(false);
  };

  const removePastedContent = (indexToRemove) => {
    setPastedContents((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const getTotalCharacters = () => {
    const pastedChars = pastedContents.reduce((sum, content) => sum + content.length, 0);
    const separatorChars = pastedContents.length > 1 ? (pastedContents.length - 1) * 4 : 0;
    return inputValue.length + pastedChars + separatorChars + (inputValue && pastedContents.length > 0 ? 4 : 0);
  };

  return (
    <>
      {pastedContents.length > 0 && (
        <section className="clb-snippet-section copyBox-custom-scroll">
          <header className="clb-snippet-header">
            <div className="clb-snippet-header-text">
              <p className="clb-snippet-title">Captured snippets</p>
              <p className="clb-snippet-subtitle">Click a card to review and edit before sending</p>
            </div>
            <span className="clb-snippet-count">
              {pastedContents.length} item{pastedContents.length > 1 ? "s" : ""}
            </span>
          </header>

          <div className="clb-snippet-cards">
            {pastedContents.map((content, index) => (
              <button key={index} type="button" onClick={() => openModal(index)} className="clb-snippet-card">
                <span className="clb-snippet-cardTitle">
                  <span className="clb-snippet-cardIndex">#{index + 1} • Snippet</span>
                  <span className="clb-snippet-charCount">{content.length} chars</span>
                </span>

                <p className="clb-snippet-body">{truncateText(content, 80)}</p>

                <div className="clb-snippet-footer">
                  <span className="clb-snippet-footerPreview">
                    <FileText className="clb-snippet-footerIcon" />
                    Preview
                  </span>
                  <span className="clb-snippet-view">View ↗</span>
                </div>

                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    removePastedContent(index);
                  }}
                  className="clb-snippet-remove"
                  aria-label="Remove snippet"
                >
                  <X className="clb-snippet-removeIcon" />
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
      <div className="clb-messageInput-block">
        <div className="clb-messageInput-wrap relative">
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleAttachmentChange} />
          {hasPendingAttachments && (
            <div className="clb-attachments-list">
              {pendingAttachments.map((attachment, index) => (
                <div key={`${attachment.url}-${index}`} className="clb-attachment-item">
                  <div className="clb-attachment-info">
                    <span className="clb-attachment-icon">
                      <FileText className="clb-attachment-iconSvg" />
                    </span>
                    <div className="clb-attachment-details">
                      <span className="clb-attachment-name">{attachment.name || `Attachment ${index + 1}`}</span>
                      <span className="clb-attachment-meta">
                        {[attachment.extension?.toUpperCase(), attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : null]
                          .filter(Boolean)
                          .join(" | ")}
                      </span>
                    </div>
                  </div>
                  <button type="button" className="clb-attachment-remove" onClick={() => handleRemovePendingAttachment?.(index)} aria-label="Remove attachment">
                    <X className="clb-attachment-removeIcon" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <textarea
            id="paste-input"
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            placeholder={voiceConversationEnabled ? "Voice conversation is active..." : "Chat with your AI guide here..."}
            className="clb-message-input custom-scroll"
            disabled={voiceConversationEnabled} // Disable manual input when voice conversation is active
          />
          <div className="clb-message-btnGroup">
            <button type="button" onClick={triggerAttachmentPicker} disabled={voiceConversationEnabled} className="clb-message-btn">
              <Paperclip className="size-4" />
            </button>
            {!voiceConversationEnabled && isSupported && <VoiceInput onTranscriptComplete={handleVoiceTranscript} />}

            {isSupported && (
              <VoiceConversation
                onTranscriptComplete={handleVoiceConversationTranscript}
                isEnabled={voiceConversationEnabled}
                onToggle={setVoiceConversationEnabled}
              />
            )}

            <button onClick={handleSubmit} disabled={disableSendButton} className="clb-message-btn">
              <SendIcon className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto pl-4">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={closeModal}></div>

            <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="clb-ctnView-head">
                <div className="clb-ctnView-head-inner">
                  <FileText className="size-5 text-gray-500" />
                  <h3 className="text-md font-medium text-gray-900">Content View ({getTotalCharacters()})</h3>
                </div>
                <div className="flex items-center space-x-2">
                  {pastedContents.length > 1 && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setActiveModalIndex(Math.max(0, activeModalIndex - 1))}
                        disabled={activeModalIndex === 0}
                        className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-md transition-colors duration-200"
                      >
                        ←
                      </button>
                      <button
                        onClick={() => setActiveModalIndex(Math.min(pastedContents.length - 1, activeModalIndex + 1))}
                        disabled={activeModalIndex === pastedContents.length - 1}
                        className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-md transition-colors duration-200"
                      >
                        →
                      </button>
                    </div>
                  )}
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors duration-200"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                  <button onClick={closeModal} className="clb-close-btn">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="clb-ctnView-body">
                <div className="bg-gray-50 rounded-lg space-y-4">
                  {pastedContents.length > 0 && (
                    <div>
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed bg-white p-3 rounded border">
                        {pastedContents[activeModalIndex]}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              <div className="clb-ctnView-footer">
                <div className="flex items-center space-x-2">
                  <button onClick={clearAllContent} className="clb-clear-btn">
                    Clear All Content
                  </button>
                </div>
                <button onClick={closeModal} className="clb-secondary-btn">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
