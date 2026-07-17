import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Pencil, Trash2, Landmark, Filter, ArrowUpDown, Eye,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useUserData } from '../hooks/useUserData';
import { useToast } from '../context/ToastContext';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import LoanDetailsModal from '../components/loans/LoanDetailsModal';
import type { Loan } from '../lib/types';

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const loanTypes = ['Personal Loan', 'Credit Card', 'Home Loan', 'Auto Loan', 'Education Loan', 'Business Loan', 'Gold Loan', 'Other'];
const priorities = ['Low', 'Medium', 'High'];
const statuses = ['Active', 'Settled', 'Closed', 'Defaulted'];

interface FormData {
  lender: string;
  loan_type: string;
  outstanding_amount: string;
  interest_rate: string;
  emi: string;
  overdue_months: string;
  due_date: string;
  priority: string;
  status: string;
}

const empty: FormData = {
  lender: '', loan_type: 'Personal Loan', outstanding_amount: '', interest_rate: '',
  emi: '', overdue_months: '', due_date: '', priority: 'Medium', status: 'Active',
};

export default function Loans() {
  const { loans, loading, refresh } = useUserData();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'outstanding' | 'overdue' | 'created'>('outstanding');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Loan | null>(null);
  const [form, setForm] = useState<FormData>(empty);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Loan | null>(null);
  const [viewTarget, setViewTarget] = useState<Loan | null>(null);

  const filtered = useMemo(() => {
    let list = loans.filter((l) =>
      l.lender.toLowerCase().includes(search.toLowerCase()) ||
      l.loan_type.toLowerCase().includes(search.toLowerCase())
    );
    if (typeFilter !== 'All') list = list.filter((l) => l.loan_type === typeFilter);
    if (priorityFilter !== 'All') list = list.filter((l) => l.priority === priorityFilter);
    list = [...list].sort((a, b) => {
      if (sortBy === 'outstanding') return Number(b.outstanding_amount) - Number(a.outstanding_amount);
      if (sortBy === 'overdue') return Number(b.overdue_months) - Number(a.overdue_months);
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });
    return list;
  }, [loans, search, typeFilter, priorityFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openAdd = () => {
    setEditing(null);
    setForm(empty);
    setModalOpen(true);
  };

  const openEdit = (loan: Loan) => {
    setEditing(loan);
    setForm({
      lender: loan.lender,
      loan_type: loan.loan_type,
      outstanding_amount: String(loan.outstanding_amount),
      interest_rate: String(loan.interest_rate),
      emi: String(loan.emi),
      overdue_months: String(loan.overdue_months),
      due_date: loan.due_date || '',
      priority: loan.priority,
      status: loan.status,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.lender.trim()) { toast('Lender name is required', 'error'); return; }
    setSaving(true);
    const payload = {
      lender: form.lender.trim(),
      loan_type: form.loan_type,
      outstanding_amount: Number(form.outstanding_amount) || 0,
      interest_rate: Number(form.interest_rate) || 0,
      emi: Number(form.emi) || 0,
      overdue_months: Number(form.overdue_months) || 0,
      due_date: form.due_date || null,
      priority: form.priority,
      status: form.status,
    };
    const { error } = editing
      ? await supabase.from('loans').update(payload).eq('id', editing.id)
      : await supabase.from('loans').insert(payload);
    setSaving(false);
    if (error) {
      toast(error.message, 'error');
    } else {
      toast(editing ? 'Loan updated' : 'Loan added', 'success');
      setModalOpen(false);
      refresh();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('loans').delete().eq('id', deleteTarget.id);
    if (error) toast(error.message, 'error');
    else { toast('Loan deleted', 'success'); refresh(); }
  };

  if (loading) return <TableSkeleton rows={5} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Loan Management</h2>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
            {loans.length} total loans · {formatINR(loans.reduce((s, l) => s + Number(l.outstanding_amount), 0))} outstanding
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="w-5 h-5" /> Add Loan
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by lender or loan type..."
            className="input-field pl-11"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 pointer-events-none" />
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="input-field pl-9 pr-8 appearance-none cursor-pointer"
            >
              <option value="All">All Types</option>
              {loanTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
              className="input-field appearance-none cursor-pointer"
            >
              <option value="All">All Priority</option>
              {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <button
            onClick={() => setSortBy(sortBy === 'outstanding' ? 'overdue' : sortBy === 'overdue' ? 'created' : 'outstanding')}
            className="btn-secondary !px-4"
            title="Sort"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Sort</span>
          </button>
        </div>
      </div>

      {/* Table */}
      {pageItems.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Landmark className="w-8 h-8" />}
            title={loans.length === 0 ? 'No loans yet' : 'No matching loans'}
            description={loans.length === 0 ? 'Add your first loan to start tracking your debt recovery journey.' : 'Try adjusting your search or filters.'}
            action={loans.length === 0 ? <button onClick={openAdd} className="btn-primary text-sm"><Plus className="w-4 h-4" /> Add Loan</button> : undefined}
          />
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-secondary-200 dark:border-secondary-800 text-left text-xs uppercase text-secondary-500">
                    <th className="px-5 py-3 font-semibold">Lender</th>
                    <th className="px-5 py-3 font-semibold">Type</th>
                    <th className="px-5 py-3 font-semibold">Outstanding</th>
                    <th className="px-5 py-3 font-semibold">EMI</th>
                    <th className="px-5 py-3 font-semibold">Interest</th>
                    <th className="px-5 py-3 font-semibold">Overdue</th>
                    <th className="px-5 py-3 font-semibold">Priority</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {pageItems.map((loan) => (
                      <motion.tr
                        key={loan.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-secondary-100 dark:border-secondary-800/50 hover:bg-secondary-50 dark:hover:bg-secondary-800/30 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary-500/15 flex items-center justify-center">
                              <Landmark className="w-4 h-4 text-primary-500" />
                            </div>
                            <span className="font-medium text-secondary-900 dark:text-white">{loan.lender}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-secondary-600 dark:text-secondary-300">{loan.loan_type}</td>
                        <td className="px-5 py-4 font-semibold text-secondary-900 dark:text-white">{formatINR(Number(loan.outstanding_amount))}</td>
                        <td className="px-5 py-4 text-sm text-secondary-600 dark:text-secondary-300">{formatINR(Number(loan.emi))}</td>
                        <td className="px-5 py-4 text-sm text-secondary-600 dark:text-secondary-300">{loan.interest_rate}%</td>
                        <td className="px-5 py-4">
                          {Number(loan.overdue_months) > 0 ? (
                            <Badge variant="danger">{loan.overdue_months} mo</Badge>
                          ) : (
                            <Badge variant="accent">On time</Badge>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <Badge variant={loan.priority === 'High' ? 'danger' : loan.priority === 'Medium' ? 'warning' : 'accent'}>
                            {loan.priority}
                          </Badge>
                        </td>
                        <td className="px-5 py-4">
                          <Badge variant={loan.status === 'Active' ? 'primary' : loan.status === 'Settled' ? 'accent' : 'neutral'}>
                            {loan.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => setViewTarget(loan)} className="p-2 rounded-lg hover:bg-primary-500/10 text-primary-500" title="View details">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => openEdit(loan)} className="p-2 rounded-lg hover:bg-primary-500/10 text-primary-500" title="Edit">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteTarget(loan)} className="p-2 rounded-lg hover:bg-danger-500/10 text-danger-500" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-secondary-500">
                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-ghost disabled:opacity-40"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium ${
                      page === i + 1 ? 'bg-primary-600 text-white' : 'glass hover:bg-secondary-100 dark:hover:bg-secondary-800'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-ghost disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Loan' : 'Add New Loan'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Lender Name *</label>
              <input
                type="text"
                value={form.lender}
                onChange={(e) => setForm({ ...form, lender: e.target.value })}
                placeholder="HDFC Bank"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Loan Type</label>
              <select
                value={form.loan_type}
                onChange={(e) => setForm({ ...form, loan_type: e.target.value })}
                className="input-field cursor-pointer"
              >
                {loanTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Outstanding Amount (₹)</label>
              <input
                type="number"
                value={form.outstanding_amount}
                onChange={(e) => setForm({ ...form, outstanding_amount: e.target.value })}
                placeholder="500000"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Interest Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={form.interest_rate}
                onChange={(e) => setForm({ ...form, interest_rate: e.target.value })}
                placeholder="12.5"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Monthly EMI (₹)</label>
              <input
                type="number"
                value={form.emi}
                onChange={(e) => setForm({ ...form, emi: e.target.value })}
                placeholder="12000"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Overdue Months</label>
              <input
                type="number"
                value={form.overdue_months}
                onChange={(e) => setForm({ ...form, overdue_months: e.target.value })}
                placeholder="2"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Due Date</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="input-field cursor-pointer"
              >
                {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="input-field cursor-pointer"
              >
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (editing ? 'Update Loan' : 'Add Loan')}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Loan"
        message={`Are you sure you want to delete the loan from ${deleteTarget?.lender}? This action cannot be undone.`}
        confirmText="Delete"
        danger
      />

      <LoanDetailsModal
        loan={viewTarget}
        isOpen={!!viewTarget}
        onClose={() => setViewTarget(null)}
      />
    </div>
  );
}
