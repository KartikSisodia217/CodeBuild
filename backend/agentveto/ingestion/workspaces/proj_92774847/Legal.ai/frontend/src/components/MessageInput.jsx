import React, { useRef, useEffect, useState } from 'react';
import { Paperclip, Mic, ArrowUp, X, Scale, FileText, FileEdit, Square } from 'lucide-react';
import LightboxModal from './LightboxModal';
import ModelSelector from './ModelSelector';

const MessageInput = ({ activeChat, createNewChat, setAttachedFilesForChat, updateChatActivity, handleSendMessage, isChatActive, isGenerating, stopGeneration, selectedModel, setSelectedModel }) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [activeLightboxImage, setActiveLightboxImage] = useState(null);
  
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const attachedFiles = activeChat?.attachedFiles || [];

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 300)}px`;
    }
  }, [text]);

  // Global Keyboard Capture ("Type-to-Chat")
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // 2. Focus Exclusion Guardrails
      const activeElement = document.activeElement;
      if (
        activeElement && 
        (activeElement.tagName === 'INPUT' || 
         activeElement.tagName === 'TEXTAREA' || 
         activeElement.isContentEditable)
      ) {
        return;
      }

      // 3. Modifier & System Key Controls
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length > 1) return; // Ignores Shift, Enter, Backspace, Arrow keys, etc.

      // 4. Targeted Focus Pipeline
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  const handleSubmit = () => {
    if (text.trim() || attachedFiles.length > 0) {
      handleSendMessage(text, attachedFiles);
      setText('');
      // No need to manually clear files here as App.jsx clears them in global state for us.
    }
  };

  const handlePillClick = (prompt) => {
    setText(prompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const updateFiles = (newFiles) => {
    let targetChatId = activeChat?.id;
    if (!targetChatId) {
       targetChatId = createNewChat();
    }
    setAttachedFilesForChat(targetChatId, [...(activeChat?.attachedFiles || []), ...newFiles]);
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      updateFiles(newFiles);
      e.target.value = null; // reset input
    }
  };

  const removeFile = (indexToRemove, e) => {
    e.stopPropagation();
    if (activeChat) {
      setAttachedFilesForChat(activeChat.id, attachedFiles.filter((_, idx) => idx !== indexToRemove));
    }
  };

  const handleFileClick = (file) => {
    if (file.type.startsWith('image/')) {
      setActiveLightboxImage(file);
    } else {
      // Programmatic Download
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleMicClick = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
          const audioFile = new File([audioBlob], 'voice_note.webm', { type: audioBlob.type });
          
          updateFiles([audioFile]);
          
          // Stop all tracks to release the microphone
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
      }
    }
  };

  const hasContent = text.trim().length > 0 || attachedFiles.length > 0 || isRecording;

  return (
    <div className={`w-full max-w-3xl mx-auto transition-all duration-500 ease-in-out px-4 ${isChatActive ? 'pb-6' : 'translate-y-4'}`}>
      
      <LightboxModal 
        imageFile={activeLightboxImage} 
        onClose={() => setActiveLightboxImage(null)} 
      />

      <div className="relative bg-white shadow-sm border border-gray-200 rounded-3xl focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-400 transition-all flex flex-col">
        
        {/* Render Attached Files (Chips) */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 px-3 pt-3 pb-1">
            {attachedFiles.map((file, idx) => (
              <div 
                key={idx} 
                onClick={() => handleFileClick(file)}
                className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer animate-fade-in-up"
                title="Click to view/download"
              >
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button 
                  onClick={(e) => removeFile(idx, e)}
                  className="text-gray-400 hover:text-gray-700 p-0.5 rounded-full transition-colors"
                  title="Remove file"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end p-2 min-h-[56px]">
          {/* Hidden File Input */}
          <input 
            type="file" 
            multiple 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
          
          {/* Attachment Button */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-gray-400 hover:text-amber-600 rounded-full hover:bg-amber-50 transition-colors shrink-0"
          >
            <Paperclip size={20} />
          </button>

          {/* Dynamic Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your legal query or paste a document..."
            className="flex-1 max-h-[300px] min-h-[40px] bg-transparent resize-none border-none focus:outline-none focus:ring-0 outline-none text-gray-800 placeholder-gray-400 py-2.5 px-2 overflow-y-auto"
            rows={1}
          />

          {/* Action Buttons */}
          <div className="flex items-center gap-1 shrink-0 px-1 pb-1">
            <div className="mr-1">
              <ModelSelector selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
            </div>

            {(!hasContent || isRecording) && !isGenerating && (
              <button 
                onClick={handleMicClick}
                className={`p-2.5 rounded-full transition-colors ${
                  isRecording 
                  ? 'bg-rose-100 text-rose-600 hover:bg-rose-200' 
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                }`}
                title="Voice Input"
              >
                <Mic size={20} className={isRecording ? 'animate-pulse text-red-500' : ''} />
              </button>
            )}
            
            {hasContent && !isRecording && !isGenerating && (
              <button 
                onClick={handleSubmit}
                className="p-2.5 rounded-full transition-all bg-gray-900 text-white hover:bg-gray-800 scale-100"
              >
                <ArrowUp size={20} />
              </button>
            )}

            {isGenerating && (
              <button 
                onClick={stopGeneration}
                className="p-2.5 rounded-full transition-all bg-gray-900 text-white hover:bg-gray-800 scale-100"
                title="Stop Execution"
              >
                <Square size={20} className="fill-current" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Quick Action Pills (Landing State Only) */}
      {!isChatActive && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6 animate-fade-in-up">
          <button 
            onClick={() => handlePillClick("Explain Section 1 of BNS")}
            className="bg-white hover:bg-amber-50/50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 transition-all cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <Scale size={16} className="text-amber-500" /> Explain Section 1 of BNS
          </button>
          <button 
            onClick={() => handlePillClick("Draft an FIR report for my missing dog")}
            className="bg-white hover:bg-amber-50/50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 transition-all cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <FileEdit size={16} className="text-amber-500" /> Draft an FIR report for my missing dog
          </button>
          <button 
            onClick={() => handlePillClick("Understand a rent agreement clause")}
            className="bg-white hover:bg-amber-50/50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 transition-all cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <FileText size={16} className="text-amber-500" /> Understand a rent agreement clause
          </button>
        </div>
      )}

      {/* Disclaimer / Hints */}
      <div className="text-center mt-4">
        <p className="text-xs text-gray-400">
          AI generated legal information. AI can make mistakes
        </p>
      </div>
    </div>
  );
};

export default MessageInput;
