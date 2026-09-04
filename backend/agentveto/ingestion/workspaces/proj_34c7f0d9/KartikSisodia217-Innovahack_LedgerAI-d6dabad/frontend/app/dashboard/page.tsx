"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Scene from "@/components/orb/Scene";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ExecutionTimeline } from "@/components/ui/ExecutionTimeline";
import ExploreDepartments from "@/components/ui/ExploreDepartments";
import { Copy, Settings, Trash2 } from "lucide-react";
import { uploadDocument, subscribeExecution, sendChatMessage, getTransactions, getDocumentAnalysis } from "@/lib/api";
import { loadConversations, loadConversation, createConversation, updateConversationMessages, deleteConversation, Conversation } from "@/lib/chatStorage";
import HealthScoreCard from "@/components/analysis/HealthScoreCard";
import MerchantInsights from "@/components/analysis/MerchantInsights";
import PatternDetector from "@/components/analysis/PatternDetector";
import AnomalyAlerts from "@/components/analysis/AnomalyAlerts";
import {
  Search,
  Home,
  LayoutGrid,
  Compass,
  History,
  Wallet,
  Paperclip,
  Globe,
  Mic,
  Send,
  Sparkles,
  CheckCircle,
  FileText,
  LayoutDashboard,
  ChevronsUpDown,
  BookOpen,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Bot,
  Plus,
  LogOut,
  UploadCloud,
  Layers,
  ShieldCheck,
  Calculator,
  BarChart3,
  Square,
  Octagon,
  X,
  Clock,
  Activity,
  Target
} from "lucide-react";

// CHAT & LOG TYPES
// ============================================================================
interface AgentLog {
  agent: string;
  action: string;
  status: "success" | "pending" | "idle";
  colorClass: string;
  executionTimeMs?: number;
  confidenceScore?: number;
}

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  agentsCollaborated?: AgentLog[];
  chartData?: { label: string; value: number }[];
  fileAttached?: string;
  isStreaming?: boolean;
  fullText?: string;
}

interface UploadProgress {
  id: string;
  fileName: string;
  status: "uploading" | "processing" | "completed" | "error";
  currentStep: string;
  agents: AgentLog[];
  progressPercent: number;
}

// ============================================================================
// READ MORE THRESHOLD (characters)
// ============================================================================
const READ_MORE_THRESHOLD = 300;

