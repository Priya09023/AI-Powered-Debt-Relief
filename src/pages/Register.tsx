import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, UserPlus, Check } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const pwdRules = [
  { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p: string) => /[a-z]/.test(p), label: 'One lowercase letter' },
  { test: (p: string) => /[0-9]/.test(p), label: 'One number' },
];

export default function Register() {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (!email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email format';
    if (!password) e.password = 'Password is required';
    else if (!pwdRules.every((r) => r.test(password))) e.password = 'Password does not meet requirements';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    if (!agree) e.agree = 'You must accept the terms';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      toast(error, 'error');
    } else {
      toast('Account created! Welcome to FinRelief AI.', 'success');
      navigate('/dashboard');
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start your journey to financial recovery today">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="input-field pl-11"
            />
          </div>
          {errors.fullName && <p className="mt-1.5 text-xs text-danger-500">{errors.fullName}</p>}
        </div>

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
          {errors.email && <p className="mt-1.5 text-xs text-danger-500">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field pl-11 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-primary-500"
            >
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password && (
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {pwdRules.map((r) => {
                const ok = r.test(password);
                return (
                  <div key={r.label} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-accent-500' : 'text-secondary-400'}`}>
                    <Check className="w-3 h-3" /> {r.label}
                  </div>
                );
              })}
            </div>
          )}
          {errors.password && <p className="mt-1.5 text-xs text-danger-500">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type={showPwd ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="input-field pl-11"
            />
          </div>
          {errors.confirm && <p className="mt-1.5 text-xs text-danger-500">{errors.confirm}</p>}
        </div>

        <label className="flex items-start gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-secondary-600 dark:text-secondary-400">
            I agree to the <a href="#" className="text-primary-500 hover:underline">Terms of Service</a> and{' '}
            <a href="#" className="text-primary-500 hover:underline">Privacy Policy</a>
          </span>
        </label>
        {errors.agree && <p className="text-xs text-danger-500">{errors.agree}</p>}

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
              <UserPlus className="w-5 h-5" /> Create Account
            </>
          )}
        </motion.button>

        <p className="text-center text-sm text-secondary-500 dark:text-secondary-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-500 hover:text-primary-400 font-semibold">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
