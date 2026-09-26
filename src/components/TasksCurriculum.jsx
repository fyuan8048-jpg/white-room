import React, { useState } from 'react';
import { 
  Plus, 
  Check, 
  Trash2, 
  Target, 
  Pin, 
  BookOpen, 
  Sparkles,
  X,
  Flame,
  Award,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { focusAudioSuite } from '../utils/audioSynthesizer';

export default function TasksCurriculum({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onIncrementTaskPomodoro,
  onDecrementTaskPomodoro,
  activeTaskId,
  onSetActiveTask,
  scene,
  onClose
}) {
  const [filter, setFilter] = useState('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newRank, setNewRank] = useState('A');
  const [newCategory, setNewCategory] = useState('Study');
  const [newTargetSessions, setNewTargetSessions] = useState(3);
  const [newNotes, setNewNotes] = useState('');

  const rankStyles = {
    'S': 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-950/20',
    'A': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    'B': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    'C': 'bg-slate-700/30 text-slate-300 border-slate-600/40'
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      rank: newRank,
      completedSessions: 0,
      targetSessions: Number(newTargetSessions) || 2,
      completed: false,
      priority: newRank === 'S' ? 'high' : 'medium',
      notes: newNotes.trim()
    });

    setNewTitle('');
    setNewNotes('');
    setIsAdding(false);
  };

  const handleCheck = (task) => {
    if (!task.completed) {
      focusAudioSuite.playSessionChime();
      try {
        confetti({
          particleCount: 50,
          spread: 55,
          origin: { y: 0.7 }
        });
      } catch (e) {}
    }
    onToggleTask(task.id);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="relative max-w-xl mx-auto rounded-3xl p-6 bg-black/75 border border-white/15 backdrop-blur-2xl text-slate-100 shadow-2xl flex flex-col max-h-[80vh]">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 font-sans">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-base text-white">Target Directives</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-cyan-300 border border-white/10">
                CURRICULUM
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Target assignments & focus objectives</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white text-black font-sans font-bold text-xs hover:bg-neutral-200 transition-all shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>

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

      {/* Progress & Filters */}
      {tasks.length > 0 && (
        <div className="my-3 space-y-2">
          <div className="flex justify-between text-xs font-sans text-slate-400">
            <span>COMPLETION RATE</span>
            <span className="text-cyan-300 font-bold">{completedCount} of {tasks.length} Completed ({progressPercent}%)</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-amber-300 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center space-x-1 p-1 rounded-xl bg-black/40 border border-white/10 text-xs font-sans self-start">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${filter === 'all' ? 'bg-white/20 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1 rounded-lg transition-all ${filter === 'active' ? 'bg-white/20 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
            >
              Pending ({tasks.length - completedCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded-lg transition-all ${filter === 'completed' ? 'bg-white/20 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
            >
              Done ({completedCount})
            </button>
          </div>
        </div>
      )}

      {/* Add Task Drawer */}
      {isAdding && (
        <form onSubmit={handleCreate} className="my-3 p-4 rounded-2xl bg-black/70 border border-white/15 space-y-3 font-sans text-xs animate-in slide-in-from-top-2 duration-150">
          <input
            type="text"
            placeholder="Target Directive Title (e.g. Calculus Chapter 4, Essay Review)..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
            autoFocus
          />

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-slate-400">RANK</label>
              <select
                value={newRank}
                onChange={(e) => setNewRank(e.target.value)}
                className="w-full mt-1 px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="S">Rank S</option>
                <option value="A">Rank A</option>
                <option value="B">Rank B</option>
                <option value="C">Rank C</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400">CATEGORY</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full mt-1 px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="Study">Study</option>
                <option value="Strategy">Strategy</option>
                <option value="Coding">Coding</option>
                <option value="Reading">Reading</option>
                <option value="Review">Review</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400">INTERVALS</label>
              <input
                type="number"
                min="1"
                max="20"
                value={newTargetSessions}
                onChange={(e) => setNewTargetSessions(e.target.value)}
                className="w-full mt-1 px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-white text-black font-bold hover:bg-neutral-200"
            >
              Add Target
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="space-y-2 overflow-y-auto pr-1 flex-1 my-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-sans text-xs space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-cyan-300">
              <Target className="w-6 h-6" />
            </div>
            <div className="text-white font-medium">No target directives active</div>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Add your custom study targets or type directly into the timer input.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isPinned = activeTaskId === task.id;
            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                  isPinned
                    ? 'border-cyan-400/60 bg-cyan-950/20'
                    : task.completed
                      ? 'border-white/5 bg-black/20 opacity-60'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <button
                    onClick={() => handleCheck(task)}
                    className={`flex-shrink-0 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                      task.completed
                        ? 'bg-cyan-400/20 border-cyan-400 text-cyan-300'
                        : 'border-white/20 hover:border-cyan-400'
                    }`}
                  >
                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="overflow-hidden">
                    <div className="flex items-center space-x-2">
                      <span className={`font-sans font-medium text-xs sm:text-sm truncate ${task.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                        {task.title}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono border font-bold flex-shrink-0 ${rankStyles[task.rank] || rankStyles['B']}`}>
                        {task.rank}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <div className="flex items-center space-x-1" title={`${task.completedSessions} of ${task.targetSessions} intervals`}>
                    {[...Array(Math.max(task.targetSessions, task.completedSessions))].map((_, i) => (
                      <span
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          i < task.completedSessions ? 'bg-cyan-400' : 'bg-white/20'
                        }`}
                      />
                    ))}
                    <span className="text-[10px] font-mono text-slate-400 ml-1">
                      {task.completedSessions}/{task.targetSessions}
                    </span>
                  </div>

                  <button
                    onClick={() => onSetActiveTask(isPinned ? null : task.id)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isPinned ? 'bg-cyan-400/20 border-cyan-400 text-cyan-300' : 'border-white/10 text-slate-400 hover:text-white'
                    }`}
                    title={isPinned ? "Unpin from timer" : "Pin to timer"}
                  >
                    <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-cyan-300' : ''}`} />
                  </button>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
