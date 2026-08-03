import React, { createContext, useContext, useState, useEffect } from "react";

const STORAGE_KEY = "wg-wedding-profile-v1";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

const DEFAULTS = {
  coupleNames: "Shrestha & Nishanth",
  weddingDate: "2026-08-22",
  venueOverride: "",
  weddingStatus: "Planning",
  plannerName: "",
  plannerPhotoUrl: "",
  plannerEmail: "",
  plannerPhone: "",
  couplePhotoUrl: "",
};

const WeddingProfileContext = createContext(null);

export function WeddingProfileProvider({ children }) {
  const saved = loadState();
  const [profile, setProfileState] = useState({ ...DEFAULTS, ...(saved || {}) });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) { /* storage unavailable */ }
  }, [profile]);

  function updateProfile(fields) {
    setProfileState((p) => ({ ...p, ...fields }));
  }

  return (
    <WeddingProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </WeddingProfileContext.Provider>
  );
}

export function useWeddingProfile() {
  const ctx = useContext(WeddingProfileContext);
  if (!ctx) throw new Error("useWeddingProfile must be used inside WeddingProfileProvider");
  return ctx;
}
