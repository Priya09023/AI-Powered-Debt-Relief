import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Rajesh Kumar',
    role: 'Small Business Owner, Chennai',
    rating: 5,
    text: 'FinRelief AI helped me settle my business loan at 58% of the outstanding amount. The negotiation letter was so professional that my bank approved it within a week.',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    name: 'Priya Sharma',
    role: 'IT Professional, Bangalore',
    rating: 5,
    text: 'The settlement prediction was spot on. It recommended I settle at 65% and the bank agreed to 67%. The AI history feature lets me track all my negotiations in one place.',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    name: 'Amit Patel',
    role: 'Teacher, Ahmedabad',
    rating: 5,
    text: 'I was drowning in credit card debt. The financial health analysis showed me exactly where I stood, and the AI recommendations helped me create a realistic recovery plan.',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-warning-500/10 text-warning-500 text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary-900 dark:text-white">
            Trusted by thousands of borrowers
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="card p-6 relative"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-primary-500/20" />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star key={idx} className="w-4 h-4 fill-warning-500 text-warning-500" />
                ))}
              </div>
              <p className="text-sm text-secondary-600 dark:text-secondary-300 leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <div className="font-semibold text-secondary-900 dark:text-white">{t.name}</div>
                  <div className="text-xs text-secondary-500 dark:text-secondary-400">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
