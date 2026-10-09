import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  Layers, 
  RotateCcw, 
  Check, 
  Plus, 
  Trash2, 
  Sparkles, 
  Copy, 
  FileText, 
  Brain,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';

const INITIAL_FLASHCARDS = [
  {
    id: 'fc-1',
    subject: 'Strategy & Mind',
    question: 'What is the Ultradian Rhythm in deep work?',
    answer: 'The natural biological cycle of ~90 minutes of peak brain alertness followed by ~20 minutes of mental fatigue, requiring a restorative break to reset neural focus.'
  },
  {
    id: 'fc-2',
    subject: 'Strategy & Mind',
    question: 'How does the Feynman Technique ensure true comprehension?',
    answer: '1. Choose a concept. 2. Teach it to an imaginary 6-year-old in simple words. 3. Identify knowledge gaps. 4. Refine and simplify until zero jargon remains.'
  },
  {
    id: 'fc-3',
    subject: 'Strategy & Mind',
    question: 'What does Parkinson’s Law state?',
    answer: '"Work expands to fill the time available for its completion." Setting strict, constrained artificial deadlines forces ruthless prioritization.'
  },
  {
    id: 'fc-4',
    subject: 'Strategy & Mind',
    question: 'What is the Pareto Principle (80/20 Rule)?',
    answer: '80% of consequential outcomes result from 20% of high-leverage inputs. Identify the critical 20% concepts and master them first.'
  }
];

