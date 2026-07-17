import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Landmark,
  Wallet,
  Brain,
  Mail,
  History,
  BookOpen,
  Settings,
  LogOut,
  X,
  TrendingUp,
  UserCircle,
} from 'lucide-react';
import Logo from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/loans', label: 'Loans', icon: Landmark },
  { to: '/financial-profile', label: 'Financial Profile', icon: Wallet },
  { to: '/settlement-prediction', label: 'Settlement Prediction', icon: Brain },
  { to: '/negotiation-letter', label: 'Negotiation Letter', icon: Mail },
  { to: '/ai-history', label: 'AI History', icon: History },
  { to: '/know-your-rights', label: 'Know Your Rights', icon: BookOpen },
  { to: '/profile', label: 'Profile', icon: UserCircle },
  { to: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const content = (
    <>
      <div className="px-5 py-5 flex items-center justify-between">
        <Logo size="sm" to="/dashboard" />
        <button onClick={onClose} className="lg:hidden text-secondary-400">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
            }
          >
            <l.icon className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{l.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-secondary-800">
        <div className="px-3 py-3 mb-2 rounded-xl bg-secondary-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold shrink-0">
              {(profile?.full_name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">
                {profile?.full_name || 'User'}
              </div>
              <div className="text-xs text-secondary-400 truncate">Free Plan</div>
            </div>
          </div>
        </div>
        <button onClick={handleSignOut} className="sidebar-link w-full text-danger-400 hover:bg-danger-500/10">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col gradient-bg border-r border-secondary-800 fixed inset-y-0 left-0 z-30">
        {content}
      </aside>

      {/* Mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-64 flex flex-col gradient-bg border-r border-secondary-800 z-50 lg:hidden"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function MobileTopBar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <button
      onClick={onMenuClick}
      className="lg:hidden fixed top-4 left-4 z-30 p-2.5 rounded-xl glass"
    >
      <TrendingUp className="w-5 h-5 text-primary-500" />
    </button>
  );
}
