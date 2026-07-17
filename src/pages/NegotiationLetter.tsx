import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Sparkles, Copy, Download, Save, Pencil, FileText, Check, Landmark,
  Wand2, FileDown,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { supabase } from '../lib/supabase';
import { useUserData } from '../hooks/useUserData';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import { predictSettlement } from '../lib/ai';
import { generateLetterViaGemini, type LetterTone } from '../lib/gemini';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';

const toneOptions: { value: LetterTone; label: string; desc: string }[] = [
  { value: 'polite', label: 'Polite', desc: 'Warm and respectful' },
  { value: 'firm', label: 'Firm', desc: 'Confident and assertive' },
  { value: 'formal', label: 'Formal', desc: 'Business formal' },
  { value: 'concise', label: 'Concise', desc: 'Brief and direct' },
];

export default function NegotiationLetter() {
  const { loans } = useUserData();
  const { profile } = useAuth();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [reason, setReason] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [tone, setTone] = useState<LetterTone>('polite');
  const [letter, setLetter] = useState('');
  const [letterSource, setLetterSource] = useState<'gemini' | 'fallback' | ''>('');
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editableLetter, setEditableLetter] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedLoan = useMemo(
    () => loans.find((l) => l.id === selectedLoanId),
    [loans, selectedLoanId],
  );

  const handleGenerate = async () => {
    if (!selectedLoan || !profile) {
      toast('Select a loan and complete your profile first', 'error');
      return;
    }
    setGenerating(true);
    const prediction = predictSettlement({ loan: selectedLoan, profile });
    const result = await generateLetterViaGemini({
      lenderName: selectedLoan.lender,
      borrowerName: profile.full_name || 'Borrower',
      loanType: selectedLoan.loan_type,
      outstandingAmount: Number(selectedLoan.outstanding_amount),
      settlementPercentage: prediction.settlement_percentage,
      recommendedAmount: prediction.recommended_amount,
      reason: reason || 'unforeseen financial hardship caused by a reduction in income and increased household responsibilities',
      contactInfo: contactInfo || 'borrower@email.com',
      tone,
    });
    setLetter(result.letter);
    setEditableLetter(result.letter);
    setLetterSource(result.source);
    setGenerating(false);
    toast(
      result.source === 'gemini' ? 'Letter generated via Google Gemini AI' : 'Letter generated (offline mode)',
      'success',
    );
    addNotification({
      title: 'Negotiation letter generated',
      message: `${selectedLoan.lender} - ${result.source === 'gemini' ? 'Powered by Gemini AI' : 'Local engine'}`,
      type: 'success',
      action: { label: 'View letter', href: '/negotiation-letter' },
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editing ? editableLetter : letter);
      setCopied(true);
      toast('Copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('Failed to copy', 'error');
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const content = editing ? editableLetter : letter;
    const lines = doc.splitTextToSize(content, 170);
    doc.setFontSize(11);
    doc.text(lines, 20, 20);
    doc.save(`negotiation-letter-${selectedLoan?.lender || 'loan'}.pdf`);
    toast('PDF downloaded', 'success');
  };

  const handleDownloadReport = () => {
    if (!selectedLoan) return;
    import('../lib/exportReport').then(({ exportLoanReport }) => {
      exportLoanReport(selectedLoan, profile);
      toast('Report downloaded', 'success');
    });
  };

  const handleSave = async () => {
    if (!selectedLoan) return;
    setSaving(true);
    const content = editing ? editableLetter : letter;
    const { error } = await supabase.from('ai_history').insert({
      type: 'letter',
      title: `Negotiation Letter - ${selectedLoan.lender}`,
      content,
      metadata: { loan_id: selectedLoan.id },
    });
    setSaving(false);
    if (error) toast(error.message, 'error');
    else toast('Letter saved to AI history', 'success');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
          <Mail className="w-6 h-6 text-primary-500" /> AI Negotiation Letter
        </h2>
        <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
          Generate a professional settlement request letter powered by AI. Edit, copy, or download as PDF.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Config panel */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-secondary-900 dark:text-white">Letter Configuration</h3>

          {loans.length === 0 ? (
            <EmptyState icon={<Landmark className="w-8 h-8" />} title="No loans available" description="Add a loan first." />
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Select Loan</label>
                <select
                  value={selectedLoanId}
                  onChange={(e) => setSelectedLoanId(e.target.value)}
                  className="input-field cursor-pointer"
                >
                  <option value="">Choose a loan...</option>
                  {loans.map((l) => (
                    <option key={l.id} value={l.id}>{l.lender} · {l.loan_type}</option>
                  ))}
                </select>
              </div>

              {selectedLoan && (
                <div className="p-3 rounded-xl bg-secondary-50 dark:bg-secondary-800/40 space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-secondary-500">Outstanding</span><span className="font-semibold text-secondary-900 dark:text-white">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(selectedLoan.outstanding_amount))}</span></div>
                  <div className="flex justify-between"><span className="text-secondary-500">EMI</span><span className="font-semibold text-secondary-900 dark:text-white">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(selectedLoan.emi))}</span></div>
                  <div className="flex justify-between"><span className="text-secondary-500">Overdue</span><Badge variant={Number(selectedLoan.overdue_months) > 0 ? 'danger' : 'accent'}>{selectedLoan.overdue_months} months</Badge></div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Reason for Settlement</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Job loss, medical emergency, business downturn..."
                  className="input-field resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Your Contact Info</label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="Email / Phone / Address"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Letter Tone</label>
                <div className="grid grid-cols-2 gap-2">
                  {toneOptions.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTone(t.value)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        tone === t.value
                          ? 'border-primary-500 bg-primary-500/10 ring-1 ring-primary-500/30'
                          : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-400'
                      }`}
                    >
                      <div className="text-sm font-semibold text-secondary-900 dark:text-white">{t.label}</div>
                      <div className="text-xs text-secondary-500">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleGenerate} disabled={!selectedLoan || generating} className="btn-primary w-full disabled:opacity-50">
                {generating ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    AI Writing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" /> Generate Letter
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Letter preview */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-500" /> Letter Preview
              {letterSource && (
                <Badge variant={letterSource === 'gemini' ? 'accent' : 'neutral'} size="sm">
                  <Wand2 className="w-3 h-3" /> {letterSource === 'gemini' ? 'Gemini AI' : 'Offline'}
                </Badge>
              )}
            </h3>
            {letter && (
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setEditing(!editing)} className={`btn-ghost text-sm ${editing ? 'text-primary-500' : ''}`}>
                  <Pencil className="w-4 h-4" /> {editing ? 'Editing' : 'Edit'}
                </button>
                <button onClick={handleCopy} className="btn-ghost text-sm">
                  {copied ? <Check className="w-4 h-4 text-accent-500" /> : <Copy className="w-4 h-4" />} Copy
                </button>
                <button onClick={handleDownloadPDF} className="btn-ghost text-sm">
                  <Download className="w-4 h-4" /> PDF
                </button>
                <button onClick={handleDownloadReport} className="btn-ghost text-sm">
                  <FileDown className="w-4 h-4" /> Report
                </button>
                <button onClick={handleSave} disabled={saving} className="btn-primary !py-2 text-sm disabled:opacity-60">
                  {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Save</>}
                </button>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {generating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-20 text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-14 h-14 mx-auto rounded-full border-4 border-primary-500/20 border-t-primary-500"
                />
                <p className="mt-4 text-secondary-500">AI is drafting your letter...</p>
              </motion.div>
            ) : letter ? (
              <motion.div
                key="letter"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {editing ? (
                  <textarea
                    value={editableLetter}
                    onChange={(e) => setEditableLetter(e.target.value)}
                    rows={24}
                    className="input-field font-mono text-sm resize-y leading-relaxed"
                  />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-sm text-secondary-700 dark:text-secondary-300 leading-relaxed bg-secondary-50 dark:bg-secondary-800/30 p-5 rounded-xl max-h-[600px] overflow-y-auto">
                    {letter}
                  </pre>
                )}
              </motion.div>
            ) : (
              <EmptyState
                icon={<Mail className="w-8 h-8" />}
                title="No letter generated yet"
                description="Configure your loan details and click Generate Letter to create a professional negotiation letter."
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
