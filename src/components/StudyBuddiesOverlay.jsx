import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  X, 
  Minimize2, 
  Maximize2, 
  Sparkles, 
  Clock, 
  MessageSquare, 
  Send, 
  Plus, 
  Trash2, 
  Bot, 
  ArrowLeft,
  RefreshCw,
  Sparkle
} from 'lucide-react';

export const PSYCHOLOGICAL_ANIME_BUDDIES = [
  {
    id: 'ayanokoji',
    name: 'Kiyotaka Ayanokouji',
    anime: 'Classroom of the Elite',
    role: 'White Room Masterpiece',
    status: 'Deep Strategic Calculation',
    nature: 'Ruthless stoic pragmatist who views emotional detachment as the ultimate lever of efficiency.',
    quote: 'Quiet the mind. The equation solves itself in stillness.',
    accent: '#38bdf8',
    avatar: 'https://s4.anilist.co/file/anilistcdn/character/large/b123212-ewZgUQr9vvEM.png',
    baseMinutes: 52,
    dialogueResponses: [
      "Distraction is merely an emotional reaction to friction. Discard the emotion, and continue.",
      "The White Room taught me one fundamental truth: limits are cognitive illusions created by weak resolve.",
      "Calculate your remaining tasks not with anxiety, but as chess pieces positioning for checkmate.",
      "To win against exhaustion, you don't struggle against it. You simply accept the monotony and execute anyway.",
      "Focus is not a feeling, it is a binary state. Either you are working, or you are yielding to mediocrity."
    ]
  },
  {
    id: 'light',
    name: 'Light Yagami',
    anime: 'Death Note',
    role: 'Genius Academic Prodigy',
    status: 'Writing Notes with Surgical Precision',
    nature: 'Hyper-focused perfectionist driven by relentless discipline and supreme academic ambition.',
    quote: 'I will achieve perfection. Every second spent without focus is a second lost.',
    accent: '#f59e0b',
    avatar: 'https://s4.anilist.co/file/anilistcdn/character/large/b80-26EhwSsSqQ50.png',
    baseMinutes: 68,
    dialogueResponses: [
      "A second of procrastination is a fracture in perfection. Fix your posture and write with purpose.",
      "Others rely on luck or last-minute panic. I rely on relentless, premeditated preparation.",
      "If you cannot conquer a 25-minute study interval, how do you expect to conquer the challenges ahead?",
      "Eliminate every irrelevant thought. What matters right now is total mastery of the subject in front of you.",
      "Discipline separates those who merely wish from those who dictate reality."
    ]
  },
  {
    id: 'lawliet',
    name: 'L Lawliet',
    anime: 'Death Note',
    role: "World's Greatest Detective",
    status: 'Deep Deductive Problem Solving',
    nature: 'Eccentric deductive mastermind with obsessive mental stamina and analytical clarity.',
    quote: 'There is no victory without thorough analysis. Let us solve this problem completely.',
    accent: '#a855f7',
    avatar: 'https://s4.anilist.co/file/anilistcdn/character/large/b71-1W4panC53vfs.png',
    baseMinutes: 84,
    dialogueResponses: [
      "There is a 97.4% probability that taking an unscheduled break right now will derail your flow state.",
      "When a problem seems impossible, break it into smaller deductions. The truth always reveals itself.",
      "My cognitive stamina doesn't come from motivation. It comes from genuine curiosity and obsessive focus.",
      "Take a deep breath. A sugar cube or tea helps brain glucose, but the real solution is rigorous thinking.",
      "Do not guess. Verify every step of your logic until doubt is mathematically impossible."
    ]
  },
  {
    id: 'johan',
    name: 'Johan Liebert',
    anime: 'Monster',
    role: 'The Shadow Philosopher',
    status: 'Observing Human Potential in Stillness',
    nature: 'Chillingly calm, charismatic observer who masters chaos through absolute emotional composure.',
    quote: 'The greatest power is total emotional composure. Master yourself first.',
    accent: '#ef4444',
    avatar: 'https://s4.anilist.co/file/anilistcdn/character/large/b719-y984mDWyGf5n.jpg',
    baseMinutes: 45,
    dialogueResponses: [
      "Why do you fear the difficult work? Chaos only exists in the mind when you resist silence.",
      "When everyone else panics under pressure, the one who remains still controls the outcome.",
      "Close your eyes for three seconds. Let the noise vanish. Now, begin without hesitation.",
      "True discipline is quiet. It makes no speeches, demands no praise, and never hesitates.",
      "Look closely at the challenge before you. It is merely symbols on paper. It has no power unless you give it fear."
    ]
  },
  {
    id: 'lelouch',
    name: 'Lelouch Lamperouge',
    anime: 'Code Geass',
    role: 'High-Order Tactical Commander',
    status: 'Formulating Multi-Step Strategy',
    nature: 'Visionary chess grandmaster who turns every obstacle into decisive intellectual leverage.',
    quote: 'If the King does not lead, how can he expect his subordinates to follow?',
    accent: '#8b5cf6',
    avatar: 'https://s4.anilist.co/file/anilistcdn/character/large/b417-gVLmIJu9phcK.png',
    baseMinutes: 39,
    dialogueResponses: [
      "I command you to seize control of your concentration! Excuses are for the conquered.",
      "Treat your curriculum like a battlefield. Identify the critical leverage point, and strike with all your force.",
      "The only ones who should study are those who are prepared to master the craft completely.",
      "Every minute of focused intellect is a piece moved on your strategic chessboard.",
      "Never look back with regret during a study session. Forward momentum is the only tactical command."
    ]
  },
  {
    id: 'dazai',
    name: 'Osamu Dazai',
    anime: 'Bungo Stray Dogs',
    role: 'Literary Armed Thinker',
    status: 'Contemplating Paradoxes with Black Coffee',
    nature: 'Witty, enigmatic intellectual who approaches intense focus with nonchalant genius.',
    quote: 'Discipline is not about punishment; it is about staying true to your intellect.',
    accent: '#10b981',
    avatar: 'https://s4.anilist.co/file/anilistcdn/character/large/b89198-qKmRTw4Y3PRC.png',
    baseMinutes: 61,
    dialogueResponses: [
      "Ah, the melancholy of hard work! But you know, intellectual breakthrough feels rather delightful.",
      "Don't take life too seriously, but do take your own potential seriously. Now, let's write something brilliant.",
      "Procrastination is so terribly predictable. Why not surprise yourself and finish this chapter right now?",
      "A quiet room, a sharp mind, and a cup of black coffee. What more could an intellectual desire?",
      "Even if the world is absurd, your intellect is your own sanctuary. Honor it with focus."
    ]
  },
  {
    id: 'kaneki',
    name: 'Ken Kaneki',
    anime: 'Tokyo Ghoul',
    role: 'Enduring Scholar of Tragedy',
    status: 'Pushing Through Mental Fatigue',
    nature: 'Introspective scholar who transforms pain and cognitive fatigue into unbreakable mental stamina.',
    quote: 'I would rather suffer through the discipline than suffer the regret of quitting.',
    accent: '#64748b',
    avatar: 'https://s4.anilist.co/file/anilistcdn/character/large/b87275-mb13EWZBdbh3.png',
    baseMinutes: 30,
    dialogueResponses: [
      "Mental fatigue feels like pain, but it's just your mind expanding its capacity. Keep going.",
      "I used to retreat when things became overwhelming. But enduring the strain is how you transform.",
      "Read one more page. Solve one more problem. You are stronger than your impulse to quit.",
      "In silence, we confront who we truly are. Make your silent hours count.",
      "Turn your inner turmoil into sharp, undivided concentration. It's the only way forward."
    ]
  }
];

