import React, { useState } from "react";
import { Icon } from "./Icons";
import { STAT_MAPPINGS } from "../constants/powers";

export function PowerAmountEditor({
  character,
  timeMachineChar,
  rosterType,
  onUpdateStat,
  onBatchUpdateStats,
}) {
  const [activeStatTab, setActiveStatTab] = useState("superStat"); // "superStat" or "stat"

  if (!character) return null;

  const currentStats = (activeStatTab === "superStat" ? character.superStat : character.stat) || {};
  const availableKeys = Object.keys(currentStats).sort((a, b) => Number(a) - Number(b));

  // Quick preset booster for all stats in active tab
  const handleBoostAll = (multiplier) => {
    const updated = {};
    availableKeys.forEach((key) => {
      // Keep popularity (key 6) capped at 100 or scale accordingly
      if (key === "6") {
        updated[key] = Math.min(multiplier, 100);
      } else {
        updated[key] = multiplier;
      }
    });
    onBatchUpdateStats?.(activeStatTab, updated);
  };

  // Clone power amounts from Time Machine
  const handleCloneAmounts = () => {
    if (!timeMachineChar) return;
    if (activeStatTab === "superStat" && timeMachineChar.superStat) {
      onBatchUpdateStats?.("superStat", { ...timeMachineChar.superStat });
    } else if (activeStatTab === "stat" && timeMachineChar.stat) {
      onBatchUpdateStats?.("stat", { ...timeMachineChar.stat });
    }
  };

  return (
    <div className="space-y-4">
      {/* Category & Boost Toolbar */}
      <div className="bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Segmented Tab Control */}
        <div className="inline-flex p-1 bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-[8px] text-xs">
          <button
            type="button"
            onClick={() => setActiveStatTab("superStat")}
            className={`cursor-pointer px-3 py-1.5 rounded-[6px] font-medium flex items-center gap-1.5 fast-transition ${
              activeStatTab === "superStat"
                ? "bg-white dark:bg-[#1E1E1E] text-neutral-900 dark:text-[#EDEDED] shadow-xs"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-[#EDEDED]"
            }`}
          >
            <Icon name="zap" className="w-3.5 h-3.5 text-amber-500" />
            <span>Super Form</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStatTab("stat")}
            className={`cursor-pointer px-3 py-1.5 rounded-[6px] font-medium flex items-center gap-1.5 fast-transition ${
              activeStatTab === "stat"
                ? "bg-white dark:bg-[#1E1E1E] text-neutral-900 dark:text-[#EDEDED] shadow-xs"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-[#EDEDED]"
            }`}
          >
            <Icon name="user" className="w-3.5 h-3.5" />
            <span>Civilian Base</span>
          </button>
        </div>

        {/* Quick Batch Boosters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400 dark:text-neutral-500">
            Quick Boost:
          </span>
          <button
            type="button"
            onClick={() => handleBoostAll(200)}
            className="cursor-pointer text-xs font-medium px-2.5 py-1.5 rounded-[6px] bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/25 fast-transition active:scale-[0.98]"
          >
            Max (200%)
          </button>
          <button
            type="button"
            onClick={() => handleBoostAll(500)}
            className="cursor-pointer text-xs font-medium px-2.5 py-1.5 rounded-[6px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/25 fast-transition active:scale-[0.98]"
          >
            God Mode (500%)
          </button>
          <button
            type="button"
            onClick={() => handleBoostAll(150)}
            className="cursor-pointer text-xs font-medium px-2.5 py-1.5 rounded-[6px] bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-neutral-700 dark:text-neutral-300 border border-black/[0.08] dark:border-white/[0.08] fast-transition"
          >
            150%
          </button>
          <button
            type="button"
            onClick={() => handleBoostAll(100)}
            className="cursor-pointer text-xs font-medium px-2.5 py-1.5 rounded-[6px] bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-neutral-700 dark:text-neutral-300 border border-black/[0.08] dark:border-white/[0.08] fast-transition"
          >
            Reset 100%
          </button>

          {rosterType === "savedChars" && timeMachineChar && (
            <button
              type="button"
              onClick={handleCloneAmounts}
              className="cursor-pointer text-xs font-medium px-2.5 py-1.5 rounded-[6px] bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-neutral-700 dark:text-neutral-300 border border-black/[0.08] dark:border-white/[0.08] flex items-center gap-1.5 fast-transition active:scale-[0.98]"
            >
              <Icon name="copy" className="w-3 h-3" />
              <span>Copy from Time Machine</span>
            </button>
          )}
        </div>
      </div>

      {/* Stat Attribute Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {availableKeys.map((key) => {
          const meta = STAT_MAPPINGS.find((m) => m.key === key) || {
            key,
            name: `Stat Slot ${key}`,
            icon: "zap",
          };

          const rawVal = currentStats[key] !== undefined ? Number(currentStats[key]) : 100;
          const percentageDisplay = rawVal.toFixed(1);
          const sliderVal = Math.min(200, Math.max(0, rawVal));

          return (
            <div
              key={key}
              className="bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-5 flex flex-col justify-between hover:border-black/[0.14] dark:hover:border-white/[0.14] fast-transition shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-[#EDEDED]">
                    {meta.name}
                  </h4>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-[4px] bg-black/[0.04] dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-200 border border-black/[0.08] dark:border-white/[0.08] font-semibold tabular-nums">
                    {percentageDisplay}%
                  </span>
                </div>

                {/* Slider & Number Input */}
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="0.5"
                    value={sliderVal}
                    onChange={(e) => onUpdateStat(activeStatTab, key, parseFloat(e.target.value))}
                    className="flex-1 accent-neutral-900 dark:accent-[#EDEDED] cursor-pointer"
                  />
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      value={rawVal}
                      onChange={(e) => onUpdateStat(activeStatTab, key, parseFloat(e.target.value) || 0)}
                      className="w-20 bg-white dark:bg-white/[0.03] border border-black/[0.12] dark:border-white/[0.12] text-neutral-900 dark:text-[#EDEDED] font-mono text-xs rounded-[6px] px-2 py-1.5 text-right custom-focus fast-transition tabular-nums"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 text-[10px] pointer-events-none">
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
