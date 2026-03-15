import React from 'react';
import { Link } from 'react-router-dom';
import { Keyboard, User, LogOut, Activity } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <header className="w-full max-w-5xl mx-auto py-8 px-4 flex justify-between items-center text-zinc-400 font-mono">
      <Link to="/" className="flex items-center gap-3 text-zinc-200 hover:text-emerald-400 transition-colors group">
        <div className="bg-emerald-500/10 p-2 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
          <Keyboard size={24} className="text-emerald-400" />
        </div>
        <span className="text-2xl font-bold tracking-tighter">monkeytype<span className="text-emerald-400">.clone</span></span>
      </Link>

      <nav className="flex gap-6 items-center">
        {user ? (
          <>
            <Link to="/dashboard" className="flex items-center gap-2 hover:text-zinc-200 transition-colors">
              <Activity size={18} />
              <span>dashboard</span>
            </Link>
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-md">
              <User size={18} />
              <span>{user.username}</span>
            </div>
            <button onClick={logout} className="hover:text-red-400 transition-colors" title="Logout">
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <Link to="/login" className="flex items-center gap-2 hover:text-zinc-200 transition-colors bg-zinc-800/50 px-4 py-2 rounded-lg hover:bg-zinc-800">
            <User size={18} />
            <span>login</span>
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
