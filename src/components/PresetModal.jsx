import React from "react";
import { Icon } from "./Icons";
import { POWER_PRESETS, formatPowerValue } from "../constants/powers";

export function PresetModal({ isOpen, onClose, character, onApplyPreset }) {
  if (!isOpen || !character) return null;

  return (
    <div className="fixed inset-0 z-50 glass-surface flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] rounded-t-[16px] sm:rounded-xl w-full max-w-2xl max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden modal-spring">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
          <div>
            <h3 className="text-base font-medium tracking-tight text-neutral-900 dark:text-[#EDEDED]">
              Loadout Presets
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Apply proven archetype presets to {character.name} (#{character.id})
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

        {/* Preset Cards List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {POWER_PRESETS.map((preset) => (
            <div
              key={preset.name}
              className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] hover:border-black/[0.12] dark:hover:border-white/[0.12] rounded-[8px] p-4 fast-transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-[#EDEDED]">{preset.name}</h4>
                  <span className="text-[10px] font-medium tracking-[0.02em] px-2 py-0.5 rounded-[6px] bg-black/[0.04] dark:bg-white/[0.04] text-neutral-600 dark:text-neutral-400 border border-black/[0.08] dark:border-white/[0.08]">
                    {preset.badge}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">{preset.description}</p>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex flex-wrap gap-x-3 gap-y-1 pt-1 font-mono">
                  <span>Atk: {formatPowerValue("powerAttack", preset.loadout.powerAttack)}</span>
                  <span>Flight: {formatPowerValue("powerFlight", preset.loadout.powerFlight)}</span>
                  <span>Innate: {formatPowerValue("powerInnate", preset.loadout.powerInnate)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onApplyPreset(preset.loadout);
                  onClose();
                }}
                className="cursor-pointer text-xs font-medium px-3.5 py-2 min-h-[44px] sm:min-h-[32px] w-full sm:w-auto bg-[#111111] text-[#EDEDED] hover:bg-[#262626] dark:bg-[#EDEDED] dark:text-[#111111] dark:hover:bg-[#F5F5F5] rounded-[8px] shrink-0 self-end sm:self-center fast-transition active:scale-[0.98]"
              >
                Apply Preset
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black/[0.08] dark:border-white/[0.08] bg-black/[0.01] dark:bg-white/[0.01] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-xs font-medium px-4 py-2 min-h-[44px] sm:min-h-[32px] w-full sm:w-auto bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-neutral-700 dark:text-neutral-200 border border-black/[0.08] dark:border-white/[0.08] rounded-[8px] fast-transition active:scale-[0.98]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
