import React, { useState, useRef, useEffect } from "react";
import { Icon } from "./Icons";
import logoImg from "../assets/logo.png";

export function Header({
  fileName,
  changesCount,
  onOpenAudit,
  onOpenGuide,
  onUploadFile,
  onCloseFile,
  onExport,
  onExportJson,
  hasSaveData,
  themePreference,
  effectiveTheme,
  onToggleTheme,
  onSetThemeMode,
}) {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileExportOpen, setIsMobileExportOpen] = useState(false);

  const themeDropdownRef = useRef(null);
  const exportDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileExportRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        themeDropdownRef.current &&
        !themeDropdownRef.current.contains(e.target)
      ) {
        setIsThemeMenuOpen(false);
      }
      if (
        exportDropdownRef.current &&
        !exportDropdownRef.current.contains(e.target)
      ) {
        setIsExportMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setIsMobileMenuOpen(false);
      }
      if (
        mobileExportRef.current &&
        !mobileExportRef.current.contains(e.target)
      ) {
        setIsMobileExportOpen(false);
      }
    };
    if (
      isThemeMenuOpen ||
      isExportMenuOpen ||
      isMobileMenuOpen ||
      isMobileExportOpen
    ) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isThemeMenuOpen, isExportMenuOpen, isMobileMenuOpen, isMobileExportOpen]);

  return (
    <header className="sticky top-0 z-30 glass-surface border-b border-black/[0.08] dark:border-white/[0.08] px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5">
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand & File Info */}
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          <img
            src={logoImg}
            alt="Infinite Saves Logo"
            width="64"
            height="64"
            className="w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 shrink-0 object-contain select-none -my-1 sm:-my-2 transition-transform hover:scale-105 drop-shadow-sm"
          />
          <div className="min-w-0">
            <h1 className="font-semibold text-sm sm:text-lg lg:text-xl text-neutral-900 dark:text-[#EDEDED] tracking-[-0.02em] truncate">
              Infinite Saves
            </h1>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
              <span className="font-mono text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-[100px] xs:max-w-[160px] sm:max-w-xs">
                {fileName || "No File Loaded"}
              </span>
              {hasSaveData && onCloseFile && (
                <button
                  type="button"
                  onClick={onCloseFile}
                  title="Close current save file"
                  className="cursor-pointer text-[10px] sm:text-[11px] text-neutral-400 hover:text-rose-600 dark:text-neutral-500 dark:hover:text-rose-400 underline transition-colors shrink-0"
                >
                  Close
                </button>
              )}
              {changesCount > 0 && (
                <span className="hidden sm:inline-flex text-[10px] sm:text-[11px] font-medium tracking-[0.02em] px-1.5 sm:px-2 py-0.5 rounded-[6px] bg-amber-500/[0.08] text-amber-700 dark:text-amber-300 border border-amber-500/[0.2] shrink-0">
                  {changesCount}{" "}
                  <span className="hidden xs:inline">unsaved</span>{" "}
                  {changesCount === 1 ? "edit" : "edits"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Action Controls (hidden on mobile, visible md and up) */}
        <div className="hidden md:flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Dark / Light / Crimson Theme Switcher with System Auto Support */}
          <div className="relative" ref={themeDropdownRef}>
            <div className="flex items-center rounded-[8px] border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.04] dark:bg-white/[0.04] p-0.5 min-h-[32px]">
              <button
                type="button"
                onClick={onToggleTheme}
                className="cursor-pointer text-xs font-medium px-2 sm:px-2.5 py-1 rounded-[6px] flex items-center gap-1.5 hover:bg-black/[0.04] dark:hover:bg-white/[0.08] text-neutral-700 dark:text-neutral-200 fast-transition active:scale-[0.98]"
                title={`Theme: ${themePreference === "system" ? `System (${effectiveTheme})` : effectiveTheme}. Click to cycle themes.`}
              >
                <Icon
                  name={
                    effectiveTheme === "crimson"
                      ? "flame"
                      : effectiveTheme === "dark"
                        ? "moon"
                        : "sun"
                  }
                  className={`w-3.5 h-3.5 ${effectiveTheme === "crimson" ? "text-rose-400" : ""}`}
                />
                <span className="capitalize">
                  {themePreference === "system"
                    ? "Auto"
                    : effectiveTheme === "crimson"
                      ? "Crimson"
                      : effectiveTheme}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsThemeMenuOpen((prev) => !prev)}
                className="cursor-pointer px-1 sm:px-1.5 py-1 rounded-[6px] hover:bg-black/[0.04] dark:hover:bg-white/[0.08] text-neutral-500 dark:text-neutral-400 fast-transition"
                title="Select theme preference"
                aria-label="Theme options"
              >
                <Icon name="chevron-down" className="w-3 h-3" />
              </button>
            </div>

            {/* Dropdown Menu for Explicit Selection */}
            {isThemeMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-44 py-1 glass-surface bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] rounded-[8px] shadow-lg z-50 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    onSetThemeMode("light");
                    setIsThemeMenuOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-black/[0.04] dark:hover:bg-white/[0.06] fast-transition cursor-pointer ${
                    themePreference === "light"
                      ? "text-neutral-900 dark:text-white font-medium"
                      : "text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon name="sun" className="w-3.5 h-3.5" /> Light
                  </span>
                  {themePreference === "light" && (
                    <Icon name="check" className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSetThemeMode("dark");
                    setIsThemeMenuOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-black/[0.04] dark:hover:bg-white/[0.06] fast-transition cursor-pointer ${
                    themePreference === "dark"
                      ? "text-neutral-900 dark:text-white font-medium"
                      : "text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon name="moon" className="w-3.5 h-3.5" /> Dark
                  </span>
                  {themePreference === "dark" && (
                    <Icon name="check" className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSetThemeMode("crimson");
                    setIsThemeMenuOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-rose-500/10 dark:hover:bg-rose-500/15 fast-transition cursor-pointer ${
                    themePreference === "crimson"
                      ? "text-rose-400 font-medium"
                      : "text-rose-300 dark:text-rose-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon name="flame" className="w-3.5 h-3.5 text-rose-400" />{" "}
                    Crimson (Red/Black)
                  </span>
                  {themePreference === "crimson" && (
                    <Icon name="check" className="w-3.5 h-3.5 text-rose-400" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSetThemeMode("system");
                    setIsThemeMenuOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-black/[0.04] dark:hover:bg-white/[0.06] fast-transition cursor-pointer border-t border-black/[0.06] dark:border-white/[0.06] ${
                    themePreference === "system"
                      ? "text-neutral-900 dark:text-white font-medium"
                      : "text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon name="monitor" className="w-3.5 h-3.5" /> System
                    (Auto)
                  </span>
                  {themePreference === "system" && (
                    <Icon name="check" className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <label className="cursor-pointer text-xs font-medium px-2.5 sm:px-3 py-1.5 min-h-[32px] bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-neutral-700 dark:text-neutral-200 border border-black/[0.08] dark:border-white/[0.08] rounded-[8px] flex items-center gap-1.5 fast-transition active:scale-[0.98]">
            <Icon name="upload" className="w-3.5 h-3.5 shrink-0" />
            <span>
              Upload<span className="hidden lg:inline"> Save</span>
            </span>
            <input
              type="file"
              accept=".bytes,.txt,.json"
              onChange={onUploadFile}
              className="hidden"
            />
          </label>

          {/* Audit / Changes Log */}
          <button
            type="button"
            onClick={onOpenAudit}
            className={`cursor-pointer text-xs font-medium px-2.5 sm:px-3 py-1.5 min-h-[32px] rounded-[8px] border flex items-center gap-1.5 fast-transition active:scale-[0.98] ${
              changesCount > 0
                ? "bg-amber-500/[0.08] text-amber-700 dark:text-amber-300 border-amber-500/[0.25]"
                : "bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-neutral-700 dark:text-neutral-200 border border-black/[0.08] dark:border-white/[0.08]"
            }`}
          >
            <Icon name="history" className="w-3.5 h-3.5 shrink-0" />
            <span>Changes ({changesCount})</span>
          </button>

          {/* Guide Button */}
          <button
            type="button"
            onClick={onOpenGuide}
            className="cursor-pointer text-xs font-medium px-2.5 sm:px-3 py-1.5 min-h-[32px] bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-neutral-700 dark:text-neutral-200 border border-black/[0.08] dark:border-white/[0.08] rounded-[8px] flex items-center gap-1.5 fast-transition active:scale-[0.98]"
            title="User Guide"
          >
            <Icon name="help" className="w-3.5 h-3.5 shrink-0" />
            <span>Guide</span>
          </button>

          {/* Desktop Universal Export */}
          <div className="relative flex items-center" ref={exportDropdownRef}>
            <button
              type="button"
              onClick={onExport}
              disabled={!hasSaveData}
              className={`text-xs font-medium pl-3 pr-2 py-1.5 min-h-[32px] rounded-l-[8px] flex items-center gap-1.5 fast-transition active:scale-[0.98] ${
                hasSaveData
                  ? "cursor-pointer bg-[#111111] text-[#EDEDED] hover:bg-[#262626] dark:bg-[#EDEDED] dark:text-[#111111] dark:hover:bg-[#F5F5F5]"
                  : "opacity-40 cursor-not-allowed bg-black/[0.04] dark:bg-white/[0.04] text-neutral-400 dark:text-neutral-500 border border-black/[0.08] dark:border-white/[0.08]"
              }`}
              title="Download game-ready Save.bytes"
            >
              <Icon name="download" className="w-3.5 h-3.5 shrink-0" />
              <span>
                Export<span className="hidden lg:inline"> Save.bytes</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setIsExportMenuOpen((prev) => !prev)}
              disabled={!hasSaveData}
              className={`text-xs px-1.5 py-1.5 min-h-[32px] rounded-r-[8px] border-l border-white/20 dark:border-black/20 flex items-center justify-center fast-transition ${
                hasSaveData
                  ? "cursor-pointer bg-[#111111] text-[#EDEDED] hover:bg-[#262626] dark:bg-[#EDEDED] dark:text-[#111111] dark:hover:bg-[#F5F5F5]"
                  : "opacity-40 cursor-not-allowed bg-black/[0.04] dark:bg-white/[0.04] text-neutral-400 dark:text-neutral-500"
              }`}
              title="More export options"
            >
              <Icon name="chevron-down" className="w-3 h-3" />
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 py-1 bg-white dark:bg-[#141414] border border-black/[0.12] dark:border-white/[0.12] rounded-[8px] shadow-lg z-50 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    onExport();
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-neutral-900 dark:text-[#EDEDED] fast-transition cursor-pointer"
                >
                  <span className="font-medium">Direct Save.bytes</span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                    Binary
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onExportJson) onExportJson();
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-neutral-900 dark:text-[#EDEDED] fast-transition cursor-pointer border-t border-black/[0.06] dark:border-white/[0.06]"
                >
                  <span>Raw JSON (.txt)</span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    Text
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Action Controls (visible on screens < md) */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          {/* Compact Export Split Button */}
          <div className="relative flex items-center" ref={mobileExportRef}>
            <button
              type="button"
              onClick={onExport}
              disabled={!hasSaveData}
              className={`text-xs font-medium pl-2.5 pr-1.5 py-2 min-h-[44px] rounded-l-[8px] flex items-center gap-1 fast-transition active:scale-[0.98] ${
                hasSaveData
                  ? "cursor-pointer bg-[#111111] text-[#EDEDED] hover:bg-[#262626] dark:bg-[#EDEDED] dark:text-[#111111] dark:hover:bg-[#F5F5F5]"
                  : "opacity-40 cursor-not-allowed bg-black/[0.04] dark:bg-white/[0.04] text-neutral-400 dark:text-neutral-500 border border-black/[0.08] dark:border-white/[0.08]"
              }`}
              title="Download Save.bytes"
            >
              <Icon name="download" className="w-3.5 h-3.5 shrink-0" />
              <span>Export</span>
            </button>
            <button
              type="button"
              onClick={() => setIsMobileExportOpen((prev) => !prev)}
              disabled={!hasSaveData}
              className={`text-xs px-2 py-2 min-h-[44px] rounded-r-[8px] border-l border-white/20 dark:border-black/20 flex items-center justify-center fast-transition ${
                hasSaveData
                  ? "cursor-pointer bg-[#111111] text-[#EDEDED] hover:bg-[#262626] dark:bg-[#EDEDED] dark:text-[#111111] dark:hover:bg-[#F5F5F5]"
                  : "opacity-40 cursor-not-allowed bg-black/[0.04] dark:bg-white/[0.04] text-neutral-400 dark:text-neutral-500"
              }`}
              title="More export formats"
              aria-label="More export options"
            >
              <Icon name="chevron-down" className="w-3 h-3" />
            </button>

            {isMobileExportOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 py-1 bg-white dark:bg-[#141414] border border-black/[0.12] dark:border-white/[0.12] rounded-[8px] shadow-lg z-50 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    onExport();
                    setIsMobileExportOpen(false);
                  }}
                  className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-neutral-900 dark:text-[#EDEDED] fast-transition cursor-pointer"
                >
                  <span className="font-medium">Direct Save.bytes</span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                    Binary
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onExportJson) onExportJson();
                    setIsMobileExportOpen(false);
                  }}
                  className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-neutral-900 dark:text-[#EDEDED] fast-transition cursor-pointer border-t border-black/[0.06] dark:border-white/[0.06]"
                >
                  <span>Raw JSON (.txt)</span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    Text
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* More Options ("...") Menu */}
          <div className="relative" ref={mobileMenuRef}>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="relative min-w-[44px] min-h-[44px] rounded-[8px] border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-neutral-700 dark:text-neutral-200 flex items-center justify-center fast-transition active:scale-[0.98] cursor-pointer"
              title="More options"
              aria-label="More options"
            >
              <Icon name="more-vertical" className="w-4 h-4" />
              {changesCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-[#121212]" />
              )}
            </button>

            {isMobileMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-60 py-1.5 bg-white dark:bg-[#141414] border border-black/[0.12] dark:border-white/[0.12] rounded-[10px] shadow-xl z-50 text-xs">
                {/* Upload File */}
                <label className="w-full px-3.5 py-2.5 flex items-center gap-2.5 text-neutral-800 dark:text-[#EDEDED] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] cursor-pointer fast-transition">
                  <Icon
                    name="upload"
                    className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0"
                  />
                  <span className="font-medium">Upload Save File</span>
                  <input
                    type="file"
                    accept=".bytes,.txt,.json"
                    onChange={(e) => {
                      onUploadFile(e);
                      setIsMobileMenuOpen(false);
                    }}
                    className="hidden"
                  />
                </label>

                {/* Audit Log */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenAudit();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between text-neutral-800 dark:text-[#EDEDED] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] cursor-pointer fast-transition text-left"
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <Icon
                      name="history"
                      className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0"
                    />
                    Audit Log
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-semibold ${
                      changesCount > 0
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25"
                        : "bg-black/[0.04] dark:bg-white/[0.06] text-neutral-500 dark:text-neutral-400"
                    }`}
                  >
                    {changesCount} {changesCount === 1 ? "edit" : "edits"}
                  </span>
                </button>

                {/* User Guide */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenGuide();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2.5 flex items-center gap-2.5 text-neutral-800 dark:text-[#EDEDED] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] cursor-pointer fast-transition text-left"
                >
                  <Icon
                    name="help"
                    className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0"
                  />
                  <span className="font-medium">User Guide</span>
                </button>

                {/* Divider */}
                <div className="my-1.5 border-t border-black/[0.06] dark:border-white/[0.06]" />

                {/* Theme Picker */}
                <div className="px-3.5 py-1.5">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 dark:text-neutral-500 mb-1.5">
                    Theme
                  </div>
                  <div className="grid grid-cols-4 gap-1 p-0.5 bg-black/[0.04] dark:bg-white/[0.04] rounded-[8px] border border-black/[0.06] dark:border-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => {
                        onSetThemeMode("light");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`min-h-[34px] rounded-[6px] flex flex-col items-center justify-center p-1 cursor-pointer fast-transition ${
                        themePreference === "light"
                          ? "bg-white dark:bg-neutral-800 shadow-xs font-semibold text-neutral-900 dark:text-white"
                          : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                      }`}
                      title="Light Theme"
                    >
                      <Icon name="sun" className="w-3.5 h-3.5" />
                      <span className="text-[9px] mt-0.5">Light</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSetThemeMode("dark");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`min-h-[34px] rounded-[6px] flex flex-col items-center justify-center p-1 cursor-pointer fast-transition ${
                        themePreference === "dark"
                          ? "bg-white dark:bg-neutral-800 shadow-xs font-semibold text-neutral-900 dark:text-white"
                          : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                      }`}
                      title="Dark Theme"
                    >
                      <Icon name="moon" className="w-3.5 h-3.5" />
                      <span className="text-[9px] mt-0.5">Dark</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSetThemeMode("crimson");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`min-h-[34px] rounded-[6px] flex flex-col items-center justify-center p-1 cursor-pointer fast-transition ${
                        themePreference === "crimson"
                          ? "bg-white dark:bg-neutral-800 shadow-xs font-semibold text-rose-500"
                          : "text-rose-400 hover:text-rose-500"
                      }`}
                      title="Crimson Theme"
                    >
                      <Icon
                        name="flame"
                        className="w-3.5 h-3.5 text-rose-500"
                      />
                      <span className="text-[9px] mt-0.5 text-rose-500">
                        Red
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSetThemeMode("system");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`min-h-[34px] rounded-[6px] flex flex-col items-center justify-center p-1 cursor-pointer fast-transition ${
                        themePreference === "system"
                          ? "bg-white dark:bg-neutral-800 shadow-xs font-semibold text-neutral-900 dark:text-white"
                          : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                      }`}
                      title="Auto Theme"
                    >
                      <Icon name="monitor" className="w-3.5 h-3.5" />
                      <span className="text-[9px] mt-0.5">Auto</span>
                    </button>
                  </div>
                </div>

                {/* Close Save File if loaded */}
                {hasSaveData && onCloseFile && (
                  <>
                    <div className="my-1.5 border-t border-black/[0.06] dark:border-white/[0.06]" />
                    <button
                      type="button"
                      onClick={() => {
                        onCloseFile();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-3.5 py-2.5 flex items-center gap-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 cursor-pointer fast-transition text-left font-medium"
                    >
                      <Icon name="x" className="w-4 h-4 shrink-0" />
                      <span>Close Save File</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
