import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemTitle?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title,
  message,
  itemTitle,
  confirmLabel = 'Permanently Delete',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <button
              onClick={onCancel}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            {itemTitle && (
              <p className="mt-1 font-semibold text-xs text-rose-600 line-clamp-2 bg-rose-50/60 p-2 rounded-lg border border-rose-100">
                "{itemTitle}"
              </p>
            )}
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">{message}</p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{confirmLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
