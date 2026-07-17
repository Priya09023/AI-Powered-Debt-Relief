import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Twitter, Linkedin, Facebook } from 'lucide-react';
import Logo from '../ui/Logo';

const sections = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'How It Works', href: '#workflow' },
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Get Started', to: '/register' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Know Your Rights', to: '/know-your-rights' },
      { label: 'FAQ', href: '#faq' },
      { label: 'AI History', to: '/ai-history' },
      { label: 'Settlement Prediction', to: '/settlement-prediction' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="gradient-bg pt-20 pb-8 relative overflow-hidden">
      <div className="glow-orb w-[400px] h-[400px] bg-primary-600 -bottom-40 left-1/4" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-10 mb-12">
          <div className="lg:col-span-2">
            <Logo size="lg" />
            <p className="mt-4 text-sm text-secondary-300 max-w-sm leading-relaxed">
              AI-powered debt relief and financial recovery platform helping borrowers negotiate settlements, track financial health, and rebuild credit.
            </p>
            <div className="mt-6 space-y-2 text-sm text-secondary-300">
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary-400" /> support@finrelief.ai</div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary-400" /> +91 80000 12345</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-400" /> Mumbai, India</div>
            </div>
            <div className="flex gap-3 mt-6">
              {[Twitter, Linkedin, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:scale-110 hover:text-primary-400 transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {sections.map((s) => (
            <div key={s.title}>
              <h4 className="font-semibold text-white mb-4">{s.title}</h4>
              <ul className="space-y-2">
                {s.links.map((l) => (
                  <li key={l.label}>
                    {'to' in l && l.to ? (
                      <Link to={l.to} className="text-sm text-secondary-400 hover:text-primary-400 transition-colors">
                        {l.label}
                      </Link>
                    ) : (
                      <a href={l.href} className="text-sm text-secondary-400 hover:text-primary-400 transition-colors">
                        {l.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-secondary-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-secondary-400">© 2026 FinRelief AI. All rights reserved.</p>
          <p className="text-xs text-secondary-500">
            Built with Google Gemini AI · Supabase · React
          </p>
        </div>
      </div>
    </footer>
  );
}
