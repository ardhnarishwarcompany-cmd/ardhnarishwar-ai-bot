import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { usePageContext } from '../../context/PageContext';
import {
  Bot,
  MessageSquare,
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  Send,
  ThumbsUp,
  ThumbsDown,
  Target,
  Compass,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  Volume2,
  VolumeX,
  Search,
  Check,
  MousePointerClick,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Info,
  Star,
  ListOrdered,
  RefreshCw,
  Zap,
  CheckCircle2,
  Activity
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function WebsiteHelperBot() {
  const navigate = useNavigate();
  const {
    location,
    pageMeta,
    pageKnowledge,
    userRole,
    isBotOpen,
    setIsBotOpen,
    activeTab,
    setActiveTab,
    highlightElement,
    toursList,
    startTour,
    inspectMode,
    setInspectMode
  } = usePageContext();

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showGreetingBubble, setShowGreetingBubble] = useState(true);
  const [feedbackGiven, setFeedbackGiven] = useState({}); // messageId -> boolean
  const [searchKnowledgeQuery, setSearchKnowledgeQuery] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [featuresList, setFeaturesList] = useState([]);
  const [featuresCategories, setFeaturesCategories] = useState({});
  const [websiteOverview, setWebsiteOverview] = useState(null);
  const [selectedFeatureCategory, setSelectedFeatureCategory] = useState('All');
  const [main7Modules, setMain7Modules] = useState([]);
  const [liveUpdatesInfo, setLiveUpdatesInfo] = useState(null);

  // Load website explanation, 7 core modules, live updates and features
  useEffect(() => {
    axios.get(`${API_BASE}/helper-bot/explain-website`)
      .then(res => {
        setWebsiteOverview(res.data);
        if (res.data?.main7Modules) setMain7Modules(res.data.main7Modules);
      })
      .catch(() => {});
    axios.get(`${API_BASE}/helper-bot/main-7-modules`)
      .then(res => {
        if (res.data?.modules) setMain7Modules(res.data.modules);
      })
      .catch(() => {});
    axios.get(`${API_BASE}/helper-bot/live-updates`)
      .then(res => setLiveUpdatesInfo(res.data))
      .catch(() => {});
    axios.get(`${API_BASE}/helper-bot/features`)
      .then(res => {
        setFeaturesList(res.data?.features || []);
        setFeaturesCategories(res.data?.categories || {});
      })
      .catch(() => {});
  }, []);

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*_#`[\]()]/g, ' ').replace(/\s+/g, ' ').trim();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 0.98;
    utterance.pitch = 1.05;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Stop speech when closing bot or switching tabs
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [isBotOpen, activeTab]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Play subtle chime
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch (e) {}
  };

  // Initial welcome message
  useEffect(() => {
    const welcomeMsg = {
      id: 'welcome-init',
      sender: 'bot',
      text: `👋 **Welcome to Ardhnarishwar Global Business Solutions!**\n\nI'm your **Website Helper Bot**. I understand the entire platform and can tell you **where to click**, explain any button or feature, and give you step-by-step guided tours.\n\n📍 You are currently on the **${pageMeta.name}** page. How can I guide you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickReplies: [
        '⭐ Explain Main 7 Modules',
        '⚡ Priority of Working 7 Modules',
        '🔄 Real-Time System Updates',
        '🏢 What services do you offer?',
        '💡 Explain this page',
        '🎯 Where should I click?',
        '🧭 Take a Guided Tour'
      ]
    };
    setMessages([welcomeMsg]);
  }, []);

  // Page change awareness: update context greeting when navigating
  useEffect(() => {
    if (messages.length > 0) {
      // Add a lightweight context-switch note
      const contextNote = {
        id: `page-nav-${Date.now()}`,
        sender: 'system',
        text: `📍 *Navigated to: **${pageMeta.name}** (${pageMeta.title})*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, contextNote]);
    }
  }, [pageMeta.name]);

  // Auto-scroll chat
  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, activeTab]);

  // Listen to inspect element trigger event
  useEffect(() => {
    const handleCustomAsk = (e) => {
      if (e.detail?.query) {
        handleSendMessage(e.detail.query);
      }
    };
    window.addEventListener('helper-bot-ask', handleCustomAsk);
    return () => window.removeEventListener('helper-bot-ask', handleCustomAsk);
  }, [pageMeta]);

  // Send message to backend
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    setInputValue('');
    setShowGreetingBubble(false);
    setHasUnread(false);

    const userMessageId = `user-${Date.now()}`;
    const newUserMsg = {
      id: userMessageId,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/helper-bot/chat`, {
        message: text,
        pageContext: {
          path: location.pathname,
          name: pageMeta.name,
          title: pageMeta.title
        },
        userRole
      });

      const botMessageId = `bot-${Date.now()}`;
      const botReply = {
        id: botMessageId,
        sender: 'bot',
        userQuery: text,
        text: response.data.response,
        action: response.data.action,
        quickReplies: response.data.quickReplies || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botReply]);
      playChime();
    } catch (error) {
      console.error('Helper bot chat error:', error);
      const errorReply = {
        id: `bot-err-${Date.now()}`,
        sender: 'bot',
        text: "I'm having trouble connecting to the knowledge base right now. You can explore our services directly or click below for instant page guidance!",
        quickReplies: ['💡 Explain this page', '🎯 Where should I click?', 'Explore Services'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle action click from a bot message
  const handleActionClick = (action) => {
    if (!action) return;

    if (action.type === 'navigate' && action.url) {
      navigate(action.url);
      if (action.selector) {
        setTimeout(() => {
          highlightElement(action.selector, action.label || 'Target element');
        }, 500);
      }
    } else if (action.type === 'highlight' && action.selector) {
      highlightElement(action.selector, action.label || 'Target element');
    } else if (action.type === 'tour') {
      startTour(action.tourId);
    }
  };

  // Submit feedback
  const handleFeedback = async (msg, isHelpful) => {
    if (feedbackGiven[msg.id]) return;

    setFeedbackGiven(prev => ({ ...prev, [msg.id]: isHelpful ? 'helpful' : 'unhelpful' }));

    try {
      await axios.post(`${API_BASE}/helper-bot/feedback`, {
        messageId: msg.id,
        userQuery: msg.userQuery || 'Context prompt',
        botResponse: msg.text,
        pagePath: location.pathname,
        pageTitle: pageMeta.name,
        userRole,
        isHelpful
      });
    } catch (e) {
      console.warn('Failed to record feedback:', e);
    }
  };

  // Reset chat
  const handleResetChat = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        sender: 'bot',
        text: `✨ Chat history cleared.\n\nI'm ready to guide you around **${pageMeta.name}**! What would you like to know?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: ['💡 Explain this page', '🎯 Where should I click?', '🧭 Guided Tour']
      }
    ]);
  };

  return (
    <>
      {/* 1. FLOATING HELPER BOT TRIGGER BUTTON (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-[9990] flex flex-col items-end pointer-events-auto">
        {/* Welcome Greeting Toast */}
        {showGreetingBubble && !isBotOpen && (
          <div 
            onClick={() => { setIsBotOpen(true); setShowGreetingBubble(false); }}
            className="mb-3 cursor-pointer max-w-xs bg-slate-900/95 text-white p-3.5 rounded-2xl border border-violet-500/40 shadow-2xl shadow-violet-950/60 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300 relative group transition transform hover:scale-105"
          >
            <button
              onClick={(e) => { e.stopPropagation(); setShowGreetingBubble(false); }}
              className="absolute top-2 right-2 text-slate-400 hover:text-white p-1 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-start gap-2.5">
              <span className="p-1.5 rounded-xl bg-violet-600/30 text-violet-400 border border-violet-500/30 shrink-0">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </span>
              <div>
                <p className="text-xs font-semibold text-violet-300">Ardhnarishwar AI Guide</p>
                <p className="text-xs text-slate-200 mt-0.5 leading-snug">
                  Need help exploring? I can explain this page & tell you where to click!
                </p>
              </div>
            </div>
            {/* Arrow pointing to floating button */}
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-slate-900 border-r border-b border-violet-500/40 transform rotate-45" />
          </div>
        )}

        {/* Floating AI Button */}
        <button
          id="website-helper-bot-trigger"
          onClick={() => {
            setIsBotOpen(prev => !prev);
            setShowGreetingBubble(false);
            setHasUnread(false);
          }}
          className={`relative group flex items-center justify-center p-4 rounded-2xl shadow-2xl transition-all duration-300 transform active:scale-95 ${
            isBotOpen
              ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
              : 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-violet-900/50 hover:shadow-violet-600/60 hover:-translate-y-1'
          }`}
          aria-label="Open Website Helper Bot"
        >
          {/* Animated pulse ring around button when closed */}
          {!isBotOpen && (
            <span className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 opacity-40 blur-sm group-hover:opacity-75 animate-pulse transition duration-1000" />
          )}

          <div className="relative flex items-center gap-2">
            {isBotOpen ? (
              <X className="w-6 h-6 transition-transform rotate-0 group-hover:rotate-90" />
            ) : (
              <>
                <Bot className="w-6 h-6 animate-bounce-gentle" />
                <span className="hidden sm:inline font-semibold text-xs tracking-wide uppercase pr-1">
                  AI Guide
                </span>
              </>
            )}
          </div>

          {/* Unread indicator badge */}
          {hasUnread && !isBotOpen && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900" />
            </span>
          )}
        </button>
      </div>

      {/* 2. EXPANDED BOT WINDOW / DRAWER */}
      {isBotOpen && (
        <div
          className={`fixed z-[9995] flex flex-col bg-slate-950/95 text-slate-100 border border-violet-500/30 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95 ${
            isExpanded
              ? 'inset-4 md:inset-10'
              : 'bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] h-[600px] max-h-[82vh]'
          }`}
          style={{
            boxShadow: '0 25px 60px -15px rgba(124, 58, 237, 0.35), 0 0 0 1px rgba(139, 92, 246, 0.25)'
          }}
        >
          {/* TOP HEADER */}
          <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-violet-950/40 to-slate-900 border-b border-slate-800/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-900/40 text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-100 tracking-tight">
                    Ardhnarishwar AI Guide
                  </h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-900/50 text-violet-300 border border-violet-700/40">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-violet-400 shrink-0" />
                  <span className="truncate max-w-[200px]">
                    On: <strong className="text-violet-200">{pageMeta.name}</strong>
                  </span>
                </p>
              </div>
            </div>

            {/* Header controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled(prev => !prev)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title={soundEnabled ? 'Mute sound' : 'Enable sound'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </button>
              <button
                onClick={handleResetChat}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title="Reset conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(prev => !prev)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition hidden sm:block"
                title={isExpanded ? 'Restore size' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsBotOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title="Close AI Guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CONTEXT-AWARE QUICK STRIP */}
          <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/60 flex items-center justify-between text-xs overflow-x-auto gap-2 shrink-0 no-scrollbar">
            <button
              onClick={() => {
                setActiveTab('chat');
                handleSendMessage('Explain main 7 modules');
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold whitespace-nowrap flex items-center gap-1.5 transition"
              title="Explain the 7 Core Flagship Modules of Ardhnarishwar"
            >
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" /> 7 Main Modules
            </button>
            <button
              onClick={() => {
                setActiveTab('chat');
                handleSendMessage('Priority of working 7 modules');
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-semibold whitespace-nowrap flex items-center gap-1.5 transition"
              title="Explain the operational priority sequence (Priority 1 to 7)"
            >
              <ListOrdered className="w-3.5 h-3.5 text-emerald-400" /> Working Priority
            </button>
            <button
              onClick={() => {
                setActiveTab('chat');
                handleSendMessage('When all update explain it also');
              }}
              className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 font-semibold whitespace-nowrap flex items-center gap-1.5 transition"
              title="Show real-time updates and live database status"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-400" /> Live Updates
            </button>
            <button
              onClick={() => setActiveTab('explain')}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium whitespace-nowrap flex items-center gap-1.5 shadow-sm hover:from-violet-500 hover:to-indigo-500 transition"
            >
              <Sparkles className="w-3.5 h-3.5" /> Explainer Tab
            </button>
            <button
              onClick={() => handleSendMessage('Explain this page')}
              className="px-2.5 py-1 rounded-lg bg-violet-950/60 hover:bg-violet-900/80 border border-violet-800/40 text-violet-300 font-medium whitespace-nowrap flex items-center gap-1.5 transition"
            >
              <Info className="w-3.5 h-3.5" /> Explain Page
            </button>
            <button
              onClick={() => handleSendMessage('Where should I click?')}
              className="px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-800/40 text-indigo-300 font-medium whitespace-nowrap flex items-center gap-1.5 transition"
            >
              <Target className="w-3.5 h-3.5" /> Where to Click?
            </button>
            <button
              onClick={() => {
                setInspectMode(true);
                setIsBotOpen(false);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium whitespace-nowrap flex items-center gap-1.5 transition"
              title="Click any element on the page to explain what it does"
            >
              <MousePointerClick className="w-3.5 h-3.5 text-amber-400" /> Inspect Element
            </button>
          </div>

          {/* TAB NAVIGATION */}
          <div className="flex border-b border-slate-800 bg-slate-900/40 shrink-0">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition border-b-2 ${
                activeTab === 'chat'
                  ? 'border-violet-500 text-violet-300 bg-violet-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> Assistant
            </button>
            <button
              onClick={() => setActiveTab('explain')}
              className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition border-b-2 ${
                activeTab === 'explain'
                  ? 'border-violet-500 text-violet-300 bg-violet-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Explain
            </button>
            <button
              onClick={() => setActiveTab('page_guide')}
              className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition border-b-2 ${
                activeTab === 'page_guide'
                  ? 'border-violet-500 text-violet-300 bg-violet-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Target className="w-3.5 h-3.5" /> Page Guide
            </button>
            <button
              onClick={() => setActiveTab('tours')}
              className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition border-b-2 ${
                activeTab === 'tours'
                  ? 'border-violet-500 text-violet-300 bg-violet-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" /> Tours
            </button>
            <button
              onClick={() => setActiveTab('faqs')}
              className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition border-b-2 ${
                activeTab === 'faqs'
                  ? 'border-violet-500 text-violet-300 bg-violet-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" /> Knowledge
            </button>
          </div>

          {/* TAB 1: CONVERSATIONAL CHAT */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-950/70">
              {/* Message scroll area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm leading-relaxed">
                {messages.map((msg) => {
                  if (msg.sender === 'system') {
                    return (
                      <div key={msg.id} className="text-center py-1">
                        <span className="text-[11px] text-slate-400 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-full font-mono">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }

                  const isBot = msg.sender === 'bot';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 shadow-md ${
                          isBot
                            ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm'
                            : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-sm shadow-violet-900/30'
                        }`}
                      >
                        {/* Message body with Markdown support */}
                        <div className="whitespace-pre-line text-[13px] leading-relaxed">
                          {msg.text}
                        </div>

                        {/* Action CTA Button if attached to message */}
                        {msg.action && (
                          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center gap-2">
                            <button
                              onClick={() => handleActionClick(msg.action)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white flex items-center gap-1.5 transition shadow-sm"
                            >
                              {msg.action.type === 'highlight' && <Target className="w-3.5 h-3.5" />}
                              {msg.action.type === 'navigate' && <ExternalLink className="w-3.5 h-3.5" />}
                              {msg.action.type === 'tour' && <Compass className="w-3.5 h-3.5" />}
                              <span>{msg.action.label || 'View Action'}</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Timestamp & Feedback (Helpful / Not Helpful) */}
                      {isBot && msg.id !== 'welcome-init' && (
                        <div className="flex items-center gap-2 mt-1 px-1 text-[11px] text-slate-500">
                          <span>{msg.timestamp}</span>
                          <span className="text-slate-700">•</span>
                          <span>Was this helpful?</span>
                          <button
                            onClick={() => handleFeedback(msg, true)}
                            className={`p-1 rounded hover:bg-slate-800 transition ${
                              feedbackGiven[msg.id] === 'helpful' ? 'text-emerald-400 font-bold' : 'hover:text-emerald-400'
                            }`}
                            title="Helpful"
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleFeedback(msg, false)}
                            className={`p-1 rounded hover:bg-slate-800 transition ${
                              feedbackGiven[msg.id] === 'unhelpful' ? 'text-rose-400 font-bold' : 'hover:text-rose-400'
                            }`}
                            title="Not Helpful"
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                          {feedbackGiven[msg.id] && (
                            <span className="text-xs text-violet-400 font-medium">Thanks!</span>
                          )}
                          <span className="text-slate-700">•</span>
                          <button
                            onClick={() => isSpeaking ? stopSpeaking() : speakText(msg.text)}
                            className={`p-1 rounded hover:bg-slate-800 transition flex items-center gap-1 ${
                              isSpeaking ? 'text-violet-400 font-bold' : 'text-slate-400 hover:text-violet-300'
                            }`}
                            title={isSpeaking ? "Stop speaking" : "Listen to AI voice explanation"}
                          >
                            <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-pulse text-violet-400' : ''}`} />
                            <span className="text-[10px]">{isSpeaking ? 'Stop' : 'Listen'}</span>
                          </button>
                        </div>
                      )}

                      {/* Quick reply suggestions */}
                      {msg.quickReplies && msg.quickReplies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                          {msg.quickReplies.map((reply, i) => (
                            <button
                              key={i}
                              onClick={() => handleSendMessage(reply)}
                              className="text-xs px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-violet-950/80 border border-slate-800 hover:border-violet-600/50 text-slate-300 hover:text-violet-200 transition"
                            >
                              {reply}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-violet-400 p-2">
                    <span className="animate-spin">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <span>AI Guide is checking website knowledge...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat input box */}
              <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask where to click, explain a feature, or book demo..."
                    className="flex-1 bg-slate-950 text-slate-100 placeholder-slate-500 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="p-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition shadow-md shadow-violet-900/30"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB: EXPLAIN WEBSITE & FEATURES */}
          {activeTab === 'explain' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/70 text-xs">
              {/* Audio Voice Narration Hero Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-950/80 via-slate-900 to-indigo-950/80 border border-violet-500/40 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-violet-600/30 text-violet-300 border border-violet-500/30">
                      <Bot className="w-5 h-5 animate-bounce-gentle" />
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                        Ardhnarishwar AI Voice Explainer
                      </h4>
                      <p className="text-[11px] text-violet-300">
                        {isSpeaking ? '🎙️ Speaking aloud...' : 'Where people-work meets machine-work'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (isSpeaking) {
                        stopSpeaking();
                      } else {
                        const narration = "Welcome to Ardhnarishwar Global Business Solutions. We bring HR, staffing, attendance, and recruitment together with artificial intelligence and automation, so people work and machine work run as one unified system. Explore our workforce management with face and biometric recognition, AI recruitment cloud, CRM sales pipelines, and dedicated portals for organizations, candidates, and administrators.";
                        speakText(narration);
                      }
                    }}
                    className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition transform hover:scale-105 active:scale-95 ${
                      isSpeaking
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-violet-900/40'
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-4 h-4" /> Stop Voice
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" /> Listen to AI
                      </>
                    )}
                  </button>
                </div>

                <p className="text-slate-300 text-xs mt-3 leading-relaxed">
                  Ardhnarishwar is an integrated business cloud platform. We replace disconnected tools with a unified architecture covering <strong>Workforce & HRMS</strong>, <strong>Smart Attendance</strong>, <strong>AI Recruitment</strong>, <strong>CRM</strong>, and <strong>Autonomous Agents</strong>.
                </p>

                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => startTour('website-overview-tour')}
                    className="px-3 py-1.5 rounded-lg bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/40 text-violet-200 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Compass className="w-3.5 h-3.5" /> Start Interactive Tour
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('chat');
                      handleSendMessage('Explain website in detail');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Chat Deep-Dive
                  </button>
                </div>
              </div>

              {/* 5 Core Pillars */}
              <div>
                <h5 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-violet-400" />
                  Core Technological Pillars
                </h5>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    {
                      title: 'Workforce & Smart Attendance',
                      tag: 'HR & Operations',
                      desc: 'Face recognition, GPS check-ins, shift scheduling, and automatic payroll sync on a centralized employee database.',
                      prompt: 'Explain HRMS & Smart Attendance'
                    },
                    {
                      title: 'AI Recruitment & Staffing Cloud',
                      tag: 'Talent & AI',
                      desc: 'Resume intelligence, candidate qualification screening, and automated job matching for candidates and employers.',
                      prompt: 'Explain AI Recruitment Cloud and Job Portal'
                    },
                    {
                      title: 'HR Staffing & Talent Sourcing',
                      tag: 'Staffing & Placement',
                      desc: 'Technology-enabled staffing services for permanent, temporary, executive search, and bulk workforce deployment.',
                      prompt: 'Explain HR Staffing Solutions'
                    },
                    {
                      title: 'Robotics & AI Agents Network',
                      tag: 'Autonomous AI',
                      desc: 'Department-specific autonomous bots for HR, Finance, Recruitment, and IT that remove administrative toil.',
                      prompt: 'Explain AI Agents Network and Robotics'
                    },
                    {
                      title: 'Zero-Trust Security & Portals',
                      tag: 'Security & Access',
                      desc: 'Role-based access control with dedicated workspaces for Enterprise Clients, Job Candidates, and Staff Admins.',
                      prompt: 'Explain Client and Candidate Portals security'
                    }
                  ].map((p, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-900 border border-slate-800 hover:border-violet-600/40 rounded-xl transition flex items-start justify-between gap-3 group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h6 className="font-bold text-slate-100 text-xs group-hover:text-violet-300 transition">
                            {p.title}
                          </h6>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-violet-950/60 text-violet-300 border border-violet-800/30">
                            {p.tag}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-1 leading-snug">
                          {p.desc}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 pt-0.5">
                        <button
                          onClick={() => {
                            speakText(`${p.title}. ${p.desc}`);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                          title="Listen to explanation"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('chat');
                            handleSendMessage(p.prompt);
                          }}
                          className="px-2 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-[11px] font-semibold transition"
                        >
                          Explain
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ⭐ MAIN 7 MODULES & PRIORITY OF WORKING (LIVE SYNCED) */}
              <div className="p-4 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-violet-500/30 rounded-2xl shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        <Star className="w-4 h-4 fill-amber-400/20" />
                      </span>
                      <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                        Main 7 Modules & Priority of Working
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Structured sequence from organizational foundation to autonomous automation.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (isSpeaking) {
                        stopSpeaking();
                      } else {
                        const prioritySpeech = "Here is the operational priority sequence of the 7 main modules in Ardhnarishwar. Priority 1: HRMS and Workforce Management, establishing the organizational foundation, employee master database, and roles. Priority 2: Smart Attendance System, capturing real-time face recognition and GPS check-ins that feed verified hours to payroll. Priority 3: Job Portal, bringing in candidate applications and job postings. Priority 4: AI Recruitment Cloud, automatically screening resumes, detecting skill gaps, and preparing interview questions. Priority 5: HR Staffing Solutions, managing flexible contract staffing, executive search, and verified candidate deployment. Priority 6: AI Agents Network and Personal AI, deploying specialized co-pilots for HR, Sales, IT, and Finance teams. Priority 7: AI Robotics and Automation, connecting all data streams with autonomous bots and eliminating manual toil. All modules automatically update from our live database in real time.";
                        speakText(prioritySpeech);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/40 text-violet-200 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition"
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-violet-300" />}
                    <span>{isSpeaking ? 'Stop Audio' : 'Listen to Priority Flow'}</span>
                  </button>
                </div>

                {/* Priority Flow Banner */}
                <div className="my-3 p-2.5 rounded-xl bg-violet-950/40 border border-violet-800/30 flex items-center gap-2 text-[11px] text-violet-200 overflow-x-auto no-scrollbar">
                  <span className="font-bold text-violet-300 shrink-0 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" /> Working Sequence:
                  </span>
                  <span className="shrink-0 text-slate-300">
                    P1: HRMS → P2: Attendance → P3: Job Portal → P4: AI Recruitment → P5: HR Staffing → P6: AI Agents → P7: Robotics
                  </span>
                </div>

                {/* 7 Modules List */}
                <div className="space-y-3 mt-3">
                  {(main7Modules.length > 0 ? main7Modules : [
                    { priority: 1, title: 'HRMS & Workforce Management', slug: 'hrms-workforce-management', tag: 'Foundation Layer', badgeColor: 'emerald', role: 'Central enterprise foundation and employee master database.', workingSequence: 'Step 1: Sets up the organization, departments, and employee records.', updatedAtFormatted: 'Live' },
                    { priority: 2, title: 'Smart Attendance System', slug: 'smart-attendance-system', tag: 'Daily Operations', badgeColor: 'teal', role: 'Real-time Face Recognition, GPS check-ins, and automated payroll sync.', workingSequence: 'Step 2: Tracks daily workforce presence in real time.', updatedAtFormatted: 'Live' },
                    { priority: 3, title: 'Job Portal', slug: 'job-portal', tag: 'Talent Sourcing', badgeColor: 'blue', role: 'Career portal and candidate discovery for active hiring.', workingSequence: 'Step 3: Attracts and collects job applications from candidates.', updatedAtFormatted: 'Live' },
                    { priority: 4, title: 'AI Recruitment Cloud', slug: 'ai-recruitment-cloud', tag: 'Intelligent Screening', badgeColor: 'violet', role: 'Resume intelligence, skill gap detection, and candidate ranking.', workingSequence: 'Step 4: Evaluates candidate resumes against job descriptions.', updatedAtFormatted: 'Live' },
                    { priority: 5, title: 'HR Staffing Solutions', slug: 'hr-staffing-solutions', tag: 'Workforce Staffing', badgeColor: 'amber', role: 'Technology-enabled staffing services for permanent, temporary, executive search, and bulk hiring coordination.', workingSequence: 'Step 5: Deploys qualified personnel and coordinates client placement pipelines.', updatedAtFormatted: 'Live' },
                    { priority: 6, title: 'AI Agents Network & Personal AI', slug: 'ai-agents-network', tag: 'Departmental Co-pilots', badgeColor: 'indigo', role: 'Departmental AI co-pilots for HR, Sales, IT, and Finance teams.', workingSequence: 'Step 6: Assists employees with daily briefs and SOP search.', updatedAtFormatted: 'Live' },
                    { priority: 7, title: 'AI Robotics & Automation', slug: 'ai-robotics-automation', tag: 'Autonomous Orchestration', badgeColor: 'fuchsia', role: 'Autonomous bots and RPA eliminating repetitive administrative toil.', workingSequence: 'Step 7: Connects all data streams to automate tasks end-to-end.', updatedAtFormatted: 'Live' },
                  ]).map((mod) => (
                    <div
                      key={mod.slug || mod.priority}
                      className="p-3 bg-slate-900/90 border border-slate-800 hover:border-violet-500/40 rounded-xl transition duration-200 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <span className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 shadow-sm ${
                            mod.priority === 1 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                            mod.priority === 2 ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' :
                            mod.priority === 3 ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                            mod.priority === 4 ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40' :
                            mod.priority === 5 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                            mod.priority === 6 ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' :
                            'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40'
                          }`}>
                            P{mod.priority}
                          </span>
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <h5 className="font-bold text-slate-100 text-xs group-hover:text-violet-300 transition">
                                {mod.title}
                              </h5>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                {mod.tag || 'Core Module'}
                              </span>
                            </div>
                            <p className="text-slate-400 text-[11px] mt-1 leading-snug">
                              {mod.role || mod.shortDescription}
                            </p>
                            <p className="text-violet-300 text-[10px] mt-1 flex items-center gap-1">
                              <span className="font-semibold text-slate-300">Operational Flow:</span> {mod.workingSequence}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 pt-0.5">
                          <button
                            onClick={() => speakText(`${mod.title}, Priority ${mod.priority}. ${mod.role || mod.shortDescription}. ${mod.workingSequence}`)}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                            title="Listen to description"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              setActiveTab('chat');
                              handleSendMessage(`Explain ${mod.title}`);
                            }}
                            className="px-2 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-[10px] font-semibold transition"
                          >
                            Explain
                          </button>
                          <button
                            onClick={() => {
                              navigate(`/services/${mod.slug}`);
                              setIsBotOpen(false);
                            }}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[10px] font-semibold border border-slate-700 transition"
                            title="View service page & test live demo"
                          >
                            Demo
                          </button>
                        </div>
                      </div>

                      {/* Live Sync Footer */}
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Live Database Synced</span>
                        </span>
                        <span>Updated: <strong className="text-slate-300">{mod.updatedAtFormatted || 'Real-time'}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 🔄 AUTOMATIC DATABASE SYNCHRONIZATION CARD */}
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                      <RefreshCw className="w-4 h-4" />
                    </span>
                    <div>
                      <h5 className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                        Real-Time Automatic Updates
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                          Active
                        </span>
                      </h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Database & AI Bot automatically synchronize without redeployment.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('chat');
                      handleSendMessage('When all update explain it also');
                    }}
                    className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition shrink-0"
                  >
                    <RefreshCw className="w-3 h-3" /> Check Updates
                  </button>
                </div>

                <div className="mt-2.5 pt-2.5 border-t border-slate-800/70 text-[11px] text-slate-300 leading-snug">
                  Whenever an administrator updates service features, titles, or tech stacks in the Admin Panel, the changes are stored in MySQL and immediately accessible by the AI Bot in real time.
                </div>
              </div>

              {/* Live Features Interactive Catalog */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    Interactive Feature Explorer ({featuresList.length || 'Live'} Live Connected Modules)
                  </h5>
                </div>

                {/* Category Pills */}
                <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar">
                  {['All', 'HR & Workforce', 'Artificial Intelligence', 'Staffing', 'Global Network', 'Security', 'Custom Solutions'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedFeatureCategory(cat)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition ${
                        selectedFeatureCategory === cat
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Features Grid */}
                <div className="space-y-2">
                  {(featuresList.length > 0 ? featuresList : [
                    { title: 'HRMS & Workforce Management', category: 'HR & Workforce', slug: 'hrms-workforce-management', shortDescription: 'Complete employee lifecycle management, leave, shifts, and payroll inputs.' },
                    { title: 'Smart Attendance System', category: 'HR & Workforce', slug: 'smart-attendance-system', shortDescription: 'Face recognition, GPS check-in, biometric devices, and real-time dashboard.' },
                    { title: 'AI Recruitment Cloud', category: 'Artificial Intelligence', slug: 'ai-recruitment-cloud', shortDescription: 'Resume intelligence, candidate ranking, and skill gap detection.' },
                    { title: 'HR Staffing Solutions', category: 'Staffing', slug: 'hr-staffing-solutions', shortDescription: 'Technology-enabled staffing services for permanent, temporary, and contract roles.' },
                    { title: 'Job Portal', category: 'Staffing', slug: 'job-portal', shortDescription: 'Connecting employers and candidates with integrated application tracking.' },
                    { title: 'AI Robotics & Automation', category: 'Artificial Intelligence', slug: 'ai-robotics-automation', shortDescription: 'Autonomous robotics and RPA eliminating manual business processes.' }
                  ])
                    .filter(f => selectedFeatureCategory === 'All' || f.category === selectedFeatureCategory)
                    .map((feat) => (
                      <div
                        key={feat.slug || feat.title}
                        className="p-3 bg-slate-900/90 border border-slate-800 hover:border-violet-600/40 rounded-xl transition flex items-center justify-between gap-3 group"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h6 className="font-semibold text-slate-200 group-hover:text-violet-300 text-xs transition">
                              {feat.title}
                            </h6>
                            <span className="text-[10px] text-slate-400">({feat.category})</span>
                          </div>
                          <p className="text-slate-400 text-[11px] mt-0.5 line-clamp-1">
                            {feat.shortDescription}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setActiveTab('chat');
                              handleSendMessage(`Explain ${feat.title}`);
                            }}
                            className="px-2 py-1 bg-violet-600/30 hover:bg-violet-600 border border-violet-500/40 text-violet-300 hover:text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition"
                          >
                            <Bot className="w-3 h-3" /> Explain
                          </button>
                          <button
                            onClick={() => {
                              navigate(`/services/${feat.slug}`);
                              setIsBotOpen(false);
                            }}
                            className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                            title="Open Demo & Details"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PAGE GUIDE (Elements, Buttons & Forms) */}
          {activeTab === 'page_guide' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/70 text-xs">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <h4 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-violet-400" />
                  {pageMeta.name} Overview
                </h4>
                <p className="text-slate-400 mt-1 leading-relaxed">
                  {pageKnowledge?.summary || pageMeta.title}
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-violet-300 uppercase tracking-wider text-[11px] mb-2">
                  Key Interactive Elements on this Page:
                </h5>
                <div className="space-y-2.5">
                  {(pageKnowledge?.keyElements || []).map((el, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-900/90 border border-slate-800 hover:border-violet-600/40 rounded-xl transition flex items-center justify-between gap-3 group"
                    >
                      <div>
                        <p className="font-semibold text-slate-200 group-hover:text-violet-300 transition">
                          {el.name}
                        </p>
                        <p className="text-slate-400 text-[11px] mt-0.5 leading-snug">
                          {el.purpose}
                        </p>
                      </div>
                      <button
                        onClick={() => highlightElement(el.selector, el.name)}
                        className="px-2.5 py-1.5 bg-violet-600/20 hover:bg-violet-600 border border-violet-500/40 text-violet-300 hover:text-white rounded-lg flex items-center gap-1 font-semibold transition shrink-0"
                      >
                        <Target className="w-3.5 h-3.5" /> Highlight
                      </button>
                    </div>
                  ))}

                  {(!pageKnowledge?.keyElements || pageKnowledge.keyElements.length === 0) && (
                    <div className="text-center py-6 text-slate-500">
                      No explicit elements registered for this sub-route. Ask in the chat assistant for dynamic answers!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GUIDED TOURS */}
          {activeTab === 'tours' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/70 text-xs">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <h4 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                  <Compass className="w-4 h-4 text-violet-400" />
                  Step-by-Step Interactive Tours
                </h4>
                <p className="text-slate-400 mt-1 leading-relaxed">
                  Pick a guided tour and the bot will walk you step-by-step through the interface, highlighting buttons and forms on your screen.
                </p>
              </div>

              <div className="space-y-2.5">
                {toursList.map((tour) => (
                  <div
                    key={tour.id}
                    className="p-3.5 bg-slate-900/90 border border-slate-800 hover:border-violet-600/50 rounded-xl transition group"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-slate-100 group-hover:text-violet-300 transition text-sm">
                        {tour.title}
                      </h5>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {tour.steps.length} Steps
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                      {tour.description}
                    </p>
                    <div className="mt-3 flex items-center justify-end">
                      <button
                        onClick={() => startTour(tour.id)}
                        className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-md shadow-violet-950/40 transition"
                      >
                        <Compass className="w-3.5 h-3.5" /> Start Tour
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: KNOWLEDGE & FAQS */}
          {activeTab === 'faqs' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/70 text-xs">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchKnowledgeQuery}
                  onChange={(e) => setSearchKnowledgeQuery(e.target.value)}
                  placeholder="Search products, HRMS, attendance, pricing..."
                  className="w-full bg-slate-900 border border-slate-800 pl-9 pr-3 py-2 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="space-y-2">
                {[
                  { q: 'What is Ardhnarishwar Global Business Solutions?', a: 'A unified enterprise technology provider offering live connected modules for HRMS, Smart Attendance, AI Recruitment, HR Staffing, and Custom Software.' },
                  { q: 'How does Smart Attendance verify employee clock-ins?', a: 'Using face recognition, biometric scanners, dynamic QR codes, and GPS location fencing with real-time dashboard analytics.' },
                  { q: 'Can I test an interactive demo?', a: 'Yes! Head to Request Demo or open any service details page to preview live product screens.' },
                  { q: 'How do candidates apply for jobs?', a: 'Visit the Careers page or sign into the Candidate Portal to build your profile, upload your resume, and track application reviews.' },
                  { q: 'Where do enterprise clients log in?', a: 'Visit /login/choose and select Organization Portal to access project inquiries, team management, and workspace tools.' },
                  { q: 'Where is the Admin Console located?', a: 'Company administrators can log in at /admin/login to access the CMS and CRM pipeline.' }
                ]
                  .filter(f => !searchKnowledgeQuery || f.q.toLowerCase().includes(searchKnowledgeQuery.toLowerCase()) || f.a.toLowerCase().includes(searchKnowledgeQuery.toLowerCase()))
                  .map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl"
                    >
                      <p className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        {item.q}
                      </p>
                      <p className="text-slate-400 text-[11px] mt-1.5 leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