export default function StudyBuddiesOverlay({
  isOpen,
  onClose,
  currentSceneAccent = '#fbbf24'
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [elapsedOffset, setElapsedOffset] = useState(0);

  // Custom User Companions persisted in storage
  const [customBuddies, setCustomBuddies] = useState(() => {
    try {
      const saved = localStorage.getItem('whiteroom_custom_buddies');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Active view: 'list' | 'chat' | 'add'
  const [activeView, setActiveView] = useState('list');
  const [selectedBuddyId, setSelectedBuddyId] = useState('ayanokoji');

  // Interactive chat messages per buddy
  const [chatHistories, setChatHistories] = useState(() => {
    try {
      const saved = localStorage.getItem('whiteroom_buddies_chat_history');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // New Companion Form State
  const [newCompanion, setNewCompanion] = useState({
    name: '',
    anime: '',
    role: '',
    nature: '',
    quote: '',
    avatar: '',
    accent: '#38bdf8'
  });

  // Combine default and custom buddies
  const allBuddies = [...PSYCHOLOGICAL_ANIME_BUDDIES, ...customBuddies];
  const activeBuddy = allBuddies.find(b => b.id === selectedBuddyId) || allBuddies[0];

  // Sync companion timers
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setElapsedOffset(prev => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Persist custom buddies
  useEffect(() => {
    localStorage.setItem('whiteroom_custom_buddies', JSON.stringify(customBuddies));
  }, [customBuddies]);

  // Persist chat histories
  useEffect(() => {
    localStorage.setItem('whiteroom_buddies_chat_history', JSON.stringify(chatHistories));
  }, [chatHistories]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeView === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeView, chatHistories, selectedBuddyId, isTyping]);

  if (!isOpen) return null;

  // Handle Send Message in Chat
  const handleSendMessage = (textToSend = null) => {
    const text = (textToSend || messageInput).trim();
    if (!text || !activeBuddy) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const buddyId = activeBuddy.id;
    const currentList = chatHistories[buddyId] || [];
    const updatedList = [...currentList, userMsg];

    setChatHistories(prev => ({
      ...prev,
      [buddyId]: updatedList
    }));

    if (!textToSend) setMessageInput('');
    setIsTyping(true);

    // Simulate authentic psychological in-character response
    setTimeout(() => {
      let replyText = "";

      if (activeBuddy.dialogueResponses && activeBuddy.dialogueResponses.length > 0) {
        // Choose contextually or cycle
        const responses = activeBuddy.dialogueResponses;
        const randIdx = Math.floor(Math.random() * responses.length);
        replyText = responses[randIdx];
      } else if (activeBuddy.nature) {
        replyText = `"${activeBuddy.nature}" — Remember our goal. Channel this inquiry directly into decisive progress. What is your next tactical step?`;
      } else {
        replyText = `Understood. Maintain mental stillness and let us complete this study block without hesitation.`;
      }

      const buddyMsg = {
        id: `msg-reply-${Date.now()}`,
        sender: 'buddy',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatHistories(prev => ({
        ...prev,
        [buddyId]: [...(prev[buddyId] || updatedList), buddyMsg]
      }));

      setIsTyping(false);
    }, 900);
  };

  // Add custom companion
  const handleCreateCompanion = (e) => {
    e.preventDefault();
    if (!newCompanion.name.trim()) return;

    const created = {
      id: `custom-${Date.now()}`,
      name: newCompanion.name.trim(),
      anime: newCompanion.anime.trim() || 'Custom Scholar',
      role: newCompanion.role.trim() || 'Analytical Study Partner',
      status: 'Studying in Deep Focus',
      nature: newCompanion.nature.trim() || 'Calm, methodical, and ruthlessly disciplined focus partner.',
      quote: newCompanion.quote.trim() || 'Focus is the foundation of intellectual mastery.',
      accent: newCompanion.accent || '#38bdf8',
      avatar: newCompanion.avatar.trim() || 'https://s4.anilist.co/file/anilistcdn/character/large/b123212-ewZgUQr9vvEM.png',
      baseMinutes: 20,
      dialogueResponses: [
        `Understood. As your study partner, I expect nothing less than your highest standard of concentration.`,
        `Let us break down this problem systematically. What is the core obstacle?`,
        `Discipline is a muscle. Keep pushing through this study session.`,
        `Stay composed. The only way past mental resistance is through it.`
      ],
      isCustom: true
    };

    setCustomBuddies([created, ...customBuddies]);
    setSelectedBuddyId(created.id);
    setActiveView('list');
    setNewCompanion({
      name: '',
      anime: '',
      role: '',
      nature: '',
      quote: '',
      avatar: '',
      accent: '#38bdf8'
    });
  };

  const handleDeleteCustomBuddy = (id, e) => {
    e.stopPropagation();
    setCustomBuddies(customBuddies.filter(b => b.id !== id));
    if (selectedBuddyId === id) setSelectedBuddyId('ayanokoji');
  };

  const currentChatMessages = chatHistories[activeBuddy?.id] || [
    {
      id: 'welcome-init',
      sender: 'buddy',
      text: `${activeBuddy?.quote || "I am studying alongside you."} What is your focus objective today?`,
      timestamp: 'Now'
    }
  ];

  return (
    <div className={`fixed z-30 transition-all duration-300 select-none ${
      isMinimized 
        ? 'bottom-20 left-6' 
        : 'top-20 left-6 w-80 sm:w-96 max-h-[82vh]'
    }`}>
      <div className="rounded-3xl glass-card-glow p-4 shadow-2xl text-slate-100 space-y-3 flex flex-col max-h-[82vh] overflow-hidden animate-in fade-in slide-in-from-left-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-sans flex-shrink-0">
          <div className="flex items-center space-x-2 overflow-hidden">
            <div className="p-1.5 rounded-xl bg-cyan-400/20 text-cyan-300 flex-shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="font-bold text-white text-xs flex items-center space-x-1.5 truncate">
                <span className="truncate">
                  {activeView === 'chat' ? `Discussion: ${activeBuddy?.name}` : 'Psychological Anime Peers'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                {activeView === 'chat' 
                  ? activeBuddy?.role 
                  : `${allBuddies.length} Elite Thinkers in Flow`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 flex-shrink-0">
            {activeView !== 'list' && (
              <button
                onClick={() => setActiveView('list')}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                title="Back to companions list"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              title="Close study room"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Minimized view pill */}
        {isMinimized ? (
          <div 
            onClick={() => setIsMinimized(false)}
            className="flex items-center space-x-2 text-xs font-sans py-0.5 cursor-pointer hover:opacity-90"
          >
            <div className="flex -space-x-2 overflow-hidden">
              {allBuddies.slice(0, 4).map((b) => (
                <img
                  key={b.id}
                  src={b.avatar}
                  alt={b.name}
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-neutral-900 object-cover"
                />
              ))}
            </div>
            <span className="text-[11px] text-slate-300 font-medium truncate">
              {allBuddies.length} Psychological Peers
            </span>
          </div>
        ) : (
          <>
            {/* VIEW 1: COMPANIONS LIST */}
            {activeView === 'list' && (
              <div className="flex-1 flex flex-col min-h-0 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-sans px-1">
                  <span className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                    Active Study Room
                  </span>
                  <button
                    onClick={() => setActiveView('add')}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/30 font-medium transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Companion</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar max-h-96">
                  {allBuddies.map((buddy) => {
                    const currentMins = buddy.baseMinutes + elapsedOffset;
                    const hrs = Math.floor(currentMins / 60);
                    const mins = currentMins % 60;
                    const timeDisplay = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

                    return (
                      <div
                        key={buddy.id}
                        className="p-3 rounded-2xl bg-neutral-900/60 border border-white/10 hover:border-white/20 transition-all flex items-start space-x-3 group relative hover:bg-neutral-900/80"
                      >
                        {/* Real Anime Profile Avatar */}
                        <div className="relative w-11 h-11 rounded-2xl overflow-hidden flex-shrink-0 bg-neutral-950 border border-white/15 shadow-inner">
                          <img
                            src={buddy.avatar}
                            alt={buddy.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = 'https://s4.anilist.co/file/anilistcdn/character/large/b123212-ewZgUQr9vvEM.png';
                            }}
                          />
                          <div 
                            className="absolute bottom-0 left-0 right-0 h-1"
                            style={{ backgroundColor: buddy.accent }}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center justify-between">
                            <div className="truncate">
                              <span className="font-bold text-white text-xs truncate block">{buddy.name}</span>
                              <span className="text-[10px] text-slate-400 block truncate">{buddy.anime}</span>
                            </div>
                            <span className="text-[10px] font-mono text-cyan-300 flex items-center space-x-0.5 flex-shrink-0 bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-500/20">
                              <Clock className="w-2.5 h-2.5 mr-0.5" />
                              <span>{timeDisplay}</span>
                            </span>
                          </div>

                          <div className="text-[10px] text-amber-200/90 truncate mt-1 font-medium">
                            {buddy.status}
                          </div>

                          <p className="text-[10px] text-slate-300 italic mt-1 line-clamp-1 border-t border-white/5 pt-1">
                            "{buddy.quote}"
                          </p>

                          {/* Action Buttons: Chat & Discuss */}
                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5">
                            <span className="text-[9px] text-slate-400 truncate max-w-[170px]">
                              {buddy.role}
                            </span>
                            
                            <div className="flex items-center space-x-1">
                              {buddy.isCustom && (
                                <button
                                  onClick={(e) => handleDeleteCustomBuddy(buddy.id, e)}
                                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                  title="Delete custom buddy"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedBuddyId(buddy.id);
                                  setActiveView('chat');
                                }}
                                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold transition-all border border-white/10 hover:border-white/25 shadow-sm"
                              >
                                <MessageSquare className="w-2.5 h-2.5 text-cyan-300" />
                                <span>Discuss</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW 2: INTERACTIVE COMPANION CHAT */}
            {activeView === 'chat' && activeBuddy && (
              <div className="flex-1 flex flex-col min-h-0 space-y-2 h-[420px]">
                
                {/* Companion Bio Pill */}
                <div className="p-2.5 rounded-2xl bg-neutral-900/80 border border-white/10 flex items-center space-x-2.5 flex-shrink-0">
                  <img
                    src={activeBuddy.avatar}
                    alt={activeBuddy.name}
                    className="w-9 h-9 rounded-xl object-cover border border-white/15"
                  />
                  <div className="flex-1 overflow-hidden">
                    <div className="text-xs font-bold text-white truncate">{activeBuddy.name}</div>
                    <div className="text-[10px] text-amber-300/90 truncate">{activeBuddy.nature}</div>
                  </div>
                </div>

                {/* Quick Interactive Prompt Pills */}
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 custom-scrollbar text-[10px] flex-shrink-0">
                  {[
                    "I feel distracted, sharpen my focus.",
                    "Analyze my study strategy.",
                    "Explain your philosophy on discipline.",
                    "How do I conquer cognitive fatigue?"
                  ].map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white flex-shrink-0 transition-all text-[10px]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Chat Message Feed */}
                <div className="flex-1 overflow-y-auto space-y-2.5 p-2 rounded-2xl bg-black/40 border border-white/5 custom-scrollbar text-xs">
                  {currentChatMessages.map((msg) => {
                    const isMe = msg.sender === 'user';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in`}
                      >
                        <div className="flex items-end space-x-1.5 max-w-[85%]">
                          {!isMe && (
                            <img
                              src={activeBuddy.avatar}
                              alt=""
                              className="w-5 h-5 rounded-full object-cover flex-shrink-0 mb-0.5 border border-white/10"
                            />
                          )}
                          <div
                            className={`p-2.5 rounded-2xl ${
                              isMe
                                ? 'bg-amber-400 text-black font-medium rounded-br-sm'
                                : 'bg-neutral-900 border border-white/15 text-slate-100 rounded-bl-sm'
                            }`}
                          >
                            <p className="leading-relaxed text-[11px] select-text">{msg.text}</p>
                          </div>
                        </div>
                        <span className="text-[9px] text-slate-500 mt-0.5 px-1 font-mono">
                          {msg.timestamp}
                        </span>
                      </div>
                    );
                  })}

                  {isTyping && (
                    <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] italic py-1 px-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce delay-100" />
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce delay-200" />
                      <span>{activeBuddy.name} is calculating reply...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center space-x-1.5 pt-1 flex-shrink-0"
                >
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={`Discuss with ${activeBuddy.name.split(' ')[0]}...`}
                    className="flex-1 px-3 py-2 rounded-2xl bg-neutral-900/90 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="p-2 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-black transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

            {/* VIEW 3: ADD CUSTOM COMPANION FORM */}
            {activeView === 'add' && (
              <form onSubmit={handleCreateCompanion} className="flex-1 flex flex-col min-h-0 space-y-2.5 overflow-y-auto custom-scrollbar p-1">
                <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Create Custom Companion</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Define their identity, psychological nature, and behavior when studying with you.
                </p>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold">Companion Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shinichi Akiyama / Friend Name"
                      value={newCompanion.name}
                      onChange={(e) => setNewCompanion({ ...newCompanion, name: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-semibold">Anime / Origin</label>
                      <input
                        type="text"
                        placeholder="e.g. Liar Game"
                        value={newCompanion.anime}
                        onChange={(e) => setNewCompanion({ ...newCompanion, anime: e.target.value })}
                        className="w-full mt-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-semibold">Role / Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Strategic Game Theorist"
                        value={newCompanion.role}
                        onChange={(e) => setNewCompanion({ ...newCompanion, role: e.target.value })}
                        className="w-full mt-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold">Nature & Behaviour *</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Cold analytical mentor who values probability, game theory, and calls out emotional excuses."
                      value={newCompanion.nature}
                      onChange={(e) => setNewCompanion({ ...newCompanion, nature: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold">Signature Quote</label>
                    <input
                      type="text"
                      placeholder='e.g. "Doubt is the first step toward genuine truth."'
                      value={newCompanion.quote}
                      onChange={(e) => setNewCompanion({ ...newCompanion, quote: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold">Avatar Image URL (or PFP)</label>
                    <input
                      type="url"
                      placeholder="https://... (leave empty for default anime PFP)"
                      value={newCompanion.avatar}
                      onChange={(e) => setNewCompanion({ ...newCompanion, avatar: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveView('list')}
                    className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-lg"
                  >
                    Save Companion
                  </button>
                </div>
              </form>
            )}
          </>
        )}

      </div>
    </div>
  );
}
