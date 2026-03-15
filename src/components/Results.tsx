import React, { useEffect, useState } from 'react';
import { useTypingStore } from '../store/useTypingStore';
import { useAuthStore } from '../store/useAuthStore';
import { RefreshCcw, ChevronRight, BrainCircuit, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';

const fingerMap: Record<string, string> = {
  'q': 'Left Pinky', 'a': 'Left Pinky', 'z': 'Left Pinky', '1': 'Left Pinky', '2': 'Left Pinky',
  'w': 'Left Ring', 's': 'Left Ring', 'x': 'Left Ring', '3': 'Left Ring',
  'e': 'Left Middle', 'd': 'Left Middle', 'c': 'Left Middle', '4': 'Left Middle',
  'r': 'Left Index', 'f': 'Left Index', 'v': 'Left Index', 't': 'Left Index', 'g': 'Left Index', 'b': 'Left Index', '5': 'Left Index', '6': 'Left Index',
  'y': 'Right Index', 'h': 'Right Index', 'n': 'Right Index', 'u': 'Right Index', 'j': 'Right Index', 'm': 'Right Index', '7': 'Right Index', '8': 'Right Index',
  'i': 'Right Middle', 'k': 'Right Middle', ',': 'Right Middle', '9': 'Right Middle',
  'o': 'Right Ring', 'l': 'Right Ring', '.': 'Right Ring', '0': 'Right Ring',
  'p': 'Right Pinky', ';': 'Right Pinky', '/': 'Right Pinky', '-': 'Right Pinky', '=': 'Right Pinky', '[': 'Right Pinky', ']': 'Right Pinky', '\'': 'Right Pinky'
};

const Results: React.FC = () => {
  const store = useTypingStore();
  const { user, token } = useAuthStore();
  const [saved, setSaved] = useState(false);
  
  const elapsed = store.endTime && store.startTime ? (store.endTime - store.startTime) / 1000 : store.duration;
  
  // Use the final metrics calculated by the engine
  const wpm = store.liveWpm;
  const rawWpm = store.liveRawWpm;
  const accuracy = store.liveAccuracy;

  // Calculate consistency (Monkeytype style)
  const wpmSamples = store.wpmHistory.map(h => h.wpm).filter(w => w > 0);
  let consistency = 0;
  if (wpmSamples.length > 1) {
    const mean = wpmSamples.reduce((a, b) => a + b, 0) / wpmSamples.length;
    const variance = wpmSamples.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / wpmSamples.length;
    const stdDev = Math.sqrt(variance);
    consistency = Math.max(0, Math.round(100 * (1 - (stdDev / mean))));
  } else if (wpmSamples.length === 1) {
    consistency = 100;
  }

  const mistypedEntries = Object.entries(store.mistypedChars)
    .filter(([char]) => char !== 'extra')
    .sort((a, b) => b[1] - a[1]);

  const weakFingers: Record<string, number> = {};
  mistypedEntries.forEach(([char, count]) => {
    const finger = fingerMap[char.toLowerCase()];
    if (finger) {
      weakFingers[finger] = (weakFingers[finger] || 0) + count;
    }
  });

  const worstFinger = Object.entries(weakFingers).sort((a, b) => b[1] - a[1])[0];

  const handlePractice = () => {
    const charsToPractice = mistypedEntries.slice(0, 5).map(([char]) => char);
    store.startPracticeMode(charsToPractice);
  };

  useEffect(() => {
    if (user && token && !saved && wpm > 0) {
      fetch('/api/tests/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          wpm,
          rawWpm,
          accuracy,
          errors: store.errors,
          duration: Math.round(elapsed),
          mode: store.mode,
          details: store.wpmHistory
        })
      }).then(res => {
        if (res.ok) setSaved(true);
      }).catch(console.error);
    }
  }, [user, token, saved, wpm, rawWpm, accuracy, store.errors, elapsed, store.mode, store.wpmHistory]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto min-h-[80vh] animate-in fade-in slide-in-from-bottom-4 duration-500 px-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12 w-full">
        <div className="text-center md:text-left">
          <div className="text-zinc-500 text-2xl mb-1 font-mono">wpm</div>
          <div className="text-emerald-400 text-6xl font-mono font-bold">{wpm}</div>
        </div>
        <div className="text-center md:text-left">
          <div className="text-zinc-500 text-2xl mb-1 font-mono">acc</div>
          <div className="text-emerald-400 text-6xl font-mono font-bold">{accuracy}%</div>
        </div>
        <div className="text-center md:text-left">
          <div className="text-zinc-500 text-xl mb-1 font-mono">raw</div>
          <div className="text-zinc-200 text-4xl font-mono">{rawWpm}</div>
        </div>
        <div className="text-center md:text-left">
          <div className="text-zinc-500 text-xl mb-1 font-mono">consistency</div>
          <div className="text-zinc-200 text-4xl font-mono">{consistency}%</div>
        </div>
        <div className="text-center md:text-left">
          <div className="text-zinc-500 text-xl mb-1 font-mono">time</div>
          <div className="text-zinc-200 text-4xl font-mono">{Math.round(elapsed)}s</div>
        </div>
      </div>
      
      <div className="w-full h-64 mb-12 bg-zinc-900/30 rounded-xl p-4 border border-zinc-800/50">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={store.wpmHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
            <XAxis dataKey="second" stroke="#71717a" tick={{fill: '#71717a'}} />
            <YAxis yAxisId="left" stroke="#34d399" tick={{fill: '#34d399'}} />
            <YAxis yAxisId="right" orientation="right" stroke="#a1a1aa" tick={{fill: '#a1a1aa'}} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
              itemStyle={{ color: '#e4e4e7' }}
            />
            <Line yAxisId="left" type="monotone" dataKey="wpm" stroke="#34d399" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="#a1a1aa" strokeWidth={2} dot={false} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {mistypedEntries.length > 0 && (
        <div className="w-full mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-6">
            <div className="flex items-center gap-2 text-zinc-300 mb-4 font-mono font-bold">
              <BrainCircuit className="text-emerald-400" size={20} />
              AI Typing Coach
            </div>
            <div className="text-zinc-400 text-sm mb-4 leading-relaxed">
              {worstFinger ? (
                <>Your <strong className="text-red-400">{worstFinger[0]}</strong> is causing the most errors ({worstFinger[1]} mistakes). Focus on keeping your hands anchored to the home row.</>
              ) : (
                <>You had a few scattered mistakes. Keep practicing to build muscle memory.</>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {mistypedEntries.slice(0, 5).map(([char, count]) => (
                <div key={char} className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-md font-mono text-sm">
                  <span className="text-red-400 font-bold">{char === ' ' ? 'space' : char}</span>
                  <span className="text-zinc-500">{count}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={handlePractice}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors rounded-lg font-mono font-medium border border-emerald-500/20"
            >
              <Target size={18} />
              Practice Weaknesses
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        <button 
          onClick={store.resetTest}
          className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors rounded-lg font-mono font-medium"
        >
          <RefreshCcw size={18} />
          Restart Test
        </button>
        
        {!user && (
          <Link 
            to="/login"
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors rounded-lg font-mono font-medium border border-emerald-500/20"
          >
            Sign in to save score
            <ChevronRight size={18} />
          </Link>
        )}
      </div>
    </div>
  );
};

export default Results;
