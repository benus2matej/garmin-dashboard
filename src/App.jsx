import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Moon, 
  Activity, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Plus, 
  Calendar, 
  Award, 
  ChevronRight,
  Info
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// Initial 7-Day Baseline Data
const initialHistory = [
  { date: '10-14', hrv: 54, hrv7d: 56, sleep: 72, deep: 68, rem: 85, readiness: 62, restingHr: 54, workoutDone: true, workoutType: 'Easy Short Run' },
  { date: '10-15', hrv: 58, hrv7d: 56, sleep: 78, deep: 82, rem: 102, readiness: 74, restingHr: 53, workoutDone: true, workoutType: 'Heavy 3-Set Calisthenics' },
  { date: '10-16', hrv: 55, hrv7d: 56, sleep: 64, deep: 45, rem: 70, readiness: 58, restingHr: 55, workoutDone: false, workoutType: 'Rest Day' },
  { date: '10-17', hrv: 62, hrv7d: 57, sleep: 84, deep: 95, rem: 110, readiness: 82, restingHr: 51, workoutDone: true, workoutType: 'Nordic Subthreshold Run' },
  { date: '10-18', hrv: 60, hrv7d: 58, sleep: 80, deep: 88, rem: 105, readiness: 79, restingHr: 52, workoutDone: true, workoutType: 'Light 2-Set Calisthenics' },
  { date: '10-19', hrv: 59, hrv7d: 58, sleep: 75, deep: 70, rem: 92, readiness: 71, restingHr: 53, workoutDone: false, workoutType: 'Rest Day' },
  { date: '10-20', hrv: 64, hrv7d: 59, sleep: 88, deep: 102, rem: 125, readiness: 86, restingHr: 50, workoutDone: true, workoutType: 'Easy Long Run' },
];

