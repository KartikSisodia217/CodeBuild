import React, { useState, useEffect, useRef } from 'react';
import { PanelLeftClose, PanelLeftOpen, MessageSquare, Plus, Check, Pin, Trash2, Edit3, X, Search } from 'lucide-react';

const Sidebar = ({ 
  isOpen, 
  setIsOpen, 
  chats, 
  activeChatId, 
  setActiveChatId, 
  createNewChat, 
  deleteChat, 
  renameChat, 
  pinChat 
}) => {
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isResizing, setIsResizing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for inline renaming
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const editInputRef = useRef(null);

  // Focus input when editing starts
  useEffect(() => {
    if (editingChatId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingChatId]);

  // Handle Resize Logic
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      let newWidth = e.clientX;
      if (newWidth < 200) newWidth = 200;
      if (newWidth > 400) newWidth = 400;
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizing) setIsResizing(false);
    };

    if (isResizing) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleRenameSubmit = (id) => {
    if (editTitle.trim()) {
      renameChat(id, editTitle.trim());
    }
    setEditingChatId(null);
  };

  const handleRenameKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      handleRenameSubmit(id);
    } else if (e.key === 'Escape') {
      setEditingChatId(null);
    }
  };

  const pinnedChats = chats
    .filter(c => c.isPinned && c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b.lastUsedTime - a.lastUsedTime);
    
  const unpinnedChats = chats
    .filter(c => !c.isPinned && c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b.lastUsedTime - a.lastUsedTime);

  const renderChatItem = (chat) => {
    const isActive = activeChatId === chat.id;
    const isEditing = editingChatId === chat.id;

    return (
      <div 
        key={chat.id} 
        onClick={() => {
          if (!isEditing) setActiveChatId(chat.id);
        }}
        className={`group relative flex items-center w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer animate-fade-in ${
          isActive 
            ? 'bg-amber-100/50 text-amber-900 font-medium' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <MessageSquare size={18} className="shrink-0 mr-3 opacity-70" />
        
        {isEditing ? (
          <input
            ref={editInputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => handleRenameKeyDown(e, chat.id)}
            onBlur={() => handleRenameSubmit(chat.id)}
            className="flex-1 bg-white border border-amber-300 rounded px-2 py-0.5 text-sm outline-none w-full"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 truncate text-sm">{chat.title}</span>
        )}

        {/* Hover Actions */}
        {!isEditing && (
          <div className={`absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l ${isActive ? 'from-amber-100 via-amber-100' : 'from-gray-100 via-gray-100'} pl-2`}>
            <button 
              onClick={(e) => { e.stopPropagation(); pinChat(chat.id); }} 
              className={`p-1 rounded-md hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors ${chat.isPinned ? 'text-amber-600 hover:text-amber-700' : ''}`}
              title={chat.isPinned ? "Unpin" : "Pin"}
            >
              <Pin size={14} className={chat.isPinned ? "fill-current" : ""} />
            </button>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                setEditTitle(chat.title);
                setEditingChatId(chat.id); 
              }} 
              className="p-1 rounded-md hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
              title="Rename"
            >
              <Edit3 size={14} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }} 
              className="p-1 rounded-md hover:bg-rose-200 text-gray-500 hover:text-rose-600 transition-colors"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      style={{ width: isOpen ? sidebarWidth : 0 }} 
      className="relative flex-shrink-0 bg-[#f9f9f9] border-r border-gray-200 transition-[width] duration-300 ease-in-out h-full overflow-hidden flex flex-col"
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-[200px]">
        
        {/* Top Section */}
        <div className="p-4 flex items-center justify-between">
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <PanelLeftClose size={20} />
          </button>
        </div>

        {/* New Chat CTA */}
        <div className="px-4 mb-4">
          <button 
            onClick={createNewChat}
            className="w-full flex items-center gap-2 bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all rounded-xl p-3 text-gray-700 font-medium"
          >
            <div className="bg-amber-100 text-amber-700 p-1 rounded-lg">
              <Plus size={18} strokeWidth={2.5} />
            </div>
            New Chat
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-100 border-transparent focus:bg-white focus:border-amber-300 focus:ring-2 focus:ring-amber-200 rounded-lg text-sm transition-all outline-none"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="px-4 pb-4">
          
          {pinnedChats.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-400 mb-2 px-1 tracking-wider uppercase">Pinned</h3>
              <div className="space-y-1">
                {pinnedChats.map(renderChatItem)}
              </div>
            </div>
          )}

          {unpinnedChats.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 mb-2 px-1 tracking-wider uppercase">Recents</h3>
              <div className="space-y-1">
                {unpinnedChats.map(renderChatItem)}
              </div>
            </div>
          )}
          
          {pinnedChats.length === 0 && unpinnedChats.length === 0 && chats.length > 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              No chats found
            </div>
          )}

        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-200 bg-white/50 min-w-[200px]">
        <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-200 to-amber-500 flex items-center justify-center text-white font-bold shadow-sm">
            U
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-gray-800 truncate">User Account</p>
            <p className="text-xs text-gray-500 truncate">Free Plan</p>
          </div>
        </div>
      </div>

      {/* Resize Handle */}
      {isOpen && (
        <div 
          onMouseDown={() => setIsResizing(true)}
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-amber-400 active:bg-amber-500 transition-colors z-10"
        />
      )}
    </div>
  );
};

export default Sidebar;
