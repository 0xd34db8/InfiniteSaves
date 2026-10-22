import React from "react";
import { Icon } from "./Icons";
import { formatPowerValue } from "../constants/powers";

export function AuditLogModal({ isOpen, onClose, changesLog, onRevertChange, onClearAllChanges }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 glass-surface flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] rounded-t-[16px] sm:rounded-xl w-full max-w-2xl max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden modal-spring">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
          <div>
            <h3 className="text-base font-medium tracking-tight text-neutral-900 dark:text-[#EDEDED]">
              Session Audit Log ({changesLog.length})
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              History of edits made during the current editing session
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer p-1.5 rounded-[6px] text-neutral-400 hover:text-neutral-900 dark:hover:text-[#EDEDED] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] fast-transition"
          >
            <Icon name="x" className="w-4 h-4" />
          </button>
        </div>

        {/* Change Entries List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2">
          {changesLog.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 dark:text-neutral-500 text-xs">
              No modifications recorded in this session.
            </div>
          ) : (
            changesLog.map((log, index) => (
              <div
                key={log.id || index}
                className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] hover:border-black/[0.12] dark:hover:border-white/[0.12] rounded-[8px] p-3 flex items-center justify-between gap-3 text-xs fast-transition"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-neutral-500 dark:text-neutral-400 font-medium tabular-nums">
                      #{log.charId}
                    </span>
                    <span className="font-medium text-neutral-900 dark:text-[#EDEDED]">
                      {log.charName}
                    </span>
                    <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-mono">
                      {log.field}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                    <span className="text-neutral-400 dark:text-neutral-500 line-through tabular-nums">
                      {formatPowerValue(log.field, log.oldVal)}
                    </span>
                    <span className="text-neutral-400 dark:text-neutral-600">→</span>
                    <span className="text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {formatPowerValue(log.field, log.newVal)}
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono tabular-nums">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                {onRevertChange && (
                  <button
                    type="button"
                    onClick={() => onRevertChange(log)}
                    className="cursor-pointer text-[11px] font-medium px-2.5 py-1 min-h-[44px] sm:min-h-[28px] bg-black/[0.04] hover:bg-rose-500/10 dark:bg-white/[0.04] text-neutral-700 hover:text-rose-600 dark:text-neutral-300 dark:hover:text-rose-300 border border-black/[0.08] dark:border-white/[0.08] hover:border-rose-500/30 rounded-[6px] shrink-0 flex items-center gap-1 fast-transition active:scale-[0.98]"
                    title="Undo this specific change"
                  >
                    <Icon name="undo" className="w-3 h-3" />
                    <span>Undo</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black/[0.08] dark:border-white/[0.08] bg-black/[0.01] dark:bg-white/[0.01] flex items-center justify-between">
          {changesLog.length > 0 ? (
            <button
              type="button"
              onClick={onClearAllChanges}
              className="cursor-pointer text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 underline"
            >
              Revert All Changes
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-xs font-medium px-4 py-2 min-h-[44px] sm:min-h-[32px] bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-neutral-700 dark:text-neutral-200 border border-black/[0.08] dark:border-white/[0.08] rounded-[8px] fast-transition active:scale-[0.98]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
