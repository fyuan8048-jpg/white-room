import React, { useState } from 'react';
import { 
  Plus, 
  Pin, 
  Trash2, 
  Search, 
  Lightbulb, 
  Copy, 
  Check, 
  Sparkles,
  X
} from 'lucide-react';

export default function BrainstormBoard({
  cards,
  onAddCard,
  onDeleteCard,
  onTogglePinCard,
  scene,
  onClose
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Idea');
  const [newColor, setNewColor] = useState('purple');
  const [copiedId, setCopiedId] = useState(null);

  const categories = ['all', 'Idea', 'Strategy', 'Observation', 'Concept', 'Notes'];

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    onAddCard({
      id: `card-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      color: newColor,
      pinned: false,
      createdAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    });

    setNewTitle('');
    setNewContent('');
    setIsAdding(false);
  };

  const copyCard = (card) => {
    navigator.clipboard.writeText(`${card.title}\n\n${card.content}`);
    setCopiedId(card.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCards = cards
    .filter((card) => {
      const matchSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          card.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'all' || card.category === selectedCategory;
      return matchSearch && matchCat;
    })
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="relative max-w-xl mx-auto rounded-3xl p-6 bg-black/75 border border-white/15 backdrop-blur-2xl text-slate-100 shadow-2xl flex flex-col max-h-[80vh]">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 font-sans">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-base text-white">Thoughts & Brainstorming</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-purple-300 border border-white/10">
                IDEAS
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Capture sudden concepts, strategies & thoughts</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white text-black font-sans font-bold text-xs hover:bg-neutral-200 transition-all shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
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

      {/* Search & Category Pills */}
      {cards.length > 0 && (
        <div className="my-3 space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search concepts or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-neutral-900 border border-white/10 text-white placeholder-slate-500 text-xs font-sans focus:outline-none focus:border-purple-400"
            />
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto p-1 rounded-xl bg-black/40 border border-white/10 text-xs font-sans">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-0.5 rounded-lg capitalize transition-all ${
                  selectedCategory === cat
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="my-3 p-4 rounded-2xl bg-black/70 border border-white/15 space-y-3 font-sans text-xs animate-in slide-in-from-top-2 duration-150">
          <input
            type="text"
            placeholder="Concept / Idea Title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
            autoFocus
          />

          <textarea
            rows={3}
            placeholder="Observations, brainstorm notes, or strategy details..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 resize-none font-sans text-xs leading-relaxed"
          />

          <div className="flex items-center justify-between">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-white/10 text-white text-xs font-sans focus:outline-none focus:border-purple-400"
            >
              <option value="Idea">Idea</option>
              <option value="Strategy">Strategy</option>
              <option value="Observation">Observation</option>
              <option value="Concept">Concept</option>
              <option value="Notes">Notes</option>
            </select>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-white text-black font-bold font-sans hover:bg-neutral-200"
              >
                Save Thought
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Cards List */}
      <div className="space-y-2 overflow-y-auto pr-1 flex-1 my-2">
        {filteredCards.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-sans text-xs space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-purple-300">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div className="text-white font-medium">No brainstorm notes yet</div>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Click "New Note" to capture your ideas, observations, or strategies during focus blocks.
            </p>
          </div>
        ) : (
          filteredCards.map((card) => (
            <div
              key={card.id}
              className="p-3.5 rounded-2xl border border-white/10 bg-white/5 hover:border-white/20 transition-all space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-xs text-white">
                    {card.title}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-sans bg-black/40 text-purple-300 border border-white/10">
                    {card.category}
                  </span>
                  {card.pinned && (
                    <Pin className="w-3 h-3 text-purple-400 fill-purple-400" />
                  )}
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => copyCard(card)}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                    title="Copy note"
                  >
                    {copiedId === card.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => onTogglePinCard(card.id)}
                    className={`p-1 transition-colors ${card.pinned ? 'text-purple-400' : 'text-slate-400 hover:text-white'}`}
                    title="Pin"
                  >
                    <Pin className={`w-3.5 h-3.5 ${card.pinned ? 'fill-purple-400' : ''}`} />
                  </button>
                  <button
                    onClick={() => onDeleteCard(card.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-200/90 leading-relaxed font-sans whitespace-pre-wrap">
                {card.content}
              </p>

              <div className="text-[10px] text-slate-500 font-mono pt-1">
                {card.createdAt}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
