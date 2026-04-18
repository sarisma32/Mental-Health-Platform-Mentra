import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import { parseText } from './ChatMessage.jsx';
import { BOT_NAME, WELCOME_MESSAGE, QUICK_REPLIES, getBotResponse } from './chatbotData.js';
import { buildApiUrl } from '../config/api.js';

const SUGGESTED_PROMPTS = [
  { icon: '🏥', title: 'What is Mentra?', subtitle: 'Learn about the platform', value: 'what is mentra' },
  { icon: '📝', title: 'How to sign up', subtitle: 'Step-by-step registration guide', value: 'how to sign up' },
  { icon: '📅', title: 'Book an appointment', subtitle: 'How to schedule a session', value: 'how to book appointment' },
  { icon: '🔍', title: 'Find a doctor', subtitle: 'Browse mental health professionals', value: 'how to find a doctor' },
  { icon: '🔐', title: 'Forgot password', subtitle: 'Reset your account password', value: 'forgot password' },
];

// Keywords that trigger the AI (anything beyond simple platform navigation)
const AI_KEYWORDS = [
  'feel', 'feeling', 'symptom', 'suffer', 'suffering', 'problem', 'issue',
  'anxiety', 'anxious', 'depressed', 'depression', 'stress', 'stressed',
  'panic', 'fear', 'phobia', 'trauma', 'ptsd', 'sad', 'sadness', 'lonely',
  'anger', 'angry', 'mood', 'sleep', 'insomnia', 'addiction', 'alcohol',
  'drug', 'relationship', 'marriage', 'family', 'child', 'ocd', 'bipolar',
  'schizophrenia', 'adhd', 'grief', 'loss', 'abuse', 'which doctor',
  'what doctor', 'recommend doctor', 'suggest doctor', 'should i see',
  'who should i consult', 'what specialist', 'mental health issue',
  'not feeling well', 'struggling', 'overwhelmed', 'burnout', 'tired',
  'hopeless', 'worthless', 'crying', 'irritable', 'concentration',
  // availability / coping
  'available', 'availability', 'schedule', 'time slot', 'book', 'free slot',
  'cope', 'coping', 'strategy', 'strategies', 'help me', 'what can i do',
  'how to deal', 'how to handle', 'manage', 'calm down', 'tips', 'advice',
  'today', 'tomorrow', 'this week', 'next week',
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  // crisis
  'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die',
  'better off dead', 'no reason to live', 'self harm', 'self-harm',
  'hurt myself', 'cant go on', "can't go on", 'end it all', 'give up on life',
  'nothing to live for', 'disappear forever', 'overdose',
];

const isAiQuestion = (msg) => {
  const lower = msg.toLowerCase();
  return AI_KEYWORDS.some(kw => lower.includes(kw));
};

const STORAGE_KEY = 'mentra_chat_history';
const GROQ_HISTORY_KEY = 'mentra_groq_history';

const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
};

// Keys are scoped to user ID so different accounts never share history
const getStorageKey = (userId) => `mentra_chat_${userId}`;
const getGroqKey = (userId) => `mentra_groq_${userId}`;

const loadHistory = (userId) => {
  if (!userId) return [];
  try {
    const saved = localStorage.getItem(getStorageKey(userId));
    if (!saved) return [];
    return JSON.parse(saved).map(m => ({ ...m, time: new Date(m.time) }));
  } catch { return []; }
};

const saveHistory = (userId, messages) => {
  if (!userId) return;
  try { localStorage.setItem(getStorageKey(userId), JSON.stringify(messages)); } catch {}
};