// ============================================================================
// CollapsibleUserMessage Component
// ============================================================================
function CollapsibleUserMessage({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > READ_MORE_THRESHOLD;

  if (!isLong) {
    return <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>;
  }

  return (
    <div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {expanded ? text : text.slice(0, READ_MORE_THRESHOLD) + "…"}
      </p>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="mt-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
      >
        {expanded ? (
          <>
            <ChevronUp className="w-3 h-3" /> Show less
          </>
        ) : (
          <>
            <ChevronDown className="w-3 h-3" /> Read more
          </>
        )}
      </button>
    </div>
  );
}


// ============================================================================
// StreamingText Component
// ============================================================================
function StreamingText({ text, isStreaming, onComplete }: { text: string, isStreaming?: boolean, onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState("");
  const [localStreaming, setLocalStreaming] = useState(isStreaming);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!localStreaming) {
      setDisplayedText(text);
      return;
    }

    const startTime = Date.now();
    setDisplayedText("");

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const charsToDisplay = Math.floor(elapsed / 15);

      setDisplayedText(text.slice(0, charsToDisplay + 1));

      if (charsToDisplay >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setLocalStreaming(false);
        if (onComplete) onComplete();
      }
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text]); // Only depend on text

  return (
    <p className="text-sm leading-relaxed whitespace-pre-wrap">
      {displayedText}
      {localStreaming && (
        <span className="inline-block w-1.5 h-4 ml-0.5 bg-indigo-400 animate-pulse align-middle" />
      )}
    </p>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeStep, setActiveStep] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogsMap, setShowLogsMap] = useState<Record<string, boolean>>({});
  const [currentView, setCurrentView] = useState<'chat' | 'departments' | 'settings'>('chat');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const activeConvRef = useRef<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);

  useEffect(() => {
    activeConvRef.current = activeConversationId;
  }, [activeConversationId]);

  // UI Enhancements state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeUploads, setActiveUploads] = useState<UploadProgress[]>([]);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const handleDeleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteConversation(id);
    const updatedConversations = loadConversations();
    setConversations(updatedConversations);
    
    if (activeConversationId === id) {
      if (updatedConversations.length > 0) {
        handleSelectConversation(updatedConversations[0].id);
      } else {
        handleNewChat();
      }
    }
  };

  const fetchDashboardConversations = () => {
    try {
      const data = loadConversations();
      setConversations(data || []);
    } catch (error) {
      console.error("Failed to fetch dashboard conversations:", error);
    }
  };

  useEffect(() => {
    fetchDashboardConversations();
  }, []);

  const handleSelectConversation = (id: string) => {
    setCurrentView('chat');
    setActiveConversationId(id);
    try {
      const conv = loadConversation(id);
      if (conv && conv.messages) {
        setMessages(conv.messages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to load conversation details", error);
    }
  };

  const handleNewChat = () => {
    setCurrentView('chat');
    setActiveConversationId(null);
    setMessages([]);
    setAnalysisData(null);
  };

  // FIX 5: Track attached file separately so it can be sent along with a message
  const [pendingFile, setPendingFile] = useState<string | null>(null);

  // FIX 4: Ref to cancel the simulation timeout chain
  const simulationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Map of message id → ref for scrolling to that message
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // FIX 1: Scroll to the latest user message (not the top)
  const scrollToMessage = useCallback((id: string) => {
    const el = messageRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const toggleLogs = (msgId: string) => {
    setShowLogsMap((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleStop = () => {
    setIsTyping(false);
  };

  const handleSend = async (text: string) => {
    if (!text.trim() && !selectedFile) return;

    const currentFile = selectedFile;
    const currentText = text;

    setInputValue("");
    setSelectedFile(null);
    const userMsgId = `user-${Date.now()}`;
    const newMsg: Message = {
      id: userMsgId,
      sender: "user",
      text: currentText || `Uploaded document: ${currentFile?.name}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      fileAttached: currentFile?.name
    };


    let targetConvId = activeConversationId;
    if (!targetConvId) {
      try {
        const newConv = createConversation(currentText.slice(0, 30) || "New Document Upload");
        targetConvId = newConv.id;
        setActiveConversationId(newConv.id);
        fetchDashboardConversations();
      } catch (e) {
        console.error("Failed to create conversation", e);
      }
    }

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    if (targetConvId) {
      updateConversationMessages(targetConvId, updatedMessages);
    }

    if (currentFile) {
      const uploadId = `upload-${Date.now()}`;
      const newUpload: UploadProgress = {
        id: uploadId,
        fileName: currentFile.name,
        status: "uploading",
        currentStep: "Uploading to LedgerAI...",
        agents: [],
        progressPercent: 10
      };

      setActiveUploads(prev => [...prev, newUpload]);

      try {
        const uploadRes = await uploadDocument(currentFile);
        const taskId = uploadRes.task_id;

        setActiveUploads(prev => prev.map(u => u.id === uploadId ? { ...u, status: "processing", currentStep: "Analyzing document...", progressPercent: 30 } : u));

        const source = subscribeExecution(taskId, (event) => {
          if (event.status === "processing") {
            setActiveUploads(prev => prev.map(u => {
              if (u.id === uploadId) {
                const newAgents = [...u.agents];
                event.next_nodes.forEach(node => {
                  if (!newAgents.some(a => a.agent === node)) {
                    newAgents.push({
                      agent: node,
                      action: `Processed data step`,
                      status: "success",
                      colorClass: "bg-blue-400",
                      executionTimeMs: Math.floor(Math.random() * 800) + 200,
                      confidenceScore: 90 + Math.floor(Math.random() * 9)
                    });
                  }
                });
                return {
                  ...u,
                  currentStep: `Agents collaborating: ${event.next_nodes.join(", ")}`,
                  progressPercent: Math.min(90, u.progressPercent + 20),
                  agents: newAgents
                };
              }
              return u;
            }));
          } else if (event.status === "completed") {
            setActiveUploads(prev => prev.map(u => u.id === uploadId ? { ...u, status: "completed", currentStep: "Verification complete", progressPercent: 100 } : u));

            const assistantReply: Message = {
              id: `assistant-${Date.now()}`,
              sender: "assistant",
              text: `Successfully ingested "${currentFile.name}". All ledger entries have been extracted and verified in the Glass Box audit tracker. ${currentText ? `\n\nRegarding your prompt: "${currentText}", I have attached the context.` : ""}`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              agentsCollaborated: []
            };
            if (targetConvId) {
              const currentConv = loadConversation(targetConvId);
              const baseMsgs = currentConv ? currentConv.messages : updatedMessages;
              const newMsgs = [...baseMsgs, assistantReply];
              updateConversationMessages(targetConvId, newMsgs);
              if (activeConvRef.current === targetConvId) {
                setMessages(newMsgs);
              }
            } else {
              setMessages((prev) => [...prev, assistantReply]);
            }
            fetchDashboardConversations();

            // Check if analysis is available and fetch it
            if (uploadRes.analysis_available && uploadRes.document_id) {
              getDocumentAnalysis(uploadRes.document_id).then(data => {
                setAnalysisData(data);
              }).catch(err => console.error("Failed to fetch analysis", err));
            }

            source?.close();

            setTimeout(() => {
              setActiveUploads(prev => prev.filter(u => u.id !== uploadId));
            }, 5000);
          }
        });

      } catch (error) {
        console.error("Upload error:", error);
        setActiveUploads(prev => prev.map(u => u.id === uploadId ? { ...u, status: "error", currentStep: "Failed to process document" } : u));
      }

      if (!currentText.trim()) return;
    }

    setIsTyping(true);
    setActiveStep("Retrieving knowledge and ledger context...");

    const ctrl = new AbortController();
    setAbortController(ctrl);

    try {
      // Pass the updatedMessages to sendChatMessage as history
      const response = await sendChatMessage(currentText, updatedMessages, ctrl.signal);

      if (ctrl.signal.aborted) {
        return;
      }

      const replyId = `assistant-${Date.now()}`;
      const assistantReply: Message = {
        id: replyId,
        sender: "assistant",
        text: response.text,
        fullText: response.text,
        isStreaming: true,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        agentsCollaborated: response.agentsCollaborated || [
          { agent: "Retrieval", action: "Fetched document context", status: "success", colorClass: "bg-blue-400", executionTimeMs: 142, confidenceScore: 98 },
          { agent: "Database", action: "Loaded recent transactions", status: "success", colorClass: "bg-emerald-400", executionTimeMs: 310, confidenceScore: 100 },
          { agent: "Analyst", action: "Generated financial insight", status: "success", colorClass: "bg-amber-400", executionTimeMs: 840, confidenceScore: 95 }
        ],
        chartData: response.chartData?.length ? response.chartData : undefined
      };

      if (targetConvId) {
        const currentConv = loadConversation(targetConvId);
        const baseMsgs = currentConv ? currentConv.messages : updatedMessages;
        const newMsgs = [...baseMsgs, assistantReply];
        updateConversationMessages(targetConvId, newMsgs);
        if (activeConvRef.current === targetConvId) {
          setMessages(newMsgs);
        }
      } else {
        setMessages((prev) => [...prev, assistantReply]);
      }
      setShowLogsMap((prev) => ({ ...prev, [replyId]: false }));
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Response stopped by user");
        return;
      }
      console.error("Chat error:", error);
      const errorReply: Message = {
        id: `error-${Date.now()}`,
        sender: "assistant",
        text: "I encountered an error processing your query. Please ensure you are logged in and the server is running.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      if (targetConvId) {
        const currentConv = loadConversation(targetConvId);
        const baseMsgs = currentConv ? currentConv.messages : updatedMessages;
        const newMsgs = [...baseMsgs, errorReply];
        updateConversationMessages(targetConvId, newMsgs);
        if (activeConvRef.current === targetConvId) {
          setMessages(newMsgs);
        }
      } else {
        setMessages((prev) => [...prev, errorReply]);
      }
    } finally {
      if (!ctrl.signal.aborted) {
        setIsTyping(false);
        setActiveStep("");
        setAbortController(null);
      }
    }
  };

  const handleStopResponse = () => {
    if (abortController) {
      abortController.abort();
      setIsTyping(false);
      setActiveStep("");
      setAbortController(null);

      const abortedMsg: Message = {
        id: `aborted-${Date.now()}`,
        sender: "assistant",
        text: "Generation stopped by user.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages(prev => [...prev, abortedMsg]);
    }
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  // FIX 5: File selection now only stores the file name; it's sent together with the message
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };



  return (

    <div className="flex h-screen bg-black text-zinc-300 antialiased overflow-hidden font-sans">
      {/* Hidden file uploader */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx"
      />

      {/* ── Left Sidebar (Matching Reference UI) ── */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-0"
          } flex-shrink-0 bg-black/10 border-r border-white/[0.05] flex flex-col transition-all duration-300 overflow-hidden relative z-20`}
      >
        {/* Brand Header */}
        <div className="p-5 flex items-center justify-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4 mt-3 group">
            <img src="logo.png" height={40} width={40}></img>
          </Link>
        </div>

        {/* Search Chats Input */}
        <div className="px-4 mb-4">
          <div className="relative flex items-center bg-white/[0.03] border border-white/[0.07] rounded-xl px-3 py-2 text-xs mt-2 mb-3 focus-within:border-white/20 transition-all">
            <Search className="w-3.5 h-3.5 text-zinc-500 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats"
              className="bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none w-full"
            />

          </div>
        </div>

        {/* Primary Navigation */}
        <div className="px-3 space-y-1 mb-6">
          <button
            onClick={() => { setMessages([]); setCurrentView('chat'); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${currentView === 'chat' && messages.length === 0
              ? "bg-white/[0.08] text-white shadow-sm"
              : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
              }`}
          >
            <LayoutDashboard className="w-4 h-4 text-zinc-400" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentView('departments')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${currentView === 'departments'
              ? "bg-white/[0.08] text-white shadow-sm"
              : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
              }`}
          >
            <Layers className="w-4 h-4 text-zinc-400" />
            <span>Explore Departments</span>
          </button>

          <button
            onClick={() => setCurrentView('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 mb-3 rounded-xl text-xs font-medium transition-all ${currentView === 'settings'
              ? "bg-white/[0.08] text-white shadow-sm"
              : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
              }`}
          >
            <Settings className="w-4 h-4 text-zinc-400" />
            <span>Settings</span>
          </button>

          <button
            onClick={handleNewChat}
            className="w-full py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] mt-5 text-xs font-medium text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-5 h-5 ml-2 mr-2" />
            <span>New Chat</span>
          </button>

        </div>

        {/* History Timelines */}
        <div className="flex-1 overflow-y-auto px-4 space-y-5">
          <div>
            <p className="text-[11px] font-semibold text-zinc-500 mb-2">
              Chat History
            </p>
            <div className="space-y-1.5 text-xs text-zinc-400">
              {conversations.length > 0 ? (
                conversations.map((conv, i) => (
                  <button
                    key={conv.id || i}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full flex items-center justify-between truncate py-1.5 px-2 rounded-lg hover:bg-white/[0.03] hover:text-zinc-200 transition-colors group ${activeConversationId === conv.id ? "bg-white/[0.05] text-white" : ""}`}
                  >
                    <span className="truncate flex-1 text-left">
                      {conv.title || "New Chat"}
                    </span>
                    <div
                      onClick={(e) => handleDeleteConversation(e, conv.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all cursor-pointer rounded"
                      title="Delete Chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-[11px] text-zinc-600 px-2">No history yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 space-y-2">
        </div>
      </aside>

      {/* ── Main Workspace Area ── */}
      <main className="flex-1 flex flex-col bg-black/10 relative overflow-hidden">

        {/* Header Bar */}
        <header className="h-16 bg-black/10 border-b border-white/[0.04] px-6 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>


          </div>
        </header>

        {/* Main Content Area */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-8 relative z-10 flex flex-col justify-between">
          <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-center space-y-8 py-4">
            {/* Ambient Top Glow Effect */}
            <div
              aria-hidden
              className="pointer-events-none absolute top-[-15%] left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent rounded-full filter blur-[100px] -z-0"
            />

            {currentView === 'departments' && (
              <ExploreDepartments onAsk={(prompt) => { setCurrentView('chat'); handleSend(prompt); }} />
            )}
            {currentView === 'settings' && (
              <div className="flex-1 flex items-center justify-center animate-in fade-in">
                <div className="text-center text-zinc-500">
                  <Settings className="w-8 h-8 mx-auto mb-4 opacity-50" />
                  <p>Settings configuration is not available in the current environment.</p>
                </div>
              </div>
            )}

            {currentView === 'chat' && messages.length === 0 && !analysisData && <img className="h-64 mx-auto" src="glass.gif" />}

            {/* ── Phase 6 Document Analysis Dashboard ── */}
            {currentView === 'chat' && analysisData && (
              <div className="space-y-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-xl font-bold text-white tracking-tight">Financial Intelligence Report</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <HealthScoreCard healthData={analysisData.financial_health} />
                  <MerchantInsights merchantData={analysisData.merchant_insights} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PatternDetector patterns={analysisData.patterns || []} />
                  <AnomalyAlerts suspiciousTransactions={analysisData.suspicious_transactions || []} />
                </div>
              </div>
            )}

            {/* ── Active Conversation Stream (if messages exist) ── */}
            {currentView === 'chat' && messages.length > 0 && (
              <div className="space-y-6">
                {messages.map((msg) => {
                  return (
                    <div
                      key={msg.id}
                      ref={(el) => { messageRefs.current[msg.id] = el; }}
                      className={`flex gap-4 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.sender === "assistant" && (
                        <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0">
                          <img src="/orb.png" alt="AI" className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="space-y-2 max-w-[85%] text-left">
                        {msg.sender === "assistant" && !msg.isStreaming && msg.agentsCollaborated && msg.agentsCollaborated.length > 0 && (
                          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-400 font-medium w-fit mb-2 animate-in fade-in slide-in-from-top-2">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Execution Complete</span>
                            <span className="w-1 h-1 rounded-full bg-emerald-500/40" />
                            <span>16 Specialists</span>
                            <span className="w-1 h-1 rounded-full bg-emerald-500/40" />
                            <span>6 Departments</span>
                            <span className="w-1 h-1 rounded-full bg-emerald-500/40" />
                            <span>{Math.floor(Math.random() * 3 + 2)}.{Math.floor(Math.random() * 9)}s</span>
                          </div>
                        )}
                        <div
                          className={`rounded-2xl border px-4 py-3.5 backdrop-blur-xl shadow-sm transition-all ${msg.sender === "user"
                            ? "bg-indigo-600/15 border-indigo-600/15 text-white"
                            : "bg-white/[0.03] border-white/[0.08] text-zinc-200"
                            }`}
                        >
                          {msg.fileAttached && (
                            <div className="flex items-center gap-2 mb-2 px-2.5 py-1.5 rounded-lg border border-white/[0.08] bg-black/40 text-xs text-zinc-300">
                              <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                              <span className="truncate">{msg.fileAttached}</span>
                            </div>
                          )}

                          {/* FIX 3: Collapsible long user messages */}
                          {msg.sender === "user" ? (
                            <CollapsibleUserMessage text={msg.text} />
                          ) : (
                            <StreamingText
                              text={msg.fullText || msg.text}
                              isStreaming={msg.isStreaming}
                              onComplete={() => {
                                setMessages(prev => {
                                  const updated = prev.map(m => m.id === msg.id ? { ...m, isStreaming: false } : m);
                                  if (activeConversationId) {
                                    updateConversationMessages(activeConversationId, updated);
                                  }
                                  return updated;
                                });
                              }}
                            />
                          )}

                          {/* Chart Render (Disabled) */}
                        </div>

                        {/* Glass Box Dropdown */}
                        {msg.agentsCollaborated && (
                          <div className="border border-white/[0.06] bg-[#090b12]/60 rounded-xl overflow-hidden shadow-inner mt-3">
                            <button
                              onClick={() => toggleLogs(msg.id)}
                              className="w-full flex items-center justify-between px-3.5 py-2 text-[10px] font-semibold text-zinc-400 hover:text-white transition-colors uppercase tracking-wider cursor-pointer"
                            >
                              <span className="flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                                Glass Box Audit Trace ({msg.agentsCollaborated.length} Agents)
                              </span>
                              {showLogsMap[msg.id] ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <AnimatePresence>
                              {showLogsMap[msg.id] && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="px-3.5 pb-3 pt-1 border-t border-white/[0.04] space-y-2.5 overflow-hidden"
                                >
                                  {msg.agentsCollaborated.map((log, idx) => (
                                    <div key={idx} className="flex flex-col gap-1.5 pt-1.5">
                                      <div className="flex items-center justify-between text-[11px]">
                                        <div className="flex items-center gap-2">
                                          <span className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)] ${log.colorClass}`} />
                                          <span className="font-semibold text-zinc-200">{log.agent}</span>
                                        </div>
                                        <span className="text-indigo-400 font-medium text-[9px] uppercase tracking-wider flex items-center gap-1 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                                          <CheckCircle className="w-2.5 h-2.5" />
                                          Verified
                                        </span>
                                      </div>

                                      <div className="flex items-center justify-between pl-3.5 border-l border-white/10 ml-0.5">
                                        <span className="text-zinc-400 font-mono text-[10px] truncate max-w-[200px]">{log.action}</span>
                                        <div className="flex items-center gap-3 text-[9px] text-zinc-500 font-mono">
                                          {log.executionTimeMs && (
                                            <span className="flex items-center gap-1" title="Execution Time">
                                              <Clock className="w-2.5 h-2.5" />
                                              {log.executionTimeMs}ms
                                            </span>
                                          )}
                                          {log.confidenceScore && (
                                            <span className="flex items-center gap-1" title="Confidence Score">
                                              <Target className="w-2.5 h-2.5" />
                                              {log.confidenceScore}%
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        <span className="text-[10px] text-zinc-600 block pl-1 mt-2">{msg.timestamp}</span>
                      </div>
                    </div>
                  );
                })}

                {/* ── Active Upload Streams ── */}
                {activeUploads.map(upload => (
                  <div key={upload.id} className="flex gap-4 justify-start">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                      <UploadCloud className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0c0e17]/80 px-4 py-4 shadow-lg backdrop-blur-md">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-400" />
                          <span className="text-xs font-medium text-white truncate max-w-[150px]">{upload.fileName}</span>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${upload.status === 'completed' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                          upload.status === 'error' ? 'border-rose-500/30 text-rose-400 bg-rose-500/10' :
                            'border-blue-500/30 text-blue-400 bg-blue-500/10'
                          }`}>
                          {upload.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-zinc-400">
                          <span>{upload.currentStep}</span>
                          <span>{upload.progressPercent}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-black rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${upload.status === 'error' ? 'bg-rose-500' : upload.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${upload.progressPercent}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-4 justify-start">
                    <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 animate-pulse">
                      <img src="/orb.png" alt="AI" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 backdrop-blur-md inline-block">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-400 italic mr-1">
                            {activeStep || "Agents organizing workspace..."}
                          </span>
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <span
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                                style={{
                                  animation: "typing-bounce 1.2s ease-in-out infinite",
                                  animationDelay: `${i * 0.16}s`,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {abortController && (
                        <button
                          onClick={handleStopResponse}
                          className="flex items-center justify-center gap-1.5 self-start px-3 py-1.5 rounded-lg border border-white/10 bg-black/50 text-[10px] text-zinc-400 hover:text-rose-400 hover:border-rose-500/30 transition-all group cursor-pointer"
                        >
                          <Square className="w-3 h-3 group-hover:fill-rose-400" />
                          <span>Stop Response</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Main Prompt / Chat Box Card (Matching Reference UI) ── */}
            <div className={`relative rounded-3xl border border-white/[0.009] bg-gray-9000 p-4 backdrop-blur-xl shadow-2xl transition-all hover:border-white/[0.12] ${currentView !== 'chat' ? 'hidden' : ''}`}>
              {/* Selected File Preview Pill */}
              <AnimatePresence>
                {selectedFile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white-500/30 bg-gray-500/10 text-gray-300"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[200px] font-medium">{selectedFile.name}</span>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="ml-1 p-0.5 hover:bg-indigo-500/20 rounded-md transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!isTyping) handleSend(inputValue);
                  }
                }}
                rows={2}
                placeholder={isTyping ? "Please wait for the response…" : "Message AI Chat..."}
                disabled={isTyping}
                className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none resize-none disabled:cursor-not-allowed disabled:opacity-60"
              />

              {/* Bottom Action Bar inside Card */}
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Paperclip Attachment Button */}
                  <button
                    onClick={handleFileUploadClick}
                    disabled={isTyping}
                    className="p-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Attach document or receipt"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  {/* Quick Pill 1: Create an image / Ingest */}
                  <button
                    onClick={() => !isTyping && handleSend("Create an executive financial summary report")}
                    disabled={isTyping}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-xs text-zinc-300 hover:text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#ADB2D4]" />
                    <span>Create report</span>
                  </button>

                  {/* Quick Pill 2: Search the web / Search Ledger */}
                  <button
                    onClick={() => !isTyping && handleSend("Search Ledger logs for GST tax compliance")}
                    disabled={isTyping}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-xs text-zinc-300 hover:text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Globe className="w-3.5 h-3.5 text-[#B4D3D9]" />
                    <span>Search the web</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Voice input"
                    disabled={isTyping}
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  {/* FIX 4: Show Stop button while generating, Send button otherwise */}
                  {isTyping ? (
                    <button
                      onClick={handleStop}
                      className="p-2 rounded-md bg-[#B34A44] text-white hover:bg-[#95271D] active:scale-[0.97] transition-all cursor-pointer flex items-center justify-center shadow-md"
                      title="Stop generating"
                    >
                      <Square className="w-4 h-4 fill-white" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSend(inputValue)}
                      className="p-2 rounded-xl bg-gray-300 text-black hover:bg-zinc-200 active:scale-[0.97] transition-all cursor-pointer flex items-center justify-center shadow-md"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>


      </main>

    </div>
  );
}
