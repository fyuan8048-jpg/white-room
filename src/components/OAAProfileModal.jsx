import React, { useState } from 'react';
import { 
  X, 
  Award, 
  Brain, 
  Zap, 
  Users, 
  Edit3, 
  Clock, 
  CheckCircle2, 
  Flame,
  ShieldCheck, 
  Sliders, 
  RotateCcw, 
  Sparkles, 
  Save,
  Plus,
  Trash2,
  Calendar,
  BarChart2,
  Check
} from 'lucide-react';
import { getFocusSummary } from '../utils/focusStats';

const DEFAULT_METRICS = [
  {
    id: 'academic',
    label: 'Academic Ability (学力)',
    desc: 'Cognitive throughput, mathematical logic & study hours',
    value: 95,
    weight: 35,
    color: 'text-cyan-400',
    bar: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'adaptability',
    label: 'Adaptability & Strategy (適応力)',
    desc: 'Problem solving, tactical decisions & adaptability',
    value: 94,
    weight: 25,
    color: 'text-amber-400',
    bar: 'from-amber-500 to-orange-500'
  },
  {
    id: 'physical',
    label: 'Discipline & Stamina (体力)',
    desc: 'Focus persistence, stamina & daily streaks',
    value: 92,
    weight: 25,
    color: 'text-emerald-400',
    bar: 'from-emerald-500 to-teal-500'
  },
  {
    id: 'social',
    label: 'Social & Contribution (社会貢献度)',
    desc: 'Session reflections logged and team coordination',
    value: 75,
    weight: 15,
    color: 'text-purple-400',
    bar: 'from-purple-500 to-pink-500'
  }
];

