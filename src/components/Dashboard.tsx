import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, Clock, Target, Zap } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, token } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (user && token) {
      fetch('/api/tests/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json()).then(setStats);

      fetch('/api/tests/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json()).then(setHistory);
    }
  }, [user, token]);

  if (!user) return <div className="text-center text-zinc-500 mt-20 font-mono">Please log in to view dashboard.</div>;
  if (!stats) return <div className="text-center text-zinc-500 mt-20 font-mono animate-pulse">Loading stats...</div>;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-mono font-bold text-zinc-200 mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
        <StatCard title="Tests Taken" value={stats.totalTests || 0} icon={<Activity size={24} className="text-emerald-400" />} />
        <StatCard title="Time Typing" value={`${Math.round((stats.totalTime || 0) / 60)}m`} icon={<Clock size={24} className="text-zinc-400" />} />
        <StatCard title="Best WPM" value={Math.round(stats.bestWpm || 0)} icon={<Zap size={24} className="text-emerald-400" />} />
        <StatCard title="Avg WPM" value={Math.round(stats.avgWpm || 0)} icon={<Zap size={24} className="text-emerald-400" />} />
        <StatCard title="Avg Accuracy" value={`${Math.round(stats.avgAccuracy || 0)}%`} icon={<Target size={24} className="text-zinc-400" />} />
      </div>

      <div className="bg-zinc-900/30 rounded-2xl p-6 border border-zinc-800/50 mb-12">
        <h2 className="text-xl font-mono font-bold text-zinc-300 mb-6">WPM History</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[...history].reverse()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
              <XAxis dataKey="createdAt" stroke="#71717a" tick={{fill: '#71717a'}} tickFormatter={(val) => new Date(val).toLocaleDateString()} />
              <YAxis stroke="#34d399" tick={{fill: '#34d399'}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                itemStyle={{ color: '#e4e4e7' }}
                labelFormatter={(val) => new Date(val).toLocaleString()}
              />
              <Line type="monotone" dataKey="wpm" stroke="#34d399" strokeWidth={3} dot={{ r: 4, fill: '#18181b', strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-zinc-900/30 rounded-2xl p-6 border border-zinc-800/50">
        <h2 className="text-xl font-mono font-bold text-zinc-300 mb-6">Recent Tests</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-sm">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-800">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">WPM</th>
                <th className="pb-3 font-medium">Accuracy</th>
                <th className="pb-3 font-medium">Mode</th>
                <th className="pb-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 10).map((test, i) => (
                <tr key={i} className="border-b border-zinc-800/50 text-zinc-300 hover:bg-zinc-800/20 transition-colors">
                  <td className="py-4">{new Date(test.createdAt).toLocaleString()}</td>
                  <td className="py-4 text-emerald-400 font-bold">{Math.round(test.wpm)}</td>
                  <td className="py-4">{Math.round(test.accuracy)}%</td>
                  <td className="py-4 text-zinc-500">{test.mode}</td>
                  <td className="py-4 text-zinc-500">{test.duration}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
  <div className="bg-zinc-900/30 rounded-2xl p-6 border border-zinc-800/50 flex flex-col gap-4 hover:border-zinc-700 transition-colors">
    <div className="flex justify-between items-start">
      <div className="text-zinc-500 font-mono text-sm uppercase tracking-wider">{title}</div>
      {icon}
    </div>
    <div className="text-4xl font-mono font-bold text-zinc-200">{value}</div>
  </div>
);

export default Dashboard;
