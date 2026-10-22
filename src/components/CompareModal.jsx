import React from "react";
import { Icon } from "./Icons";
import {
  POWER_FIELDS,
  POWER_MAPPINGS,
  STAT_MAPPINGS,
  formatPowerValue,
} from "../constants/powers";

export function CompareModal({
  isOpen,
  onClose,
  character,
  timeMachineChar,
  onCloneFromTimeMachine,
}) {
  if (!isOpen || !character) return null;

  return (
    <div className="fixed inset-0 z-50 glass-surface flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] rounded-t-[16px] sm:rounded-xl w-full max-w-3xl max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden modal-spring">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
          <div>
            <h3 className="text-base font-medium tracking-tight text-neutral-900 dark:text-[#EDEDED]">
              Roster Comparison: {character.name} (#{character.id})
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Comparing Active World (`savedChars`) against Time Machine snapshot (`timeChars`)
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

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {timeMachineChar ? (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-black/[0.02] dark:bg-white/[0.02] p-3 rounded-[8px] border border-black/[0.06] dark:border-white/[0.06]">
                <span className="text-xs text-neutral-600 dark:text-neutral-300">
                  Copy all superpowers & power amounts from Time Machine snapshot into Active World:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onCloneFromTimeMachine();
                    onClose();
                  }}
                  className="cursor-pointer text-xs font-medium px-3.5 py-2 min-h-[44px] sm:min-h-[32px] w-full sm:w-auto bg-[#111111] text-[#EDEDED] hover:bg-[#262626] dark:bg-[#EDEDED] dark:text-[#111111] dark:hover:bg-[#F5F5F5] rounded-[8px] flex items-center justify-center gap-1.5 fast-transition active:scale-[0.98]"
                >
                  <Icon name="zap" className="w-3.5 h-3.5" />
                  <span>Execute Full Clone</span>
                </button>
              </div>

              {/* General & Powers Comparison */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                  Superpower Categories
                </h4>
                <div className="border border-black/[0.08] dark:border-white/[0.08] rounded-[8px] overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs min-w-[480px]">
                    <thead>
                      <tr className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/[0.08] dark:border-white/[0.08] text-neutral-500 dark:text-neutral-400">
                        <th className="py-2.5 px-3 font-medium">Attribute</th>
                        <th className="py-2.5 px-3 font-medium text-neutral-700 dark:text-neutral-300">
                          Active World
                        </th>
                        <th className="py-2.5 px-3 font-medium text-neutral-700 dark:text-neutral-300">
                          Time Machine
                        </th>
                        <th className="py-2.5 px-3 font-medium text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-0.5">
                      <tr className="h-9 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] fast-transition">
                        <td className="py-2 px-3 font-medium text-neutral-700 dark:text-neutral-300">
                          Alias / Alter-Ego
                        </td>
                        <td className="py-2 px-3 font-mono text-neutral-700 dark:text-neutral-300">
                          "{character.alias || "None"}"
                        </td>
                        <td className="py-2 px-3 font-mono text-neutral-700 dark:text-neutral-300">
                          "{timeMachineChar.alias || "None"}"
                        </td>
                        <td className="py-2 px-3 text-right">
                          {character.alias === timeMachineChar.alias ? (
                            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                              Match
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-300">
                              Different
                            </span>
                          )}
                        </td>
                      </tr>

                      {POWER_FIELDS.map((key) => {
                        const meta = POWER_MAPPINGS[key];
                        const valActive = character[key];
                        const valTime = timeMachineChar[key];

                        let isMatch = false;
                        if (key === "projectileLimb") {
                          isMatch = JSON.stringify(valActive) === JSON.stringify(valTime);
                        } else {
                          isMatch = Number(valActive) === Number(valTime);
                        }

                        return (
                          <tr
                            key={key}
                            className={`h-9 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] fast-transition ${
                              !isMatch ? "bg-amber-500/[0.04]" : ""
                            }`}
                          >
                            <td className="py-2 px-3 font-medium text-neutral-700 dark:text-neutral-300">
                              {meta.name}
                            </td>
                            <td className="py-2 px-3 font-mono text-neutral-700 dark:text-neutral-300 tabular-nums">
                              {formatPowerValue(key, valActive)}
                            </td>
                            <td className="py-2 px-3 font-mono text-neutral-700 dark:text-neutral-300 tabular-nums">
                              {formatPowerValue(key, valTime)}
                            </td>
                            <td className="py-2 px-3 text-right">
                              {isMatch ? (
                                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                  Match
                                </span>
                              ) : (
                                <span className="text-[11px] font-medium text-amber-600 dark:text-amber-300">
                                  Different
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Super Stat Amounts Comparison */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                  Power Amounts
                </h4>
                <div className="border border-black/[0.08] dark:border-white/[0.08] rounded-[8px] overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs min-w-[480px]">
                    <thead>
                      <tr className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/[0.08] dark:border-white/[0.08] text-neutral-500 dark:text-neutral-400">
                        <th className="py-2.5 px-3 font-medium">Stat Attribute</th>
                        <th className="py-2.5 px-3 font-medium text-neutral-700 dark:text-neutral-300">
                          Active World
                        </th>
                        <th className="py-2.5 px-3 font-medium text-neutral-700 dark:text-neutral-300">
                          Time Machine
                        </th>
                        <th className="py-2.5 px-3 font-medium text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-0.5">
                      {/* Spirit Meter */}
                      <tr className="h-9 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] fast-transition">
                        <td className="py-2 px-3 font-medium text-neutral-700 dark:text-neutral-300">
                          Spirit
                        </td>
                        <td className="py-2 px-3 font-mono text-neutral-700 dark:text-neutral-300 tabular-nums">
                          {Number(character.spirit ?? 100).toFixed(1)}%
                        </td>
                        <td className="py-2 px-3 font-mono text-neutral-700 dark:text-neutral-300 tabular-nums">
                          {Number(timeMachineChar.spirit ?? 100).toFixed(1)}%
                        </td>
                        <td className="py-2 px-3 text-right">
                          {Math.round(character.spirit ?? 100) === Math.round(timeMachineChar.spirit ?? 100) ? (
                            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                              Match
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-300">
                              Different
                            </span>
                          )}
                        </td>
                      </tr>

                      {/* SuperStat Attributes */}
                      {STAT_MAPPINGS.slice(0, 7).map((statMeta) => {
                        const valActive = character.superStat?.[statMeta.key] ?? 100;
                        const valTime = timeMachineChar.superStat?.[statMeta.key] ?? 100;
                        const isMatch = Math.round(valActive) === Math.round(valTime);

                        return (
                          <tr
                            key={statMeta.key}
                            className={`h-9 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] fast-transition ${
                              !isMatch ? "bg-amber-500/[0.04]" : ""
                            }`}
                          >
                            <td className="py-2 px-3 font-medium text-neutral-700 dark:text-neutral-300">
                              {statMeta.name}
                            </td>
                            <td className="py-2 px-3 font-mono text-neutral-700 dark:text-neutral-300 tabular-nums">
                              {Number(valActive).toFixed(1)}%
                            </td>
                            <td className="py-2 px-3 font-mono text-neutral-700 dark:text-neutral-300 tabular-nums">
                              {Number(valTime).toFixed(1)}%
                            </td>
                            <td className="py-2 px-3 text-right">
                              {isMatch ? (
                                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                  Match
                                </span>
                              ) : (
                                <span className="text-[11px] font-medium text-amber-600 dark:text-amber-300">
                                  Different
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center p-8 text-neutral-500 dark:text-neutral-400 text-xs">
              Character #{character.id} does not exist in Time Machine roster.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-black/[0.08] dark:border-white/[0.08] bg-black/[0.01] dark:bg-white/[0.01] flex justify-end">
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
