import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CheckCircle2, AlertCircle, Info, Trash2, X, Check } from 'lucide-react';

export type NotificationType = 'success' | 'warning' | 'error' | 'info';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: number;
  action?: { label: string; href: string };
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

const STORAGE_KEY = 'finrelief-notifications';

const seedNotifications = (): Omit<AppNotification, 'id' | 'read' | 'createdAt'>[] => [
  {
    title: 'Welcome to FinRelief AI',
    message: 'Complete your financial profile to unlock AI settlement predictions.',
    type: 'info',
    action: { label: 'Set up profile', href: '/financial-profile' },
  },
  {
    title: 'AI engine ready',
    message: 'Generate a negotiation letter powered by Google Gemini AI.',
    type: 'success',
    action: { label: 'Generate letter', href: '/negotiation-letter' },
  },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored) as AppNotification[];
    } catch { /* ignore */ }
    // Seed initial notifications on first load
    return seedNotifications().map((n, i) => ({
      ...n,
      id: `seed-${i}`,
      read: false,
      createdAt: Date.now() - i * 60000,
    }));
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch { /* ignore */ }
  }, [notifications]);

  const addNotification = useCallback((n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => {
    const id = Math.random().toString(36).slice(2);
    setNotifications((prev) => [
      { ...n, id, read: false, createdAt: Date.now() },
      ...prev,
    ].slice(0, 50));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-accent-500" />,
    warning: <AlertCircle className="w-5 h-5 text-warning-500" />,
    error: <AlertCircle className="w-5 h-5 text-danger-500" />,
    info: <Info className="w-5 h-5 text-primary-500" />,
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, removeNotification, clearAll, isOpen, setIsOpen }}
    >
      {children}
      {/* Notification dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed top-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 glass-card overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-secondary-200/30 dark:border-secondary-700/40">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary-500" />
                  <h3 className="font-semibold text-secondary-900 dark:text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-primary-500 text-white text-xs font-medium">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} title="Mark all as read" className="p-1.5 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 text-secondary-400 hover:text-accent-500">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button onClick={clearAll} title="Clear all" className="p-1.5 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 text-secondary-400 hover:text-danger-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 text-secondary-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center">
                    <Bell className="w-10 h-10 text-secondary-300 dark:text-secondary-700 mx-auto mb-3" />
                    <p className="text-sm text-secondary-500">No notifications yet</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {notifications.map((n) => (
                      <motion.div
                        key={n.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onClick={() => markAsRead(n.id)}
                        className={`p-4 border-b border-secondary-100 dark:border-secondary-800/50 hover:bg-secondary-50 dark:hover:bg-secondary-800/30 cursor-pointer transition-colors ${!n.read ? 'bg-primary-500/5' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 mt-0.5">{icons[n.type]}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-secondary-900 dark:text-white">{n.title}</p>
                              {!n.read && <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />}
                            </div>
                            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1 leading-relaxed">{n.message}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-secondary-400">{formatTime(n.createdAt)}</span>
                              {n.action && (
                                <a
                                  href={n.action.href}
                                  onClick={() => setIsOpen(false)}
                                  className="text-xs font-medium text-primary-500 hover:text-primary-400"
                                >
                                  {n.action.label} →
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
