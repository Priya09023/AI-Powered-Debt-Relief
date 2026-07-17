import LandingNavbar from '../components/landing/LandingNavbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import Workflow from '../components/landing/Workflow';
import Testimonials from '../components/landing/Testimonials';
import FAQ from '../components/landing/FAQ';
import Footer from '../components/landing/Footer';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative gradient-bg rounded-3xl p-10 sm:p-16 text-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-dots opacity-30" />
          <div className="glow-orb w-[300px] h-[300px] bg-primary-500 -top-20 -left-20" />
          <div className="glow-orb w-[300px] h-[300px] bg-accent-500 -bottom-20 -right-20" />
          <div className="relative">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-balance">
              Ready to take control of your debt?
            </h2>
            <p className="mt-4 text-lg text-secondary-300 max-w-2xl mx-auto">
              Join 48,000+ borrowers who have used FinRelief AI to negotiate settlements and rebuild their financial future.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-base group">
                Start Free Today
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="btn-secondary text-base">Sign In</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950">
      <LandingNavbar />
      <Hero />
      <Features />
      <Workflow />
      <Testimonials />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  );
}
