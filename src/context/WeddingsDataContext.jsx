import React, { createContext, useContext, useState, useEffect } from "react";

const STORAGE_KEY = "wg-weddings-data-v1";
const OLD_PROFILE_KEY = "wg-wedding-profile-v1";
const OLD_BUDGET_KEY = "wg-budget-data-v1";

export function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }

const PROFILE_DEFAULTS = {
  coupleNames: "",
  weddingDate: "",
  venueOverride: "",
  weddingStatus: "Planning",
  plannerName: "",
  plannerPhotoUrl: "",
  plannerEmail: "",
  plannerPhone: "",
  couplePhotoUrl: "",
  couplePhotoSize: 60,
};
const BUDGET_DEFAULTS = {
  vendors: [], rentals: [], misc: [],
  initialOverallBudget: 0, categoryBudgets: [], savingsLog: [], timelineGeniusLink: "",
};

function makeWeddingRecord(overrides = {}) {
  return { id: uid(), archived: false, ...PROFILE_DEFAULTS, ...BUDGET_DEFAULTS, ...overrides };
}

function migrateFromOldStorage() {
  try {
    const oldProfileRaw = localStorage.getItem(OLD_PROFILE_KEY);
    const oldBudgetRaw = localStorage.getItem(OLD_BUDGET_KEY);
    if (!oldProfileRaw && !oldBudgetRaw) return null;
    const oldProfile = oldProfileRaw ? JSON.parse(oldProfileRaw) : {};
    const oldBudget = oldBudgetRaw ? JSON.parse(oldBudgetRaw) : {};
    return makeWeddingRecord({ ...oldProfile, ...oldBudget });
  } catch (e) {
    return null;
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* fall through to migration/seed */ }

  const migrated = migrateFromOldStorage();
  if (migrated) {
    return { weddings: [migrated], currentWeddingId: migrated.id };
  }
  return null;
}

const WeddingsDataContext = createContext(null);

export function WeddingsDataProvider({ children }) {
  const saved = loadState();
  const [weddings, setWeddings] = useState(saved?.weddings || []);
  const [currentWeddingId, setCurrentWeddingId] = useState(saved?.currentWeddingId || saved?.weddings?.[0]?.id || null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ weddings, currentWeddingId }));
    } catch (e) { /* storage unavailable */ }
  }, [weddings, currentWeddingId]);

  function updateWeddingField(weddingId, field, valueOrUpdater) {
    setWeddings((prev) => prev.map((w) => {
      if (w.id !== weddingId) return w;
      const newValue = typeof valueOrUpdater === "function" ? valueOrUpdater(w[field]) : valueOrUpdater;
      return { ...w, [field]: newValue };
    }));
  }

  function updateWeddingFields(weddingId, fields) {
    setWeddings((prev) => prev.map((w) => (w.id === weddingId ? { ...w, ...fields } : w)));
  }

  function addWedding(fields = {}) {
    const record = makeWeddingRecord(fields);
    setWeddings((prev) => [...prev, record]);
    return record.id;
  }
  function deleteWedding(weddingId) {
    setWeddings((prev) => prev.filter((w) => w.id !== weddingId));
    if (currentWeddingId === weddingId) {
      setCurrentWeddingId((id) => {
        const remaining = weddings.filter((w) => w.id !== weddingId);
        return remaining[0]?.id || null;
      });
    }
  }
  function archiveWedding(weddingId, archived = true) {
    updateWeddingField(weddingId, "archived", archived);
  }

  const value = {
    weddings, setWeddings,
    currentWeddingId, setCurrentWeddingId,
    updateWeddingField, updateWeddingFields,
    addWedding, deleteWedding, archiveWedding,
  };

  return <WeddingsDataContext.Provider value={value}>{children}</WeddingsDataContext.Provider>;
}

export function useWeddingsData() {
  const ctx = useContext(WeddingsDataContext);
  if (!ctx) throw new Error("useWeddingsData must be used inside WeddingsDataProvider");
  return ctx;
}
