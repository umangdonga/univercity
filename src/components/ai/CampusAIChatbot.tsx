import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { AIChatMessage } from '../../types';
import { CAMPUS_LOCATIONS } from '../../data/mockCampusData';
import {
  Bot,
  Send,
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Navigation,
  Utensils,
  Bus,
  BookOpen,
  Building2,
  RefreshCw,
  Copy,
  Check,
  Compass,
  ArrowRight,
} from 'lucide-react';

interface CampusAIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CampusAIChatbot: React.FC<CampusAIChatbotProps> = ({ isOpen, onClose }) => {
  const {
    user,
    startNavigationTo,
    openService,
    setActiveTab,
    showToast,
  } = useApp();

  const [inputMessage, setInputMessage] = useState<string>('');
  const [messages, setMessages] = useState<AIChatMessage[]>(() => {
    const saved = localStorage.getItem('campus_connect_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: 'msg-welcome',
        sender: 'assistant',
        text: `👋 Hello ${user.name.split(' ')[0]}! I'm your **CampusAI Assistant**.\n\nAsk me anything about classrooms, canteen menus, bus schedules, library books, or hostel rules!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: [
          'Where is Classroom B 304?',
          'What is on S Y Cafe menu?',
          'When is the next bus?',
          'How do I renew library books?',
        ],
      },
    ];
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Sync chat to local storage
  useEffect(() => {
    localStorage.setItem('campus_connect_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Web Speech API Voice Recognition setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      showToast('Voice input is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        showToast('Listening... Speak now');
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#•_]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: AIChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build previous conversation history
      const history = messages.slice(-4).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          userRole: user.role,
        }),
      });

      const data = await res.json();
      const botMsg: AIChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'I am ready to help you navigate campus life.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: data.suggestions || ['Navigate to Classroom', 'Check Canteen Today', 'Bus Timings'],
      };

      setMessages((prev) => [...prev, botMsg]);

      if (isSpeechEnabled) {
        speakText(botMsg.text);
      }
    } catch (err) {
      // Fallback
      const botMsg: AIChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `📍 **Classroom B 304** is located in **Science Block B (3rd Floor)**.\n\nTake the elevator or stairs from Main Quad. ~3 mins walk from entrance!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: ['Navigate to B 304', 'Open Canteen Menu', 'Bus Timings'],
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (actionName: string) => {
    const act = actionName.toLowerCase();
    if (act.includes('b 304') || act.includes('b304') || act.includes('navigate') || act.includes('3d') || act.includes('map')) {
      const loc = CAMPUS_LOCATIONS.find((l) => l.id === 'classroom-b304') || CAMPUS_LOCATIONS[0];
      startNavigationTo(loc);
      setActiveTab('navigation');
      onClose();
      showToast('Starting turn-by-turn navigation to Classroom B 304');
    } else if (act.includes('canteen') || act.includes('cafe') || act.includes('menu') || act.includes('dining')) {
      openService('canteen');
      onClose();
    } else if (act.includes('bus') || act.includes('pass') || act.includes('route')) {
      openService('bus');
      onClose();
    } else if (act.includes('library') || act.includes('book') || act.includes('fine')) {
      openService('library');
      onClose();
    } else if (act.includes('admission') || act.includes('tour') || act.includes('counseling')) {
      openService('admission');
      onClose();
    } else if (act.includes('hostel') || act.includes('warden')) {
      openService('hostel');
      onClose();
    } else if (act.includes('parking')) {
      openService('parking');
      onClose();
    } else if (act.includes('sos') || act.includes('emergency') || act.includes('support')) {
      openService('support');
      onClose();
    } else {
      handleSendMessage(actionName);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'msg-welcome',
        sender: 'assistant',
        text: `Chat reset. How can I assist you with your campus schedule or directions today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: ['Where is B 304?', 'S Y Cafe Menu', 'Bus Departure Time'],
      },
    ]);
    showToast('Chat history cleared');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in select-none font-['Poppins',sans-serif]">
      {/* Chat Container Window */}
      <div className="w-full max-w-lg h-full sm:h-[620px] bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#263D88] via-[#1E2F6B] to-[#263D88] text-white px-4 py-3.5 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xs">
                <Bot className="w-5 h-5 text-[#53AADF]" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#263D88] animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight">CampusAI Assistant</h2>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-bold tracking-wider text-blue-100 uppercase">
                  Gemini 3.7 Flash
                </span>
              </div>
              <p className="text-[11px] text-blue-200/90 font-medium">
                Live 24/7 Smart Campus Navigation & Help
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isSpeechEnabled
                  ? 'bg-[#53AADF] text-white shadow-xs'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
              title={isSpeechEnabled ? 'Mute Speech Output' : 'Enable Voice Responses'}
            >
              {isSpeechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={handleClearHistory}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 transition-all cursor-pointer"
              title="Clear Chat"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              title="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F4F7FB]" style={{ scrollbarWidth: 'thin' }}>
          {messages.map((msg) => {
            const isBot = msg.sender === 'assistant';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} animate-in fade-in slide-in-from-bottom-2`}
              >
                <div className="flex items-end gap-2 max-w-[88%] sm:max-w-[82%]">
                  {isBot && (
                    <div className="w-7 h-7 rounded-lg bg-[#263D88] text-white flex items-center justify-center shrink-0 mb-1 text-xs shadow-xs">
                      <Sparkles className="w-4 h-4 text-[#53AADF]" />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs transition-all ${
                      isBot
                        ? 'bg-white text-[#101214] rounded-bl-xs border border-slate-200/90'
                        : 'bg-[#263D88] text-white rounded-br-xs shadow-[#263D88]/20'
                    }`}
                  >
                    {/* Message Body with clean formatting */}
                    <div className="whitespace-pre-line break-words space-y-1">
                      {msg.text.split('\n').map((line, i) => {
                        if (line.startsWith('• ') || line.startsWith('📍 ') || line.startsWith('🍽️ ') || line.startsWith('🚌 ') || line.startsWith('📚 ') || line.startsWith('🏢 ') || line.startsWith('🎓 ') || line.startsWith('🚗 ') || line.startsWith('🚨 ') || line.startsWith('👋 ')) {
                          return (
                            <p key={i} className="font-medium">
                              {line}
                            </p>
                          );
                        }
                        return <p key={i}>{line}</p>;
                      })}
                    </div>

                    {/* Action suggestions inside bot message */}
                    {isBot && msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {msg.suggestions.map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleActionClick(sug)}
                            className="px-2.5 py-1 rounded-xl bg-[#BADDF2]/40 hover:bg-[#263D88] hover:text-white text-[#263D88] text-[11px] font-bold border border-[#263D88]/20 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                          >
                            <span>{sug}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Timestamp & Actions */}
                <div className={`flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400 ${isBot ? 'pl-9' : 'pr-1'}`}>
                  <span>{msg.timestamp}</span>
                  {isBot && (
                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="hover:text-slate-600 transition-colors"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 max-w-[80%] animate-in fade-in">
              <div className="w-7 h-7 rounded-lg bg-[#263D88] text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[#53AADF] animate-spin" />
              </div>
              <div className="bg-white rounded-2xl rounded-bl-xs p-3.5 border border-slate-200/90 shadow-xs flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#263D88] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#53AADF] animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[#263D88] animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-[11px] text-slate-400">CampusAI is thinking...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggested Quick Question Chips above input */}
        <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#53AADF]" /> Ask:
          </span>
          {[
            'Where is B 304?',
            'S Y Cafe Menu',
            'Bus #12 Timings',
            'Library Book Due',
            'Hostel Warden Desk',
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => handleSendMessage(chip)}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-[#BADDF2]/50 hover:text-[#263D88] text-slate-600 text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 border border-slate-200/60"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-2.5 rounded-2xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
              title={isListening ? 'Stop listening' : 'Speak voice prompt'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isListening ? 'Listening to voice...' : 'Ask about rooms, food, bus, library...'}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#263D88] focus:bg-white transition-all"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2.5 rounded-2xl bg-[#263D88] hover:bg-[#1E2F6B] disabled:opacity-40 text-white shadow-md shadow-[#263D88]/20 active:scale-95 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
