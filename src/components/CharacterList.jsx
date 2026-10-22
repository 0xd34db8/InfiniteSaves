import React, { useMemo } from "react";
import { Icon } from "./Icons";

export function CharacterList({
  roster,
  rosterType,
  setRosterType,
  selectedId,
  onSelectCharacter,
  modifiedIds,
  searchQuery,
  setSearchQuery,
  filterTab,
  setFilterTab,
  className = "",
}) {
  const characters = useMemo(() => {
    if (!roster) return [];
    return Object.entries(roster).map(([id, char]) => ({
      id,
      ...char,
      isModified: modifiedIds.has(id),
    }));
  }, [roster, modifiedIds]);

  const filteredCharacters = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return characters.filter((c) => {
      // Tab filter
      if (filterTab === "modified" && !c.isModified) return false;

      // Search query
      if (!q) return true;
      const name = String(c.name || "").toLowerCase();
      const alias = String(c.alias || "").toLowerCase();
      const id = String(c.id || "").toLowerCase();

      return id === q || name.includes(q) || alias.includes(q);
    });
  }, [characters, searchQuery, filterTab]);

  const modifiedCount = useMemo(
    () => characters.filter((c) => c.isModified).length,
    [characters],
  );

  return (
    <aside
      className={`w-full md:w-80 lg:w-96 flex flex-col bg-[#F4F4F5] dark:bg-[#0D0D0D] border-r border-black/[0.08] dark:border-white/[0.08] h-full shrink-0 ${className}`}
    >
      {/* Roster Switcher */}
      <div className="p-3 border-b border-black/[0.08] dark:border-white/[0.08]">
        <div className="grid grid-cols-2 p-1 bg-black/[0.02] dark:bg-white/[0.02] rounded-[8px] border border-black/[0.06] dark:border-white/[0.06]">
          <button
            type="button"
            onClick={() => setRosterType("savedChars")}
            className={`cursor-pointer px-3 py-1.5 text-xs rounded-[6px] flex items-center justify-center gap-1.5 fast-transition ${
              rosterType === "savedChars"
                ? "bg-white dark:bg-white/[0.08] text-sky-600 dark:text-sky-400 font-semibold border border-sky-500/30 dark:border-sky-500/30 shadow-xs dark:shadow-none"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 font-normal border border-transparent"
            }`}
          >
            <span>Active World</span>
          </button>
          <button
            type="button"
            onClick={() => setRosterType("timeChars")}
            className={`cursor-pointer px-3 py-1.5 text-xs rounded-[6px] flex items-center justify-center gap-1.5 fast-transition ${
              rosterType === "timeChars"
                ? "bg-white dark:bg-white/[0.08] text-purple-600 dark:text-purple-300 font-semibold border border-purple-500/30 dark:border-purple-500/30 shadow-xs dark:shadow-none"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 font-normal border border-transparent"
            }`}
          >
            <Icon
              name="clock"
              className={`w-3.5 h-3.5 ${rosterType === "timeChars" ? "text-purple-500 dark:text-purple-400" : ""}`}
            />
            <span>Time Machine</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-3 border-b border-black/[0.08] dark:border-white/[0.08]">
        <div className="relative">
          <Icon
            name="search"
            className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search characters or ID..."
            className="w-full bg-white dark:bg-white/[0.03] border border-black/[0.12] dark:border-white/[0.12] text-neutral-900 dark:text-[#EDEDED] text-xs rounded-[6px] pl-8 pr-8 py-2 placeholder-neutral-400 dark:placeholder-neutral-500 custom-focus fast-transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <Icon name="x" className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 mt-2.5">
          <button
            type="button"
            onClick={() => setFilterTab("all")}
            className={`cursor-pointer text-xs px-2.5 py-1 rounded-[6px] fast-transition ${
              filterTab === "all"
                ? "bg-white dark:bg-white/[0.08] text-neutral-900 dark:text-[#EDEDED] font-medium border border-black/[0.12] dark:border-white/[0.12] shadow-xs dark:shadow-none"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 border border-transparent"
            }`}
          >
            All ({characters.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("modified")}
            className={`cursor-pointer text-xs px-2.5 py-1 rounded-[6px] fast-transition ${
              filterTab === "modified"
                ? "bg-white dark:bg-white/[0.08] text-neutral-900 dark:text-[#EDEDED] font-medium border border-black/[0.12] dark:border-white/[0.12] shadow-xs dark:shadow-none"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 border border-transparent"
            }`}
          >
            Edited ({modifiedCount})
          </button>
        </div>
      </div>

      {/* Characters Scroll List - Row height 36-40px, no dividers, subtle hover */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredCharacters.length === 0 ? (
          <div className="p-8 text-center text-neutral-400 dark:text-neutral-500 text-xs">
            No characters match your search or filter.
          </div>
        ) : (
          filteredCharacters.map((char) => {
            const isSelected = char.id === selectedId;
            return (
              <button
                key={char.id}
                type="button"
                onClick={() => onSelectCharacter(char.id)}
                className={`w-full text-left p-2 rounded-[6px] cursor-pointer fast-transition flex items-center justify-between gap-2.5 min-h-[44px] md:min-h-[38px] active:scale-[0.98] ${
                  isSelected
                    ? "bg-white dark:bg-white/[0.06] text-neutral-900 dark:text-[#EDEDED] border border-black/[0.1] dark:border-white/[0.08] shadow-xs dark:shadow-none"
                    : "hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-neutral-700 dark:text-neutral-300 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono text-xs text-neutral-400 dark:text-neutral-500 tabular-nums shrink-0 w-8">
                    #{char.id}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-xs text-neutral-900 dark:text-[#EDEDED] truncate">
                        {char.name || "Unknown"}
                      </span>
                      {char.player === 1 && (
                        <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 tracking-wider">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                      {char.alias ? `"${char.alias}"` : "Civilian"}
                    </div>
                  </div>
                </div>

                {/* Right-aligned status indicators */}
                <div className="flex items-center gap-2 shrink-0">
                  {char.isModified && (
                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-300">
                      EDITED
                    </span>
                  )}
                  <Icon
                    name="chevron-right"
                    className={`w-3.5 h-3.5 ${
                      isSelected
                        ? "text-neutral-800 dark:text-neutral-200"
                        : "text-neutral-400 dark:text-neutral-600"
                    }`}
                  />
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
