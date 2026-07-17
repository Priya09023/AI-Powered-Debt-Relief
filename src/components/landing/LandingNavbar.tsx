import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Moon, Sun, Shield } from 'lucide-react';
import Logo from '../ui/Logo';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const links = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#workflow' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
];

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass shadow-lg py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Logo />

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-4 py-2 text-sm font-medium text-secondary-600 dark:text-secondary-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl glass hover:scale-105 transition-all"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-warning-400" /> : <Moon className="w-4 h-4 text-primary-600" />}
          </button>
          {user ? (
            <button onClick={() => navigate('/dashboard')} className="hidden sm:inline-flex btn-primary !py-2.5 !px-5 text-sm">
              <Shield className="w-4 h-4" /> Dashboard
            </button>
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline-flex btn-ghost text-sm">Sign In</Link>
              <Link to="/register" className="hidden sm:inline-flex btn-primary !py-2.5 !px-5 text-sm">Get Started</Link>
            </>
          )}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2.5 rounded-xl glass"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden glass mt-3 mx-4 rounded-2xl"
          >
            <div className="p-4 space-y-1">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-xl text-secondary-600 dark:text-secondary-300 hover:bg-primary-500/10 hover:text-primary-500 transition-colors"
                >
                  {l.label}
                </a>
              ))}
              <div className="pt-2 border-t border-secondary-200/20 dark:border-secondary-700/40 flex gap-2">
                <Link to="/login" className="flex-1 btn-ghost justify-center">Sign In</Link>
                <Link to="/register" className="flex-1 btn-primary justify-center">Get Started</Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
