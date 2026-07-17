import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Moon, Sun, Bell, Search } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

interface TopbarProps {
  onMenuClick: () => void;
  title: string;
}

export default function Topbar({ onMenuClick, title }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { profile } = useAuth();
  const { unreadCount, isOpen: notifOpen, setIsOpen: setNotifOpen } = useNotifications();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('topbar-search')?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/ai-history?q=${encodeURIComponent(search)}`);
    }
  };

  return (
    <header className="sticky top-0 z-20 glass border-b border-secondary-200/30 dark:border-secondary-800/40">
      <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 h-16">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800">
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-lg font-semibold text-secondary-900 dark:text-white hidden sm:block">{title}</h1>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-auto relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <input
            id="topbar-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search history, loans, letters..."
            className="w-full pl-11 pr-16 py-2.5 rounded-xl bg-white/60 dark:bg-secondary-900/60 border border-secondary-200 dark:border-secondary-700 text-sm text-secondary-900 dark:text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-secondary-400 border border-secondary-300 dark:border-secondary-700 rounded px-1.5 py-0.5">
            ⌘K
          </kbd>
        </form>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl glass hover:scale-105 transition-all"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-warning-400" /> : <Moon className="w-4 h-4 text-primary-600" />}
          </button>

          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2.5 rounded-xl glass hover:scale-105 transition-all relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-danger-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold hover:scale-105 transition-transform"
          >
            {(profile?.full_name || 'U').charAt(0).toUpperCase()}
          </button>
        </div>
      </div>
    </header>
  );
}
