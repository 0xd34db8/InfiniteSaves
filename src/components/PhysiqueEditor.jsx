import React from "react";
import { Icon } from "./Icons";

export function PhysiqueEditor({
  character,
  timeMachineChar,
  rosterType,
  onUpdateField,
}) {
  if (!character) return null;

  const heightVal = Number(character.height ?? 1.0);
  const totalInches = heightVal * 72;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);

  const muscleVal = Number(character.muscleMass ?? 50);
  const bodyMassVal = Number(character.bodyMass ?? 0);
  const armMassVal = Number(character.armMass ?? 0);
  const legMassVal = Number(character.legMass ?? 0);
  const headSizeVal = Number(character.headSize ?? 1.0);
  const voiceVal = Number(character.voice ?? 1.0);

  const handleClonePhysique = () => {
    if (!timeMachineChar) return;
    const fields = [
      "height",
      "gender",
      "age",
      "muscleMass",
      "bodyMass",
      "armMass",
      "legMass",
      "headSize",
      "voice",
    ];
    fields.forEach((f) => {
      if (timeMachineChar[f] !== undefined) {
        onUpdateField(f, timeMachineChar[f]);
      }
    });
  };

  return (
    <div className="space-y-4">
      {rosterType === "savedChars" && timeMachineChar && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleClonePhysique}
            className="cursor-pointer text-xs font-medium px-3 py-1.5 rounded-[6px] bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-neutral-700 dark:text-neutral-300 border border-black/[0.08] dark:border-white/[0.08] flex items-center gap-1.5 fast-transition"
          >
            <Icon name="copy" className="w-3 h-3" />
            <span>Copy Physique from Time Machine</span>
          </button>
        </div>
      )}

      {/* Grid of Physical Attribute Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Height Card */}
        <div className="bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-5 flex flex-col justify-between hover:border-black/[0.14] dark:hover:border-white/[0.14] fast-transition shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h4 className="text-sm font-medium text-neutral-900 dark:text-[#EDEDED]">
                Height
              </h4>
              <span className="font-mono text-xs px-2 py-0.5 rounded-[4px] bg-black/[0.04] dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-200 border border-black/[0.08] dark:border-white/[0.08] font-semibold tabular-nums">
                {feet}&apos;{inches}&quot; ({heightVal.toFixed(2)}x)
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.50"
                max="1.50"
                step="0.01"
                value={Math.min(1.5, Math.max(0.5, heightVal))}
                onChange={(e) =>
                  onUpdateField("height", parseFloat(e.target.value))
                }
                className="flex-1 accent-neutral-900 dark:accent-[#EDEDED] cursor-pointer"
              />
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={heightVal}
                  onChange={(e) =>
                    onUpdateField("height", parseFloat(e.target.value) || 1.0)
                  }
                  className="w-20 bg-white dark:bg-white/[0.03] border border-black/[0.12] dark:border-white/[0.12] text-neutral-900 dark:text-[#EDEDED] font-mono text-xs rounded-[6px] px-2 py-1.5 text-right custom-focus fast-transition tabular-nums"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 text-[10px] pointer-events-none">
                  x
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Muscle Mass Card */}
        <div className="bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-5 flex flex-col justify-between hover:border-black/[0.14] dark:hover:border-white/[0.14] fast-transition shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h4 className="text-sm font-medium text-neutral-900 dark:text-[#EDEDED]">
                Muscle Mass
              </h4>
              <span className="font-mono text-xs px-2 py-0.5 rounded-[4px] bg-black/[0.04] dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-200 border border-black/[0.08] dark:border-white/[0.08] font-semibold tabular-nums">
                {muscleVal.toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={Math.min(100, Math.max(0, muscleVal))}
                onChange={(e) =>
                  onUpdateField("muscleMass", parseFloat(e.target.value))
                }
                className="flex-1 accent-neutral-900 dark:accent-[#EDEDED] cursor-pointer"
              />
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  value={muscleVal}
                  onChange={(e) =>
                    onUpdateField(
                      "muscleMass",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  className="w-20 bg-white dark:bg-white/[0.03] border border-black/[0.12] dark:border-white/[0.12] text-neutral-900 dark:text-[#EDEDED] font-mono text-xs rounded-[6px] px-2 py-1.5 text-right custom-focus fast-transition tabular-nums"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 text-[10px] pointer-events-none">
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body Mass Card */}
        <div className="bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-5 flex flex-col justify-between hover:border-black/[0.14] dark:hover:border-white/[0.14] fast-transition shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h4 className="text-sm font-medium text-neutral-900 dark:text-[#EDEDED]">
                Body Mass
              </h4>
              <span className="font-mono text-xs px-2 py-0.5 rounded-[4px] bg-black/[0.04] dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-200 border border-black/[0.08] dark:border-white/[0.08] font-semibold tabular-nums">
                {bodyMassVal > 0 ? `+${bodyMassVal.toFixed(1)}%` : `${bodyMassVal.toFixed(1)}%`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                value={Math.min(100, Math.max(-100, bodyMassVal))}
                onChange={(e) =>
                  onUpdateField("bodyMass", parseFloat(e.target.value))
                }
                className="flex-1 accent-neutral-900 dark:accent-[#EDEDED] cursor-pointer"
              />
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  value={bodyMassVal}
                  onChange={(e) =>
                    onUpdateField("bodyMass", parseFloat(e.target.value) || 0)
                  }
                  className="w-20 bg-white dark:bg-white/[0.03] border border-black/[0.12] dark:border-white/[0.12] text-neutral-900 dark:text-[#EDEDED] font-mono text-xs rounded-[6px] px-2 py-1.5 text-right custom-focus fast-transition tabular-nums"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 text-[10px] pointer-events-none">
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Arm Thickness Card */}
        <div className="bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-5 flex flex-col justify-between hover:border-black/[0.14] dark:hover:border-white/[0.14] fast-transition shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h4 className="text-sm font-medium text-neutral-900 dark:text-[#EDEDED]">
                Arm Thickness
              </h4>
              <span className="font-mono text-xs px-2 py-0.5 rounded-[4px] bg-black/[0.04] dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-200 border border-black/[0.08] dark:border-white/[0.08] font-semibold tabular-nums">
                {armMassVal > 0 ? `+${armMassVal.toFixed(1)}%` : `${armMassVal.toFixed(1)}%`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                value={Math.min(100, Math.max(-100, armMassVal))}
                onChange={(e) =>
                  onUpdateField("armMass", parseFloat(e.target.value))
                }
                className="flex-1 accent-neutral-900 dark:accent-[#EDEDED] cursor-pointer"
              />
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  value={armMassVal}
                  onChange={(e) =>
                    onUpdateField("armMass", parseFloat(e.target.value) || 0)
                  }
                  className="w-20 bg-white dark:bg-white/[0.03] border border-black/[0.12] dark:border-white/[0.12] text-neutral-900 dark:text-[#EDEDED] font-mono text-xs rounded-[6px] px-2 py-1.5 text-right custom-focus fast-transition tabular-nums"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 text-[10px] pointer-events-none">
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Leg Thickness Card */}
        <div className="bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-5 flex flex-col justify-between hover:border-black/[0.14] dark:hover:border-white/[0.14] fast-transition shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h4 className="text-sm font-medium text-neutral-900 dark:text-[#EDEDED]">
                Leg Thickness
              </h4>
              <span className="font-mono text-xs px-2 py-0.5 rounded-[4px] bg-black/[0.04] dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-200 border border-black/[0.08] dark:border-white/[0.08] font-semibold tabular-nums">
                {legMassVal > 0 ? `+${legMassVal.toFixed(1)}%` : `${legMassVal.toFixed(1)}%`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                value={Math.min(100, Math.max(-100, legMassVal))}
                onChange={(e) =>
                  onUpdateField("legMass", parseFloat(e.target.value))
                }
                className="flex-1 accent-neutral-900 dark:accent-[#EDEDED] cursor-pointer"
              />
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  value={legMassVal}
                  onChange={(e) =>
                    onUpdateField("legMass", parseFloat(e.target.value) || 0)
                  }
                  className="w-20 bg-white dark:bg-white/[0.03] border border-black/[0.12] dark:border-white/[0.12] text-neutral-900 dark:text-[#EDEDED] font-mono text-xs rounded-[6px] px-2 py-1.5 text-right custom-focus fast-transition tabular-nums"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 text-[10px] pointer-events-none">
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Head Scale Card */}
        <div className="bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-5 flex flex-col justify-between hover:border-black/[0.14] dark:hover:border-white/[0.14] fast-transition shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h4 className="text-sm font-medium text-neutral-900 dark:text-[#EDEDED]">
                Head Scale
              </h4>
              <span className="font-mono text-xs px-2 py-0.5 rounded-[4px] bg-black/[0.04] dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-200 border border-black/[0.08] dark:border-white/[0.08] font-semibold tabular-nums">
                {headSizeVal.toFixed(2)}x
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.80"
                max="1.45"
                step="0.01"
                value={Math.min(1.45, Math.max(0.8, headSizeVal))}
                onChange={(e) =>
                  onUpdateField("headSize", parseFloat(e.target.value))
                }
                className="flex-1 accent-neutral-900 dark:accent-[#EDEDED] cursor-pointer"
              />
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={headSizeVal}
                  onChange={(e) =>
                    onUpdateField(
                      "headSize",
                      parseFloat(e.target.value) || 1.0,
                    )
                  }
                  className="w-20 bg-white dark:bg-white/[0.03] border border-black/[0.12] dark:border-white/[0.12] text-neutral-900 dark:text-[#EDEDED] font-mono text-xs rounded-[6px] px-2 py-1.5 text-right custom-focus fast-transition tabular-nums"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 text-[10px] pointer-events-none">
                  x
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Voice Pitch Card */}
        <div className="bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-5 flex flex-col justify-between hover:border-black/[0.14] dark:hover:border-white/[0.14] fast-transition shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h4 className="text-sm font-medium text-neutral-900 dark:text-[#EDEDED]">
                Voice Pitch
              </h4>
              <span className="font-mono text-xs px-2 py-0.5 rounded-[4px] bg-black/[0.04] dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-200 border border-black/[0.08] dark:border-white/[0.08] font-semibold tabular-nums">
                {voiceVal.toFixed(2)}x
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.70"
                max="1.30"
                step="0.01"
                value={Math.min(1.3, Math.max(0.7, voiceVal))}
                onChange={(e) =>
                  onUpdateField("voice", parseFloat(e.target.value))
                }
                className="flex-1 accent-neutral-900 dark:accent-[#EDEDED] cursor-pointer"
              />
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={voiceVal}
                  onChange={(e) =>
                    onUpdateField("voice", parseFloat(e.target.value) || 1.0)
                  }
                  className="w-20 bg-white dark:bg-white/[0.03] border border-black/[0.12] dark:border-white/[0.12] text-neutral-900 dark:text-[#EDEDED] font-mono text-xs rounded-[6px] px-2 py-1.5 text-right custom-focus fast-transition tabular-nums"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 text-[10px] pointer-events-none">
                  x
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