export default function StudyNotebookModal({
  isOpen,
  onClose,
  currentSubject = 'General',
  notes = '',
  onSaveNotes,
  flashcards = INITIAL_FLASHCARDS,
  onUpdateFlashcards
}) {
  const [tab, setTab] = useState('notes'); // 'notes' | 'flashcards'
  const [noteContent, setNoteContent] = useState(notes);
  const [copiedToast, setCopiedToast] = useState(false);

  // Flashcards state
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  useEffect(() => {
    setNoteContent(notes);
  }, [notes]);

  if (!isOpen) return null;

  const handleNotesChange = (val) => {
    setNoteContent(val);
    if (onSaveNotes) onSaveNotes(val);
  };

  const insertTimestamp = () => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated = noteContent + `\n[${time} #${currentSubject}] `;
    handleNotesChange(updated);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(noteContent);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const handleAddFlashcard = (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const newCard = {
      id: `fc-${Date.now()}`,
      subject: currentSubject,
      question: newQuestion.trim(),
      answer: newAnswer.trim()
    };

    const updated = [newCard, ...flashcards];
    if (onUpdateFlashcards) onUpdateFlashcards(updated);

    setNewQuestion('');
    setNewAnswer('');
    setIsAddingCard(false);
    setCurrentCardIdx(0);
    setIsFlipped(false);
  };

  const handleDeleteCard = (id) => {
    const updated = flashcards.filter(c => c.id !== id);
    if (onUpdateFlashcards) onUpdateFlashcards(updated);
    if (currentCardIdx >= updated.length) {
      setCurrentCardIdx(Math.max(0, updated.length - 1));
    }
    setIsFlipped(false);
  };

  const activeCard = flashcards[currentCardIdx] || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-neutral-950/95 border border-white/15 p-6 shadow-2xl text-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 font-sans">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-400/20 text-cyan-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Study Notebook & Flashcards</h3>
              <p className="text-[11px] text-slate-400">Distraction-free scratchpad and active recall memory decks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-black/50 border border-white/10 text-xs font-sans">
          <button
            onClick={() => setTab('notes')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl transition-all ${
              tab === 'notes' ? 'bg-white text-black font-semibold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Scratchpad Notes (#{currentSubject})</span>
          </button>

          <button
            onClick={() => setTab('flashcards')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl transition-all ${
              tab === 'flashcards' ? 'bg-cyan-400 text-black font-semibold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Active Recall Flashcards ({flashcards.length})</span>
          </button>
        </div>

        {/* Tab 1: Notes Scratchpad */}
        {tab === 'notes' && (
          <div className="space-y-2.5 font-sans">
            {/* Toolbar */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-400">
                Auto-saved in browser for subject: <strong className="text-amber-300">#{currentSubject}</strong>
              </span>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={insertTimestamp}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] border border-white/10"
                  title="Insert current timestamp"
                >
                  + Timestamp
                </button>

                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] border border-white/10 flex items-center space-x-1"
                  title="Copy notes to clipboard"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedToast ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Note Area */}
            <textarea
              value={noteContent}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Write your study reflections, code snippets, equations, or key ideas here..."
              rows={11}
              className="w-full p-4 rounded-2xl bg-neutral-900 border border-white/15 text-slate-100 placeholder-slate-500 text-xs sm:text-sm font-mono focus:outline-none focus:border-cyan-400 leading-relaxed resize-none shadow-inner"
            />
          </div>
        )}

        {/* Tab 2: Flashcards Deck */}
        {tab === 'flashcards' && (
          <div className="space-y-3 font-sans text-xs">
            {/* Top flashcard actions */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Card {flashcards.length > 0 ? currentCardIdx + 1 : 0} of {flashcards.length}
              </span>

              <button
                type="button"
                onClick={() => setIsAddingCard(!isAddingCard)}
                className="flex items-center space-x-1 px-3 py-1 rounded-xl bg-white text-black font-bold hover:bg-neutral-200 shadow"
              >
                <Plus className="w-3 h-3" />
                <span>New Flashcard</span>
              </button>
            </div>

            {/* Add Card Drawer */}
            {isAddingCard && (
              <form onSubmit={handleAddFlashcard} className="p-3.5 rounded-2xl bg-white/5 border border-white/15 space-y-2.5 animate-in slide-in-from-top-2">
                <input
                  type="text"
                  placeholder="Question / Concept / Term..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  autoFocus
                />
                <textarea
                  placeholder="Answer / Key explanation / Derivation..."
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400 resize-none"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingCard(false)}
                    className="px-3 py-1 rounded-xl text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 rounded-xl bg-cyan-400 text-black font-bold"
                  >
                    Save Card
                  </button>
                </div>
              </form>
            )}

            {/* The Active Flashcard Flip Card */}
            {activeCard ? (
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full h-56 rounded-3xl p-6 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border border-cyan-400/40 shadow-2xl flex flex-col justify-between cursor-pointer group transition-all duration-300 hover:border-cyan-300 relative overflow-hidden"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 font-medium">
                    {activeCard.subject || currentSubject}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                    {isFlipped ? 'ANSWER' : 'QUESTION (Click to flip)'}
                  </span>
                </div>

                <div className="text-center my-auto px-4">
                  <p className="text-sm sm:text-base font-medium text-white leading-relaxed">
                    {isFlipped ? activeCard.answer : activeCard.question}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/10">
                  <span>{isFlipped ? '↺ Click to see question' : 'Click card to reveal answer'}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCard(activeCard.id);
                    }}
                    className="p-1 text-slate-500 hover:text-rose-400"
                    title="Delete flashcard"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <Brain className="w-6 h-6 mx-auto mb-1 text-slate-500" />
                <p>No flashcards created yet.</p>
                <p className="text-[10px] text-slate-500">Click "+ New Flashcard" to create your first active recall card.</p>
              </div>
            )}

            {/* Prev / Next controls */}
            {flashcards.length > 1 && (
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentCardIdx((prev) => (prev - 1 + flashcards.length) % flashcards.length);
                  }}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs border border-white/10"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    try {
                      confetti({ particleCount: 30, spread: 45, origin: { y: 0.7 } });
                    } catch (e) {}
                    setIsFlipped(false);
                    setCurrentCardIdx((prev) => (prev + 1) % flashcards.length);
                  }}
                  className="flex items-center space-x-1 px-4 py-1.5 rounded-xl bg-cyan-400 text-black font-bold text-xs hover:bg-cyan-300 shadow"
                >
                  <span>Next Card</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-white/10 text-xs font-sans">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
