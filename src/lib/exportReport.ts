import jsPDF from 'jspdf';
import type { Loan, Profile, SettlementRecord, AIHistoryItem } from './types';

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

interface ReportData {
  profile: Profile | null;
  loans: Loan[];
  settlements: SettlementRecord[];
  aiHistory: AIHistoryItem[];
}

const BRAND = {
  primary: [37, 99, 235] as [number, number, number],
  dark: [15, 23, 42] as [number, number, number],
  accent: [34, 197, 94] as [number, number, number],
  gray: [100, 116, 139] as [number, number, number],
  light: [241, 245, 249] as [number, number, number],
};

function addHeader(doc: jsPDF, title: string, subtitle: string) {
  // Background band
  doc.setFillColor(...BRAND.dark);
  doc.rect(0, 0, 210, 40, 'F');

  // Brand mark
  doc.setFillColor(...BRAND.primary);
  doc.roundedRect(14, 12, 16, 16, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('F', 18, 22);

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(title, 36, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(200, 200, 200);
  doc.text(subtitle, 36, 25);

  // Date
  doc.setFontSize(9);
  doc.text(
    `Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    196, 18,
    { align: 'right' },
  );
}

function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...BRAND.light);
    doc.setLineWidth(0.3);
    doc.line(14, 285, 196, 285);
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.gray);
    doc.setFont('helvetica', 'normal');
    doc.text('FinRelief AI - AI Powered Debt Relief & Financial Recovery Platform', 14, 291);
    doc.text(`Page ${i} of ${pageCount}`, 196, 291, { align: 'right' });
  }
}

function sectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(...BRAND.primary);
  doc.roundedRect(14, y, 182, 8, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(title, 17, y + 5.5);
  return y + 14;
}

function keyValue(doc: jsPDF, key: string, value: string, y: number): number {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.gray);
  doc.text(key, 18, y);
  doc.setTextColor(...BRAND.dark);
  doc.setFont('helvetica', 'bold');
  doc.text(value, 100, y);
  return y + 7;
}

export function exportFullReport(data: ReportData) {
  const doc = new jsPDF();
  let y = 50;

  addHeader(doc, 'Financial Recovery Report', 'Comprehensive debt & settlement overview');

  // Profile section
  if (data.profile) {
    y = sectionTitle(doc, 'Personal & Financial Profile', y);
    y = keyValue(doc, 'Full Name', data.profile.full_name || '-', y);
    y = keyValue(doc, 'Employment Type', data.profile.employment_type || '-', y);
    y = keyValue(doc, 'Dependents', String(data.profile.dependents ?? 0), y);
    y = keyValue(doc, 'Monthly Income', formatINR(Number(data.profile.monthly_income) || 0), y);
    y = keyValue(doc, 'Monthly Expenses', formatINR(Number(data.profile.monthly_expenses) || 0), y);
    y = keyValue(doc, 'Savings', formatINR(Number(data.profile.savings) || 0), y);
    y = keyValue(doc, 'Existing Debts', formatINR(Number(data.profile.existing_debts) || 0), y);
    y = keyValue(doc, 'Total Assets', formatINR(Number(data.profile.assets) || 0), y);

    const surplus = (Number(data.profile.monthly_income) || 0) - (Number(data.profile.monthly_expenses) || 0);
    y = keyValue(doc, 'Monthly Surplus', formatINR(surplus), y);
    y += 4;
  }

  // Loans section
  if (data.loans.length > 0) {
    if (y > 240) { doc.addPage(); y = 20; }
    y = sectionTitle(doc, 'Loan Portfolio', y);

    // Table header
    doc.setFillColor(...BRAND.light);
    doc.rect(14, y - 4, 182, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.dark);
    doc.text('Lender', 16, y);
    doc.text('Type', 56, y);
    doc.text('Outstanding', 86, y);
    doc.text('EMI', 116, y);
    doc.text('Overdue', 141, y);
    doc.text('Priority', 166, y);
    doc.text('Status', 186, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    data.loans.forEach((l) => {
      if (y > 280) { doc.addPage(); y = 20; }
      doc.setTextColor(...BRAND.dark);
      doc.text(String(l.lender).slice(0, 24), 16, y);
      doc.text(String(l.loan_type).slice(0, 16), 56, y);
      doc.text(formatINR(Number(l.outstanding_amount)), 86, y);
      doc.text(formatINR(Number(l.emi)), 116, y);
      doc.text(`${l.overdue_months} mo`, 141, y);
      doc.text(String(l.priority), 166, y);
      doc.text(String(l.status), 186, y);
      doc.setDrawColor(...BRAND.light);
      doc.setLineWidth(0.2);
      doc.line(14, y + 2, 196, y + 2);
      y += 6;
    });
    y += 4;
  }

  // Settlements section
  if (data.settlements.length > 0) {
    if (y > 240) { doc.addPage(); y = 20; }
    y = sectionTitle(doc, 'AI Settlement Predictions', y);
    doc.setFontSize(9);
    data.settlements.forEach((s) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...BRAND.dark);
      doc.text(`Settlement ${s.settlement_percentage}% - ${formatINR(Number(s.recommended_amount))}`, 16, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...BRAND.gray);
      doc.text(`Risk: ${s.risk_category} | Priority: ${s.priority} | Health: ${s.financial_health}`, 16, y);
      y += 5;
      doc.text(`Date: ${new Date(s.created_at || '').toLocaleDateString('en-IN')}`, 16, y);
      y += 8;
    });
    y += 2;
  }

  // AI History section
  if (data.aiHistory.length > 0) {
    if (y > 240) { doc.addPage(); y = 20; }
    y = sectionTitle(doc, 'AI History Log', y);
    doc.setFontSize(9);
    data.aiHistory.slice(0, 20).forEach((h) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...BRAND.dark);
      doc.text(h.title, 16, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...BRAND.gray);
      doc.text(`${h.type} | ${new Date(h.created_at || '').toLocaleDateString('en-IN')}`, 16, y);
      y += 7;
    });
  }

  addFooter(doc);
  doc.save(`finrelief-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportLoanReport(loan: Loan, profile: Profile | null) {
  const doc = new jsPDF();
  addHeader(doc, 'Loan Details Report', `${loan.lender} - ${loan.loan_type}`);

  let y = 50;
  y = sectionTitle(doc, 'Loan Information', y);
  y = keyValue(doc, 'Lender', loan.lender, y);
  y = keyValue(doc, 'Loan Type', loan.loan_type, y);
  y = keyValue(doc, 'Outstanding Amount', formatINR(Number(loan.outstanding_amount)), y);
  y = keyValue(doc, 'Monthly EMI', formatINR(Number(loan.emi)), y);
  y = keyValue(doc, 'Interest Rate', `${loan.interest_rate}% p.a.`, y);
  y = keyValue(doc, 'Overdue Months', `${loan.overdue_months} months`, y);
  y = keyValue(doc, 'Due Date', loan.due_date ? new Date(loan.due_date).toLocaleDateString('en-IN') : '-', y);
  y = keyValue(doc, 'Priority', loan.priority, y);
  y = keyValue(doc, 'Status', loan.status, y);
  y += 4;

  if (profile) {
    y = sectionTitle(doc, 'Borrower Information', y);
    y = keyValue(doc, 'Name', profile.full_name || '-', y);
    y = keyValue(doc, 'Employment', profile.employment_type || '-', y);
    y = keyValue(doc, 'Monthly Income', formatINR(Number(profile.monthly_income) || 0), y);
    y = keyValue(doc, 'Monthly Expenses', formatINR(Number(profile.monthly_expenses) || 0), y);
  }

  addFooter(doc);
  doc.save(`loan-report-${loan.lender.replace(/\s+/g, '-').toLowerCase()}.pdf`);
}

export function exportHistoryReport(items: AIHistoryItem[]) {
  const doc = new jsPDF();
  addHeader(doc, 'AI History Report', `${items.length} items exported`);

  let y = 50;
  if (items.length === 0) {
    doc.setFontSize(12);
    doc.setTextColor(...BRAND.gray);
    doc.text('No AI history items to export.', 14, y);
  } else {
    items.forEach((h, idx) => {
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFillColor(...BRAND.light);
      doc.rect(14, y - 5, 182, 14, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...BRAND.dark);
      doc.text(`${idx + 1}. ${h.title}`, 16, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...BRAND.gray);
      doc.text(`${h.type} | ${new Date(h.created_at || '').toLocaleString('en-IN')}`, 16, y + 5);
      y += 12;

      doc.setFontSize(9);
      doc.setTextColor(...BRAND.dark);
      const lines = doc.splitTextToSize(h.content, 180);
      lines.forEach((line: string) => {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.text(line, 16, y);
        y += 4;
      });
      y += 6;
    });
  }

  addFooter(doc);
  doc.save(`ai-history-${new Date().toISOString().slice(0, 10)}.pdf`);
}
