import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

export default function ForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!email) { setError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Invalid email format'); return; }
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) {
      toast(error.message, 'error');
    } else {
      setSent(true);
      toast('Reset link sent to your email', 'success');
    }
  };

  return (
    <AuthLayout title="Reset your password" subtitle="We'll send a recovery link to your email">
      {sent ? (
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 rounded-full bg-accent-500/15 flex items-center justify-center mx-auto"
          >
            <CheckCircle className="w-10 h-10 text-accent-500" />
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">Check your email</h3>
            <p className="text-sm text-secondary-500 dark:text-secondary-400">
              We've sent a password reset link to <span className="font-semibold text-primary-500">{email}</span>.
              Follow the link to reset your password.
            </p>
          </div>
          <Link to="/login" className="btn-primary inline-flex">
            <ArrowLeft className="w-5 h-5" /> Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field pl-11"
              />
            </div>
            {error && <p className="mt-1.5 text-xs text-danger-500">{error}</p>}
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-60"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" /> Send Reset Link
              </>
            )}
          </motion.button>

          <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-primary-500 hover:text-primary-400 font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </Link>
        </form>
      )}
    </AuthLayout>
  );
}
