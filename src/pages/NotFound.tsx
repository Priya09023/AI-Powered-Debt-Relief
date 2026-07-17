import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Compass, Search } from 'lucide-react';
import Logo from '../components/ui/Logo';

const quickLinks = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Loans', to: '/loans' },
  { label: 'AI Prediction', to: '/settlement-prediction' },
  { label: 'Know Your Rights', to: '/know-your-rights' },
];

export default function NotFound() {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="glow-orb w-[500px] h-[500px] bg-primary-600 -top-40 -left-40 animate-pulse-slow" />
      <div className="glow-orb w-[400px] h-[400px] bg-accent-600 bottom-0 right-0 animate-float" />

      <div className="relative z-10 text-center px-6 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <Logo size="lg" to="/" />
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-display text-[120px] sm:text-[180px] font-bold gradient-text leading-none"
        >
          404
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-4">Page not found</h1>
          <p className="mt-3 text-secondary-300 max-w-md mx-auto text-pretty">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link to="/" className="btn-primary">
            <Home className="w-5 h-5" /> Back to Home
          </Link>
          <Link to="/dashboard" className="btn-secondary">
            <Compass className="w-5 h-5" /> Go to Dashboard
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10"
        >
          <p className="text-sm text-secondary-400 mb-3 flex items-center justify-center gap-2">
            <Search className="w-4 h-4" /> Quick links
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-2 rounded-xl glass text-sm text-secondary-300 hover:text-primary-400 hover:scale-105 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-secondary-400 hover:text-primary-400 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Return to FinRelief AI
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
