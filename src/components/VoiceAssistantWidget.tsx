/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Send,
  Brain,
  Loader2,
  Globe,
  RotateCcw,
  Copy,
  Check,
  Radio,
  ExternalLink,
  ChevronDown,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Zap,
  BookOpen
} from 'lucide-react';

interface MessageItem {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  grounding?: {
    searchQueries?: string[];
    searchChunks?: Array<{ web?: { uri?: string; title?: string } }>;
    isSearchGrounded?: boolean;
  };
}

export const VoiceAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(true);
  const [continuousMode, setContinuousMode] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome-msg',
      sender: 'ai',
      text: 'Hello! I am Texora, your AI Voice & Knowledge Companion. Tap the mic and speak anytime—I have unlimited real-time knowledge grounded with Google Search. Ask me anything about science, exams, global news, calculations, or school operations!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const silenceTimerRef = useRef<any>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing, interimTranscript]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Initialize and trigger listening immediately
  const startListening = () => {
    if (typeof window === 'undefined') return;

    // Stop speaking if currently talking
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not natively supported in this browser. Please type your query to Texora.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript('');
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalTrans = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (currentInterim) {
          setInterimTranscript(currentInterim);
        }

        if (finalTrans) {
          setQuery(finalTrans);
          setInterimTranscript('');
          setIsListening(false);
          // Auto send captured voice query
          handleSendQuery(finalTrans);
        } else if (currentInterim) {
          // Reset silence timer for auto-submitting long spoken thoughts
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (currentInterim.trim()) {
              setQuery(currentInterim);
              setInterimTranscript('');
              try {
                recognition.stop();
              } catch {}
              setIsListening(false);
              handleSendQuery(currentInterim);
            }
          }, 2400);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition status/error:', event.error);
        setIsListening(false);
        setInterimTranscript('');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
    if (interimTranscript.trim()) {
      const captured = interimTranscript.trim();
      setInterimTranscript('');
      handleSendQuery(captured);
    }
  };

  const handleOpenAndListen = () => {
    if (!isOpen) {
      setIsOpen(true);
      // Immediately start listening when opened as requested: "The app should listen once tapped"
      setTimeout(() => {
        startListening();
      }, 300);
    } else {
      // If already open, toggle listening
      if (isListening) {
        stopListening();
      } else {
        startListening();
      }
    }
  };

  // Text-To-Speech response with Web Speech Synthesis
  const speakText = (text: string) => {
    if (!speechEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();

      // Clean markdown symbols for natural voice readout
      const cleanText = text
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/#{1,6}\s+/g, '')
        .replace(/`{1,3}[^`]*`{1,3}/g, 'code block')
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      // Pick a natural sounding English voice if available
      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(v => (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('English')) && v.lang.startsWith('en'));
      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        // If continuous mode is enabled, start listening again for next prompt!
        if (continuousMode) {
          setTimeout(() => {
            startListening();
          }, 800);
        }
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      currentUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const handleSendQuery = async (queryToSend?: string) => {
    const rawText = queryToSend || query;
    const trimmed = rawText.trim();
    if (!trimmed || isProcessing) return;

    const userMessage: MessageItem = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setInterimTranscript('');
    setIsProcessing(true);

    try {
      const response = await fetch('/api/ai/texora-voice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: trimmed,
          conversationHistory: messages.map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to get response from Texora AI.');
      }

      const aiText = data.text || 'I have analyzed your query with real-time Google search grounding.';
      const aiMessage: MessageItem = {
        id: 'msg-ai-' + Date.now(),
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        grounding: data.grounding
      };

      setMessages(prev => [...prev, aiMessage]);

      // Speak response out loud
      speakText(aiText);
    } catch (err: any) {
      console.error('Error contacting Texora AI:', err);
      const errorMessage: MessageItem = {
        id: 'msg-err-' + Date.now(),
        sender: 'ai',
        text: `Texora encountered a network issue: ${err.message || 'Please check connectivity.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const samplePrompts = [
    'Explain Quantum Superposition simply',
    'What are the latest updates in space exploration?',
    'Solve 2x^2 + 5x - 3 = 0 step-by-step',
    'Explain DNA Transcription vs Translation',
    'Summarize Key WAEC Literature Themes',
    'Give me 5 motivational study tips for exams'
  ];

  return (
    <>
      {/* Floating Immediate Listen Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {/* Floating Quick Listening Indicator Badge if listening in background */}
        {isListening && (
          <div className="hidden sm:flex items-center gap-2 bg-rose-600/95 text-white px-4 py-2 rounded-full shadow-xl border border-rose-400 animate-pulse text-xs font-black">
            <Radio className="w-4 h-4 animate-spin text-amber-300" />
            <span>Texora is listening... Speak now</span>
          </div>
        )}

        <button
          id="texora-voice-assistant-fab"
          onClick={handleOpenAndListen}
          className={`relative p-4 rounded-full shadow-2xl flex items-center justify-center transition-all cursor-pointer transform hover:scale-105 active:scale-95 ${
            isListening
              ? 'bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 text-white ring-4 ring-rose-400/50 shadow-rose-900/50 animate-pulse'
              : isSpeaking
              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white ring-4 ring-emerald-400/40 shadow-emerald-900/40'
              : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-900/40'
          }`}
          title="Texora AI Voice Assistant - Tap to listen immediately"
        >
          {isListening ? (
            <Mic className="h-7 w-7 text-white animate-bounce" />
          ) : isSpeaking ? (
            <Volume2 className="h-7 w-7 text-white animate-pulse" />
          ) : (
            <>
              <Sparkles className="h-6 w-6 text-amber-300 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
              </span>
            </>
          )}
        </button>
      </div>

      {/* Texora Interactive Voice Console Modal */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-3xl shadow-2xl overflow-hidden ${
            isExpanded
              ? 'inset-4 sm:inset-10 md:inset-16 max-w-5xl mx-auto'
              : 'bottom-20 right-4 sm:right-6 w-[92vw] sm:w-[440px] max-h-[82vh] h-[600px]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 p-4 text-white flex items-center justify-between border-b border-indigo-500/20">
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-md">
                <Brain className="h-5 w-5 text-amber-300" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black tracking-tight text-white">Texora AI</h3>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 flex items-center gap-1">
                    <Globe className="w-2.5 h-2.5 text-emerald-400" /> Unlimited Live Knowledge
                  </span>
                </div>
                <p className="text-[11px] text-indigo-200 font-medium">Voice & General Intelligence Engine</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSpeechEnabled(!speechEnabled)}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  speechEnabled
                    ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30'
                    : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                }`}
                title={speechEnabled ? 'Voice Readout Enabled' : 'Voice Readout Muted'}
              >
                {speechEnabled ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4" />}
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white cursor-pointer transition-all hidden sm:flex"
                title={isExpanded ? 'Minimize Window' : 'Expand Window'}
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>

              <button
                onClick={() => {
                  stopListening();
                  stopSpeaking();
                  setIsOpen(false);
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-rose-600/80 text-slate-300 hover:text-white cursor-pointer transition-all"
                title="Close Texora Console"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Active Voice Equalizer / Listening Stage */}
          <div
            className={`p-4 transition-all duration-300 flex flex-col items-center justify-center border-b ${
              isListening
                ? 'bg-gradient-to-r from-rose-950/90 via-red-950/80 to-purple-950/90 border-rose-500/40'
                : isSpeaking
                ? 'bg-gradient-to-r from-emerald-950/90 via-teal-950/80 to-indigo-950/90 border-emerald-500/40'
                : 'bg-slate-900/60 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center gap-4 w-full justify-between">
              {/* Mic Sphere Button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`p-4 rounded-2xl transition-all transform hover:scale-105 active:scale-95 cursor-pointer shadow-lg flex items-center justify-center ${
                    isListening
                      ? 'bg-rose-500 text-white animate-bounce ring-4 ring-rose-400/40 shadow-rose-900/50'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500'
                  }`}
                  title={isListening ? 'Click to stop listening and send' : 'Tap to speak to Texora'}
                >
                  {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">
                      {isListening
                        ? 'Texora is Listening...'
                        : isSpeaking
                        ? 'Texora Speaking...'
                        : isProcessing
                        ? 'Searching Google & Thinking...'
                        : 'Tap Mic to Speak'}
                    </span>
                    {isListening && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-300">
                    {isListening
                      ? 'Speak your question or instruction clearly'
                      : isSpeaking
                      ? 'Voice narration active'
                      : 'Immediate voice capture with Google grounding'}
                  </p>
                </div>
              </div>

              {/* Action and controls */}
              <div className="flex items-center gap-2">
                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow"
                  >
                    <Pause className="w-3.5 h-3.5" /> Stop Voice
                  </button>
                )}

                <button
                  onClick={() => setContinuousMode(!continuousMode)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    continuousMode
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                  title="When enabled, Texora automatically listens again after answering"
                >
                  <Zap className={`w-3.5 h-3.5 ${continuousMode ? 'text-amber-300 fill-amber-300' : ''}`} />
                  <span>Hands-Free Auto-Dialogue</span>
                </button>
              </div>
            </div>

            {/* Live Spoken Audio Waves visualizer */}
            {(isListening || isSpeaking) && (
              <div className="w-full mt-3 pt-3 border-t border-white/10 flex items-center justify-center gap-1.5">
                {[40, 70, 90, 60, 100, 80, 50, 90, 75, 45, 85, 60, 95, 70, 30].map((h, i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      isListening
                        ? 'bg-rose-400 animate-pulse'
                        : 'bg-emerald-400 animate-bounce'
                    }`}
                    style={{
                      height: `${Math.max(8, (h * (isListening ? 0.35 : 0.28)))}px`,
                      animationDelay: `${i * 0.08}s`
                    }}
                  />
                ))}
              </div>
            )}

            {/* Live Speech Interim Transcript */}
            {isListening && interimTranscript && (
              <div className="w-full mt-2 p-2.5 rounded-xl bg-black/40 border border-rose-500/30 text-rose-100 text-xs font-mono">
                "{interimTranscript}..."
              </div>
            )}
          </div>

          {/* Conversation Stream Log */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs bg-slate-50 dark:bg-slate-900/60">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`p-4 rounded-3xl max-w-[88%] shadow-sm relative group ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none'
                  }`}
                >
                  {/* Message Header */}
                  <div className="flex items-center justify-between gap-4 mb-1.5 text-[10px] opacity-75">
                    <span className="font-extrabold flex items-center gap-1">
                      {m.sender === 'ai' ? (
                        <>
                          <Sparkles className="w-3 h-3 text-amber-400" /> Texora Intelligence
                        </>
                      ) : (
                        'You'
                      )}
                    </span>
                    <span>{m.timestamp}</span>
                  </div>

                  {/* Message Text Content */}
                  <div className="whitespace-pre-wrap leading-relaxed text-xs sm:text-[13px]">
                    {m.text}
                  </div>

                  {/* Google Search Grounding Badge & Citations */}
                  {m.grounding?.isSearchGrounded && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700 text-[10px] space-y-1.5">
                      <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
                        <Globe className="w-3 h-3 text-emerald-500" />
                        <span>Google Search Grounded Intelligence</span>
                      </div>
                      {m.grounding.searchQueries && m.grounding.searchQueries.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {m.grounding.searchQueries.map((sq, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[9px] font-medium"
                            >
                              🔍 {sq}
                            </span>
                          ))}
                        </div>
                      )}
                      {m.grounding.searchChunks && m.grounding.searchChunks.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {m.grounding.searchChunks.map((chunk, cIdx) => chunk.web?.uri ? (
                            <a
                              key={cIdx}
                              href={chunk.web.uri}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 text-[9px] hover:underline"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              <span className="truncate max-w-[160px]">{chunk.web.title || chunk.web.uri}</span>
                            </a>
                          ) : null)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer Actions */}
                  {m.sender === 'ai' && (
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/50">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => speakText(m.text)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                          title="Replay Voice Audio"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => copyToClipboard(m.id, m.text)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                          title="Copy Answer"
                        >
                          {copiedId === m.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-bold text-xs p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800 w-fit">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                <div className="flex flex-col">
                  <span>Texora is searching Google live index & synthesizing answer...</span>
                  <span className="text-[10px] text-slate-400 font-normal">Real-time web reasoning active</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
            <span className="text-[10px] font-black uppercase text-slate-400 shrink-0">Try:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendQuery(p)}
                className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 text-slate-700 dark:text-slate-200 shrink-0 transition-all cursor-pointer font-medium hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Controls */}
          <div className="p-3.5 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-center ${
                isListening
                  ? 'bg-rose-500 text-white ring-4 ring-rose-400/40 animate-pulse'
                  : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800'
              }`}
              title={isListening ? 'Stop listening' : 'Tap to speak'}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendQuery()}
              placeholder="Ask Texora anything or tap mic to speak..."
              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />

            <button
              onClick={() => handleSendQuery()}
              disabled={!query.trim() || isProcessing}
              className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white rounded-2xl shadow-md cursor-pointer transition-all flex items-center justify-center"
              title="Send Prompt"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
