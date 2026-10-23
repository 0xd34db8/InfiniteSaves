import React, { useState, useRef, useEffect, useMemo } from "react";
import { Icon } from "./Icons";
import {
  POWER_MAPPINGS,
  POWER_FIELDS,
  cleanPowerLabel,
} from "../constants/powers";
import { PowerAmountEditor } from "./PowerAmountEditor";
import { PhysiqueEditor } from "./PhysiqueEditor";

function PowerDropdown({
  value,
  meta,
  isOpen,
  onToggle,
  onClose,
  onChange,
  compact = false,
}) {
  const dropdownRef = useRef(null);
  const [unobservedInput, setUnobservedInput] = useState("");

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  const numVal = Number(value);
  const matched = meta.proven.find((opt) => opt.id === numVal);
  const isOtherObserved =
    !matched && meta.observed && meta.observed.includes(numVal);
  const isUnobserved =
    !matched && !isOtherObserved && value !== undefined && numVal !== 0;

  const otherObservedIds = useMemo(() => {
    if (!meta.observed) return [];
    const provenIds = new Set(meta.proven.map((p) => p.id));
    return meta.observed.filter((id) => !provenIds.has(id));
  }, [meta]);

  const currentLabel = matched
    ? cleanPowerLabel(matched.label)
    : isOtherObserved || isUnobserved
      ? `Internal ID (${numVal})`
      : "None";

  const handleApplyUnobserved = () => {
    const targetStr =
      unobservedInput.trim() ||
      (!matched && numVal !== 0 ? String(numVal) : "");
    const parsed = parseInt(targetStr, 10);
    if (!isNaN(parsed)) {
      onChange(parsed);
      setUnobservedInput("");
      onClose();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={onToggle}
        className={`w-full bg-white dark:bg-white/[0.03] border border-black/[0.12] dark:border-white/[0.12] hover:border-black/[0.2] dark:hover:border-white/[0.2] text-neutral-900 dark:text-[#EDEDED] text-xs rounded-[6px] ${
          compact ? "px-2.5 py-1.5" : "px-3 py-2"
        } flex items-center justify-between gap-2 custom-focus fast-transition text-left cursor-pointer`}
      >
        <span className="truncate font-medium text-neutral-900 dark:text-[#EDEDED]">
          {currentLabel}
        </span>
        <Icon
          name="chevron-down"
          className={`w-3.5 h-3.5 text-neutral-400 shrink-0 fast-transition ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            compact ? "min-w-[210px] left-0" : "left-0 right-0"
          } top-full mt-1.5 z-50 bg-white dark:bg-[#141414] border border-black/[0.12] dark:border-white/[0.12] rounded-[8px] py-1 shadow-lg max-h-72 overflow-y-auto`}
        >
          {/* Observed Powers */}
          <div className="px-3 py-1 text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            Observed
          </div>
          {meta.proven.map((opt) => {
            const isSelected = numVal === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  onClose();
                }}
                className={`w-full px-3 py-1.5 text-xs flex items-center justify-between text-left fast-transition cursor-pointer ${
                  isSelected
                    ? "bg-black/[0.06] dark:bg-white/[0.08] font-medium"
                    : "hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                }`}
              >
                <span className="truncate text-neutral-900 dark:text-[#EDEDED]">
                  {cleanPowerLabel(opt.label)}
                </span>
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono ml-2">
                  {opt.id}
                </span>
              </button>
            );
          })}

          {/* Line separating Observed from Internal IDs */}
          <div className="border-t border-black/[0.08] dark:border-white/[0.08] my-1" />

          {/* Internal IDs Section */}
          <div className="px-3 py-1 text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            Internal IDs
          </div>

          {/* Continuous list of internal IDs (no nested scrollbar) */}
          {otherObservedIds.map((id) => {
            const isSelected = numVal === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  onChange(id);
                  onClose();
                }}
                className={`w-full px-3 py-1.5 text-xs flex items-center justify-between text-left fast-transition cursor-pointer ${
                  isSelected
                    ? "bg-black/[0.06] dark:bg-white/[0.08] font-medium"
                    : "hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                }`}
              >
                <span className="truncate text-neutral-700 dark:text-neutral-300">
                  Internal ID: {id}
                </span>
              </button>
            );
          })}

          {/* Custom / Direct Internal ID Input */}
          <div className="border-t border-black/[0.06] dark:border-white/[0.06] my-1 pt-1.5 px-3 pb-1.5">
            <div className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1.5">
              Custom Internal ID
            </div>
            {!matched && numVal !== 0 && value !== undefined && (
              <div className="mb-2 px-2 py-1 rounded bg-black/[0.04] dark:bg-white/[0.06] text-xs font-mono text-neutral-800 dark:text-neutral-200 flex items-center justify-between">
                <span>Selected: {numVal}</span>
                <span className="text-[10px] text-neutral-400 font-sans">
                  Active
                </span>
              </div>
            )}
            <div
              className="flex items-center gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="number"
                value={unobservedInput}
                onChange={(e) => setUnobservedInput(e.target.value)}
                placeholder={
                  !matched && numVal !== 0
                    ? `Current ID: ${numVal}`
                    : "Type internal ID..."
                }
                className="w-full bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.12] dark:border-white/[0.12] rounded px-2 py-1 text-xs text-neutral-900 dark:text-[#EDEDED] font-mono focus:outline-none focus:border-black/[0.3] dark:focus:border-white/[0.3]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyUnobserved();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleApplyUnobserved}
                className="cursor-pointer px-2.5 py-1 text-xs font-medium rounded bg-black/[0.08] hover:bg-black/[0.12] dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-neutral-800 dark:text-[#EDEDED] border border-black/[0.08] dark:border-white/[0.08] fast-transition shrink-0 active:scale-[0.98]"
              >
                Set
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function CharacterEditor({
  character,
  timeMachineChar,
  rosterType,
  onUpdateField,
  onUpdateLimb,
  onUpdateStat,
  onBatchUpdateStats,
  onCloneFromTimeMachine,
  onOpenPresets,
  onOpenCompare,
  onRevertCharacter,
  hasChanges,
  onBackToRoster,
  className = "",
}) {
  const [editorSection, setEditorSection] = useState("powers"); // "powers", "amounts"
  const [customInputMode, setCustomInputMode] = useState({});
  const [limbEditMode, setLimbEditMode] = useState("symmetric"); // "symmetric" or "detailed"
  const [activeDropdown, setActiveDropdown] = useState(null);

  if (!character) {
    return (
      <div
        className={`flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-400 dark:text-neutral-500 ${className}`}
      >
        <h3 className="text-base font-medium text-neutral-800 dark:text-neutral-300 mb-1">
          No Character Selected
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm">
          Select a character from the roster to begin customizing superpowers.
        </p>
      </div>
    );
  }

  const toggleCustom = (key) => {
    setCustomInputMode((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getLimbSlot = (slot) => {
    if (
      typeof character.projectileLimb === "object" &&
      character.projectileLimb !== null
    ) {
      return character.projectileLimb[String(slot)] ?? 0;
    }
    return Number(character.projectileLimb ?? 0);
  };

  const handleLimbChange = (slot, value) => {
    const num = Number(value);
    if (limbEditMode === "symmetric") {
      onUpdateLimb({ 0: num, 1: num, 2: num });
    } else {
      const current =
        typeof character.projectileLimb === "object" &&
        character.projectileLimb !== null
          ? { ...character.projectileLimb }
          : { 0: 0, 1: 0, 2: 0 };
      current[String(slot)] = num;
      onUpdateLimb(current);
    }
  };

  return (
    <main
      className={`flex-1 overflow-y-auto bg-[#FAFAFA] dark:bg-[#0A0A0A] p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 ${className}`}
    >
      {/* Mobile Back to Roster Navigation */}
      {onBackToRoster && (
        <div className="md:hidden flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToRoster}
            className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-[#EDEDED] px-3 py-2 min-h-[40px] rounded-[8px] bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] shadow-xs active:scale-[0.98] fast-transition"
          >
            <Icon name="chevron-left" className="w-4 h-4" />
            <span>Back to Roster</span>
          </button>
        </div>
      )}

      {/* Top Banner & Identity Card */}
      <div className="bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.08] dark:border-white/[0.08] pb-5">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                {rosterType === "savedChars" ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-[0.02em] px-2.5 py-0.5 rounded-[6px] bg-sky-500/10 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/25">
                    <span>Active World</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-[0.02em] px-2.5 py-0.5 rounded-[6px] bg-purple-500/10 dark:bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/25">
                    <Icon
                      name="clock"
                      className="w-3 h-3 text-purple-500 dark:text-purple-400"
                    />
                    <span>Time Machine</span>
                  </span>
                )}
                {character.player === 1 && (
                  <span className="inline-flex items-center text-[11px] font-semibold tracking-[0.02em] px-2.5 py-0.5 rounded-[6px] bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                    Player Controlled
                  </span>
                )}
                {hasChanges && (
                  <span className="inline-flex items-center text-[11px] font-semibold tracking-[0.02em] px-2.5 py-0.5 rounded-[6px] bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                    Unsaved Edits
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-neutral-900 dark:text-[#EDEDED] truncate">
                {character.name || "Unnamed Character"}
              </h2>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                Alias:{" "}
                <span className="text-neutral-900 dark:text-[#EDEDED] font-medium">
                  "{character.alias || "None"}"
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons Toolbar - Spacious & Responsive */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
            {rosterType === "savedChars" && timeMachineChar && (
              <button
                type="button"
                onClick={onCloneFromTimeMachine}
                className="cursor-pointer text-xs font-medium px-4 py-2.5 sm:py-2 min-h-[44px] md:min-h-[32px] w-full sm:w-auto bg-[#111111] text-[#EDEDED] hover:bg-[#262626] dark:bg-[#EDEDED] dark:text-[#111111] dark:hover:bg-[#F5F5F5] rounded-[8px] flex items-center justify-center gap-2 fast-transition active:scale-[0.98]"
                title="Copy powers, stats, and physique from this character's Time Machine snapshot"
              >
                <Icon name="clock" className="w-3.5 h-3.5 shrink-0" />
                <span>Clone from Time Machine</span>
              </button>
            )}

            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onOpenPresets}
                className="cursor-pointer text-xs font-medium px-3.5 py-2.5 sm:py-2 min-h-[44px] md:min-h-[32px] bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-neutral-700 dark:text-neutral-200 border border-black/[0.08] dark:border-white/[0.08] rounded-[8px] flex items-center justify-center gap-1.5 fast-transition active:scale-[0.98]"
              >
                <span>Presets</span>
              </button>

              <button
                type="button"
                onClick={onOpenCompare}
                className="cursor-pointer text-xs font-medium px-3.5 py-2.5 sm:py-2 min-h-[44px] md:min-h-[32px] bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-neutral-700 dark:text-neutral-200 border border-black/[0.08] dark:border-white/[0.08] rounded-[8px] flex items-center justify-center gap-1.5 fast-transition active:scale-[0.98]"
              >
                <span className="hidden sm:inline">Compare</span>
                <span className="sm:hidden">Compare</span>
              </button>
            </div>

            {hasChanges && (
              <button
                type="button"
                onClick={onRevertCharacter}
                className="cursor-pointer text-xs font-medium px-3.5 py-2.5 sm:py-2 min-h-[44px] md:min-h-[32px] w-full sm:w-auto bg-black/[0.04] hover:bg-rose-500/10 dark:bg-white/[0.04] text-rose-600 dark:text-rose-300 border border-black/[0.08] dark:border-white/[0.08] hover:border-rose-500/30 rounded-[8px] flex items-center justify-center gap-1.5 fast-transition active:scale-[0.98]"
                title="Revert modifications on this character back to original"
              >
                <Icon name="undo" className="w-3.5 h-3.5 shrink-0" />
                <span>Revert</span>
              </button>
            )}
          </div>
        </div>

        {/* Identity Editable Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mt-4 sm:mt-5">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
              Character Name
            </label>
            <input
              type="text"
              value={character.name || ""}
              onChange={(e) => onUpdateField("name", e.target.value)}
              placeholder="e.g. Julian"
              className="w-full bg-white dark:bg-white/[0.03] border border-black/[0.12] dark:border-white/[0.12] text-neutral-900 dark:text-[#EDEDED] text-xs sm:text-sm rounded-[6px] px-3.5 py-2 custom-focus fast-transition placeholder-neutral-400 dark:placeholder-neutral-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
              Alias / Nickname
            </label>
            <input
              type="text"
              value={character.alias || ""}
              onChange={(e) => onUpdateField("alias", e.target.value)}
              placeholder="e.g. Homelander"
              className="w-full bg-white dark:bg-white/[0.03] border border-black/[0.12] dark:border-white/[0.12] text-neutral-900 dark:text-[#EDEDED] text-xs sm:text-sm rounded-[6px] px-3.5 py-2 custom-focus fast-transition placeholder-neutral-400 dark:placeholder-neutral-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
              Gender
            </label>
            <div className="grid grid-cols-2 gap-1 p-1 bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-[6px]">
              <button
                type="button"
                onClick={() => onUpdateField("gender", 0)}
                className={`cursor-pointer py-1 text-xs font-medium rounded-[4px] fast-transition text-center ${
                  Number(character.gender ?? 0) === 0
                    ? "bg-white dark:bg-[#1E1E1E] text-sky-600 dark:text-sky-400 font-semibold shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400"
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => onUpdateField("gender", 1)}
                className={`cursor-pointer py-1 text-xs font-medium rounded-[4px] fast-transition text-center ${
                  Number(character.gender ?? 0) === 1
                    ? "bg-white dark:bg-[#1E1E1E] text-pink-600 dark:text-pink-400 font-semibold shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400"
                }`}
              >
                Female
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
              Age
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="100"
                value={character.age ?? 30}
                onChange={(e) => onUpdateField("age", parseInt(e.target.value, 10) || 0)}
                className="w-full bg-white dark:bg-white/[0.03] border border-black/[0.12] dark:border-white/[0.12] text-neutral-900 dark:text-[#EDEDED] text-xs sm:text-sm rounded-[6px] px-3.5 py-2 custom-focus fast-transition tabular-nums"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-[11px] pointer-events-none">
                yrs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* View Switcher: Powers vs Amounts vs Physique vs All */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.08] dark:border-white/[0.08] pb-3">
        <div className="inline-flex p-1 bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-[8px] text-xs flex-wrap">
          <button
            type="button"
            onClick={() => setEditorSection("all")}
            className={`cursor-pointer px-3 py-1.5 rounded-[6px] font-medium flex items-center gap-1.5 fast-transition ${
              editorSection === "all"
                ? "bg-white dark:bg-[#1E1E1E] text-neutral-900 dark:text-[#EDEDED] shadow-xs"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-[#EDEDED]"
            }`}
          >
            <span>All</span>
          </button>
          <button
            type="button"
            onClick={() => setEditorSection("powers")}
            className={`cursor-pointer px-3 py-1.5 rounded-[6px] font-medium flex items-center gap-1.5 fast-transition ${
              editorSection === "powers"
                ? "bg-white dark:bg-[#1E1E1E] text-neutral-900 dark:text-[#EDEDED] shadow-xs"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-[#EDEDED]"
            }`}
          >
            <Icon name="zap" className="w-3.5 h-3.5 text-amber-500" />
            <span>Powers</span>
          </button>
          <button
            type="button"
            onClick={() => setEditorSection("amounts")}
            className={`cursor-pointer px-3 py-1.5 rounded-[6px] font-medium flex items-center gap-1.5 fast-transition ${
              editorSection === "amounts"
                ? "bg-white dark:bg-[#1E1E1E] text-neutral-900 dark:text-[#EDEDED] shadow-xs"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-[#EDEDED]"
            }`}
          >
            <Icon name="sliders" className="w-3.5 h-3.5 text-cyan-500" />
            <span>Power Amounts</span>
          </button>
          <button
            type="button"
            onClick={() => setEditorSection("physique")}
            className={`cursor-pointer px-3 py-1.5 rounded-[6px] font-medium flex items-center gap-1.5 fast-transition ${
              editorSection === "physique"
                ? "bg-white dark:bg-[#1E1E1E] text-neutral-900 dark:text-[#EDEDED] shadow-xs"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-[#EDEDED]"
            }`}
          >
            <Icon name="user" className="w-3.5 h-3.5 text-emerald-500" />
            <span>Physique & Body</span>
          </button>
        </div>
      </div>

      {/* Physique & Body Scale Section */}
      {(editorSection === "physique" || editorSection === "all") && (
        <div className="space-y-3">
          <h3 className="text-lg sm:text-xl font-medium tracking-[-0.02em] text-neutral-900 dark:text-[#EDEDED]">
            Physique & Body
          </h3>

          <PhysiqueEditor
            character={character}
            timeMachineChar={timeMachineChar}
            rosterType={rosterType}
            onUpdateField={onUpdateField}
          />
        </div>
      )}

      {/* Power Amounts & Sliders Section */}
      {(editorSection === "amounts" || editorSection === "all") && (
        <div className="space-y-3">
          <h3 className="text-lg sm:text-xl font-medium tracking-[-0.02em] text-neutral-900 dark:text-[#EDEDED]">
            Power Amounts
          </h3>

          <PowerAmountEditor
            character={character}
            timeMachineChar={timeMachineChar}
            rosterType={rosterType}
            onUpdateStat={onUpdateStat}
            onBatchUpdateStats={onBatchUpdateStats}
          />
        </div>
      )}

      {/* Superpower Attributes Grid */}
      {(editorSection === "powers" || editorSection === "all") && (
        <div>
          <div className="mb-4">
            <h3 className="text-lg sm:text-xl font-medium tracking-[-0.02em] text-neutral-900 dark:text-[#EDEDED]">
              Superpower Attributes
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {POWER_FIELDS.map((fieldKey) => {
              const meta = POWER_MAPPINGS[fieldKey];
              const rawVal = character[fieldKey];
              const isCustom = customInputMode[fieldKey];
              const isCardDropdownOpen =
                activeDropdown === fieldKey ||
                (activeDropdown && activeDropdown.startsWith(`${fieldKey}-`));

              // Projectile Limb Special Layout
              if (fieldKey === "projectileLimb") {
                const currentLimb0 = getLimbSlot(0);

                return (
                  <div
                    key={fieldKey}
                    className={`bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-5 flex flex-col justify-between hover:border-black/[0.14] dark:hover:border-white/[0.14] fast-transition relative ${
                      isCardDropdownOpen ? "z-30" : "z-0"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <h4 className="text-sm font-medium text-neutral-900 dark:text-[#EDEDED]">
                          {meta.name}
                        </h4>

                        <button
                          type="button"
                          onClick={() =>
                            setLimbEditMode((m) =>
                              m === "symmetric" ? "detailed" : "symmetric",
                            )
                          }
                          className="cursor-pointer text-[11px] font-medium px-2 py-0.5 rounded-[6px] bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-neutral-700 dark:text-neutral-300 border border-black/[0.08] dark:border-white/[0.08] fast-transition active:scale-[0.98]"
                          title="Toggle between symmetric all-slot or per-slot editing"
                        >
                          {limbEditMode === "symmetric"
                            ? "Symmetric"
                            : "Per-Slot"}
                        </button>
                      </div>

                      {limbEditMode === "symmetric" ? (
                        <div>
                          <PowerDropdown
                            value={currentLimb0}
                            meta={meta}
                            isOpen={activeDropdown === "projectileLimb-sym"}
                            onToggle={() =>
                              setActiveDropdown((prev) =>
                                prev === "projectileLimb-sym"
                                  ? null
                                  : "projectileLimb-sym",
                              )
                            }
                            onClose={() => setActiveDropdown(null)}
                            onChange={(newVal) => handleLimbChange(0, newVal)}
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {[0, 1, 2].map((slot) => {
                            const slotKey = `projectileLimb-slot-${slot}`;
                            return (
                              <div key={slot} className="space-y-1">
                                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">
                                  Limb {slot + 1}
                                </span>
                                <PowerDropdown
                                  value={getLimbSlot(slot)}
                                  meta={meta}
                                  compact={true}
                                  isOpen={activeDropdown === slotKey}
                                  onToggle={() =>
                                    setActiveDropdown((prev) =>
                                      prev === slotKey ? null : slotKey,
                                    )
                                  }
                                  onClose={() => setActiveDropdown(null)}
                                  onChange={(newVal) =>
                                    handleLimbChange(slot, newVal)
                                  }
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              // Standard Power Attribute Card
              return (
                <div
                  key={fieldKey}
                  className={`bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-5 flex flex-col justify-between hover:border-black/[0.14] dark:hover:border-white/[0.14] fast-transition relative ${
                    isCardDropdownOpen ? "z-30" : "z-0"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h4 className="text-sm font-medium text-neutral-900 dark:text-[#EDEDED]">
                        {meta.name}
                      </h4>

                      <button
                        type="button"
                        onClick={() => toggleCustom(fieldKey)}
                        className="cursor-pointer text-[11px] font-medium px-2 py-0.5 rounded-[6px] bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-neutral-700 dark:text-neutral-300 border border-black/[0.08] dark:border-white/[0.08] fast-transition active:scale-[0.98]"
                        title="Toggle custom integer input"
                      >
                        {isCustom ? "Menu" : "Custom"}
                      </button>
                    </div>

                    {/* Input or Dropdown */}
                    {isCustom ? (
                      <div>
                        <input
                          type="number"
                          value={rawVal ?? 0}
                          onChange={(e) =>
                            onUpdateField(
                              fieldKey,
                              parseInt(e.target.value, 10) || 0,
                            )
                          }
                          placeholder="Enter custom value"
                          className="w-full bg-white dark:bg-white/[0.03] border border-black/[0.12] dark:border-white/[0.12] text-neutral-900 dark:text-[#EDEDED] text-xs rounded-[6px] px-3 py-2 custom-focus fast-transition font-mono"
                        />
                      </div>
                    ) : (
                      <PowerDropdown
                        value={rawVal ?? 0}
                        meta={meta}
                        isOpen={activeDropdown === fieldKey}
                        onToggle={() =>
                          setActiveDropdown((prev) =>
                            prev === fieldKey ? null : fieldKey,
                          )
                        }
                        onClose={() => setActiveDropdown(null)}
                        onChange={(newVal) => onUpdateField(fieldKey, newVal)}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vitals & Status Panel */}
      <div className="bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-5">
        <h4 className="text-sm font-medium text-neutral-900 dark:text-[#EDEDED] mb-3">
          Vitals & Status
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Health: Current / Max */}
          <div className="bg-black/[0.02] dark:bg-white/[0.02] p-3 rounded-[8px] border border-black/[0.06] dark:border-white/[0.06] space-y-1.5">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block">
              Health / Max
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="any"
                value={character.health ?? 100}
                onChange={(e) =>
                  onUpdateField(
                    "health",
                    e.target.value === "" ? 0 : parseFloat(e.target.value),
                  )
                }
                className="w-full bg-white dark:bg-white/[0.03] border border-black/[0.12] dark:border-white/[0.12] text-neutral-900 dark:text-[#EDEDED] font-mono text-xs rounded-[6px] px-2 py-1.5 custom-focus fast-transition tabular-nums"
                title="Current Health"
              />
              <span className="text-neutral-400 dark:text-neutral-500 font-mono text-xs">
                /
              </span>
              <input
                type="number"
                step="any"
                value={character.healthLimit ?? 100}
                onChange={(e) =>
                  onUpdateField(
                    "healthLimit",
                    e.target.value === "" ? 100 : parseFloat(e.target.value),
                  )
                }
                className="w-full bg-white dark:bg-white/[0.03] border border-black/[0.12] dark:border-white/[0.12] text-neutral-900 dark:text-[#EDEDED] font-mono text-xs rounded-[6px] px-2 py-1.5 custom-focus fast-transition tabular-nums"
                title="Max Health Limit"
              />
            </div>
          </div>

          {/* Energy (Spirit) */}
          <div className="bg-black/[0.02] dark:bg-white/[0.02] p-3 rounded-[8px] border border-black/[0.06] dark:border-white/[0.06] space-y-1.5">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block">
              Spirit
            </span>
            <input
              type="number"
              step="any"
              value={character.spirit ?? 100}
              onChange={(e) =>
                onUpdateField(
                  "spirit",
                  e.target.value === "" ? 0 : parseFloat(e.target.value),
                )
              }
              className="w-full bg-white dark:bg-white/[0.03] border border-black/[0.12] dark:border-white/[0.12] text-neutral-900 dark:text-[#EDEDED] font-mono text-xs rounded-[6px] px-2 py-1.5 custom-focus fast-transition tabular-nums"
              title="Energy meter"
            />
          </div>

          {/* Status: Healthy / Injured / Deceased */}
          <div className="bg-black/[0.02] dark:bg-white/[0.02] p-3 rounded-[8px] border border-black/[0.06] dark:border-white/[0.06] space-y-1.5">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block">
              Status
            </span>
            <div className="flex items-center gap-1.5">
              <select
                value={
                  character.dead
                    ? "dead"
                    : character.injury
                      ? "injured"
                      : "healthy"
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "dead") {
                    onUpdateField("dead", 1);
                  } else if (val === "injured") {
                    onUpdateField("dead", 0);
                    if (!character.injury) onUpdateField("injury", 1);
                  } else {
                    onUpdateField("dead", 0);
                    onUpdateField("injury", 0);
                  }
                }}
                className="w-full bg-white dark:bg-white/[0.03] border border-black/[0.12] dark:border-white/[0.12] text-neutral-900 dark:text-[#EDEDED] text-xs rounded-[6px] px-2 py-1.5 custom-focus fast-transition cursor-pointer"
              >
                <option
                  value="healthy"
                  className="bg-white dark:bg-[#121212] text-neutral-900 dark:text-[#EDEDED]"
                >
                  Healthy
                </option>
                <option
                  value="injured"
                  className="bg-white dark:bg-[#121212] text-neutral-900 dark:text-[#EDEDED]"
                >
                  Injured
                </option>
                <option
                  value="dead"
                  className="bg-white dark:bg-[#121212] text-neutral-900 dark:text-[#EDEDED]"
                >
                  Deceased
                </option>
              </select>
              {Boolean(character.injury) && !character.dead && (
                <input
                  type="number"
                  value={character.injury ?? 1}
                  onChange={(e) =>
                    onUpdateField("injury", parseInt(e.target.value, 10) || 0)
                  }
                  className="w-16 bg-white dark:bg-white/[0.03] border border-black/[0.12] dark:border-white/[0.12] text-neutral-900 dark:text-[#EDEDED] font-mono text-xs rounded-[6px] px-2 py-1.5 custom-focus fast-transition tabular-nums"
                  title="Injury ID Code"
                />
              )}
            </div>
          </div>

          {/* Role & Team */}
          <div className="bg-black/[0.02] dark:bg-white/[0.02] p-3 rounded-[8px] border border-black/[0.06] dark:border-white/[0.06] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Role & Team
              </span>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">
                Role / Team
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex-1 flex items-center gap-1">
                <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                  R:
                </span>
                <input
                  type="number"
                  value={character.role ?? 0}
                  onChange={(e) =>
                    onUpdateField("role", parseInt(e.target.value, 10) || 0)
                  }
                  className="w-full bg-white dark:bg-white/[0.03] border border-black/[0.12] dark:border-white/[0.12] text-neutral-900 dark:text-[#EDEDED] font-mono text-xs rounded-[6px] px-2 py-1.5 custom-focus fast-transition tabular-nums"
                  title="Role ID"
                />
              </div>
              <div className="flex-1 flex items-center gap-1">
                <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                  T:
                </span>
                <input
                  type="number"
                  value={character.team ?? 0}
                  onChange={(e) =>
                    onUpdateField("team", parseInt(e.target.value, 10) || 0)
                  }
                  className="w-full bg-white dark:bg-white/[0.03] border border-black/[0.12] dark:border-white/[0.12] text-neutral-900 dark:text-[#EDEDED] font-mono text-xs rounded-[6px] px-2 py-1.5 custom-focus fast-transition tabular-nums"
                  title="Team / Faction ID"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
