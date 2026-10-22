import React, { useState } from "react";
import { Icon } from "./Icons";
import { STAT_MAPPINGS } from "../constants/powers";

export function PowerAmountEditor({
  character,
  onUpdateStat,
  onUpdateField,
}) {
  const [activeStatTab, setActiveStatTab] = useState("superStat"); // "superStat", "stat", "energy"

  if (!character) return null;

  const currentStats = (activeStatTab === "superStat" ? character.superStat : character.stat) || {};
  const statList = activeStatTab === "superStat" ? STAT_MAPPINGS.slice(0, 7) : STAT_MAPPINGS;

  return (
    <div className="space-y-4">
      {/* Category Toolbar */}
      <div className="bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-3 sm:p-4">
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

          <button
            type="button"
            onClick={() => setActiveStatTab("energy")}
            className={`cursor-pointer px-3 py-1.5 rounded-[6px] font-medium flex items-center gap-1.5 fast-transition ${
              activeStatTab === "energy"
                ? "bg-white dark:bg-[#1E1E1E] text-neutral-900 dark:text-[#EDEDED] shadow-xs"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-[#EDEDED]"
            }`}
          >
            <Icon name="sparkles" className="w-3.5 h-3.5 text-purple-400" />
            <span>Energy & Health</span>
          </button>
        </div>
      </div>

      {/* Energy & Vitality Sub-Tab */}
      {activeStatTab === "energy" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Spirit Meter */}
          <div className="bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-black/[0.14] dark:hover:border-white/[0.14] fast-transition shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-neutral-900 dark:text-[#EDEDED]">
                  Spirit
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    const val = window.prompt("Enter Spirit percentage:", character.spirit ?? 100);
                    if (val !== null && val.trim() !== "") {
                      const num = parseFloat(val);
                      if (!isNaN(num)) onUpdateField("spirit", num);
                    }
                  }}
                  className="cursor-pointer font-mono text-xs px-2 py-0.5 rounded-[4px] bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 dark:text-pink-400 border border-pink-500/20 font-semibold tabular-nums fast-transition"
                  title="Click to enter custom percentage"
                >
                  {Number(character.spirit ?? 100).toFixed(1)}%
                </button>
              </div>

              <div className="space-y-3">
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="0.5"
                  value={Math.min(200, Math.max(0, character.spirit ?? 100))}
                  onChange={(e) => onUpdateField("spirit", parseFloat(e.target.value))}
                  className="w-full accent-pink-500 cursor-pointer"
                />

                <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-0.5">
                  <span>Presets:</span>
                  <div className="flex items-center gap-1">
                    {[50, 100, 150, 200].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => onUpdateField("spirit", val)}
                        className="cursor-pointer text-[10px] font-mono px-1.5 py-0.5 rounded-[4px] bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-neutral-600 dark:text-neutral-300 border border-black/[0.06] dark:border-white/[0.06] fast-transition"
                      >
                        {val}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Health Limit */}
          <div className="bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-black/[0.14] dark:hover:border-white/[0.14] fast-transition shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-neutral-900 dark:text-[#EDEDED]">
                  Health Limit
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    const val = window.prompt("Enter Health Limit percentage:", character.healthLimit ?? 100);
                    if (val !== null && val.trim() !== "") {
                      const num = parseFloat(val);
                      if (!isNaN(num)) onUpdateField("healthLimit", num);
                    }
                  }}
                  className="cursor-pointer font-mono text-xs px-2 py-0.5 rounded-[4px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold tabular-nums fast-transition"
                  title="Click to enter custom percentage"
                >
                  {Number(character.healthLimit ?? 100).toFixed(1)}%
                </button>
              </div>

              <div className="space-y-3">
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="1"
                  value={Math.min(300, Math.max(50, character.healthLimit ?? 100))}
                  onChange={(e) => onUpdateField("healthLimit", parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />

                <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-0.5">
                  <span>Presets:</span>
                  <div className="flex items-center gap-1">
                    {[100, 150, 200, 300].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => onUpdateField("healthLimit", val)}
                        className="cursor-pointer text-[10px] font-mono px-1.5 py-0.5 rounded-[4px] bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-neutral-600 dark:text-neutral-300 border border-black/[0.06] dark:border-white/[0.06] fast-transition"
                      >
                        {val}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Health */}
          <div className="bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-black/[0.14] dark:hover:border-white/[0.14] fast-transition shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-neutral-900 dark:text-[#EDEDED]">
                  Health
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    const val = window.prompt("Enter Health percentage:", character.health ?? 100);
                    if (val !== null && val.trim() !== "") {
                      const num = parseFloat(val);
                      if (!isNaN(num)) onUpdateField("health", num);
                    }
                  }}
                  className="cursor-pointer font-mono text-xs px-2 py-0.5 rounded-[4px] bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/20 font-semibold tabular-nums fast-transition"
                  title="Click to enter custom percentage"
                >
                  {Number(character.health ?? 100).toFixed(1)}%
                </button>
              </div>

              <div className="space-y-3">
                <input
                  type="range"
                  min="1"
                  max={character.healthLimit ?? 100}
                  step="0.5"
                  value={Math.min(character.healthLimit ?? 100, Math.max(1, character.health ?? 100))}
                  onChange={(e) => onUpdateField("health", parseFloat(e.target.value))}
                  className="w-full accent-teal-500 cursor-pointer"
                />

                <button
                  type="button"
                  onClick={() => onUpdateField("health", character.healthLimit ?? 100)}
                  className="cursor-pointer text-xs font-medium px-3 py-1.5 rounded-[6px] bg-[#111111] text-[#EDEDED] hover:bg-[#262626] dark:bg-[#EDEDED] dark:text-[#111111] dark:hover:bg-[#F5F5F5] inline-flex items-center gap-1.5 fast-transition active:scale-[0.98]"
                >
                  <Icon name="check" className="w-3.5 h-3.5" />
                  <span>Restore Full Health</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Stat Attribute Sliders Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {statList.map((meta) => {
            const key = meta.key;
            const rawVal = currentStats[key] !== undefined ? Number(currentStats[key]) : 100;
            const percentageDisplay = rawVal.toFixed(1);
            const sliderVal = Math.min(200, Math.max(0, rawVal));

            return (
              <div
                key={key}
                className="bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-black/[0.14] dark:hover:border-white/[0.14] fast-transition shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h4 className="text-sm font-medium text-neutral-900 dark:text-[#EDEDED]">
                      {meta.name}
                    </h4>
                    <div className="flex items-center gap-1.5">
                      {rawVal > 200 && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-[4px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          Uncapped
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const val = window.prompt(`Enter ${meta.name} percentage:`, rawVal);
                          if (val !== null && val.trim() !== "") {
                            const num = parseFloat(val);
                            if (!isNaN(num)) onUpdateStat(activeStatTab, key, num);
                          }
                        }}
                        className="cursor-pointer font-mono text-xs px-2 py-0.5 rounded-[4px] bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-neutral-700 dark:text-neutral-200 border border-black/[0.08] dark:border-white/[0.08] font-semibold tabular-nums fast-transition"
                        title="Click to enter custom percentage"
                      >
                        {percentageDisplay}%
                      </button>
                    </div>
                  </div>

                  {/* Slider */}
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="0.5"
                      value={sliderVal}
                      onChange={(e) => onUpdateStat(activeStatTab, key, parseFloat(e.target.value))}
                      className="w-full accent-neutral-900 dark:accent-[#EDEDED] cursor-pointer"
                    />

                    {/* Quick preset chips */}
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-0.5">
                      <span>Presets:</span>
                      <div className="flex items-center gap-1">
                        {[50, 75, 100, 150, 200].map((presetVal) => (
                          <button
                            key={presetVal}
                            type="button"
                            onClick={() => onUpdateStat(activeStatTab, key, presetVal)}
                            className={`cursor-pointer px-1.5 py-0.5 rounded-[4px] font-mono text-[10px] fast-transition ${
                              Math.round(rawVal) === presetVal
                                ? "bg-black/[0.1] dark:bg-white/[0.15] text-neutral-900 dark:text-white font-semibold"
                                : "bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-neutral-600 dark:text-neutral-400"
                            }`}
                          >
                            {presetVal}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
