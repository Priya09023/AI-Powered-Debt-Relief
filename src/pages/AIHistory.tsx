import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History, Search, Mail, Brain, Lightbulb, Trash2,
  Calendar, Download, Copy, Check, FileDown, LayoutGrid, List,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useUserData } from '../hooks/useUserData';
import { useToast } from '../context/ToastContext';
import { exportHistoryReport } from '../lib/exportReport';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import type { AIHistoryItem } from '../lib/types';

const typeFilters = [
  { value: 'All', label: 'All' },
  { value: 'letter', label: 'Letters' },
  { value: 'prediction', label: 'Predictions' },
  { value: 'recommendation', label: 'Recommendations' },
];

const dateFilters = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

export default function AIHistory() {
  const { aiHistory, loading, refresh } = useUserData();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('all');
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [viewItem, setViewItem] = useState<AIHistoryItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AIHistoryItem | null>(null);

  const filteredByDate = useMemo(() => {
    if (dateFilter === 'all') return aiHistory;
    const now = new Date();
    const start = new Date(now);
    if (dateFilter === 'today') start.setHours(0, 0, 0, 0);
    else if (dateFilter === 'week') start.setDate(now.getDate() - 7);
    else if (dateFilter === 'month') start.setMonth(now.getMonth() - 1);
    return aiHistory.filter((h) => new Date(h.created_at || '') >= start);
  }, [aiHistory, dateFilter]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearch(q);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let list = filteredByDate.filter((h) =>
      h.title.toLowerCase().includes(search.toLowerCase()) ||
      h.content.toLowerCase().includes(search.toLowerCase())
    );
    if (typeFilter !== 'All') list = list.filter((h) => h.type === typeFilter);
    return list;
  }, [filteredByDate, search, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleExportReport = () => {
    if (filtered.length === 0) { toast('No items to export', 'error'); return; }
    exportHistoryReport(filtered);
    toast(`Exported ${filtered.length} items to PDF`, 'success');
  };

  const handleCopy = async () => {
    if (!viewItem) return;
    await navigator.clipboard.writeText(viewItem.content);
    setCopied(true);
    toast('Copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!viewItem) return;
    const blob = new Blob([viewItem.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${viewItem.title.replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Downloaded', 'success');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('ai_history').delete().eq('id', deleteTarget.id);
    if (error) toast(error.message, 'error');
    else { toast('Deleted', 'success'); refresh(); }
  };

  const iconFor = (type: string) => {
    if (type === 'letter') return <Mail className="w-4 h-4" />;
    if (type === 'prediction') return <Brain className="w-4 h-4" />;
    return <Lightbulb className="w-4 h-4" />;
  };

  if (loading) return <TableSkeleton rows={5} />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
          <History className="w-6 h-6 text-primary-500" /> AI History
        </h2>
        <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
          All your generated letters, predictions, and recommendations in one place.
        </p>
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search history..."
              className="input-field pl-11"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {typeFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => { setTypeFilter(f.value); setPage(1); }}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  typeFilter === f.value
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                    : 'glass hover:bg-secondary-100 dark:hover:bg-secondary-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-secondary-400" />
            <div className="flex gap-1.5 flex-wrap">
              {dateFilters.map((d) => (
                <button
                  key={d.value}
                  onClick={() => { setDateFilter(d.value); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    dateFilter === d.value
                      ? 'bg-primary-500/15 text-primary-500 ring-1 ring-primary-500/30'
                      : 'glass hover:bg-secondary-100 dark:hover:bg-secondary-800 text-secondary-500'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl glass overflow-hidden">
              <button
                onClick={() => setView('grid')}
                className={`p-2 ${view === 'grid' ? 'bg-primary-500 text-white' : 'text-secondary-400 hover:text-primary-500'}`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('table')}
                className={`p-2 ${view === 'table' ? 'bg-primary-500 text-white' : 'text-secondary-400 hover:text-primary-500'}`}
                title="Table view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <button onClick={handleExportReport} className="btn-secondary !py-2 text-sm" title="Export filtered items to PDF">
              <FileDown className="w-4 h-4" /> Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      {pageItems.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<History className="w-8 h-8" />}
            title={aiHistory.length === 0 ? 'No AI history yet' : 'No matching items'}
            description={aiHistory.length === 0 ? 'Generate a negotiation letter or run a settlement prediction to see your history here.' : 'Try a different search or filter.'}
          />
        </div>
      ) : view === 'grid' ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {pageItems.map((h) => (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -4 }}
                  onClick={() => setViewItem(h)}
                  className="card p-5 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      h.type === 'letter' ? 'bg-primary-500/15 text-primary-500' :
                      h.type === 'prediction' ? 'bg-accent-500/15 text-accent-500' :
                      'bg-warning-500/15 text-warning-500'
                    }`}>
                      {iconFor(h.type)}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(h); }}
                      className="p-1.5 rounded-lg text-secondary-400 hover:bg-danger-500/10 hover:text-danger-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-semibold text-secondary-900 dark:text-white line-clamp-1">{h.title}</h4>
                  <p className="mt-2 text-xs text-secondary-500 dark:text-secondary-400 line-clamp-3 leading-relaxed">
                    {h.content}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <Badge variant={h.type === 'letter' ? 'primary' : h.type === 'prediction' ? 'accent' : 'warning'}>
                      {h.type}
                    </Badge>
                    <span className="text-xs text-secondary-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(h.created_at || '').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-secondary-500">
                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost disabled:opacity-40">Previous</button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium ${
                      page === i + 1 ? 'bg-primary-600 text-white' : 'glass hover:bg-secondary-100 dark:hover:bg-secondary-800'
                    }`}
                  >{i + 1}</button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Responsive table view */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-secondary-200 dark:border-secondary-800 text-left text-xs uppercase text-secondary-500">
                    <th className="px-5 py-3 font-semibold">Type</th>
                    <th className="px-5 py-3 font-semibold">Title</th>
                    <th className="px-5 py-3 font-semibold hidden sm:table-cell">Preview</th>
                    <th className="px-5 py-3 font-semibold hidden md:table-cell">Date</th>
                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {pageItems.map((h) => (
                      <motion.tr
                        key={h.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setViewItem(h)}
                        className="border-b border-secondary-100 dark:border-secondary-800/50 hover:bg-secondary-50 dark:hover:bg-secondary-800/30 cursor-pointer transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            h.type === 'letter' ? 'bg-primary-500/15 text-primary-500' :
                            h.type === 'prediction' ? 'bg-accent-500/15 text-accent-500' :
                            'bg-warning-500/15 text-warning-500'
                          }`}>
                            {iconFor(h.type)}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-medium text-secondary-900 dark:text-white">{h.title}</span>
                          <span className="block sm:hidden text-xs text-secondary-400 mt-1 line-clamp-1">{h.content}</span>
                        </td>
                        <td className="px-5 py-4 text-sm text-secondary-500 dark:text-secondary-400 hidden sm:table-cell max-w-xs">
                          <span className="line-clamp-1">{h.content}</span>
                        </td>
                        <td className="px-5 py-4 text-xs text-secondary-400 hidden md:table-cell">
                          {new Date(h.created_at || '').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); setViewItem(h); }}
                              className="p-2 rounded-lg hover:bg-primary-500/10 text-primary-500"
                              title="View"
                            >
                              <Search className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteTarget(h); }}
                              className="p-2 rounded-lg hover:bg-danger-500/10 text-danger-500"
                              title="Delete"
                            >
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
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost disabled:opacity-40">Previous</button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium ${
                      page === i + 1 ? 'bg-primary-600 text-white' : 'glass hover:bg-secondary-100 dark:hover:bg-secondary-800'
                    }`}
                  >{i + 1}</button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* View modal */}
      <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title={viewItem?.title} size="lg">
        {viewItem && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant={viewItem.type === 'letter' ? 'primary' : viewItem.type === 'prediction' ? 'accent' : 'warning'}>
                {viewItem.type}
              </Badge>
              <span className="text-xs text-secondary-400">
                {new Date(viewItem.created_at || '').toLocaleString('en-IN')}
              </span>
            </div>
            <pre className="whitespace-pre-wrap font-sans text-sm text-secondary-700 dark:text-secondary-300 leading-relaxed bg-secondary-50 dark:bg-secondary-800/30 p-5 rounded-xl max-h-[400px] overflow-y-auto">
              {viewItem.content}
            </pre>
            <div className="flex gap-3 justify-end">
              <button onClick={handleCopy} className="btn-ghost">
                {copied ? <Check className="w-4 h-4 text-accent-500" /> : <Copy className="w-4 h-4" />} Copy
              </button>
              <button onClick={handleDownload} className="btn-secondary">
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Item" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-secondary-600 dark:text-secondary-300">
            Are you sure you want to delete "{deleteTarget?.title}"? This cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setDeleteTarget(null)} className="btn-ghost">Cancel</button>
            <button onClick={() => { handleDelete(); setDeleteTarget(null); }} className="px-6 py-2.5 rounded-xl bg-danger-600 text-white font-semibold hover:bg-danger-700 active:scale-95 transition-all">
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