export default function App() {
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('garmin_dashboard_history');
    return saved ? JSON.parse(saved) : initialHistory;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const latest = history[history.length - 1];

  // Persist to LocalStorage
  useEffect(() => {
    localStorage.setItem('garmin_dashboard_history', JSON.stringify(history));
  }, [history]);

  // New Log Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(5, 10),
    hrv: 62,
    sleep: 82,
    deep: 90,
    rem: 110,
    readiness: 80,
    restingHr: 51,
    workoutDone: true,
    workoutType: 'Easy Short Run'
  });

  // Calculate 7-Day HRV Average
  const current7dHrvAvg = Math.round(
    history.slice(-7).reduce((acc, curr) => acc + Number(curr.hrv), 0) / Math.min(history.length, 7)
  );

  // Trend Trajectory Evaluator
  const hrvDiff = latest.hrv - current7dHrvAvg;
  const getTrendStatus = () => {
    if (hrvDiff <= -4 || latest.readiness < 60) return 'falling';
    if (hrvDiff >= 3 && latest.readiness >= 78) return 'improving';
    return 'steady';
  };
  const trendStatus = getTrendStatus();

  // Adaptive Fitness Coach Advice Engine
  const getCoachAdvice = () => {
    if (trendStatus === 'falling') {
      return {
        title: 'Priority Active Recovery Needed',
        recommendation: 'Your HRV trajectory is dipping below baseline. Shift today to active recovery or an Easy Short Run.',
        targetWorkout: 'Rest Day or Light 2-Set Calisthenics',
        tagColor: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
        badge: 'Protect Baseline'
      };
    }
    if (trendStatus === 'improving') {
      return {
        title: 'Optimal Adaptive Window — High Readiness',
        recommendation: 'Recovery markers are trending upward. High readiness window open for intensity.',
        targetWorkout: 'Nordic Subthreshold Run or Heavy 3-Set Calisthenics',
        tagColor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
        badge: 'High Performance Window'
      };
    }
    return {
      title: 'Steady Aerobic Maintenance',
      recommendation: 'Biometrics are stable and on target. Maintain your scheduled 5-session weekly cadence.',
      targetWorkout: 'Easy Short Run or Light 2-Set Calisthenics',
      tagColor: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
      badge: 'Maintain Cadence'
    };
  };

  const coach = getCoachAdvice();

  // Traffic Light Badge Component
  const TrafficBadge = ({ value, thresholds, label }) => {
    let colorClass = 'bg-red-500/20 text-red-300 border-red-500/30';
    let statusText = 'Not Good';

    if (value >= thresholds.good) {
      colorClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      statusText = 'Optimal';
    } else if (value >= thresholds.ok) {
      colorClass = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      statusText = 'Moderate';
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {label || statusText}
      </span>
    );
  };

  const handleAddLog = (e) => {
    e.preventDefault();
    const newEntry = {
      ...formData,
      hrv: Number(formData.hrv),
      sleep: Number(formData.sleep),
      deep: Number(formData.deep),
      rem: Number(formData.rem),
      readiness: Number(formData.readiness),
      restingHr: Number(formData.restingHr),
      hrv7d: current7dHrvAvg
    };
    setHistory([...history, newEntry]);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0d1110] text-[#fbf9f5] font-sans antialiased p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-[#2c3531] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#fbf9f5]">Garmin Sovereign Readout</h1>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#2c3531] text-[#8a9a86] border border-[#2c3531]">
              Live Vault Sync
            </span>
          </div>
          <p className="text-sm text-[#8a9a86] mt-1">
            Biometric trends, readiness metrics, and adaptive workout prescribing.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-[#c86d51] hover:bg-[#b25a40] text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Log Today's Entry
        </button>
      </header>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* HRV Card */}
        <div className="bg-[#161c1a] border border-[#2c3531] rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-[#8a9a86] tracking-wider uppercase">HRV Status</span>
            <Heart className="w-5 h-5 text-[#c86d51]" />
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-3xl font-bold">{latest.hrv} <span className="text-sm text-[#8a9a86] font-normal">ms</span></span>
            <TrafficBadge value={latest.hrv} thresholds={{ good: 60, ok: 50 }} />
          </div>
          <div className="text-xs text-[#8a9a86] flex items-center justify-between border-t border-[#2c3531] pt-3 mt-2">
            <span>7-Day Rolling Avg:</span>
            <span className="font-semibold text-[#fbf9f5]">{current7dHrvAvg} ms</span>
          </div>
        </div>

        {/* Sleep Score Card */}
        <div className="bg-[#161c1a] border border-[#2c3531] rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-[#8a9a86] tracking-wider uppercase">Sleep Quality</span>
            <Moon className="w-5 h-5 text-[#8a9a86]" />
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-3xl font-bold">{latest.sleep} <span className="text-sm text-[#8a9a86] font-normal">/100</span></span>
            <TrafficBadge value={latest.sleep} thresholds={{ good: 80, ok: 65 }} />
          </div>
          <div className="text-xs text-[#8a9a86] border-t border-[#2c3531] pt-3 mt-2 flex justify-between">
            <span>Deep: <strong className="text-[#fbf9f5]">{latest.deep}m</strong></span>
            <span>REM: <strong className="text-[#fbf9f5]">{latest.rem}m</strong></span>
          </div>
        </div>

        {/* Training Readiness Card */}
        <div className="bg-[#161c1a] border border-[#2c3531] rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-[#8a9a86] tracking-wider uppercase">Readiness</span>
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-3xl font-bold">{latest.readiness} <span className="text-sm text-[#8a9a86] font-normal">/100</span></span>
            <TrafficBadge value={latest.readiness} thresholds={{ good: 75, ok: 60 }} />
          </div>
          <div className="text-xs text-[#8a9a86] flex items-center justify-between border-t border-[#2c3531] pt-3 mt-2">
            <span>Trajectory:</span>
            <span className="capitalize font-semibold text-[#fbf9f5] flex items-center gap-1">
              {trendStatus === 'improving' && <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
              {trendStatus === 'falling' && <TrendingDown className="w-3.5 h-3.5 text-amber-400" />}
              {trendStatus === 'steady' && <Minus className="w-3.5 h-3.5 text-blue-400" />}
              {trendStatus}
            </span>
          </div>
        </div>

        {/* Resting Heart Rate Card */}
        <div className="bg-[#161c1a] border border-[#2c3531] rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-[#8a9a86] tracking-wider uppercase">Resting HR</span>
            <Activity className="w-5 h-5 text-[#8a9a86]" />
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-3xl font-bold">{latest.restingHr} <span className="text-sm text-[#8a9a86] font-normal">bpm</span></span>
            <TrafficBadge value={60 - latest.restingHr} thresholds={{ good: 8, ok: 0 }} label={latest.restingHr <= 53 ? 'Optimal' : 'Elevated'} />
          </div>
          <div className="text-xs text-[#8a9a86] flex items-center justify-between border-t border-[#2c3531] pt-3 mt-2">
            <span>Cardiovascular Baseline:</span>
            <span className="font-semibold text-[#fbf9f5]">Stable</span>
          </div>
        </div>
      </div>

      {/* Adaptive Fitness Coach Panel */}
      <section className="bg-[#161c1a] border border-[#2c3531] rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2c3531] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#c86d51]/10 text-[#c86d51]">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#8a9a86] uppercase tracking-wider">Adaptive Coach Prescription</span>
              <h2 className="text-xl font-serif font-bold text-[#fbf9f5]">{coach.title}</h2>
            </div>
          </div>
          <span className={`self-start md:self-auto px-3 py-1 rounded-full text-xs font-semibold border ${coach.tagColor}`}>
            {coach.badge}
          </span>
        </div>

        <p className="text-sm text-[#8a9a86] mb-6 leading-relaxed">
          {coach.recommendation}
        </p>

        {/* Workout Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0d1110] border border-[#2c3531] rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-[#8a9a86] uppercase">Prescribed Session Focus</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#c86d51]/20 text-[#c86d51]">Target</span>
            </div>
            <p className="text-base font-semibold text-[#fbf9f5]">{coach.targetWorkout}</p>
          </div>

          <div className="bg-[#0d1110] border border-[#2c3531] rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-[#8a9a86] uppercase">Weekly Target Structure (5/wk)</span>
              <span className="text-xs text-[#8a9a86]">3 Runs | 2 Calisthenics</span>
            </div>
            <p className="text-xs text-[#8a9a86] leading-relaxed">
              • Runs: Easy Short, Easy Long (&le;90m), Nordic Subthreshold (8-12x5m)<br/>
              • Calisthenics: Heavy 3-Set Session &amp; Light 2-Set Session
            </p>
          </div>
        </div>
      </section>

      {/* Biometrics Trend Chart */}
      <section className="bg-[#161c1a] border border-[#2c3531] rounded-2xl p-6 mb-8 shadow-sm">
        <h3 className="text-lg font-serif font-bold text-[#fbf9f5] mb-4">7-Day Biometric Trajectory</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2c3531" />
              <XAxis dataKey="date" stroke="#8a9a86" tick={{ fill: '#8a9a86', fontSize: 12 }} />
              <YAxis stroke="#8a9a86" tick={{ fill: '#8a9a86', fontSize: 12 }} domain={[40, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#161c1a', borderColor: '#2c3531', borderRadius: '12px', color: '#fbf9f5' }}
              />
              <Line type="monotone" dataKey="hrv" name="HRV (ms)" stroke="#c86d51" strokeWidth={2.5} dot={{ fill: '#c86d51' }} />
              <Line type="monotone" dataKey="readiness" name="Readiness" stroke="#eab308" strokeWidth={2} dot={{ fill: '#eab308' }} />
              <Line type="monotone" dataKey="sleep" name="Sleep Score" stroke="#8a9a86" strokeWidth={2} dot={{ fill: '#8a9a86' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Monthly Workout & Rest Calendar */}
      <section className="bg-[#161c1a] border border-[#2c3531] rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b border-[#2c3531] pb-4">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#fbf9f5]">Training Calendar & Log</h3>
            <p className="text-xs text-[#8a9a86]">Green = Completed Session | Orange = Rest Day</p>
          </div>
          <Calendar className="w-5 h-5 text-[#8a9a86]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {history.map((item, idx) => (
            <div 
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                item.workoutDone 
                  ? 'border-emerald-500/30 bg-emerald-500/5' 
                  : 'border-amber-500/30 bg-amber-500/5'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-[#8a9a86]">{item.date}</span>
                <span className={`w-2.5 h-2.5 rounded-full ${item.workoutDone ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              </div>
              <p className="text-sm font-semibold text-[#fbf9f5] truncate">{item.workoutType}</p>
              <div className="flex justify-between text-xs text-[#8a9a86] mt-3 border-t border-[#2c3531] pt-2">
                <span>HRV: {item.hrv}</span>
                <span>Readiness: {item.readiness}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Logging Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#161c1a] border border-[#2c3531] rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-serif font-bold mb-4">Log Daily Garmin Biometrics</h3>
            <form onSubmit={handleAddLog} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#8a9a86] mb-1">Date</label>
                  <input 
                    type="text" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-[#0d1110] border border-[#2c3531] rounded-lg p-2 text-sm text-[#fbf9f5]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8a9a86] mb-1">HRV (ms)</label>
                  <input 
                    type="number" 
                    value={formData.hrv}
                    onChange={(e) => setFormData({...formData, hrv: e.target.value})}
                    className="w-full bg-[#0d1110] border border-[#2c3531] rounded-lg p-2 text-sm text-[#fbf9f5]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#8a9a86] mb-1">Sleep Score (/100)</label>
                  <input 
                    type="number" 
                    value={formData.sleep}
                    onChange={(e) => setFormData({...formData, sleep: e.target.value})}
                    className="w-full bg-[#0d1110] border border-[#2c3531] rounded-lg p-2 text-sm text-[#fbf9f5]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8a9a86] mb-1">Readiness (/100)</label>
                  <input 
                    type="number" 
                    value={formData.readiness}
                    onChange={(e) => setFormData({...formData, readiness: e.target.value})}
                    className="w-full bg-[#0d1110] border border-[#2c3531] rounded-lg p-2 text-sm text-[#fbf9f5]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#8a9a86] mb-1">Deep Sleep (mins)</label>
                  <input 
                    type="number" 
                    value={formData.deep}
                    onChange={(e) => setFormData({...formData, deep: e.target.value})}
                    className="w-full bg-[#0d1110] border border-[#2c3531] rounded-lg p-2 text-sm text-[#fbf9f5]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8a9a86] mb-1">REM Sleep (mins)</label>
                  <input 
                    type="number" 
                    value={formData.rem}
                    onChange={(e) => setFormData({...formData, rem: e.target.value})}
                    className="w-full bg-[#0d1110] border border-[#2c3531] rounded-lg p-2 text-sm text-[#fbf9f5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#8a9a86] mb-1">Workout Type</label>
                <select 
                  value={formData.workoutType}
                  onChange={(e) => setFormData({
                    ...formData, 
                    workoutType: e.target.value,
                    workoutDone: e.target.value !== 'Rest Day'
                  })}
                  className="w-full bg-[#0d1110] border border-[#2c3531] rounded-lg p-2 text-sm text-[#fbf9f5]"
                >
                  <option value="Easy Short Run">Easy Short Run</option>
                  <option value="Easy Long Run">Easy Long Run (&le;90m)</option>
                  <option value="Nordic Subthreshold Run">Nordic Subthreshold Run</option>
                  <option value="Heavy 3-Set Calisthenics">Heavy 3-Set Calisthenics</option>
                  <option value="Light 2-Set Calisthenics">Light 2-Set Calisthenics</option>
                  <option value="Rest Day">Rest Day</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-[#2c3531] hover:bg-[#3a4440] text-[#fbf9f5] py-2 rounded-xl text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-[#c86d51] hover:bg-[#b25a40] text-white py-2 rounded-xl text-sm font-medium"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
