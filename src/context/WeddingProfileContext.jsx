import React from "react";
import { useWeddingsData } from "./WeddingsDataContext.jsx";

const EMPTY_PROFILE = {
  coupleNames: "", weddingDate: "", venueOverride: "", weddingStatus: "Planning",
  plannerName: "", plannerPhotoUrl: "", plannerEmail: "", plannerPhone: "",
  couplePhotoUrl: "", couplePhotoSize: 60,
};

export function WeddingProfileProvider({ children }) {
  return children;
}

export function useWeddingProfile() {
  const { weddings, currentWeddingId, updateWeddingFields } = useWeddingsData();
  const current = weddings.find((w) => w.id === currentWeddingId) || weddings[0] || null;

  if (!current) {
    return { profile: EMPTY_PROFILE, updateProfile: () => {} };
  }

  function updateProfile(fields) {
    updateWeddingFields(current.id, fields);
  }

  return { profile: current, updateProfile };
}
