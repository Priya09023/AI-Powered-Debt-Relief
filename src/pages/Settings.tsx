import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon, User, Mail, Phone, Moon, Sun, Bell,
  LogOut, Shield, Trash2, Save, Camera, FileDown, CheckCheck, History,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import { useUserData } from '../hooks/useUserData';
import { exportFullReport } from '../lib/exportReport';
import Badge from '../components/ui/Badge';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function Settings() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const { notifications, unreadCount, markAllAsRead, clearAll } = useNotifications();
  const { loans, settlements, aiHistory } = useUserData();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [notifs, setNotifs] = useState({ email: true, push: true, predictions: true, letters: false });
  const [showSignOut, setShowSignOut] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      full_name: fullName,
      phone,
    }).eq('id', profile.id);
    setSaving(false);
    if (error) toast(error.message, 'error');
    else { toast('Settings updated', 'success'); refreshProfile(); }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) toast(error.message, 'error');
    else {
      toast('Account deleted', 'success');
      await signOut();
      navigate('/');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-primary-500" /> Settings
        </h2>
        <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
          Manage your account, preferences, and security.
        </p>
      </div>

      {/* Profile */}
      <div className="card p-6">
        <h3 className="font-semibold text-secondary-900 dark:text-white mb-5 flex items-center gap-2">
          <User className="w-5 h-5 text-primary-500" /> Profile Information
        </h3>
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {(fullName || 'U').charAt(0).toUpperCase()}
              </div>
              <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary-600 text-white shadow-lg hover:scale-110 transition-transform">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <Badge variant="primary">Free Plan</Badge>
          </div>

          <form onSubmit={handleSaveProfile} className="flex-1 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input type="email" value={user?.email || ''} disabled className="input-field pl-11 opacity-60 cursor-not-allowed" />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className="input-field pl-11" />
              </div>
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
                {saving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Appearance */}
      <div className="card p-6">
        <h3 className="font-semibold text-secondary-900 dark:text-white mb-5 flex items-center gap-2">
          {theme === 'dark' ? <Moon className="w-5 h-5 text-primary-500" /> : <Sun className="w-5 h-5 text-primary-500" />}
          Appearance
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-secondary-900 dark:text-white">Theme</p>
            <p className="text-xs text-secondary-500 mt-0.5">Switch between dark and light mode</p>
          </div>
          <button
            onClick={toggleTheme}
            className="relative w-14 h-7 rounded-full bg-secondary-200 dark:bg-secondary-700 transition-colors"
          >
            <motion.div
              animate={{ x: theme === 'dark' ? 28 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center"
            >
              {theme === 'dark' ? <Moon className="w-3 h-3 text-primary-600" /> : <Sun className="w-3 h-3 text-warning-500" />}
            </motion.div>
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-6">
        <h3 className="font-semibold text-secondary-900 dark:text-white mb-5 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary-500" /> Notifications
        </h3>
        <div className="space-y-4">
          {[
            { key: 'email', label: 'Email notifications', desc: 'Receive updates via email' },
            { key: 'push', label: 'Push notifications', desc: 'Browser push alerts' },
            { key: 'predictions', label: 'Prediction alerts', desc: 'When AI predictions are ready' },
            { key: 'letters', label: 'Letter generation', desc: 'When letters are generated' },
          ].map((n) => (
            <div key={n.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-900 dark:text-white">{n.label}</p>
                <p className="text-xs text-secondary-500 mt-0.5">{n.desc}</p>
              </div>
              <button
                onClick={() => setNotifs({ ...notifs, [n.key]: !notifs[n.key as keyof typeof notifs] })}
                className={`relative w-14 h-7 rounded-full transition-colors ${notifs[n.key as keyof typeof notifs] ? 'bg-primary-600' : 'bg-secondary-200 dark:bg-secondary-700'}`}
              >
                <motion.div
                  animate={{ x: notifs[n.key as keyof typeof notifs] ? 28 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="card p-6">
        <h3 className="font-semibold text-secondary-900 dark:text-white mb-5 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary-500" /> Security
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary-50 dark:bg-secondary-800/40">
            <div>
              <p className="text-sm font-medium text-secondary-900 dark:text-white">Change Password</p>
              <p className="text-xs text-secondary-500 mt-0.5">Update your account password</p>
            </div>
            <button onClick={() => toast('Password change link sent to email', 'info')} className="btn-ghost text-sm">Update</button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary-50 dark:bg-secondary-800/40">
            <div>
              <p className="text-sm font-medium text-secondary-900 dark:text-white">Two-Factor Authentication</p>
              <p className="text-xs text-secondary-500 mt-0.5">Add an extra layer of security</p>
            </div>
            <Badge variant="neutral">Coming Soon</Badge>
          </div>
        </div>
      </div>

      {/* Notification Center */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary-500" /> Notification Center
            {unreadCount > 0 && (
              <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-danger-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="btn-ghost text-sm disabled:opacity-40 flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
            <button
              onClick={clearAll}
              disabled={notifications.length === 0}
              className="btn-ghost text-sm disabled:opacity-40 text-danger-500 hover:bg-danger-500/10"
            >
              <Trash2 className="w-4 h-4" /> Clear all
            </button>
          </div>
        </div>
        {notifications.length === 0 ? (
          <div className="py-8 text-center">
            <Bell className="w-8 h-8 text-secondary-300 dark:text-secondary-700 mx-auto mb-2" />
            <p className="text-sm text-secondary-500">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {notifications.slice(0, 10).map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                  n.read
                    ? 'bg-secondary-50 dark:bg-secondary-800/30'
                    : 'bg-primary-500/5 ring-1 ring-primary-500/20'
                }`}
              >
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? 'bg-secondary-300 dark:bg-secondary-600' : 'bg-primary-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary-900 dark:text-white">{n.title}</p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-secondary-400 mt-1">
                    {new Date(n.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {n.type === 'success' && <Badge variant="accent" size="sm">success</Badge>}
                {n.type === 'warning' && <Badge variant="warning" size="sm">warning</Badge>}
                {n.type === 'error' && <Badge variant="danger" size="sm">error</Badge>}
                {n.type === 'info' && <Badge variant="primary" size="sm">info</Badge>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Data Export */}
      <div className="card p-6">
        <h3 className="font-semibold text-secondary-900 dark:text-white mb-5 flex items-center gap-2">
          <FileDown className="w-5 h-5 text-primary-500" /> Data Export
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              exportFullReport({ profile, loans, settlements, aiHistory });
              toast('Full report exported to PDF', 'success');
            }}
            className="btn-primary"
          >
            <FileDown className="w-5 h-5" /> Export Full Report (PDF)
          </button>
          <button
            onClick={() => navigate('/ai-history')}
            className="btn-secondary"
          >
            <History className="w-5 h-5" /> View AI History
          </button>
        </div>
        <p className="text-xs text-secondary-500 mt-3">
          Export your complete financial data including profile, loans, settlements, and AI history as a branded PDF report.
        </p>
      </div>

      {/* Danger zone */}
      <div className="card p-6 border-l-4 border-l-danger-500">
        <h3 className="font-semibold text-danger-500 mb-4">Danger Zone</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => setShowSignOut(true)} className="btn-secondary text-danger-500 border-danger-500/30 hover:bg-danger-500/10">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
          <button onClick={() => setShowDelete(true)} className="px-6 py-3 rounded-xl bg-danger-600 text-white font-semibold hover:bg-danger-700 active:scale-95 transition-all">
            <Trash2 className="w-4 h-4 inline mr-2" /> Delete Account
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showSignOut}
        onClose={() => setShowSignOut(false)}
        onConfirm={handleSignOut}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
      />

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="This will permanently delete your account, all loans, predictions, and AI history. This action cannot be undone."
        confirmText="Delete Forever"
        danger
      />
    </div>
  );
}
