import React from "react";
import { useNavigate } from "react-router-dom";

export default function ComingSoon({ label, backTo = "/portal/dashboard" }) {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F6F4EF", padding: 24 }}>
      <div style={{ background: "#FFFFFF", border: "1.5px dashed #E7E2D5", borderRadius: 16, padding: "56px 40px", textAlign: "center", maxWidth: 420 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1D1E1A", marginBottom: 8 }}>{label}</h2>
        <p style={{ fontSize: 13, color: "#8A8577", lineHeight: 1.6, marginBottom: 20 }}>
          This module hasn't been built yet — it's next in line, following the same design system as Dashboard, Budget, and Vendors.
        </p>
        <button
          onClick={() => navigate(backTo)}
          style={{ background: "#B58A4A", color: "#1D1E1A", border: "none", borderRadius: 9, padding: "10px 18px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