const ChatbotPage = () => {
  const user = getUser();
  const isLoggedIn = !!localStorage.getItem('token');
  const userId = user?.id || null;
  const firstName = user?.full_name?.split(' ')[0] || null;

  const [messages, setMessages] = useState(() => loadHistory(userId));
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [started, setStarted] = useState(() => loadHistory(userId).length > 0);
  const [geminiHistory, setGeminiHistory] = useState(() => {
    if (!userId) return [];
    try { return JSON.parse(localStorage.getItem(getGroqKey(userId))) || []; } catch { return []; }
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Persist chat history — only for logged-in users, scoped to their ID
  useEffect(() => {
    if (messages.length > 0) saveHistory(userId, messages);
  }, [messages]);

  // Persist groq history — only for logged-in users
  useEffect(() => {
    if (!userId) return;
    try { localStorage.setItem(getGroqKey(userId), JSON.stringify(geminiHistory)); } catch {}
  }, [geminiHistory]);

  const formatTime = (date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const addMessage = (content, from) => {
    const text = typeof content === 'string' ? content : content.text;
    const doctors = typeof content === 'object' ? content.doctors : null;
    const isCrisis = typeof content === 'object' ? content.isCrisis : false;
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), from, text, doctors, isCrisis, time: new Date() }]);
  };

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;

    if (!started) setStarted(true);
    setInput('');
    addMessage(msg, 'user');
    setIsTyping(true);

    if (isAiQuestion(msg)) {
      try {
        const res = await fetch(buildApiUrl('/api/chatbot/chat'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg, history: geminiHistory }),
        });
        const data = await res.json();
        setIsTyping(false);

        if (data.success) {
          // For availability intent, append doctor cards if doctors returned
          let reply = data.reply;
          if (data.intent === 'crisis') {
            addMessage({ text: reply, isCrisis: true }, 'bot');
          } else if (data.intent === 'availability' && data.doctors?.length > 0) {
            addMessage({ text: reply, doctors: data.doctors }, 'bot');
          } else if (data.intent === 'recommendation') {
            reply = data.reply + '\n\n[→ Browse Doctors](/professionals)';
            addMessage(reply, 'bot');
          } else {
            addMessage(reply, 'bot');
          }

          setGeminiHistory(prev => [
            ...prev,
            { role: 'user', parts: [{ text: msg }] },
            { role: 'model', parts: [{ text: data.reply }] },
          ]);
        } else {
          addMessage(data.message || 'Sorry, I could not process that. Please try again.', 'bot');
        }
      } catch (err) {
        setIsTyping(false);
        addMessage('Sorry, the AI service is temporarily unavailable. Please try again later.', 'bot');
      }
    } else {
      const delay = 400 + Math.random() * 600;
      setTimeout(() => {
        setIsTyping(false);
        addMessage(getBotResponse(msg, isLoggedIn), 'bot');
      }, delay);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setStarted(false);
    setInput('');
    setGeminiHistory([]);
    if (userId) {
      localStorage.removeItem(getStorageKey(userId));
      localStorage.removeItem(getGroqKey(userId));
    }
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Keep the existing site Header */}
      <Header />

      {/* Main chatbot area */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar */}
        <div className="hidden md:flex flex-col w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0">
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Chat
            </button>
          </div>

          <div className="flex-1 p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Topics</p>
            <div className="space-y-1">
              {SUGGESTED_PROMPTS.map(p => (
                <button
                  key={p.value}
                  onClick={() => handleSend(p.value)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm transition-all group"
                >
                  <span className="mr-2">{p.icon}</span>
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#DCE4D4] rounded-xl">
              <div className="w-7 h-7 bg-[#A3B18A] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#5a7a4a]">{BOT_NAME}</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  <p className="text-xs text-[#7a9a6a]">Online</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Welcome screen — shown before first message */}
          {!started ? (
            <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-4 py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-[#A3B18A] to-[#8FA076] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {firstName ? `Welcome back, ${firstName} 👋` : 'Welcome! 👋'}
              </h1>
              <p className="text-gray-500 text-center max-w-md mb-3">
                {firstName
                  ? `Good to see you again. How can I help you today?`
                  : `How can I help you today? Ask me anything about Mentra, finding a doctor, or managing your mental health.`
                }
              </p>
              <div className="flex items-center gap-2 mb-8 px-3 py-1.5 bg-[#DCE4D4] rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-xs text-[#5a7a4a] font-medium">AI-powered doctor recommendations available</p>
              </div>

              {/* Suggested prompt cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-3xl">
                {SUGGESTED_PROMPTS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => handleSend(p.value)}
                    className="text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-[#A3B18A] hover:shadow-md transition-all group"
                  >
                    <span className="text-2xl mb-2 block">{p.icon}</span>
                    <p className="font-semibold text-gray-800 text-sm group-hover:text-[#A3B18A] transition-colors">{p.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.subtitle}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages area */
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Date separators between messages from different days */}
                {messages.map((msg, idx) => {
                  const prevMsg = messages[idx - 1];
                  const msgDate = new Date(msg.time);
                  const prevDate = prevMsg ? new Date(prevMsg.time) : null;
                  const showSeparator = !prevDate ||
                    msgDate.toDateString() !== prevDate.toDateString();
                  return (
                    <div key={msg.id}>
                      {showSeparator && (
                        <div className="flex items-center gap-3 my-2">
                          <div className="flex-1 h-px bg-gray-200" />
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {msgDate.toDateString() === new Date().toDateString()
                              ? 'Today'
                              : msgDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <div className="flex-1 h-px bg-gray-200" />
                        </div>
                      )}
                      <FullPageMessage message={msg} formatTime={formatTime} />
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#A3B18A] to-[#8FA076] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-5 py-4">
                      <div className="flex gap-1.5 items-center h-5">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Input bar — always visible at bottom */}
          <div className="border-t border-gray-200 bg-white px-4 py-4 flex-shrink-0">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end gap-3 bg-white border border-gray-300 rounded-2xl px-4 py-3 shadow-sm focus-within:border-[#A3B18A] focus-within:ring-2 focus-within:ring-[#A3B18A]/20 transition-all">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about Mentra..."
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400 resize-none max-h-32 leading-relaxed"
                  style={{ minHeight: '24px' }}
                  onInput={e => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                  }}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="w-9 h-9 bg-[#A3B18A] hover:bg-[#8FA076] disabled:bg-gray-200 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                Mentra Assistant answers questions about the platform only. Press Enter to send.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Full-page message bubble (wider, more spacious than the small chatbox version)
const FullPageMessage = ({ message, formatTime }) => {
  const isBot = message.from === 'bot';

  return (
    <div className={`flex items-start gap-4 ${isBot ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
        isBot
          ? 'bg-gradient-to-br from-[#A3B18A] to-[#8FA076]'
          : 'bg-gray-200'
      }`}>
        {isBot ? (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )}
      </div>

      <div className={`flex flex-col max-w-[85%] ${isBot ? '' : 'items-end'}`}>
        <p className="text-xs text-gray-400 mb-1 px-1">
          {isBot ? 'Mentra Assistant' : 'You'} · {formatTime(message.time)}
        </p>
        <div className={`px-5 py-4 rounded-2xl text-sm leading-relaxed ${
          isBot
            ? 'bg-gray-100 text-gray-700 rounded-tl-sm'
            : 'bg-[#A3B18A] text-white rounded-tr-sm'
        }`}>
          {parseText(message.text)}
        </div>

        {/* Doctor availability cards */}
        {isBot && message.doctors?.length > 0 && (
          <div className="mt-3 space-y-2 w-full">
            {message.doctors.map(doc => (
              <DoctorCard key={doc.id} doctor={doc} />
            ))}
          </div>
        )}

        {/* Crisis card */}
        {isBot && message.isCrisis && <CrisisCard />}
      </div>
    </div>
  );
};

const CrisisCard = () => (
  <div className="mt-3 w-full bg-red-50 border border-red-200 rounded-xl p-4">
    <div className="flex items-center gap-2 mb-3">
      <span className="text-lg">🆘</span>
      <p className="font-semibold text-red-700 text-sm">Immediate Help Available</p>
    </div>
    <div className="space-y-2 mb-4">
      <div className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-red-100">
        <span className="text-base">📞</span>
        <div>
          <p className="text-xs font-semibold text-gray-700">Nepal Mental Health Helpline</p>
          <p className="text-sm font-bold text-red-600">1166</p>
        </div>
      </div>
      <div className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-red-100">
        <span className="text-base">🏥</span>
        <div>
          <p className="text-xs font-semibold text-gray-700">Emergency Services</p>
          <p className="text-sm font-bold text-red-600">102</p>
        </div>
      </div>
      <div className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-red-100">
        <span className="text-base">💬</span>
        <div>
          <p className="text-xs font-semibold text-gray-700">TPO Nepal Crisis Support</p>
          <p className="text-sm font-bold text-red-600">01-4460084</p>
        </div>
      </div>
    </div>
    <div className="flex gap-2">
      <a
        href="/professionals"
        className="flex-1 text-center text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors font-medium"
      >
        Book Appointment Now
      </a>
      <a
        href="/professionals"
        className="flex-1 text-center text-xs bg-white hover:bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg transition-colors font-medium"
      >
        Find a Doctor
      </a>
    </div>
    <p className="text-xs text-gray-400 mt-3 text-center">
      Please also reach out to a trusted friend, family member, or anyone you feel safe with.
    </p>
  </div>
);

const DoctorCard = ({ doctor }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1">
        <p className="font-semibold text-gray-800 text-sm">Dr. {doctor.full_name}</p>
        <p className="text-xs text-[#5a7a4a] font-medium mt-0.5">{doctor.specialization}</p>
        <p className="text-xs text-gray-500 mt-1">{doctor.hospital_name}</p>
        {doctor.available_dates?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {doctor.available_dates.slice(0, 3).map(date => (
              <span key={date} className="text-xs bg-[#DCE4D4] text-[#5a7a4a] px-2 py-0.5 rounded-full">
                {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            ))}
            {doctor.available_dates.length > 3 && (
              <span className="text-xs text-gray-400">+{doctor.available_dates.length - 3} more</span>
            )}
          </div>
        )}
      </div>
      <a
        href={`/professionals`}
        className="text-xs bg-[#A3B18A] hover:bg-[#8FA076] text-white px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
      >
        View Profile
      </a>
    </div>
  </div>
);

export default ChatbotPage;
