import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { Header } from "./components/Header";
import { CharacterList } from "./components/CharacterList";
import { CharacterEditor } from "./components/CharacterEditor";
import { CompareModal } from "./components/CompareModal";
import { AuditLogModal } from "./components/AuditLogModal";
import { PresetModal } from "./components/PresetModal";
import { GuideModal } from "./components/GuideModal";
import { Icon } from "./components/Icons";
import { POWER_FIELDS } from "./constants/powers";
import { useTheme } from "./hooks/useTheme";
import { parseSaveBytes, patchSaveBytes } from "./utils/saveBytes";
import {
  saveSessionState,
  loadSessionState,
  clearSessionState,
} from "./utils/storage";
import logoImg from "./assets/logo.png";

export default function App() {
  const { themePreference, effectiveTheme, setThemeMode, toggleTheme } =
    useTheme();

  const [saveData, setSaveData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [rawBytesBuffer, setRawBytesBuffer] = useState(null);
  const [bytesOffsets, setBytesOffsets] = useState(null);
  const templateCacheRef = useRef(null);

  const [rosterType, setRosterType] = useState("savedChars"); // "savedChars" or "timeChars"
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("all");
  const [changesLog, setChangesLog] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [mobileTab, setMobileTab] = useState("roster"); // "roster" or "editor" on mobile

  // Modals
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isPresetOpen, setIsPresetOpen] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState(null);

  const [isInitialized, setIsInitialized] = useState(false);
  const isRestoringRef = useRef(false);
  const latestStateRef = useRef(null);

  const showToast = useCallback((msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Coalescing audit log tracker to prevent slider dragging from spamming micro-changes
  const logChangeEntry = useCallback((newEntry) => {
    setChangesLog((prev) => {
      if (prev.length > 0) {
        const last = prev[0];
        const isSameTarget =
          last.charId === newEntry.charId &&
          last.field === newEntry.field &&
          last.roster === newEntry.roster;
        const isRecent = Date.now() - last.timestamp < 1500;

        if (isSameTarget && isRecent) {
          if (last.oldVal === newEntry.newVal) {
            return prev.slice(1);
          }
          return [
            {
              ...last,
              newVal: newEntry.newVal,
              timestamp: Date.now(),
            },
            ...prev.slice(1),
          ];
        }
      }
      return [newEntry, ...prev];
    });
  }, []);

  // Restore persisted session from IndexedDB on initial mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const saved = await loadSessionState();
        if (saved && saved.saveData && isMounted) {
          isRestoringRef.current = true;
          setSaveData(saved.saveData);
          setOriginalData(saved.originalData || saved.saveData);
          setFileName(saved.fileName || "");
          setRawBytesBuffer(saved.rawBytesBuffer || null);
          setBytesOffsets(saved.bytesOffsets || null);
          setChangesLog(saved.changesLog || []);
          if (saved.rosterType) setRosterType(saved.rosterType);
          if (saved.selectedId) setSelectedId(saved.selectedId);
          if (saved.searchQuery) setSearchQuery(saved.searchQuery);
          if (saved.filterTab)
            setFilterTab(
              saved.filterTab === "powered" ? "all" : saved.filterTab,
            );

          showToast(
            `Restored active session for '${saved.fileName || "Save File"}'`,
            "info",
          );
        }
      } catch (err) {
        console.warn("Failed to restore session from IndexedDB:", err);
      } finally {
        if (isMounted) {
          setIsInitialized(true);
          setTimeout(() => {
            isRestoringRef.current = false;
          }, 150);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [showToast]);

  // Keep latest state snapshot for immediate beforeunload persistence
  useEffect(() => {
    if (!saveData || isRestoringRef.current) return;
    latestStateRef.current = {
      saveData,
      originalData,
      fileName,
      rawBytesBuffer,
      bytesOffsets,
      rosterType,
      selectedId,
      changesLog,
      searchQuery,
      filterTab,
    };
  }, [
    saveData,
    originalData,
    fileName,
    rawBytesBuffer,
    bytesOffsets,
    rosterType,
    selectedId,
    changesLog,
    searchQuery,
    filterTab,
  ]);

  // Debounced auto-save to IndexedDB
  useEffect(() => {
    if (!isInitialized || isRestoringRef.current) return;

    if (!saveData) {
      clearSessionState();
      return;
    }

    const timer = setTimeout(() => {
      saveSessionState({
        saveData,
        originalData,
        fileName,
        rawBytesBuffer,
        bytesOffsets,
        rosterType,
        selectedId,
        changesLog,
        searchQuery,
        filterTab,
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [
    isInitialized,
    saveData,
    originalData,
    fileName,
    rawBytesBuffer,
    bytesOffsets,
    rosterType,
    selectedId,
    changesLog,
    searchQuery,
    filterTab,
  ]);

  // Flush state immediately on page unload or refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (latestStateRef.current && latestStateRef.current.saveData) {
        saveSessionState(latestStateRef.current);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Process uploaded save file (supports both direct .bytes and decompiled .txt / .json)
  const processSaveFile = useCallback(
    (file) => {
      const isBytes = file.name.toLowerCase().endsWith(".bytes");

      if (isBytes) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const buffer = e.target.result;
            const {
              saveData: parsed,
              offsets,
              rawBuffer,
            } = parseSaveBytes(buffer);
            if (
              !parsed.savedChars ||
              Object.keys(parsed.savedChars).length === 0
            ) {
              throw new Error(
                "Could not parse character records from this .bytes file.",
              );
            }
            setSaveData(parsed);
            setOriginalData(JSON.parse(JSON.stringify(parsed)));
            setFileName(file.name);
            setRawBytesBuffer(rawBuffer);
            setBytesOffsets(offsets);
            setChangesLog([]);
            if (parsed.savedChars["200"]) {
              setSelectedId("200");
            } else {
              setSelectedId(Object.keys(parsed.savedChars)[0] || null);
            }
            showToast(
              `Direct binary '${file.name}' loaded (${Object.keys(parsed.savedChars).length} characters)! Ready to edit.`,
              "success",
            );
          } catch (err) {
            alert("Failed to parse .bytes save file: " + err.message);
          }
        };
        reader.readAsArrayBuffer(file);
        return;
      }

      // Otherwise text / JSON file
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const parsed = JSON.parse(text);
          if (!parsed.savedChars) {
            throw new Error("Invalid save file: missing 'savedChars' roster.");
          }
          setSaveData(parsed);
          setOriginalData(JSON.parse(JSON.stringify(parsed)));
          setFileName(file.name);
          setRawBytesBuffer(null);
          setBytesOffsets(null);
          setChangesLog([]);
          if (parsed.savedChars["200"]) {
            setSelectedId("200");
          } else {
            setSelectedId(Object.keys(parsed.savedChars)[0] || null);
          }
          showToast(
            `Successfully loaded '${file.name}' with ${Object.keys(parsed.savedChars).length} characters!`,
            "success",
          );
        } catch (err) {
          alert("Failed to parse save file: " + err.message);
        }
      };
      reader.readAsText(file, "utf-8");
    },
    [showToast],
  );

  const handleUploadFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processSaveFile(file);
      e.target.value = "";
    }
  };

  // Drag and drop support
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSaveFile(file);
    }
  };

  // Set of modified character IDs
  const modifiedIds = useMemo(() => {
    return new Set(changesLog.map((log) => log.charId));
  }, [changesLog]);

  const currentRoster = saveData ? saveData[rosterType] : null;
  const selectedCharacter =
    currentRoster && selectedId ? currentRoster[selectedId] : null;
  const timeMachineChar = saveData?.timeChars
    ? saveData.timeChars[selectedId]
    : null;

  // Update a single property on the active character
  const handleUpdateField = (fieldKey, value) => {
    if (!saveData || !selectedCharacter) return;

    const oldVal = selectedCharacter[fieldKey];
    if (oldVal === value) return;

    // Mutate state
    setSaveData((prev) => {
      const copy = { ...prev };
      copy[rosterType] = { ...copy[rosterType] };
      copy[rosterType][selectedId] = {
        ...copy[rosterType][selectedId],
        [fieldKey]: value,
      };
      return copy;
    });

    // Record in changes log
    const entry = {
      id: Date.now() + Math.random(),
      charId: selectedId,
      charName: selectedCharacter.name || "Unknown",
      field: fieldKey,
      oldVal,
      newVal: value,
      timestamp: Date.now(),
      roster: rosterType,
    };
    logChangeEntry(entry);
  };

  // Update projectile limb
  const handleUpdateLimb = (limbObj) => {
    if (!saveData || !selectedCharacter) return;
    const oldVal = selectedCharacter.projectileLimb;

    setSaveData((prev) => {
      const copy = { ...prev };
      copy[rosterType] = { ...copy[rosterType] };
      copy[rosterType][selectedId] = {
        ...copy[rosterType][selectedId],
        projectileLimb: limbObj,
      };
      return copy;
    });

    const entry = {
      id: Date.now() + Math.random(),
      charId: selectedId,
      charName: selectedCharacter.name || "Unknown",
      field: "projectileLimb",
      oldVal,
      newVal: limbObj,
      timestamp: Date.now(),
      roster: rosterType,
    };
    logChangeEntry(entry);
  };

  // Update a stat or superStat attribute
  const handleUpdateStat = (statType, key, value) => {
    if (!saveData || !selectedCharacter) return;

    const oldVal = selectedCharacter[statType]?.[key] ?? 100;
    if (oldVal === value) return;

    setSaveData((prev) => {
      const copy = { ...prev };
      copy[rosterType] = { ...copy[rosterType] };
      const char = { ...copy[rosterType][selectedId] };
      char[statType] = { ...char[statType], [key]: value };
      copy[rosterType][selectedId] = char;
      return copy;
    });

    const entry = {
      id: Date.now() + Math.random(),
      charId: selectedId,
      charName: selectedCharacter.name || "Unknown",
      field: `${statType}.${key}`,
      oldVal,
      newVal: value,
      timestamp: Date.now(),
      roster: rosterType,
    };
    logChangeEntry(entry);
  };

  // Batch update multiple stats or superStats at once
  const handleBatchUpdateStats = (statType, updatedStats) => {
    if (!saveData || !selectedCharacter || !updatedStats) return;

    const changes = [];
    setSaveData((prev) => {
      const copy = { ...prev };
      copy[rosterType] = { ...copy[rosterType] };
      const char = { ...copy[rosterType][selectedId] };
      char[statType] = { ...(char[statType] || {}) };

      Object.entries(updatedStats).forEach(([key, val]) => {
        const newVal = Number(val);
        const oldVal = char[statType][key] ?? 100;
        if (oldVal !== newVal) {
          char[statType][key] = newVal;
          changes.push({
            id: Date.now() + Math.random(),
            charId: selectedId,
            charName: char.name || "Unknown",
            field: `${statType}.${key}`,
            oldVal,
            newVal,
            timestamp: Date.now(),
            roster: rosterType,
          });
        }
      });

      copy[rosterType][selectedId] = char;
      return copy;
    });

    if (changes.length > 0) {
      setChangesLog((prev) => [...changes, ...prev]);
    }
  };

  // Clone powers from Time Machine
  const handleCloneFromTimeMachine = () => {
    if (!saveData || !selectedCharacter || !timeMachineChar) return;

    const changes = [];
    setSaveData((prev) => {
      const copy = { ...prev };
      copy.savedChars = { ...copy.savedChars };
      const sc = { ...copy.savedChars[selectedId] };

      POWER_FIELDS.forEach((f) => {
        const oldVal = sc[f];
        const newVal = timeMachineChar[f];
        sc[f] =
          typeof newVal === "object" && newVal !== null
            ? { ...newVal }
            : newVal;

        changes.push({
          id: Date.now() + Math.random(),
          charId: selectedId,
          charName: sc.name || "Unknown",
          field: f,
          oldVal,
          newVal,
          timestamp: Date.now(),
          roster: "savedChars",
        });
      });

      // Also clone superStat power amounts
      if (timeMachineChar.superStat) {
        sc.superStat = { ...sc.superStat };
        Object.entries(timeMachineChar.superStat).forEach(([sk, newVal]) => {
          const oldVal = sc.superStat[sk];
          sc.superStat[sk] = newVal;
          changes.push({
            id: Date.now() + Math.random(),
            charId: selectedId,
            charName: sc.name || "Unknown",
            field: `superStat.${sk}`,
            oldVal,
            newVal,
            timestamp: Date.now(),
            roster: "savedChars",
          });
        });
      }

      // Clone spirit & healthLimit if present
      if (timeMachineChar.spirit !== undefined) {
        const oldVal = sc.spirit;
        sc.spirit = timeMachineChar.spirit;
        changes.push({
          id: Date.now() + Math.random(),
          charId: selectedId,
          charName: sc.name || "Unknown",
          field: "spirit",
          oldVal,
          newVal: timeMachineChar.spirit,
          timestamp: Date.now(),
          roster: "savedChars",
        });
      }

      // Also clone physique & body traits
      const physiqueFields = [
        "gender",
        "height",
        "age",
        "muscleMass",
        "bodyMass",
        "armMass",
        "legMass",
        "headSize",
        "voice",
      ];
      physiqueFields.forEach((f) => {
        if (timeMachineChar[f] !== undefined) {
          const oldVal = sc[f];
          const newVal = timeMachineChar[f];
          if (oldVal !== newVal) {
            sc[f] = newVal;
            changes.push({
              id: Date.now() + Math.random(),
              charId: selectedId,
              charName: sc.name || "Unknown",
              field: f,
              oldVal,
              newVal,
              timestamp: Date.now(),
              roster: "savedChars",
            });
          }
        }
      });

      copy.savedChars[selectedId] = sc;
      return copy;
    });

    setChangesLog((prev) => [...changes, ...prev]);
    showToast(
      `Successfully cloned all powers, amounts, and physique from Time Machine for ${selectedCharacter.name}!`,
      "success",
    );
  };

  // Apply a preset loadout
  const handleApplyPreset = (loadout) => {
    if (!saveData || !selectedCharacter) return;

    const changes = [];
    setSaveData((prev) => {
      const copy = { ...prev };
      copy[rosterType] = { ...copy[rosterType] };
      const char = { ...copy[rosterType][selectedId] };

      Object.entries(loadout).forEach(([fieldKey, newVal]) => {
        if (
          fieldKey === "superStat" &&
          typeof newVal === "object" &&
          newVal !== null
        ) {
          char.superStat = { ...char.superStat };
          Object.entries(newVal).forEach(([sk, sVal]) => {
            const oldVal = char.superStat[sk];
            char.superStat[sk] = sVal;
            changes.push({
              id: Date.now() + Math.random(),
              charId: selectedId,
              charName: char.name || "Unknown",
              field: `superStat.${sk}`,
              oldVal,
              newVal: sVal,
              timestamp: Date.now(),
              roster: rosterType,
            });
          });
        } else {
          const oldVal = char[fieldKey];
          char[fieldKey] =
            typeof newVal === "object" && newVal !== null
              ? { ...newVal }
              : newVal;

          changes.push({
            id: Date.now() + Math.random(),
            charId: selectedId,
            charName: char.name || "Unknown",
            field: fieldKey,
            oldVal,
            newVal,
            timestamp: Date.now(),
            roster: rosterType,
          });
        }
      });

      copy[rosterType][selectedId] = char;
      return copy;
    });

    setChangesLog((prev) => [...changes, ...prev]);
    showToast(
      `Applied preset loadout to ${selectedCharacter.name}!`,
      "success",
    );
  };

  // Revert changes on the selected character
  const handleRevertCharacter = () => {
    if (!originalData || !selectedId) return;
    const origChar = originalData[rosterType]?.[selectedId];
    if (!origChar) return;

    setSaveData((prev) => {
      const copy = { ...prev };
      copy[rosterType] = { ...copy[rosterType] };
      copy[rosterType][selectedId] = JSON.parse(JSON.stringify(origChar));
      return copy;
    });

    // Remove logs for this character
    setChangesLog((prev) => prev.filter((log) => log.charId !== selectedId));
    showToast(
      `Reverted changes for ${selectedCharacter?.name || selectedId}`,
      "info",
    );
  };

  // Revert a single change from the audit log
  const handleRevertChange = (log) => {
    setSaveData((prev) => {
      const copy = { ...prev };
      if (copy[log.roster] && copy[log.roster][log.charId]) {
        copy[log.roster] = { ...copy[log.roster] };
        const char = { ...copy[log.roster][log.charId] };

        if (log.field.startsWith("superStat.")) {
          const k = log.field.split(".")[1];
          char.superStat = { ...char.superStat, [k]: log.oldVal };
        } else if (log.field.startsWith("stat.")) {
          const k = log.field.split(".")[1];
          char.stat = { ...char.stat, [k]: log.oldVal };
        } else {
          char[log.field] = log.oldVal;
        }

        copy[log.roster][log.charId] = char;
      }
      return copy;
    });

    setChangesLog((prev) => prev.filter((l) => l.id !== log.id));
    showToast(`Reverted change on ${log.field}`, "info");
  };

  // Clear all changes back to original
  const handleClearAllChanges = () => {
    if (!originalData) return;
    if (
      !window.confirm(
        "Are you sure you want to revert all changes made in this session?",
      )
    )
      return;
    setSaveData(JSON.parse(JSON.stringify(originalData)));
    setChangesLog([]);
    setIsAuditOpen(false);
    showToast("Reverted all session changes", "info");
  };

  // Retrieve base binary buffer and character offsets
  // Either from user-uploaded .bytes file or lazily fetched /Save-template.bytes
  const getBaseBufferAndOffsets = async () => {
    if (rawBytesBuffer && bytesOffsets) {
      return { buffer: rawBytesBuffer, offsets: bytesOffsets };
    }
    if (templateCacheRef.current) {
      return templateCacheRef.current;
    }
    const templatePath =
      (import.meta.env.BASE_URL || "/").replace(/\/$/, "") +
      "/Save-template.bytes";
    const res = await fetch(templatePath);
    if (!res.ok) {
      throw new Error(
        `Failed to load base binary template: HTTP ${res.status}`,
      );
    }
    const buf = await res.arrayBuffer();
    const { offsets } = parseSaveBytes(buf);
    const cached = { buffer: buf, offsets };
    templateCacheRef.current = cached;
    return cached;
  };

  // Export modified save as direct .bytes (works for both .bytes and .txt uploads)
  const handleExportBytes = async () => {
    if (!saveData) return;
    try {
      showToast("Preparing binary save file...", "info");
      const { buffer, offsets } = await getBaseBufferAndOffsets();
      const patched = patchSaveBytes(buffer, offsets, saveData);
      const blob = new Blob([patched], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName.toLowerCase().endsWith(".bytes")
        ? fileName.replace(/\.bytes$/i, "-modified.bytes")
        : "Save.bytes";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(
        `Exported game-ready binary '${a.download}'! Ready to inject into game.`,
        "success",
      );
    } catch (err) {
      alert("Failed to export .bytes: " + err.message);
    }
  };

  // Export modified save as JSON text
  const handleExportJson = () => {
    if (!saveData) return;
    const jsonString = JSON.stringify(saveData, null, 2);
    const blob = new Blob([jsonString], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Modified_Save.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Downloaded 'Modified_Save.txt'!", "success");
  };

  // Close active save and wipe persisted session from IndexedDB
  const handleCloseSave = async () => {
    if (changesLog.length > 0) {
      if (
        !window.confirm("You have unsaved edits in this session. Close anyway?")
      ) {
        return;
      }
    }
    setSaveData(null);
    setOriginalData(null);
    setFileName("");
    setRawBytesBuffer(null);
    setBytesOffsets(null);
    setChangesLog([]);
    setSelectedId(null);
    latestStateRef.current = null;
    await clearSessionState();
    showToast("Closed save file and cleared session", "info");
  };

  if (!isInitialized) {
    return (
      <div className="flex flex-col h-screen w-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] items-center justify-center">
        <div className="w-5 h-5 border-2 border-neutral-300 dark:border-neutral-700 border-t-neutral-800 dark:border-t-neutral-200 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className="flex flex-col h-screen h-[100dvh] w-full max-w-full bg-[#FAFAFA] dark:bg-[#0A0A0A] text-neutral-900 dark:text-[#EDEDED] overflow-hidden relative select-none font-sans"
    >
      {/* Drag & Drop Overlay */}
      {dragOver && (
        <div className="absolute inset-0 z-50 glass-surface border-2 border-dashed border-black/20 dark:border-white/20 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
          <Icon
            name="upload"
            className="w-10 h-10 text-neutral-700 dark:text-neutral-300 mb-3"
          />
          <h2 className="text-xl font-medium tracking-tight text-neutral-900 dark:text-[#EDEDED]">
            Drop Save File Here
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Accepts direct <span className="font-mono">Save.bytes</span> or
            decompiled JSON (<span className="font-mono">.txt / .json</span>)
          </p>
        </div>
      )}

      {/* Global Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-[10px] glass-surface text-xs font-medium flex items-center gap-2.5 border border-black/[0.12] dark:border-white/[0.12] text-neutral-900 dark:text-[#EDEDED] modal-spring ${
            toast.type === "success"
              ? "text-emerald-600 dark:text-emerald-300"
              : toast.type === "error"
                ? "text-rose-600 dark:text-rose-300"
                : "text-neutral-700 dark:text-neutral-200"
          }`}
        >
          <Icon
            name={
              toast.type === "success"
                ? "check"
                : toast.type === "error"
                  ? "x"
                  : "zap"
            }
            className="w-3.5 h-3.5 shrink-0"
          />
          <span className="text-neutral-800 dark:text-neutral-200">
            {toast.msg}
          </span>
        </div>
      )}

      {/* Header Bar */}
      <Header
        fileName={fileName}
        changesCount={changesLog.length}
        onOpenAudit={() => setIsAuditOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onUploadFile={handleUploadFile}
        onCloseFile={handleCloseSave}
        onExport={handleExportBytes}
        onExportJson={handleExportJson}
        hasSaveData={!!saveData}
        themePreference={themePreference}
        effectiveTheme={effectiveTheme}
        onToggleTheme={toggleTheme}
        onSetThemeMode={setThemeMode}
      />

      {/* Mobile Tab Bar (only shown on mobile screens < md when save data is active) */}
      {saveData && (
        <div className="md:hidden flex items-center px-3 py-2 bg-[#F4F4F5] dark:bg-[#0D0D0D] border-b border-black/[0.08] dark:border-white/[0.08] shrink-0">
          <div className="grid grid-cols-2 w-full p-0.5 bg-black/[0.04] dark:bg-white/[0.04] rounded-[8px] border border-black/[0.06] dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => setMobileTab("roster")}
              className={`cursor-pointer min-h-[38px] text-xs rounded-[6px] font-medium flex items-center justify-center gap-1.5 fast-transition ${
                mobileTab === "roster"
                  ? "bg-white dark:bg-white/[0.1] text-neutral-900 dark:text-[#EDEDED] shadow-xs dark:shadow-none font-semibold"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
              }`}
            >
              <Icon name="users" className="w-3.5 h-3.5" />
              <span>
                Roster ({currentRoster ? Object.keys(currentRoster).length : 0})
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("editor")}
              className={`cursor-pointer min-h-[38px] text-xs rounded-[6px] font-medium flex items-center justify-center gap-1.5 fast-transition ${
                mobileTab === "editor"
                  ? "bg-white dark:bg-white/[0.1] text-neutral-900 dark:text-[#EDEDED] shadow-xs dark:shadow-none font-semibold"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
              }`}
            >
              <Icon name="sliders" className="w-3.5 h-3.5" />
              <span>
                Editor {selectedCharacter ? `(#${selectedCharacter.id})` : ""}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Main App Layout */}
      {!saveData ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 text-center max-w-xl mx-auto overflow-y-auto">
          <img
            src={logoImg}
            alt="Infinite Saves - MDickie Infinite Lives Save Editor Logo"
            width="128"
            height="128"
            className="w-24 h-24 sm:w-32 sm:h-32 object-contain mb-4 select-none drop-shadow-lg"
          />
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-[#EDEDED] tracking-tight mb-2">
            Infinite Saves — MDickie's Infinite Lives Save Editor
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <label className="cursor-pointer text-xs font-medium px-4 py-2.5 bg-[#111111] text-[#EDEDED] hover:bg-[#262626] dark:bg-[#EDEDED] dark:text-[#111111] dark:hover:bg-[#F5F5F5] rounded-[8px] flex items-center gap-2 fast-transition active:scale-[0.98] shadow-sm">
              <Icon name="upload" className="w-4 h-4" />
              <span>Select Save File</span>
              <input
                type="file"
                accept=".bytes,.txt,.json"
                onChange={handleUploadFile}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="cursor-pointer text-xs font-medium px-4 py-2.5 bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-neutral-700 dark:text-neutral-200 border border-black/[0.08] dark:border-white/[0.08] rounded-[8px] flex items-center gap-2 fast-transition active:scale-[0.98]"
            >
              <Icon name="help" className="w-4 h-4" />
              <span>Reference Guide</span>
            </button>
          </div>

          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-[8px] p-3 max-w-md text-left space-y-1">
            <div className="font-semibold text-neutral-700 dark:text-neutral-300">
              Save File Locations:
            </div>
            <div>
              <strong className="text-neutral-800 dark:text-neutral-200">
                Steam / PC:
              </strong>{" "}
              <code className="font-mono text-[10px]">
                SteamLibrary/.../Infinite Lives/Save.bytes
              </code>
            </div>
            <div>
              <strong className="text-neutral-800 dark:text-neutral-200">
                Android:
              </strong>{" "}
              <code className="font-mono text-[10px]">
                Android/data/com.MDickie.InfiniteLives/files/Save.bytes
              </code>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Character Sidebar */}
          <CharacterList
            roster={currentRoster}
            rosterType={rosterType}
            setRosterType={setRosterType}
            selectedId={selectedId}
            onSelectCharacter={(id) => {
              setSelectedId(id);
              setMobileTab("editor");
            }}
            modifiedIds={modifiedIds}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterTab={filterTab}
            setFilterTab={setFilterTab}
            className={mobileTab === "editor" ? "hidden md:flex" : "flex"}
          />

          {/* Character Editor View */}
          <CharacterEditor
            character={selectedCharacter}
            timeMachineChar={timeMachineChar}
            rosterType={rosterType}
            onUpdateField={handleUpdateField}
            onUpdateLimb={handleUpdateLimb}
            onUpdateStat={handleUpdateStat}
            onBatchUpdateStats={handleBatchUpdateStats}
            onCloneFromTimeMachine={handleCloneFromTimeMachine}
            onOpenPresets={() => setIsPresetOpen(true)}
            onOpenCompare={() => setIsCompareOpen(true)}
            onRevertCharacter={handleRevertCharacter}
            hasChanges={modifiedIds.has(selectedId)}
            onBackToRoster={() => setMobileTab("roster")}
            className={mobileTab === "roster" ? "hidden md:block" : "block"}
          />
        </div>
      )}

      {/* Modals */}
      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        character={selectedCharacter}
        timeMachineChar={timeMachineChar}
        onCloneFromTimeMachine={handleCloneFromTimeMachine}
      />

      <PresetModal
        isOpen={isPresetOpen}
        onClose={() => setIsPresetOpen(false)}
        character={selectedCharacter}
        onApplyPreset={handleApplyPreset}
      />

      <AuditLogModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        changesLog={changesLog}
        onRevertChange={handleRevertChange}
        onClearAllChanges={handleClearAllChanges}
      />

      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
