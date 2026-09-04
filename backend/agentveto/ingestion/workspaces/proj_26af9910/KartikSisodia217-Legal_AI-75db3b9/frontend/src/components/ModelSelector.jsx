import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Zap, Shield, Cpu, Target, Brain } from 'lucide-react';

const MODELS = [
  {
    name: "Gemma 4 26B MoE",
    subtext: "High Performance — Efficient expert reasoning.",
    icon: <Target size={16} />
  },
  {
    name: "Gemma 4 31B Dense",
    subtext: "Max Intelligence — Deepest legal analysis, slightly slower.",
    icon: <Brain size={16} />
  }
];

const ModelSelector = ({ selectedModel, setSelectedModel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeModelDetails = MODELS.find(m => m.name === selectedModel) || MODELS[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-700 font-medium text-xs group border border-transparent hover:border-gray-200"
      >
        <span className="text-amber-600">
          {activeModelDetails.icon}
        </span>
        <span className="tracking-wide">{selectedModel}</span>
        <ChevronDown 
          size={14} 
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-72 bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.1)] border border-gray-100 z-50 overflow-hidden animate-fade-in-up origin-bottom">
          <div className="p-1.5 flex flex-col gap-0.5">
            {MODELS.map((model) => (
              <button
                key={model.name}
                onClick={() => {
                  setSelectedModel(model.name);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-start gap-3 ${
                  selectedModel === model.name 
                    ? 'bg-amber-50' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className={`mt-0.5 ${selectedModel === model.name ? 'text-amber-600' : 'text-gray-400'}`}>
                  {model.icon}
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-semibold tracking-wide ${selectedModel === model.name ? 'text-amber-900' : 'text-gray-700'}`}>
                    {model.name}
                  </span>
                  <span className="text-[11px] leading-tight text-gray-500 mt-0.5">
                    {model.subtext}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
