import { currentSocketUrl, getCurrentSocketEncodeKey, getOriginUrl, socket_values } from "@/lib/config";
import { cn, getChatUtils, notallowUserToAccess } from "@/lib/utils";
import React, { useContext, useEffect, useRef, useState } from "react";
import { ChatContext, MainContext } from "@/App";
import PasteInputComponent from "./ChatInput";
import ReadmapMobile from "../Roadmap/ReadmapMobile";
import FlowMobile from "../Flow/Workflow/FlowMobile";
import BusinessStages from "./BusinessStages";
import { useLocation, useParams } from "react-router-dom";
import { getWorkFlowdetails, uploadFileService } from "@/service/general.service";
import { ErrorToast } from "@/components/General/toastVarient";
import { FileText } from "lucide-react";
import "./BusinessChat.css";
import CustomTooltip from "./CustomTooltip";
import WalkThroughPopup from "./DisplayWalkThrough";

export default function BusinessChat({
  sidebarOpen,
  setSidebarOpen,
  guide,
  isMobile,
  reportData,
  currentPath = "",
  setCurrnetPath,
  handleShowVideo,
  handlePath,
  setRefreshData,
  selectedBusinessTemplate,
  setSelectedBusinessTemplate,
  businessTemplate,
  handleCurrentInnerPath,
}) {
  const param = useParams();
  const lastMsgRef = useRef(null);
  const descMessage = useRef(null);
  const chatIdRef = useRef(null);
  const wsRef = useRef(null);
  const location = useLocation();
  const { user_id, user, token } = useContext(MainContext);
  const [isFrame, setIsFrame] = useState(false);
  const iframeRef = useRef(null);
  const [type] = useState(
    location.pathname.includes("business/setup")
      ? "business-setup"
      : location.pathname.includes("business/overview")
        ? "business-overview"
        : location.pathname.includes("workflow/On-boarding") || location.pathname.includes("workflow/details") || location.pathname.includes("view/instance")
          ? "ai-workflow"
          : "general-support",
  );

  const [messages, setMessages] = React.useState([]);
  const [currentSocket, setCurrentSocket] = useState(null);
  const [resLoading, setResLoading] = React.useState(false);
  const [loading, setLoading] = useState(true);
  const [streamMessage, setStreamMessage] = useState("");
  const [isContinewChat, setIsContinueChat] = useState(false);
  const [openAccordion, setOpenAccordion] = useState("");
  const [attachmentUploading, setAttachmentUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (type == "business-setup" || type == "business-overview") {
      setOpenAccordion("item-1");
    }

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isFrame) {
      iframeRef?.current?.addEventListener("load", (e) => {
        const iframe = iframeRef.current;
        const currentLink = iframe?.contentWindow?.location.href;
        handleCurrentInnerPath(currentLink);
      });
    }
  }, [isFrame]);

  function formatTaskText(rawText) {
    const formatted = rawText
      .replace(/\*\*\s*([^\*]+?)\s*\*\*:\s*([^*]+?)(?=\s*\*)/g, "\n- $1: $2")
      .replace(/\*\*\s*([^\*]+?)\s*\*\*:\s*([^*]+?)(?=\. Do you|$)/g, "\n- $1: $2")
      .replace(/\*\*/g, "")
      .replace(/\*/g, '<span style="font-size: 25px; color: #49b8bf;"><b>&#8226;</b></span>')
      .replace(/\n/g, "<br>")
      .trim();
    return formatted;
  }

  const { visulizerValue, recognitionRef, synthRef, currentUtteranceRef, isEnabledRef, isRecognitionActiveRef, voiceConversationEnabled } =
    useContext(ChatContext);

  useEffect(() => {
    if (messages.length > 0 && lastMsgRef.current) {
      lastMsgRef?.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  const handleBusinessOverview = () => {
    const params = new URLSearchParams(window.location.search);
    params.set("token", token);
    params.set("reactframe", true);
    window.location.href = `${getOriginUrl()}/business/overview?${params.toString()}`;
  };

  useEffect(() => {
    if (isMobile) {
      if (currentPath) {
        setIsFrame(true);
      } else {
        setIsFrame(false);
      }
    } else {
      setIsFrame(false);
    }
  }, [currentPath, isMobile]);

  useEffect(() => {
    if (messages.length == 0 || guide.open) {
      descMessage?.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [guide.open, messages]);

  useEffect(() => {
    if (!user_id || !currentSocket) return;

    setLoading(true);
    runSocketIssue();
  }, [user_id, currentSocket]);

  useEffect(() => {
    if (type === "business-overview") {
      setCurrentSocket(socket_values.find((socket) => socket.value === "business-overview"));
    } else if (type === "business-setup") {
      setCurrentSocket(socket_values.find((socket) => socket.value === "business-setup"));
    } else if (type === "ai-workflow") {
      setCurrentSocket(socket_values.find((socket) => socket.value === "ai-workflow"));
    } else if (!notallowUserToAccess(user, [6])) {
      setCurrentSocket(socket_values.find((socket) => socket.value === "general-support"));
    }
  }, [type]);

  const getGeneratedID = (userid, type, chatvar) => {
    const prefix = type ? `${type}_` : "";
    const hash = `${prefix}${userid}`;
    return chatvar || hash;
  };

  const runSocketIssue = async () => {
    let new_socket_url = "";

    let chatvar = param?.id || null;
    if (location.pathname.includes("workflow/details") || location.pathname.includes("view/instance")) {
      const workflowDetails = await getWorkFlowdetails(token, {
        ...(location.pathname.includes("workflow/details") ? { workflow_id: param?.id } : {}),
        ...(location.pathname.includes("view/instance") ? { instance_id: param?.id } : {}),
      });
      chatvar = `${workflowDetails?.data?.workflow_details?.uuid}`;
    }

    let chat_id = getGeneratedID(user_id, currentSocket.prefix, chatvar);
    const { token: sokcetToken, signature } = await getChatUtils(user_id, getCurrentSocketEncodeKey());

    new_socket_url = `${currentSocketUrl()}/${currentSocket.value}/${chat_id}?token=${sokcetToken}&signature=${signature}`;

    chatIdRef.current = chat_id;
    if (!new_socket_url) return;

    const ws = new WebSocket(new_socket_url);

    ws.onopen = () => {
      setLoading(false);
      setResLoading(true);
    };

    ws.onmessage = (event) => {
      const message_data = JSON.parse(event.data);
      handleSaveMessage(message_data);
    };

    ws.onerror = (error) => console.error("WebSocket error:", error);
    ws.onclose = () => {
      console.log("WebSocket closed");
      setLoading(false);
    };
    wsRef.current = ws;

    return () => {
      ws.close();
    };
  };

  const handleMessagesAnd = async (crMessage, extraPayload = {}) => {
    const { attachment: payloadAttachments, ...restPayload } = extraPayload;
    const selectedFiles = payloadAttachments.map((att) => att.file);
    let preparedMessage = crMessage;
    let response = [];
    if (selectedFiles.length) {
      setAttachmentUploading(true);
      const formData = new FormData();
      for (const file of selectedFiles) {
        formData.append("files[]", file);
      }
      response = await uploadFileService(token, formData);
      preparedMessage = `${preparedMessage} \n\n` + composeAttachmentMessage(response);
      setAttachmentUploading(false);
    }

    if (!preparedMessage && !selectedFiles.length) return;

    const socketMessage = {
      message: preparedMessage,
      ...(response.length ? { attachments: response } : {}),
      ...restPayload,
    };
    const details = {
      text: preparedMessage,
      message_type: "human",
      ...(response.length ? { attachments: response } : {}),
    };

    if (!wsRef.current) {
      ErrorToast("Connection is not ready yet. Please wait a moment and try again.");
      return;
    }

    try {
      wsRef.current.send(JSON.stringify(socketMessage));
      setMessages((prev) => [...prev, details]);
      setResLoading(true);
    } catch (error) {
      console.error("Unable to send message:", error);
      ErrorToast("Failed to send message. Please try again.");
    }
  };

  const handleSaveMessage = (message) => {
    if (message.message === "Chat History") {
      const previousMessages = message?.data?.messages
        ?.map((message) => ({
          text: message.text,
          message_type: message.message_type,
          attachments: message.attached_files || [],
        }))
        .slice(-10);
      setMessages(previousMessages);
    } else {
      if (voiceConversationEnabled) {
        speakText(message.bot_message);
      }
      if (message.page_refresh) {
        setRefreshData(true);
      }
      addMessageStream(message.bot_message, message.attachments || []);
    }
    setResLoading(false);
  };

  const addMessageStream = (fullMessage, attachments = []) => {
    const words = fullMessage.split(" ");
    for (let index = 0; index < words.length; index++) {
      setTimeout(() => {
        if (index === words.length - 2) {
          setStreamMessage("");
          setMessages((prev) => [...prev, { text: fullMessage, message_type: "ai", ...(attachments.length ? { attachments } : {}) }]);
          lastMsgRef?.current?.scrollIntoView({ behavior: "smooth" });
        } else {
          setStreamMessage((currentText) => currentText + (index === 0 ? "" : " ") + words[index]);
        }
      }, index * 50);
      if (index === words.length - 2) break;
    }
  };

  const formatFileSize = (sizeInBytes) => {
    if (!sizeInBytes) return "";
    const units = ["B", "KB", "MB", "GB"];
    let size = sizeInBytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
  };

  const composeAttachmentMessage = (attachments = []) => {
    const lines = attachments.map((attachment, index) => `${index + 1}. ${attachment.name || `Attachment ${index + 1}`} - ${attachment.url}`);
    return `Files attached.\n\nAttachments:\n${lines.join("\n")}`;
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current?.cancel();
    }
    currentUtteranceRef.current = null;
  };

  const speakText = (text) => {
    if (!window.speechSynthesis || !text) return;

    stopSpeaking();

    if (isRecognitionActiveRef.current && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log("Paused recognition for speech");
      } catch (error) {
        console.error("Error pausing recognition:", error);
      }
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis?.getVoices();
    const preferredVoice = voices.find((voice) => voice.name.includes("Google") || voice.name.includes("Microsoft") || voice.name.includes("Samantha"));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      console.log("Speech started");
    };

    utterance.onend = () => {
      console.log("Speech ended");
      currentUtteranceRef.current = null;

      if (isEnabledRef.current) {
        console.log("Resuming recognition after speech");
        setTimeout(() => {
          if (isEnabledRef.current && !isRecognitionActiveRef.current) {
            try {
              recognitionRef.current?.start();
              console.log("Recognition resumed successfully");
            } catch (error) {
              console.error("Failed to resume recognition:", error);
            }
          }
        }, 500);
      }
    };

    utterance.onerror = (event) => {
      if (event.error !== "interrupted") {
        console.error("Speech synthesis error:", event.error);
      }
      currentUtteranceRef.current = null;
    };

    currentUtteranceRef.current = utterance;
    synthRef.current?.speak(utterance);
  };

  const shouldHideAside = () => {
    const allowedPaths = [
      '/business/setup',
      '/business/overview',
      '/ai-dashboard',
      '/workflow/On-boarding',
    ];

    if (currentPath) {
      const isAllowedIframe = allowedPaths.some(path => currentPath.includes(path));
      return !isAllowedIframe;
    }

    const currentRoute = location.pathname;
    const isAllowedRoute = allowedPaths.some(path => currentRoute.includes(path));    
    return !isAllowedRoute;
  };

  return (
    <>
      {guide.open && <span className="fixed hidden lg:block bottom-0 right-0 min-w-screen h-full bg-black/10 backdrop-blur-sm pointer-events-none z-15"></span>}
      {isFrame && currentPath && isMobile ? (
        <div className="w-full bg-white h-full">
          <iframe
            ref={iframeRef}
            src={currentPath}
            title="W3Schools Free Online Web Tutorials"
            className="w-full h-[calc(100vh_-_48px)] md:h-[calc(100vh_-_64px)]"
          ></iframe>
        </div>
      ) : (<>
      {!shouldHideAside() && (
        <aside className={cn("clb-aside iframe-aside", sidebarOpen ? "clb-aside-sdo" : "clb-aside-sdc")}>
          {(!openAccordion || !isMobile) && (
            <>
              <button type="button" className="clb-sidebar-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <svg
                  width="13"
                  height="20"
                  viewBox="0 0 13 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`block ${sidebarOpen ? "rotate-180" : ""}`}
                >
                  <path d="M2.025 20L0.25 18.225L8.475 10L0.25 1.775L2.025 0L12.025 10L2.025 20Z" fill="white" />
                </svg>
              </button>

              <div className="">
                {isMobile && (
                  <h1 className="head_title_page">
                    {type === "business-setup"
                      ? "Business Setup"
                      : type === "business-overview"
                        ? "Business Overview"
                        : type === "ai-workflow"
                          ? "AI Agent Topic Research"
                          : "View Your Dashboard"}
                  </h1>
                )}

                <div onClick={() => handleShowVideo(true)} className={cn("clb-handleVideo-block", sidebarOpen ? "sidebar-open" : "sidebar-closed")}>
                  <span className={"head_truncate"}>Need help? Watch a quick walkthrough of this page</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </div>

              <div className={cn("clb-message-main", sidebarOpen ? "clb-message-main-sdo" : "clb-message-main-sdc")}>
                <ul className="clb-message-list">
                  {((!loading && messages.length === 0 && !isContinewChat && !resLoading) || guide.open) && (
                    <li className="flex justify-center mb-auto" ref={descMessage}>
                      <BusinessStages
                        defaultStage={type === "business-setup" ? 0 : type === "business-overview" ? 1 : type === "ai-workflow" ? 3 : 2}
                        onStageTwo={handleBusinessOverview}
                        user={user}
                        onStageThree={() => {
                          window.location.href = `${getOriginUrl()}/ai-dashboard`;
                        }}
                        onStageOne={handlePath && (() => handlePath(""))}
                        onWatchGuide={() => handleShowVideo(true)}
                        onChatNow={() => {
                          handleShowVideo(false);
                          setIsContinueChat(true);
                        }}
                        isMobile={isMobile}
                      />
                    </li>
                  )}

                  {!loading && messages.length === 0 && !guide.open && !resLoading && isContinewChat && (
                    <li className={cn("clb-message-wrap", "clb-messageAi-wrap")}>
                      <img
                        src={"/images/defaultroo.webp"}
                        className="clb-chat-profile"
                        alt="ai profile"
                        onError={(e) => {
                          const target = e.target;
                          if (target instanceof HTMLImageElement) {
                            target.src = "/images/user.jpg";
                            target.onerror = null;
                          }
                        }}
                      />
                      <div className={cn("clb-message-box", "clb-messageAi-box")}>
                        {type === "business-setup" && (
                          <>
                            <p>I'm Colabi-roo, your guide.</p>
                            <p>
                              We'll build your Business Brain step-by-step. Let's start with your team -- are you running things solo at the moment, or do you
                              have people working with you?
                            </p>
                          </>
                        )}

                        {type === "business-overview" && (
                          <>
                            <p>Welcome to your Business Overview.</p>
                            <p>I'm Colabi-roo, your AI COO, here to help you make sense of how your business fits together.</p>
                            <p>
                              I'll take what you set up in Stage 1 -- your team, goals, plans, tools, and processes -- and turn it into a clear structure you
                              can run every day. Think of this as us laying out your business on the canvas so everything connects naturally.
                            </p>
                            <p>
                              We'll uncover your business areas, bring in your documented processes, and shape them into simple workflow suggestions you can
                              preview or build.
                            </p>
                            <p>
                              Whenever you're ready, just tell me how you'd like to begin. I can walk you through it step-by-step, or you can jump straight in.
                            </p>
                          </>
                        )}

                        {type !== "business-setup" && type !== "business-overview" && type !== "ai-workflow" && (
                          <>
                            <p>Welcome — I’m Colabi-roo, your Digital Manager, here to keep your day organised and your business running smoothly.</p>
                            <p>From here, I can:</p>
                            <ul>
                              <li>Show you today’s tasks and deadlines</li>
                              <li>Update you on workflow progress</li>
                              <li>Check your customer activity</li>
                              <li>Review upcoming events in your calendar</li>
                              <li>Check your customer activity</li>
                            </ul>
                            <p>If this is your first time here, I can show you live data or help set up anything missing.</p>
                          </>
                        )}
                      </div>
                    </li>
                  )}

                  {voiceConversationEnabled && (
                    <li className="visualizer-container">
                      <div className="visualizer-circle" style={{ transform: `scale(${visulizerValue + 50}%)` }}></div>
                    </li>
                  )}

                  {messages.length > 0 &&
                    !guide.open &&
                    messages.map((message, index) => {
                      const attachments = Array.isArray(message.attachments) ? message.attachments : [];
                      let text = message.text || "";
                      const SEARCH = "\n\nFiles attached";
                      const SEARCH_DOT = "\n\nFiles attached.";
                      let idx = text.indexOf(SEARCH);
                      if (idx === -1) idx = text.indexOf(SEARCH_DOT);
                      let truncated = idx !== -1 ? text.slice(0, idx).trimEnd() : text;
                      truncated = formatTaskText(truncated);

                      return (
                        <li
                          key={index}
                          ref={index === messages.length - 1 ? lastMsgRef : null}
                          className={cn("clb-message-wrap", message.message_type == "ai" ? "clb-messageAi-wrap" : "clb-messageUser-wrap")}
                        >
                          {message.message_type == "ai" && (
                            <img
                              src={"/images/defaultroo.webp"}
                              className="clb-chat-profile"
                              alt="ai profile"
                              onError={(e) => {
                                const target = e.target;
                                if (target instanceof HTMLImageElement) {
                                  target.src = "/images/user.jpg";
                                  target.onerror = null;
                                }
                              }}
                            />
                          )}
                          <div className={cn("clb-message-box", message.message_type == "ai" ? "clb-messageAi-box" : "clb-messageUser-box")}>
                            <div dangerouslySetInnerHTML={{ __html: truncated }}></div>
                            {attachments.length > 0 && (
                              <ul className="clb-chat-attachments">
                                {attachments.map((attachment, attachmentIndex) => (
                                  <li key={`${attachment.url}-${attachmentIndex}`} className="clb-chat-attachmentItem">
                                    <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="clb-chat-attachmentLink">
                                      <span className="clb-chat-attachmentAvatar">
                                        <FileText className="clb-chat-attachmentIcon" />
                                      </span>
                                      <span className="clb-chat-attachmentText">
                                        <span className="clb-chat-attachmentName">{attachment.name || `Attachment ${attachmentIndex + 1}`}</span>
                                        <span className="clb-chat-attachmentMeta">
                                          {[attachment.extension?.toUpperCase(), formatFileSize(attachment.size)].filter(Boolean).join(" | ")}
                                        </span>
                                      </span>
                                      <span className="clb-chat-attachmentAction">Open</span>
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </li>
                      );
                    })}

                  {attachmentUploading && (
                    <>
                      <li className="loading_chat_preview_right">
                        <img
                          src={user?.avatar ? `${getOriginUrl()}/${user?.avatar}` : "/images/user-profile.png"}
                          className="clb-chat-profile"
                          alt="user profile"
                        />
                        <div className={cn("clb-loader clb-centered")}>
                          <div className="loader-dot"></div>
                          <div className="loader-dot"></div>
                          <div className="loader-dot"></div>
                        </div>
                      </li>
                    </>
                  )}

                  {streamMessage && (
                    <li className={cn("clb-message-wrap clb-messageAi-wra")}>
                      <img
                        src={"/images/defaultroo.webp"}
                        className="clb-chat-profile"
                        alt="ai profile"
                        onError={(e) => {
                          const target = e.target;
                          if (target instanceof HTMLImageElement) {
                            target.src = "/images/user.jpg";
                            target.onerror = null;
                          }
                        }}
                      />
                      <div className="clb-message-box clb-messageAi-box">{streamMessage}</div>
                    </li>
                  )}

                  {(loading || resLoading) && (
                    <li className="loading_chat_preview">
                      <img src={"/images/defaultroo.webp"} className="clb-chat-profile" alt="ai profile" />
                      <div className={cn("clb-loader", resLoading ? "clb-loading" : "clb-centered")}>
                        <div className="loader-dot"></div>
                        <div className="loader-dot"></div>
                        <div className="loader-dot"></div>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
              {type === "business-overview" && !isMobile && (
                <div className={cn("chatFlow-btns", sidebarOpen || isMobile ? "sidebar-open" : "sidebar-closed")}>
                  <ul className="chatFlow-btn-list">
                    <li className={cn("chatFlow-btn-item", selectedBusinessTemplate === "0" && "active")}>
                      <CustomTooltip content="Manage your active operations and real-time team workflows.">
                        <button className="py-2 px-1 sm:px-3 sm:py-3" onClick={() => setSelectedBusinessTemplate("0")}>
                          Your Business
                        </button>
                      </CustomTooltip>
                    </li>
                    <li className={cn("chatFlow-btn-item", selectedBusinessTemplate === "suggested" && "active")}>
                      <CustomTooltip content="Explore AI growth suggestions based on your Stage 1 Blueprint.">
                        <button className="py-2 px-1 sm:px-3 sm:py-3" onClick={() => setSelectedBusinessTemplate("suggested")}>
                          AI Business Structure
                        </button>
                      </CustomTooltip>
                    </li>
                    {/* <li className={cn("chatFlow-btn-item", selectedBusinessTemplate === "unified" && "active")}>
                      <CustomTooltip content="Your master roadmap. Bridge live operations with AI strategic planning.">
                        <button className="py-2 px-1 sm:px-3 sm:py-3" onClick={() => setSelectedBusinessTemplate("unified")}>
                          Unified View
                        </button>
                      </CustomTooltip>
                    </li> */}
                    {/* <li className={cn("chatFlow-btn-item relative", selectedBusinessTemplate > 0 && Number(selectedBusinessTemplate) != "isNaN" && "active")}>
                      <button onClick={() => setIsOpen(!isOpen)} className="gap-2 py-1 px-2 sm:px-3 sm:py-3">
                        Business Templates
                      </button>
                      {isOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg z-50">
                          {businessTemplate.map((temp) => (
                            <button
                              key={temp.id}
                              onClick={() => {
                                setSelectedBusinessTemplate(temp.id);
                                setIsOpen(false);
                              }}
                              className={cn(
                                "w-full text-left px-4 py-2 text-zinc-700 hover:bg-[#62AAB4] hover:text-white first:rounded-t-lg last:rounded-b-lg transition-colors",
                                selectedBusinessTemplate === temp.id ? "bg-[#62AAB4] border-[#62AAB4] text-white" : "text-zinc-700"
                              )}
                            >
                              {temp.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </li> */}
                  </ul>
                </div>
              )}
            </>
          )}

          <div className={cn("clb-aiChat-block", sidebarOpen || isMobile ? "sidebar-open" : "sidebar-closed", openAccordion && "accordian-open")}>
            <div className={cn("flex flex-col w-full sm:bottom-7 sm:static grow")}>
              <div className="w-full bg-white flex flex-col gap-2.5 grow">
                {(!openAccordion || !isMobile) && <PasteInputComponent handleSubmitText={handleMessagesAnd} sidebarOpen={sidebarOpen} isMobile={isMobile} handleShowVideo={handleShowVideo}/>}
                {isMobile && type === "business-setup" && (
                  <ReadmapMobile setCurrnetPath={setCurrnetPath} setOpenAccordion={setOpenAccordion} openAccordion={openAccordion} />
                )}
                {isMobile && type === "business-overview" && (
                  <FlowMobile
                    reportData={reportData}
                    currentPath={currentPath}
                    setCurrnetPath={setCurrnetPath}
                    sidebarOpen={sidebarOpen}
                    setOpenAccordion={setOpenAccordion}
                    openAccordion={openAccordion}
                    setSidebarOpen={(val) => {
                      setSidebarOpen(val);
                      sessionStorage.setItem("sidebar-state", val == true ? 1 : 0);
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {guide.open && (
            <>
              {location.pathname.includes("ai-dashboard") && [7, 6].includes(user?.role_id) ? (
                <>
                  <div className="clb-video-block clb-walkthrough-video-block">
                    <button className={"clb-video-btn"} onClick={() => handleShowVideo(false)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <iframe
                      src={user?.role_id == 7 ? guide.member_vurl : guide.non_member_vurl}
                      frameborder="0"
                      width={"100%"}
                      className="overflow-hidden h-56 sm:h-60 md:h-56 lg:h-[315px] xl:h-[460px] 2xl:h-[540px] rounded-2xl lg:min-w-lg xl:min-w-3xl 2xl:min-w-4xl w-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </>
              ) : (
                <div className="clb-video-block">
                  <WalkThroughPopup current_stage={guide} onClose={() => handleShowVideo(false)} current_page={type} />
                </div>
              )}
            </>
          )}
        </aside>
        )}
      </>
      )}
    </>
  );
}
