import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={`p-3 rounded-xl ${danger ? 'bg-danger-500/10 text-danger-500' : 'bg-warning-500/10 text-warning-500'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-sm text-secondary-600 dark:text-secondary-300 pt-1">{message}</p>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-ghost">{cancelText}</button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={danger ? 'px-6 py-2.5 rounded-xl bg-danger-600 text-white font-semibold hover:bg-danger-700 active:scale-95 transition-all' : 'btn-primary'}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
