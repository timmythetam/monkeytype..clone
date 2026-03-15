import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import TypingTest from './components/TypingTest';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import { useTypingStore } from './store/useTypingStore';

const App: React.FC = () => {
  const font = useTypingStore(state => state.font);

  return (
    <Router>
      <div className={`min-h-screen bg-[#0a0a0a] text-zinc-200 selection:bg-emerald-500/30 selection:text-emerald-200 ${font}`}>
        <Header />
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<TypingTest />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Auth />} />
          </Routes>
        </main>
        
        <footer className="w-full max-w-5xl mx-auto py-8 px-4 text-center text-zinc-600 font-mono text-sm flex justify-center gap-6">
          <a href="#" className="hover:text-zinc-300 transition-colors flex items-center gap-2">
            <span className="text-emerald-500/50">&lt;/&gt;</span> github
          </a>
          <a href="#" className="hover:text-zinc-300 transition-colors flex items-center gap-2">
            <span className="text-emerald-500/50">@</span> contact
          </a>
        </footer>
      </div>
    </Router>
  );
};

export default App;
