import React, { useState, useEffect, useRef, Component } from 'react';
import { PanelLeftOpen, Scale, FileText, Bot, User, Copy, Check, Edit3, X, RefreshCw, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MessageInput from './MessageInput';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <div className="text-red-500">Render error: {this.state.error?.message}</div>;
    }
    return this.props.children;
  }
}


const ChatContainer = ({ 
  activeChat, 
  createNewChat,
  setAttachedFilesForChat,
  updateChatActivity,
  handleSendMessage,
  editMessageAndResubmit,
  regenerateResponse,
  switchVariant,
  isSidebarOpen, 
  setIsSidebarOpen,
  isGenerating,
  stopGeneration,
  selectedModel,
  setSelectedModel
}) => {
  const [greeting, setGreeting] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageText, setEditMessageText] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const editInputRef = useRef(null);

  // 100 Indian Legal Assistant Greetings
  const greetingsList = [
    "How can I assist you with Indian law today?",
    "What legal issue are you facing?",
    "Need help understanding a legal document?",
    "I'm here to clarify your rights under Indian law.",
    "Describe your situation, and I'll find the relevant statutes.",
    "Facing a dispute? Let's explore your legal options.",
    "Ask me about family law, property disputes, or criminal procedures.",
    "How can I help you navigate the legal system today?",
    "Need guidance on filing an FIR or drafting a notice?",
    "I can translate complex legal jargon into simple terms. What do you need?",
    "Welcome. What legal question brings you here?",
    "Tell me about your case.",
    "Seeking legal advice? Let's start with the facts.",
    "I specialize in Indian constitutional and penal law. Ask away.",
    "Are you dealing with a contract issue or a property matter?",
    "Let's break down your legal problem together.",
    "Need to know the penalty for a specific offense?",
    "I'm your AI legal guide. How can I serve you?",
    "What specific legal information are you looking for?",
    "Facing an unfair dismissal? Let's check labor laws.",
    "Need to draft a rental agreement? I can outline the key clauses.",
    "Ask me about your fundamental rights.",
    "Dealing with a consumer complaint? I can guide you.",
    "Let's figure out the right legal remedy for you.",
    "Need help with divorce proceedings or alimony questions?",
    "What section of the IPC or BNS applies to your situation? Let's find out.",
    "I can help you understand court procedures.",
    "Are you an NRI needing legal assistance in India?",
    "Tell me the details, and I'll point you to the right laws.",
    "Need to know how to respond to a legal notice?",
    "I'm ready to research Indian case law for you.",
    "Ask me about corporate compliance or tax laws.",
    "Dealing with domestic violence? Let's look at the protection acts.",
    "Need help with intellectual property rights?",
    "What are your legal concerns regarding cybercrime?",
    "I can explain the steps for filing a PIL.",
    "Ask me about property registration and stamp duty.",
    "Need guidance on the Right to Information (RTI) Act?",
    "Let's explore the legal aspects of your startup.",
    "Are you facing issues with a bank or loan?",
    "Tell me about your traffic violation query.",
    "Need to understand the nuances of the POSH Act?",
    "I'm here to demystify Indian laws for you.",
    "What's the legal challenge you want to conquer today?",
    "Ask me about the Hindu Marriage Act or Special Marriage Act.",
    "Dealing with a cheque bounce case? Let's look at Section 138.",
    "Need help understanding a government scheme's legal backing?",
    "I can provide legal context for your business decisions.",
    "Ask me about environmental laws and regulations in India.",
    "Need guidance on child custody laws?",
    "Let's discuss the legal implications of your query.",
    "Are you looking for information on human rights?",
    "Tell me about your consumer court case.",
    "Need help with a trademark or copyright issue?",
    "I can explain the process of getting bail.",
    "Ask me about the laws related to medical negligence.",
    "Dealing with a tenant-landlord dispute?",
    "Need to know about the laws protecting senior citizens?",
    "I'm here to provide accurate and relevant legal information.",
    "What legal puzzle can I help you solve?",
    "Ask me about the laws concerning NGOs and trusts.",
    "Need guidance on the Insolvency and Bankruptcy Code?",
    "Let's explore the legal framework for e-commerce in India.",
    "Are you facing workplace discrimination? Let's check the laws.",
    "Tell me about your query regarding the Motor Vehicles Act.",
    "Need help understanding the new Bharatiya Nyaya Sanhita (BNS)?",
    "I can guide you through the process of arbitration.",
    "Ask me about the laws governing mutual funds or investments.",
    "Dealing with a data privacy issue?",
    "Need to know about the laws related to adoption?",
    "I'm your virtual legal assistant. How can I help?",
    "What's on your legal mind today?",
    "Ask me about the laws related to agriculture and farming.",
    "Need guidance on the Foreign Exchange Management Act (FEMA)?",
    "Let's discuss the legalities of your real estate transaction.",
    "Are you looking for information on election laws?",
    "Tell me about your query regarding immigration or visas.",
    "Need help with a defamation case?",
    "I can explain the laws related to food safety and standards.",
    "Ask me about the laws protecting marginalized communities.",
    "Dealing with a cyberbullying incident?",
    "Need to know about the laws concerning mental health?",
    "I'm here to empower you with legal knowledge.",
    "What legal obstacle can I help you overcome?",
    "Ask me about the laws related to sports and entertainment.",
    "Need guidance on the laws governing educational institutions?",
    "Let's explore the legal aspects of your freelance work.",
    "Are you facing issues with municipal or civic authorities?",
    "Tell me about your query regarding animal rights.",
    "Need help understanding the laws related to cryptocurrency?",
    "I can guide you through the laws concerning aviation or maritime issues.",
    "Ask me about the laws related to defense and national security.",
    "Dealing with a dispute over an inheritance?",
    "Need to know about the laws concerning disaster management?",
    "I'm ready to assist you. What's your legal query?",
    "How can we navigate the Indian legal system together today?",
    "Ask me a question, and let's find the legal answer.",
    "Your legal journey starts here. How can I assist?",
    "Need reliable legal information? You're in the right place.",
    "Let's uncover the legal truths you need."
  ];

  useEffect(() => {
    setGreeting(greetingsList[Math.floor(Math.random() * greetingsList.length)]);
  }, [activeChat?.id]); // Refresh greeting only when switching to a new/different chat

  // Determine if there is content in the current chat
  const isChatActive = activeChat && (activeChat.messages.length > 0);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const startEditing = (id, text) => {
    setEditingMessageId(id);
    setEditMessageText(text);
  };

  const handleEditSubmit = (msgId) => {
    if (editMessageText.trim() && activeChat) {
      editMessageAndResubmit(activeChat.id, msgId, editMessageText);
    }
    setEditingMessageId(null);
    setEditMessageText('');
  };

  useEffect(() => {
    if (editingMessageId && editInputRef.current) {
      editInputRef.current.focus();
      const textLength = editInputRef.current.value.length;
      editInputRef.current.setSelectionRange(textLength, textLength);
    }
  }, [editingMessageId]);

  // TTS Helper Functions
  const sanitizeForSpeech = (text) => {
    return text
      .replace(/#+\s/g, '')
      .replace(/(\*\*|\*|__|_)/g, '')
      .replace(/\[Source:.*?\]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`/g, '')
      .replace(/\n/g, '. ');
  };

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      } else {
        const cleanText = sanitizeForSpeech(text);
        const utterance = new SpeechSynthesisUtterance(cleanText);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      console.warn('Text-to-speech not supported in this browser.');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full relative min-w-[320px]">
      
      {/* Top Header Bar */}
      <div className="absolute top-4 left-4 right-8 z-10 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
          {!isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors bg-white/50 backdrop-blur-sm border border-gray-100 shadow-sm"
            >
              <PanelLeftOpen size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto relative flex flex-col">
        
        {/* Dynamic Greeting Center (Landing State) */}
        <div 
          className={`flex-1 flex flex-col items-center justify-center p-8 transition-all duration-700 ease-in-out ${
            isChatActive ? 'opacity-0 -translate-y-10 pointer-events-none absolute inset-0' : 'opacity-100 translate-y-0 relative'
          }`}
        >
          <div className="bg-amber-100 p-4 rounded-full mb-6">
            <Scale size={48} className="text-amber-600" />
          </div>
          <h1 className="text-3xl font-medium font-spectral text-gray-800 tracking-wide mb-8 text-center leading-loose max-w-2xl">
            {greeting}
          </h1>
          
          {/* Centered Input (Landing State) */}
          <div className="w-full">
            <MessageInput 
              activeChat={activeChat}
              createNewChat={createNewChat}
              setAttachedFilesForChat={setAttachedFilesForChat}
              updateChatActivity={updateChatActivity}
              handleSendMessage={handleSendMessage}
              isChatActive={false}
              isGenerating={isGenerating}
              stopGeneration={stopGeneration}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
            />
          </div>
        </div>

        <div 
          className={`flex-1 w-full max-w-6xl mx-auto p-4 transition-all duration-700 delay-100 ${
            isChatActive ? 'opacity-100 translate-y-0 flex flex-col' : 'opacity-0 translate-y-10 pointer-events-none absolute inset-0'
          }`}
        >
          {activeChat?.messages.map((msg, i) => (
            <div 
              key={i} 
              className={`group w-full flex animate-fade-in-up py-6 px-4 md:px-8 border-b border-slate-200/70 last:border-0 ${
                msg.role === 'user' ? 'flex-row-reverse justify-start' : 'flex-row justify-start'
              }`}
            >
              {/* Avatar Column */}
              <div className={`flex-shrink-0 mt-1 ${msg.role === 'user' ? 'ml-5' : 'mr-5'}`}>
                {msg.role === 'user' ? (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 shadow-sm border border-gray-300">
                    <User size={16} />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm border border-amber-200">
                    <Bot size={16} />
                  </div>
                )}
              </div>

              {/* Content Column */}
              <div className="flex flex-col min-w-0 relative max-w-[90%]">
                
                {/* Header Row */}
                <div className={`flex items-center mb-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span className="text-sm font-semibold tracking-wide text-gray-800">
                    {msg.role === 'user' ? 'You' : 'Legal.ai'}
                  </span>
                </div>

                {/* File Attachments */}
                {msg.files && msg.files.length > 0 && (
                  <div className={`flex flex-wrap gap-2 mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.files.map((f, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide text-gray-700 shadow-sm">
                        <FileText size={14} className="text-gray-400" />
                        <span className="truncate max-w-[200px]">{f.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Text Content */}
                {editingMessageId === msg.id ? (
                  <div className="flex flex-col w-full gap-3 mt-1">
                    <textarea 
                      ref={editInputRef}
                      value={editMessageText}
                      onChange={(e) => setEditMessageText(e.target.value)}
                      rows={Math.max(3, editMessageText.split('\n').length)}
                      className="w-full bg-white border border-amber-200 rounded-lg focus:ring-1 focus:ring-amber-500 resize-none p-3 text-[15.5px] leading-relaxed text-gray-800 shadow-sm"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setEditingMessageId(null)}
                        className="px-4 py-2 text-xs font-medium rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handleEditSubmit(msg.id)}
                        className="px-4 py-2 text-xs font-medium rounded-md bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition-colors"
                      >
                        Save & Submit
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col w-full text-gray-800">
                    {!msg.text && msg.role === 'assistant' && (
                      <div className="transition-all duration-500 ease-in-out my-1">
                        {isGenerating ? (
                          <span className="animate-glow-pulse italic text-[15px] font-medium text-slate-500">Thinking...</span>
                        ) : (
                          <span className="italic text-[15px] font-medium text-red-400">Generation stopped.</span>
                        )}
                      </div>
                    )}
                    {msg.text && (
                      <div className="transition-all duration-300 opacity-100 font-sans text-[15.5px]">
                        <ErrorBoundary>
                          <div className="prose prose-slate prose-p:leading-relaxed prose-pre:bg-gray-100 prose-pre:text-gray-800 max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.text}
                            </ReactMarkdown>
                          </div>
                        </ErrorBoundary>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Utility Actions (visible on hover) */}
                <div className={`mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'user' && !editingMessageId && (
                    <button 
                      onClick={() => startEditing(msg.id, msg.text)}
                      className="p-1.5 text-gray-400 hover:text-amber-600 rounded-md transition-colors"
                      title="Edit Message"
                    >
                      <Edit3 size={14} />
                    </button>
                  )}

                  {/* Variant pagination for assistant messages */}
                  {msg.role === 'assistant' && msg.variants && msg.variants.length > 1 && (
                    <div className="flex items-center gap-1 mr-2 text-xs text-gray-500 font-medium select-none">
                      <button 
                        onClick={() => switchVariant(activeChat.id, msg.id, -1)}
                        disabled={msg.activeVariantIndex === 0}
                        className="p-1 hover:text-gray-800 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                        title="Previous Response"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <span>{msg.activeVariantIndex + 1} / {msg.variants.length}</span>
                      <button 
                        onClick={() => switchVariant(activeChat.id, msg.id, 1)}
                        disabled={msg.activeVariantIndex === msg.variants.length - 1}
                        className="p-1 hover:text-gray-800 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                        title="Next Response"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                  
                  {msg.text && msg.role === 'assistant' && !isGenerating && (
                    <button 
                      onClick={() => regenerateResponse(activeChat.id, msg.id)}
                      className="p-1.5 text-gray-400 hover:text-amber-600 rounded-md transition-colors"
                      title="Regenerate Response"
                    >
                      <RefreshCw size={14} />
                    </button>
                  )}

                  {msg.text && msg.role === 'assistant' && !isGenerating && (
                    <button 
                      onClick={() => handleSpeak(msg.text)}
                      className="p-1.5 text-gray-400 hover:text-amber-600 rounded-md transition-colors"
                      title="Read Aloud"
                    >
                      <Volume2 size={14} />
                    </button>
                  )}

                  {msg.text && (
                    <button 
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="p-1.5 text-gray-400 hover:text-amber-600 rounded-md transition-colors"
                      title="Copy Text"
                    >
                      {copiedMessageId === msg.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
      </div>

      {/* Docked Input Area (Visible when active) */}
      <div 
        className={`w-full bg-gradient-to-t from-marble via-marble to-transparent relative z-20 transition-all duration-700 ${
          isChatActive ? 'opacity-100 translate-y-0 pb-4 pt-2' : 'opacity-0 translate-y-10 pointer-events-none absolute bottom-0 left-0 right-0'
        }`}
      >
          <MessageInput 
          activeChat={activeChat}
          createNewChat={createNewChat}
          setAttachedFilesForChat={setAttachedFilesForChat}
          updateChatActivity={updateChatActivity}
          handleSendMessage={handleSendMessage}
          isChatActive={true}
          isGenerating={isGenerating}
          stopGeneration={stopGeneration}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
        />
      </div>

    </div>
  );
};

export default ChatContainer;
