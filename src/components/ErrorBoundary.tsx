import { Component, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './ui/Logo';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen gradient-bg flex items-center justify-center relative overflow-hidden px-6">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="glow-orb w-[400px] h-[400px] bg-danger-500 -top-20 -right-20 animate-pulse-slow" />

          <div className="relative z-10 text-center max-w-lg">
            <div className="flex justify-center mb-6">
              <Logo size="lg" showText={false} />
            </div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 rounded-2xl bg-danger-500/20 flex items-center justify-center mx-auto mb-6"
            >
              <AlertOctagon className="w-10 h-10 text-danger-400" />
            </motion.div>

            <h1 className="font-display text-3xl font-bold text-white mb-3">
              Something went wrong
            </h1>
            <p className="text-secondary-300 mb-8 text-pretty">
              An unexpected error occurred. Try refreshing the page, or return to safety.
            </p>

            {this.state.error && (
              <div className="mb-6 p-4 rounded-xl bg-secondary-900/60 border border-secondary-700/40 text-left">
                <p className="text-xs text-secondary-400 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                <RefreshCw className="w-5 h-5" /> Refresh Page
              </button>
              <Link to="/" className="btn-secondary">
                <Home className="w-5 h-5" /> Back to Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
