import React from "react";
import { Icon } from "./Icons";

export function GuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 glass-surface flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] rounded-t-[16px] sm:rounded-xl w-full max-w-3xl max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden modal-spring">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
          <div>
            <h3 className="text-base font-medium tracking-tight text-neutral-900 dark:text-[#EDEDED]">
              Save Editing Reference Guide
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Roundtrip workflow, internal numbering rules, and sign conventions
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs text-neutral-700 dark:text-neutral-300">
          {/* Step by Step Pipeline */}
          <div>
            <h4 className="text-sm font-medium text-neutral-900 dark:text-[#EDEDED] mb-3">
              1. Direct Native Save Workflow
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-black/[0.02] dark:bg-white/[0.02] p-3 rounded-[8px] border border-black/[0.06] dark:border-white/[0.06] space-y-1">
                <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">Step 1</span>
                <p className="font-medium text-neutral-900 dark:text-[#EDEDED]">Drop Save.bytes</p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Upload your raw Save.bytes file directly. The editor natively decodes .NET binary structures in-browser without any third-party websites.
                </p>
              </div>

              <div className="bg-black/[0.02] dark:bg-white/[0.02] p-3 rounded-[8px] border border-black/[0.06] dark:border-white/[0.06] space-y-1">
                <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">Step 2</span>
                <p className="font-medium text-neutral-900 dark:text-[#EDEDED]">Customize in Visual UI</p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Select characters, customize superpowers, health, energy, role, team, clone loadouts from Time Machine, or apply presets.
                </p>
              </div>

              <div className="bg-black/[0.02] dark:bg-white/[0.02] p-3 rounded-[8px] border border-black/[0.06] dark:border-white/[0.06] space-y-1">
                <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">Step 3</span>
                <p className="font-medium text-neutral-900 dark:text-[#EDEDED]">Download Save.bytes</p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Click "Export Save.bytes" to download the patched binary file in milliseconds. Copy it back to your device and play immediately!
                </p>
              </div>
            </div>
          </div>

          {/* Important Rules & Numbering Systems */}
          <div className="bg-amber-500/[0.06] dark:bg-white/[0.02] border border-amber-500/[0.2] dark:border-white/[0.08] rounded-[8px] p-4 space-y-2">
            <h4 className="text-xs font-medium text-amber-700 dark:text-amber-300">
              Important: Distinction Between Numbering Systems
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-neutral-700 dark:text-neutral-300 text-[11px]">
              <li>
                <strong className="text-neutral-900 dark:text-[#EDEDED]">Internal Save File ID:</strong> The raw integer stored in the save file (e.g. powerAttack = 12 for Rockets). This is what the game engine executes.
              </li>
              <li>
                <strong className="text-neutral-900 dark:text-[#EDEDED]">In-Game Alphabetical Dropdown Index:</strong> Visual position in the in-game editor menus. In-game menus sort powers alphabetically (1, 2, 3...), which does not match internal save IDs (e.g. Rockets is #26 in the UI, but ID 12 internally).
              </li>
              <li>
                <strong className="text-neutral-900 dark:text-[#EDEDED]">Power Sliders:</strong> Separate sliders in the game that govern projectile damage, velocity, and ranges.
              </li>
            </ol>
          </div>

          {/* Key Conventions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/[0.02] dark:bg-white/[0.02] p-4 rounded-[8px] border border-black/[0.06] dark:border-white/[0.06] space-y-2">
              <h5 className="font-medium text-neutral-900 dark:text-[#EDEDED] text-xs">
                Sign Conventions (+ vs -)
              </h5>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                MDickie games use signed integers to encode compound behaviors:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-neutral-700 dark:text-neutral-300">
                <li><strong className="text-neutral-900 dark:text-[#EDEDED]">powerFlight:</strong> 1 = Standard Run; -4 = Flight + Speed Boost.</li>
                <li><strong className="text-neutral-900 dark:text-[#EDEDED]">powerCraft:</strong> 4 = Duplication; -4 = Attraction + Duplication combo.</li>
                <li><strong className="text-neutral-900 dark:text-[#EDEDED]">transform:</strong> 55 = Random; 69 = Permanent alter-ego.</li>
              </ul>
            </div>

            <div className="bg-black/[0.02] dark:bg-white/[0.02] p-4 rounded-[8px] border border-black/[0.06] dark:border-white/[0.06] space-y-2">
              <h5 className="font-medium text-neutral-900 dark:text-[#EDEDED] text-xs">
                Projectile Limb Mapping
              </h5>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                projectileLimb is stored across 3 dictionary slots (0, 1, 2):
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-neutral-700 dark:text-neutral-300 font-mono">
                <li>0: Disabled / None</li>
                <li>1: Eyes / Head (Laser Vision)</li>
                <li>2: Mouth / Breath (Fire)</li>
                <li>3: Palm / Hands (Homelander style)</li>
                <li>4: Feet / Kick Blasts | 5: Torso Body</li>
              </ul>
            </div>

            <div className="md:col-span-2 bg-black/[0.02] dark:bg-white/[0.02] p-4 rounded-[8px] border border-black/[0.06] dark:border-white/[0.06] space-y-2">
              <h5 className="font-medium text-neutral-900 dark:text-[#EDEDED] text-xs">
                Power Amounts & Attributes
              </h5>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Superpower magnitude and slider strength in MDickie games:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-neutral-700 dark:text-neutral-300 font-mono">
                <div>0: Strength (0-200%+)</div>
                <div>1: Speed (0-200%+)</div>
                <div>2: Stamina</div>
                <div>3: Skill</div>
                <div>4: Toughness</div>
                <div>5: Spirit (Adrenaline)</div>
                <div>6: Popularity</div>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Standard in-game editor caps stats at 200%, but our editor allows typing uncapped values (e.g. 500% God Mode) for unstoppable superhuman strength and flight velocity!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black/[0.08] dark:border-white/[0.08] bg-black/[0.01] dark:bg-white/[0.01] flex items-center justify-between">
          <a
            href="https://www.saveeditonline.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-[#EDEDED] underline font-medium"
          >
            Open SaveEditOnline.com
          </a>

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
