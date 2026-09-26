import React, { useState } from 'react';
import { 
  MessageSquare, 
  Clock, 
  Sparkles, 
  Target, 
  Trash2, 
  Edit3, 
  Check, 
  X,
  Flame,
  Zap,
  Coffee,
  Brain
} from 'lucide-react';

export default function SessionLogsFeed({
  logs,
  onUpdateSessionComment,
  onDeleteSession,
  onClearLogs,
  scene,
  onClose
}) {
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editMood, setEditMood] = useState('Flow State');

  const moods = [
    { label: 'Flow State', icon: Brain, color: 'text-amber-300 bg-amber-400/10 border-amber-400/20' },
    { label: 'Hyper Focus', icon: Zap, color: 'text-cyan-300 bg-cyan-400/10 border-cyan-400/20' },
    { label: 'Deep Calm', icon: Coffee, color: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20' },
    { label: 'Relentless', icon: Flame, color: 'text-rose-300 bg-rose-400/10 border-rose-400/20' }
  ];

  const startEdit = (log) => {
    setEditingId(log.id);
    setEditText(log.comment || '');
    setEditMood(log.mood || 'Flow State');
  };

  const saveEdit = (id) => {
    onUpdateSessionComment(id, editText.trim(), editMood);
    setEditingId(null);
    setEditText('');
  };

  return (
    <div className="relative max-w-xl mx-auto rounded-3xl p-6 bg-black/75 border border-white/15 backdrop-blur-2xl text-slate-100 shadow-2xl flex flex-col max-h-[80vh]">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 font-sans">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-base text-white">Focus Session Logs</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-amber-200 border border-white/10">
                LAST 5 SESSIONS
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Add your reflections and debriefs on recent intervals</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {logs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
            >
              Clear All
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Session List */}
      <div className="space-y-3 overflow-y-auto pr-1 flex-1 my-4">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-sans text-xs space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-amber-300">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="text-white font-medium">No sessions logged yet</div>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Complete a Pomodoro timer interval to automatically log your session and add personal comments here.
            </p>
          </div>
        ) : (
          logs.slice(0, 5).map((log, index) => {
            const isEditing = editingId === log.id;
            return (
              <div
                key={log.id}
                className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-white/20 transition-all space-y-2.5"
              >
                {/* Session Header line */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-amber-300">
                      #{logs.length - index}
                    </span>
                    <div>
                      <div className="font-semibold text-xs text-white flex items-center space-x-1.5">
                        <span>{log.taskTitle || 'Focus Session'}</span>
                        <span className="text-[10px] text-slate-400">· {log.durationMinutes}m</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {log.timestamp}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {log.mood && !isEditing && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-sans bg-white/10 text-amber-200 border border-white/10">
                        {log.mood}
                      </span>
                    )}

                    {!isEditing && (
                      <button
                        onClick={() => startEdit(log)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Comment / Edit reflection"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteSession(log.id)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-colors"
                      title="Remove session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Reflection / Comment */}
                {isEditing ? (
                  <div className="pt-1 space-y-2">
                    <textarea
                      rows={2}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      placeholder="What did you accomplish? Any friction or breakthroughs?..."
                      className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/15 text-white placeholder-slate-500 text-xs font-sans focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
                      autoFocus
                    />

                    {/* Mood tag selector */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-1.5">
                        {moods.map((m) => {
                          const Icon = m.icon;
                          return (
                            <button
                              key={m.label}
                              type="button"
                              onClick={() => setEditMood(m.label)}
                              className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[10px] font-sans border transition-all ${
                                editMood === m.label
                                  ? `${m.color} font-bold ring-1 ring-white/30`
                                  : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                              }`}
                            >
                              <Icon className="w-2.5 h-2.5" />
                              <span>{m.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1 text-slate-400 hover:text-white text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEdit(log.id)}
                          className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-amber-400 text-black font-bold text-xs hover:bg-amber-300"
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Save Note</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => startEdit(log)}
                    className="p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-white/15 cursor-pointer transition-colors"
                  >
                    {log.comment ? (
                      <p className="text-xs text-slate-200 leading-relaxed font-sans italic">
                        "{log.comment}"
                      </p>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic hover:text-amber-200/80 flex items-center space-x-1">
                        <Edit3 className="w-3 h-3" />
                        <span>Click to add a personal reflection on this session...</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer hint */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-sans text-slate-400">
        <span>Automatically captures up to the last 5 completed sessions</span>
        <span className="text-amber-300 font-mono">{logs.length}/5 Cached</span>
      </div>

    </div>
  );
}
