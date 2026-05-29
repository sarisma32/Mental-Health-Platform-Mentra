import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import { parseText } from './ChatMessage.jsx';
import { BOT_NAME } from './chatbotData.js';
import { buildApiUrl } from '../config/api.js';

const SUGGESTED_PROMPTS = [
  { icon: '', title: 'What is Mentra?', subtitle: 'Learn about the platform', value: 'what is mentra' },
  { icon: '', title: 'How to sign up', subtitle: 'Step-by-step registration guide', value: 'how to sign up' },
  { icon: '', title: 'Book an appointment', subtitle: 'How to schedule a session', value: 'how to book appointment' },
  { icon: '', title: 'Find a doctor', subtitle: 'Browse mental health professionals', value: 'how to find a doctor' },
  { icon: '', title: 'Forgot password', subtitle: 'Reset your account password', value: 'forgot password' },
];

// ── Storage helpers ──────────────────────────────────────────────────────────
const getUser = () => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } };
const getToken = () => localStorage.getItem('token');

// Guest-only localStorage keys
const convsKey = (uid) => `mentra_convs_guest`;
const msgsKey  = (uid, cid) => `mentra_msgs_guest_${cid}`;
const groqKey  = (uid, cid) => `mentra_groq_guest_${cid}`;

const genId = () => `chat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// ── Guest (localStorage) helpers ─────────────────────────────────────────────
const loadGuestConversations = () => {
  try { return JSON.parse(localStorage.getItem(convsKey())) || []; } catch { return []; }
};
const saveGuestConversations = (convs) => {
  try { localStorage.setItem(convsKey(), JSON.stringify(convs)); } catch {}
};
const loadGuestMessages = (cid) => {
  try {
    const raw = localStorage.getItem(msgsKey(null, cid));
    if (!raw) return [];
    return JSON.parse(raw).map(m => ({ ...m, time: new Date(m.time) }));
  } catch { return []; }
};
const saveGuestMessages = (cid, msgs) => {
  try { localStorage.setItem(msgsKey(null, cid), JSON.stringify(msgs)); } catch {}
};
const loadGuestGroq = (cid) => {
  try { return JSON.parse(localStorage.getItem(groqKey(null, cid))) || []; } catch { return []; }
};
const saveGuestGroq = (cid, hist) => {
  try { localStorage.setItem(groqKey(null, cid), JSON.stringify(hist)); } catch {}
};

// ── DB (logged-in) helpers ────────────────────────────────────────────────────
const authHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` });

const dbGetConversations = async () => {
  const res = await fetch(buildApiUrl('/api/chat-history/conversations'), { headers: authHeaders() });
  const data = await res.json();
  return data.success ? data.conversations.map(c => ({ id: c.id, title: c.title, createdAt: c.created_at, updatedAt: c.updated_at })) : [];
};
const dbCreateConversation = async (id, title) => {
  await fetch(buildApiUrl('/api/chat-history/conversations'), {
    method: 'POST', headers: authHeaders(),
    body: JSON.stringify({ id, title }),
  });
};
const dbUpdateConversation = async (id, title) => {
  await fetch(buildApiUrl(`/api/chat-history/conversations/${id}`), {
    method: 'PATCH', headers: authHeaders(),
    body: JSON.stringify({ title }),
  });
};
const dbDeleteConversation = async (id) => {
  await fetch(buildApiUrl(`/api/chat-history/conversations/${id}`), {
    method: 'DELETE', headers: authHeaders(),
  });
};
const dbGetMessages = async (convId) => {
  const res = await fetch(buildApiUrl(`/api/chat-history/conversations/${convId}/messages`), { headers: authHeaders() });
  const data = await res.json();
  if (!data.success) return { messages: [], groqHistory: [] };
  const messages = data.messages.map(m => ({
    id: m.id,
    from: m.role,
    text: m.text,
    time: new Date(m.created_at),
    ...(m.metadata || {}),
  }));
  // rebuild groq history from messages
  const groqHistory = data.messages.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.text }],
  }));
  return { messages, groqHistory };
};
const dbSaveMessage = async (convId, role, text, metadata = {}) => {
  await fetch(buildApiUrl(`/api/chat-history/conversations/${convId}/messages`), {
    method: 'POST', headers: authHeaders(),
    body: JSON.stringify({ role, text, metadata }),
  });
};