export default function OAAProfileModal({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  focusStats
}) {
  if (!isOpen) return null;

  // Local editable dossier fields
  const [studentName, setStudentName] = useState(profile.studentName || 'Ayanokoji Kiyotaka');
  const [studentId, setStudentId] = useState(profile.studentId || 'WR-GEN4-401');
  const [generation, setGeneration] = useState(profile.generation || '4th Generation Curriculum');
  const [status, setStatus] = useState(profile.status || 'Masterpiece');
  const [classRank, setClassRank] = useState(profile.classRank || 'Class 1-D / Rank S');

  // Dynamic OAA Parameters list
  const [metrics, setMetrics] = useState(() => {
    if (profile.customMetrics && profile.customMetrics.length > 0) {
      return profile.customMetrics;
    }
    // Backward compatibility with legacy fixed 4 values
    if (profile.oaa) {
      return DEFAULT_METRICS.map(m => ({
        ...m,
        value: profile.oaa[m.id] !== undefined ? profile.oaa[m.id] : m.value
      }));
    }
    return DEFAULT_METRICS;
  });

  // State for adding a new custom parameter
  const [isAddingMetric, setIsAddingMetric] = useState(false);
  const [newMetricLabel, setNewMetricLabel] = useState('');
  const [newMetricDesc, setNewMetricDesc] = useState('');
  const [newMetricWeight, setNewMetricWeight] = useState(20);
  const [newMetricValue, setNewMetricValue] = useState(80);

  // State for editing an existing parameter details (name, desc, weight)
  const [editingMetricId, setEditingMetricId] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editWeight, setEditWeight] = useState(25);

  // Calculate real focus stats for today & calendar streak
  const summary = getFocusSummary(focusStats);

  // Dynamic Grade & Weighted Score calculation based on all current metrics
  const calculateEvaluation = () => {
    if (metrics.length === 0) return { score: 0, grade: 'N/A' };

    const totalWeight = metrics.reduce((acc, m) => acc + (Number(m.weight) || 1), 0);
    const weightedSum = metrics.reduce((acc, m) => acc + (Number(m.value) || 0) * (Number(m.weight) || 1), 0);
    const score = Math.round(weightedSum / (totalWeight || 1));

    let grade = 'B';
    if (score >= 95) grade = 'S';
    else if (score >= 90) grade = 'A+';
    else if (score >= 85) grade = 'A';
    else if (score >= 80) grade = 'B+';
    else if (score >= 70) grade = 'B';
    else if (score >= 60) grade = 'C';
    else grade = 'D';

    return { score, grade, totalWeight };
  };

  const evaluation = calculateEvaluation();

  // Metric value slider change
  const handleSliderChange = (id, val) => {
    setMetrics(metrics.map(m => m.id === id ? { ...m, value: val } : m));
  };

  // Add new parameter
  const handleAddMetricSubmit = (e) => {
    e.preventDefault();
    if (!newMetricLabel.trim()) return;

    const colors = [
      { color: 'text-amber-400', bar: 'from-amber-500 to-orange-500' },
      { color: 'text-cyan-400', bar: 'from-cyan-500 to-blue-500' },
      { color: 'text-emerald-400', bar: 'from-emerald-500 to-teal-500' },
      { color: 'text-purple-400', bar: 'from-purple-500 to-pink-500' },
      { color: 'text-rose-400', bar: 'from-rose-500 to-red-500' }
    ];
    const picked = colors[metrics.length % colors.length];

    const newParam = {
      id: `param-${Date.now()}`,
      label: newMetricLabel.trim(),
      desc: newMetricDesc.trim() || 'Custom evaluated ability parameter',
      weight: Number(newMetricWeight) || 20,
      value: Number(newMetricValue) || 80,
      color: picked.color,
      bar: picked.bar,
      isCustom: true
    };

    setMetrics([...metrics, newParam]);
    setNewMetricLabel('');
    setNewMetricDesc('');
    setNewMetricWeight(20);
    setNewMetricValue(80);
    setIsAddingMetric(false);
  };

  // Start editing a metric
  const startEditMetric = (m) => {
    setEditingMetricId(m.id);
    setEditLabel(m.label);
    setEditDesc(m.desc);
    setEditWeight(m.weight);
  };

  const saveEditMetric = () => {
    setMetrics(metrics.map(m => {
      if (m.id === editingMetricId) {
        return {
          ...m,
          label: editLabel.trim() || m.label,
          desc: editDesc.trim() || m.desc,
          weight: Number(editWeight) || 10
        };
      }
      return m;
    }));
    setEditingMetricId(null);
  };

  // Delete metric
  const handleDeleteMetric = (id) => {
    if (metrics.length <= 1) return; // Keep at least one metric
    setMetrics(metrics.filter(m => m.id !== id));
  };

  // Save all profile changes
  const handleSave = () => {
    onUpdateProfile({
      ...profile,
      studentName: studentName.trim() || 'Ayanokoji Kiyotaka',
      studentId: studentId.trim() || 'WR-GEN4-401',
      generation: generation.trim() || '4th Generation Curriculum',
      status: status.trim() || 'Masterpiece',
      classRank: classRank.trim() || 'Class 1-D / Rank S',
      customMetrics: metrics,
      oaa: {
        overallScore: evaluation.score,
        overall: evaluation.grade
      }
    });
    onClose();
  };

  // Presets
  const applyPreset = (presetName) => {
    if (presetName === 'ayanokoji') {
      setStudentName('Ayanokoji Kiyotaka');
      setStudentId('WR-GEN4-401');
      setGeneration('4th Generation Demonic Curriculum');
      setStatus('Masterpiece');
      setClassRank('Rank S');
      setMetrics([
        { id: 'academic', label: 'Academic Ability (学力)', desc: 'Cognitive throughput, mathematical logic & study hours', value: 99, weight: 35, color: 'text-cyan-400', bar: 'from-cyan-500 to-blue-500' },
        { id: 'adaptability', label: 'Adaptability & Strategy (適応力)', desc: 'Problem solving, tactical decisions & adaptability', value: 98, weight: 25, color: 'text-amber-400', bar: 'from-amber-500 to-orange-500' },
        { id: 'physical', label: 'Discipline & Martial Arts (体力)', desc: 'Focus persistence, stamina & physical reflexes', value: 97, weight: 25, color: 'text-emerald-400', bar: 'from-emerald-500 to-teal-500' },
        { id: 'social', label: 'Social & Observation (社会貢献度)', desc: 'Calculated aloofness and discreet social manipulation', value: 65, weight: 15, color: 'text-purple-400', bar: 'from-purple-500 to-pink-500' }
      ]);
    } else if (presetName === 'horikita') {
      setStudentName('Horikita Suzune');
      setStudentId('ANHS-CLASS-1D-02');
      setGeneration('Class 1-D Student Council President');
      setStatus('Honor Scholar');
      setClassRank('Rank A');
      setMetrics([
        { id: 'academic', label: 'Academic Ability (学力)', desc: 'Cognitive throughput, mathematical logic & study hours', value: 92, weight: 35, color: 'text-cyan-400', bar: 'from-cyan-500 to-blue-500' },
        { id: 'adaptability', label: 'Tactical Leadership (統率力)', desc: 'Class unification and strategy formulation', value: 84, weight: 25, color: 'text-amber-400', bar: 'from-amber-500 to-orange-500' },
        { id: 'physical', label: 'Discipline & Martial Arts (体力)', desc: 'Focus persistence, aikido and endurance', value: 85, weight: 25, color: 'text-emerald-400', bar: 'from-emerald-500 to-teal-500' },
        { id: 'social', label: 'Cooperation & Empathy (社会性)', desc: 'Developing peer trust and student leadership', value: 76, weight: 15, color: 'text-purple-400', bar: 'from-purple-500 to-pink-500' }
      ]);
    }
  };

  // Format minutes into clean hours/mins
  const formatMins = (mins) => {
    if (!mins) return '0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-neutral-950/95 border border-white/15 p-6 shadow-2xl text-slate-100 space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 font-sans">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">White Room OAA Student Dossier</h3>
              <p className="text-[11px] text-slate-400">Classroom of the Elite Advanced Assessment & Daily Focus Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: Real Daily Focus Time & Streak Analytics (Not dummy!) */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3 font-sans">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-white flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Real Daily Focus Performance</span>
            </div>
            <span className="text-[10px] text-amber-300/80 font-mono">Live Tracking</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
              <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>Today's Focus</span>
              </div>
              <div className="text-sm font-bold text-white mt-1">
                {formatMins(summary.todayFocusMinutes)}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
              <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Today's Pomodoros</span>
              </div>
              <div className="text-sm font-bold text-white mt-1">
                {summary.todayPomodoros} <span className="text-xs text-slate-400 font-normal">sessions</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
              <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>Active Streak</span>
              </div>
              <div className="text-sm font-bold text-amber-300 mt-1 flex items-center space-x-1">
                <span>{summary.currentStreak}</span>
                <span className="text-xs text-slate-400 font-normal">days</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
              <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                <Award className="w-3 h-3 text-purple-400" />
                <span>All-Time Focus</span>
              </div>
              <div className="text-sm font-bold text-white mt-1">
                {formatMins(summary.totalFocusMinutes)}
              </div>
            </div>
          </div>

          {/* 7-Day Activity Mini Bar Chart */}
          <div className="pt-2 border-t border-white/5">
            <div className="text-[10px] text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Last 7 Days Focus Distribution</span>
              <span className="text-slate-500 font-mono">Real Activity History</span>
            </div>
            <div className="grid grid-cols-7 gap-1.5 h-14 items-end">
              {summary.last7Days.map((d) => {
                const maxMins = Math.max(...summary.last7Days.map(x => x.focusMinutes), 60);
                const heightPct = Math.max(8, Math.round((d.focusMinutes / maxMins) * 100));
                return (
                  <div key={d.dateStr} className="flex flex-col items-center h-full justify-end group">
                    <div 
                      className={`w-full rounded-md transition-all ${
                        d.isToday 
                          ? 'bg-amber-400 shadow-md shadow-amber-400/20' 
                          : d.focusMinutes > 0 ? 'bg-cyan-500/70 hover:bg-cyan-400' : 'bg-white/10'
                      }`}
                      style={{ height: `${heightPct}%` }}
                      title={`${d.dayLabel} (${d.dateStr}): ${d.focusMinutes} mins, ${d.pomodoros} pomodoros`}
                    />
                    <span className={`text-[9px] mt-1 font-mono ${d.isToday ? 'text-amber-300 font-bold' : 'text-slate-500'}`}>
                      {d.dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 2: Student Dossier Profile Card */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 font-sans">
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
              <span className="text-2xl font-serif font-black text-amber-300">
                {studentName.charAt(0) || 'A'}
              </span>
              <div className="absolute bottom-0 inset-x-0 h-1 bg-amber-400" />
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Student Name"
                  className="font-bold text-base text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-amber-400 focus:outline-none transition-colors px-0.5"
                />
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Student ID"
                  className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-amber-400 focus:outline-none text-[11px] text-amber-300 font-mono w-28"
                />
                <span>•</span>
                <input
                  type="text"
                  value={classRank}
                  onChange={(e) => setClassRank(e.target.value)}
                  placeholder="Class Rank"
                  className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-amber-400 focus:outline-none text-[11px] text-slate-300 w-32"
                />
              </div>
            </div>
          </div>

          {/* OAA Overall Calculated Grade Stamp */}
          <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-black/60 border border-white/10">
            <div className="text-right font-sans">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">OAA Overall Rating</div>
              <div className="text-xs text-amber-300 font-mono font-semibold">
                Score: {evaluation.score} / 100
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-black flex items-center justify-center font-black text-2xl shadow-lg">
              {evaluation.grade}
            </div>
          </div>
        </div>

        {/* Section 3: Fully Customizable OAA Parameters & Fields */}
        <div className="space-y-3 font-sans">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>OAA Evaluation Parameters ({metrics.length})</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsAddingMetric(!isAddingMetric)}
                className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-xs font-semibold border border-amber-400/30 flex items-center space-x-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Parameter</span>
              </button>
            </div>
          </div>

          {/* Inline Add Parameter Drawer */}
          {isAddingMetric && (
            <form onSubmit={handleAddMetricSubmit} className="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/20 space-y-2.5 animate-in fade-in">
              <div className="font-bold text-xs text-amber-300 flex items-center space-x-1">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom OAA Parameter</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Parameter Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chess & Tactical Foresight"
                    value={newMetricLabel}
                    onChange={(e) => setNewMetricLabel(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Weight % (Relative Importance)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newMetricWeight}
                    onChange={(e) => setNewMetricWeight(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Description / Directive</label>
                <input
                  type="text"
                  placeholder="e.g. Evaluation of strategic foresight, pattern recognition & speed"
                  value={newMetricDesc}
                  onChange={(e) => setNewMetricDesc(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center space-x-3 pt-1">
                <div className="flex-1 flex items-center space-x-2">
                  <span className="text-[10px] text-slate-400">Initial Score:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newMetricValue}
                    onChange={(e) => setNewMetricValue(Number(e.target.value))}
                    className="flex-1 accent-amber-400 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-amber-300 w-8 text-right">
                    {newMetricValue}
                  </span>
                </div>

                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-all flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Metric</span>
                </button>
              </div>
            </form>
          )}

          {/* List of Parameters with interactive sliders */}
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {metrics.map((m) => {
              const isEditing = editingMetricId === m.id;
              return (
                <div 
                  key={m.id} 
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-white/15 transition-all space-y-2"
                >
                  {isEditing ? (
                    <div className="space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] text-slate-400 block">Parameter Name</label>
                          <input
                            type="text"
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            className="w-full px-2 py-1 rounded-lg bg-neutral-900 border border-white/20 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-400 block">Weight %</label>
                          <input
                            type="number"
                            value={editWeight}
                            onChange={(e) => setEditWeight(e.target.value)}
                            className="w-full px-2 py-1 rounded-lg bg-neutral-900 border border-white/20 text-white text-xs font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-400 block">Description</label>
                        <input
                          type="text"
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          className="w-full px-2 py-1 rounded-lg bg-neutral-900 border border-white/20 text-white text-xs"
                        />
                      </div>
                      <div className="flex justify-end space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingMetricId(null)}
                          className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={saveEditMetric}
                          className="px-3 py-1 rounded-lg bg-amber-400 text-black font-bold text-xs flex items-center space-x-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Save Field</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="overflow-hidden">
                          <div className="font-semibold text-white text-xs flex items-center space-x-2">
                            <span className={m.color}>{m.label}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-slate-400 font-mono">
                              weight: {m.weight}%
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-sm">
                            {m.desc}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => startEditMetric(m)}
                            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                            title="Edit parameter details & weight"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {metrics.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteMetric(m.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10"
                              title="Delete parameter"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Score Slider */}
                      <div className="flex items-center space-x-3">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={m.value}
                          onChange={(e) => handleSliderChange(m.id, Number(e.target.value))}
                          className="flex-1 accent-amber-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                        />
                        <div className="w-12 text-right">
                          <span className={`text-sm font-mono font-bold ${m.color}`}>
                            {m.value}
                          </span>
                          <span className="text-[10px] text-slate-500">/100</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Presets & Save Footer */}
        <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-sans">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-slate-400 text-[11px]">Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset('ayanokoji')}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10 transition-colors"
            >
              Ayanokoji
            </button>
            <button
              type="button"
              onClick={() => applyPreset('horikita')}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10 transition-colors"
            >
              Horikita
            </button>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-white text-black font-bold hover:bg-neutral-200 transition-all flex items-center space-x-1.5 shadow-lg"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Apply Dossier</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