const ChatbotPage = () => {
  const user = getUser();
  const isLoggedIn = !!localStorage.getItem('token');
  const userId = user?.id || null;
  const firstName = user?.full_name?.split(' ')[0] || null;

  const [conversations, setConversations] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [geminiHistory, setGeminiHistory] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [emotionTrend, setEmotionTrend] = useState('neutral');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const started = messages.length > 0;

  // Load conversations on mount
  useEffect(() => {
    const init = async () => {
      setLoadingHistory(true);
      if (isLoggedIn) {
        const convs = await dbGetConversations();
        setConversations(convs);
        if (convs.length > 0) {
          setActiveChatId(convs[0].id);
          const { messages: msgs, groqHistory } = await dbGetMessages(convs[0].id);
          setMessages(msgs);
          setGeminiHistory(groqHistory);
        }
      } else {
        const convs = loadGuestConversations();
        setConversations(convs);
        if (convs.length > 0) {
          setActiveChatId(convs[0].id);
          setMessages(loadGuestMessages(convs[0].id));
          setGeminiHistory(loadGuestGroq(convs[0].id));
        }
      }
      setLoadingHistory(false);
    };
    init();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Persist guest messages whenever they change
  useEffect(() => {
    if (!isLoggedIn && activeChatId && messages.length > 0) {
      saveGuestMessages(activeChatId, messages);
    }
  }, [messages]);

  // Persist guest groq history
  useEffect(() => {
    if (!isLoggedIn && activeChatId) {
      saveGuestGroq(activeChatId, geminiHistory);
    }
  }, [geminiHistory]);

  // Switch to a different conversation
  const switchChat = async (chatId) => {
    if (chatId === activeChatId) return;
    setActiveChatId(chatId);
    setInput('');
    setEmotionTrend('neutral');
    if (isLoggedIn) {
      const { messages: msgs, groqHistory } = await dbGetMessages(chatId);
      setMessages(msgs);
      setGeminiHistory(groqHistory);
    } else {
      setMessages(loadGuestMessages(chatId));
      setGeminiHistory(loadGuestGroq(chatId));
    }
  };

  // Create a brand-new conversation and switch to it
  const handleNewChat = async () => {
    const newId = genId();
    const newConv = { id: newId, title: 'New Chat', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const updated = [newConv, ...conversations];
    setConversations(updated);
    if (isLoggedIn) {
      await dbCreateConversation(newId, 'New Chat');
    } else {
      saveGuestConversations(updated);
    }
    setActiveChatId(newId);
    setMessages([]);
    setGeminiHistory([]);
    setInput('');
    setEmotionTrend('neutral');
    inputRef.current?.focus();
  };

  // Update conversation title from first user message
  const updateTitle = async (chatId, firstMsg) => {
    const title = firstMsg.length > 40 ? firstMsg.slice(0, 40) + '…' : firstMsg;
    setConversations(prev => {
      const updated = prev.map(c => c.id === chatId ? { ...c, title, updatedAt: new Date().toISOString() } : c);
      if (!isLoggedIn) saveGuestConversations(updated);
      return updated;
    });
    if (isLoggedIn) await dbUpdateConversation(chatId, title);
  };

  const formatTime = (date) => new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const addMessage = (content, from) => {
    const text = typeof content === 'string' ? content : content.text;
    const doctors = typeof content === 'object' ? content.doctors : null;
    const isCrisis = typeof content === 'object' ? content.isCrisis : false;
    const riskLevel = typeof content === 'object' ? content.riskLevel : null;
    const emotion = typeof content === 'object' ? content.emotion : null;
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), from, text, doctors, isCrisis, riskLevel, emotion, time: new Date() }]);
    return { text, doctors, isCrisis, riskLevel, emotion };
  };

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;

    // If no active chat, create one first
    let chatId = activeChatId;
    if (!chatId) {
      const newId = genId();
      const title = msg.length > 40 ? msg.slice(0, 40) + '…' : msg;
      const newConv = { id: newId, title, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      const updated = [newConv, ...conversations];
      setConversations(updated);
      if (isLoggedIn) {
        await dbCreateConversation(newId, title);
      } else {
        saveGuestConversations(updated);
      }
      setActiveChatId(newId);
      chatId = newId;
    }

    // Set title from first message
    const conv = conversations.find(c => c.id === chatId);
    if (conv && conv.title === 'New Chat' && messages.length === 0) {
      await updateTitle(chatId, msg);
    }

    setInput('');
    addMessage(msg, 'user');
    if (isLoggedIn) await dbSaveMessage(chatId, 'user', msg);
    setIsTyping(true);

    try {
      const res = await fetch(buildApiUrl('/api/chatbot/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: geminiHistory }),
      });
      const data = await res.json();
      setIsTyping(false);

      if (data.success) {
        const { intent, risk_level, emotion, reply, doctors, action } = data;
        if (emotion) setEmotionTrend(emotion);

        let botContent;
        if (risk_level === 'high' || intent === 'crisis') {
          botContent = { text: reply, isCrisis: true, riskLevel: risk_level, emotion };
        } else if ((intent === 'doctor_availability' || intent === 'doctor_recommendation') && doctors?.length > 0) {
          botContent = { text: reply, doctors };
        } else if (action === 'booking_link' || action === 'doctor_list') {
          botContent = { text: reply + '\n\n[→ Browse Doctors](/professionals)', doctors: doctors?.length ? doctors : null };
        } else if (action === 'signup_link') {
          botContent = reply + '\n\n[→ Sign Up](/register-user)';
        } else {
          botContent = reply;
        }

        addMessage(botContent, 'bot');

        // Save bot message to DB
        if (isLoggedIn) {
          const botText = typeof botContent === 'string' ? botContent : botContent.text;
          const metadata = typeof botContent === 'object' ? { doctors: botContent.doctors, isCrisis: botContent.isCrisis, riskLevel: botContent.riskLevel, emotion: botContent.emotion } : {};
          await dbSaveMessage(chatId, 'bot', botText, metadata);
        }

        setGeminiHistory(prev => [
          ...prev,
          { role: 'user', parts: [{ text: msg }] },
          { role: 'model', parts: [{ text: reply }] },
        ]);

        // Update conversation's updatedAt in state
        setConversations(prev => {
          const updated = prev.map(c => c.id === chatId ? { ...c, updatedAt: new Date().toISOString() } : c);
          if (!isLoggedIn) saveGuestConversations(updated);
          return updated;
        });
      } else {
        addMessage(data.message || 'Sorry, I could not process that. Please try again.', 'bot');
      }
    } catch {
      setIsTyping(false);
      addMessage('Sorry, the AI service is temporarily unavailable. Please try again later.', 'bot');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const deleteConversation = async (chatId, e) => {
    e.stopPropagation();
    const updated = conversations.filter(c => c.id !== chatId);
    setConversations(updated);
    if (isLoggedIn) {
      await dbDeleteConversation(chatId);
    } else {
      saveGuestConversations(updated);
      localStorage.removeItem(msgsKey(null, chatId));
      localStorage.removeItem(groqKey(null, chatId));
    }
    if (activeChatId === chatId) {
      if (updated.length > 0) {
        switchChat(updated[0].id);
      } else {
        setActiveChatId(null);
        setMessages([]);
        setGeminiHistory([]);
      }
    }
  };

  const formatRelativeTime = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-screen bg-mentra-white overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
        <div className="hidden md:flex flex-col w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0">
          {/* New Chat button */}
          <div className="p-4 border-b border-gray-200">
            <button onClick={handleNewChat}
              className="w-full flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Chat
            </button>
          </div>

          {/* Conversation history */}
          <div className="flex-1 overflow-y-auto p-3">
            {loadingHistory ? (
              <div className="px-3 py-6 text-center">
                <p className="text-xs text-gray-400">Loading chats...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="px-3 py-6 text-center">
                <p className="text-xs text-gray-400">No conversations yet</p>
                <p className="text-xs text-gray-300 mt-1">Start chatting to see history here</p>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Recent Chats</p>
                <div className="space-y-0.5">
                  {conversations.map(conv => (
                    <div key={conv.id}
                      onClick={() => switchChat(conv.id)}
                      className={`group relative flex items-start gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                        activeChatId === conv.id ? 'bg-[#d0e8dc] text-[#3d6b4a]' : 'hover:bg-white hover:shadow-sm text-gray-600'
                      }`}>
                      <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{conv.title}</p>
                        <p className="text-xs opacity-50 mt-0.5">{formatRelativeTime(conv.updatedAt)}</p>
                      </div>
                      {/* Delete button */}
                      <button onClick={(e) => deleteConversation(conv.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-red-500 transition-all flex-shrink-0">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Bot status */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#d0e8dc] rounded-xl">
              <div className="w-7 h-7 bg-[#4A7C59] rounded-full flex items-center justify-center flex-shrink-0">
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

        {/* ── Chat area ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Welcome screen */}
          {!started ? (
            <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-4 py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-[#4A7C59] to-[#3d6b4a] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {firstName ? `Welcome back, ${firstName}` : 'Welcome!'}
              </h1>
              <p className="text-gray-500 text-center max-w-md mb-3">
                {firstName ? 'Good to see you again. How can I help you today?' : 'How can I help you today? Ask me anything about Mentra, finding a doctor, or managing your mental health.'}
              </p>
              <div className="flex items-center gap-2 mb-8 px-3 py-1.5 bg-[#d0e8dc] rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-xs text-[#5a7a4a] font-medium">AI-powered doctor recommendations available</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-3xl">
                {SUGGESTED_PROMPTS.map(p => (
                  <button key={p.value} onClick={() => handleSend(p.value)}
                    className="text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-[#4A7C59] hover:shadow-md transition-all group">
                    <span className="text-2xl mb-2 block">{p.icon}</span>
                    <p className="font-semibold text-gray-800 text-sm group-hover:text-[#4A7C59] transition-colors">{p.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.subtitle}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((msg, idx) => {
                  const prevMsg = messages[idx - 1];
                  const msgDate = new Date(msg.time);
                  const prevDate = prevMsg ? new Date(prevMsg.time) : null;
                  const showSeparator = !prevDate || msgDate.toDateString() !== prevDate.toDateString();
                  return (
                    <div key={msg.id}>
                      {showSeparator && (
                        <div className="flex items-center gap-3 my-2">
                          <div className="flex-1 h-px bg-gray-200" />
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {msgDate.toDateString() === new Date().toDateString() ? 'Today'
                              : msgDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <div className="flex-1 h-px bg-gray-200" />
                        </div>
                      )}
                      <FullPageMessage message={msg} formatTime={formatTime} user={user} allMessages={messages} emotionTrend={emotionTrend} />
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#4A7C59] to-[#3d6b4a] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
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

          {/* Input bar */}
          <div className="border-t border-gray-200 bg-white px-4 py-4 flex-shrink-0">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end gap-3 bg-white border border-gray-300 rounded-2xl px-4 py-3 shadow-sm focus-within:border-[#4A7C59] focus-within:ring-2 focus-within:ring-[#4A7C59]/20 transition-all">
                <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about Mentra..." rows={1}
                  className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400 resize-none max-h-32 leading-relaxed"
                  style={{ minHeight: '24px' }}
                  onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'; }} />
                <button onClick={() => handleSend()} disabled={!input.trim()}
                  className="w-9 h-9 bg-[#4A7C59] hover:bg-[#3d6b4a] disabled:bg-gray-200 rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">Mentra Assistant answers questions about the platform only. Press Enter to send.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── FullPageMessage ──────────────────────────────────────────────────────────
const FullPageMessage = ({ message, formatTime, user, allMessages, emotionTrend }) => {
  const isBot = message.from === 'bot';
  return (
    <div className={`flex items-start gap-4 ${isBot ? '' : 'flex-row-reverse'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${isBot ? 'bg-gradient-to-br from-[#4A7C59] to-[#3d6b4a]' : 'bg-gray-200'}`}>
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
        <p className="text-xs text-gray-400 mb-1 px-1">{isBot ? 'Mentra Assistant' : 'You'} · {formatTime(message.time)}</p>
        <div className={`px-5 py-4 rounded-2xl text-sm leading-relaxed ${isBot ? 'bg-gray-100 text-gray-700 rounded-tl-sm' : 'bg-[#4A7C59] text-white rounded-tr-sm'}`}>
          {parseText(message.text)}
        </div>
        {isBot && message.doctors?.length > 0 && (
          <div className="mt-3 space-y-2 w-full">
            {message.doctors.map(doc => <DoctorCard key={doc.id} doctor={doc} />)}
          </div>
        )}
        {isBot && message.isCrisis && (
          <CrisisCard message={message} user={user} allMessages={allMessages} emotionTrend={emotionTrend} />
        )}
      </div>
    </div>
  );
};

// ── CrisisCard ───────────────────────────────────────────────────────────────
const CrisisCard = ({ message, user, allMessages = [], emotionTrend = 'distressed' }) => {
  const escalationKey = `mentra_escalated_${message.id}`;
  const [escalating, setEscalating] = useState(false);
  const [escalated, setEscalated] = useState(() => !!localStorage.getItem(escalationKey));
  const [escalationResult, setEscalationResult] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`${escalationKey}_result`)); } catch { return null; }
  });
  const isLoggedIn = !!localStorage.getItem('token');
  const isPatient = localStorage.getItem('userRole') === 'patient';

  const handleContactDoctor = async () => {
    if (!user?.id) return;
    setEscalating(true);
    try {
      const recentMessages = allMessages.slice(-10).map(m => ({ from: m.from, text: m.text }));
      const res = await fetch(buildApiUrl('/api/chatbot/escalate-crisis'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: user.id, recentMessages, riskLevel: message.riskLevel || 'high', emotionTrend }),
      });
      const data = await res.json();
      setEscalationResult(data);
      setEscalated(true);
      localStorage.setItem(escalationKey, '1');
      localStorage.setItem(`${escalationKey}_result`, JSON.stringify(data));
    } catch {
      const fallback = { success: false, message: 'Could not send notification. Please call the helpline directly.' };
      setEscalationResult(fallback);
      setEscalated(true);
      localStorage.setItem(escalationKey, '1');
      localStorage.setItem(`${escalationKey}_result`, JSON.stringify(fallback));
    } finally { setEscalating(false); }
  };

  return (
    <div className="mt-3 w-full bg-red-50 border border-red-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3"><span className="text-lg"></span><p className="font-semibold text-red-700 text-sm">Immediate Help Available</p></div>
      <div className="bg-white border border-orange-100 rounded-xl p-3 mb-3">
        <p className="text-xs font-semibold text-orange-700 mb-2">🌿 Try these right now to feel safer:</p>
        <div className="grid grid-cols-2 gap-2">
          {[{ icon: '', text: 'Take 3 slow deep breaths — in for 4 counts, out for 6' }, { icon: '', text: 'Drink a glass of cold water slowly' }, { icon: '', text: 'Move to a safe, quiet space if you can' }, { icon: '', text: 'Call or text someone you trust right now' }].map((item, i) => (
            <div key={i} className="flex items-start gap-2 bg-orange-50 rounded-lg px-2 py-2">
              <span className="text-base flex-shrink-0">{item.icon}</span>
              <p className="text-xs text-gray-600 leading-snug">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2 mb-3">
        {[{ icon: '', label: 'Nepal Mental Health Helpline', num: '1166' }, { icon: '', label: 'Emergency Services', num: '102' }, { icon: '', label: 'TPO Nepal Crisis Support', num: '01-4460084' }].map(h => (
          <div key={h.num} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-red-100">
            <span className="text-base">{h.icon}</span>
            <div><p className="text-xs font-semibold text-gray-700">{h.label}</p><p className="text-sm font-bold text-red-600">{h.num}</p></div>
          </div>
        ))}
      </div>
      {isLoggedIn && isPatient && (
        <div className="mb-3">
          {!escalated ? (
            <button onClick={handleContactDoctor} disabled={escalating}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
              {escalating ? (<><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Notifying your doctor...</>) : (<><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>Contact My Doctor</>)}
            </button>
          ) : (
            <div className={`w-full text-center text-sm font-medium px-4 py-2.5 rounded-xl ${escalationResult?.success ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
              {escalationResult?.success ? ` ${escalationResult.hasDoctorAssigned ? `Dr. ${escalationResult.doctorName} has been notified.` : 'Our support team has been notified.'} You are not alone.` : ` ${escalationResult?.message}`}
            </div>
          )}
          <p className="text-xs text-gray-400 text-center mt-1.5">This will send your doctor a brief summary — not your full conversation.</p>
        </div>
      )}
      <div className="flex gap-2">
        <a href="/professionals" className="flex-1 text-center text-xs bg-white hover:bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg transition-colors font-medium">Book Appointment</a>
        <a href="/professionals" className="flex-1 text-center text-xs bg-white hover:bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg transition-colors font-medium">Find a Doctor</a>
      </div>
      <p className="text-xs text-gray-400 mt-3 text-center">Please also reach out to a trusted friend, family member, or anyone you feel safe with.</p>
    </div>
  );
};

// ── DoctorCard ───────────────────────────────────────────────────────────────
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
              <span key={date} className="text-xs bg-[#d0e8dc] text-[#5a7a4a] px-2 py-0.5 rounded-full">
                {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            ))}
            {doctor.available_dates.length > 3 && <span className="text-xs text-gray-400">+{doctor.available_dates.length - 3} more</span>}
          </div>
        )}
      </div>
      <a href="/professionals" className="text-xs bg-[#4A7C59] hover:bg-[#3d6b4a] text-white px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">View Profile</a>
    </div>
  </div>
);

export default ChatbotPage;
