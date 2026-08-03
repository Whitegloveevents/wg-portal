import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, PhoneCall, Heart } from "lucide-react";
import { useWeddingProfile } from "../context/WeddingProfileContext.jsx";
import { useBudgetData } from "../context/BudgetDataContext.jsx";

export const HEADER_HEIGHT = 76;

const STATUS_COLOR = {
  Planning: { bg: "#F4EDE0", text: "#B58A4A" },
  "Contracts Signed": { bg: "#EAF0EE", text: "#5F7A5A" },
  "Final Details": { bg: "#EAF0EE", text: "#5F7A5A" },
  Completed: { bg: "#F0EBE1", text: "#8A8577" },
};

function useCountdown(dateStr) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);
  const target = new Date(dateStr + "T16:00:00").getTime();
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return { days, hours, minutes, isPast: target < now };
}

export default function ClientHeader() {
  const navigate = useNavigate();
  const { profile } = useWeddingProfile();
  const { vendors } = useBudgetData();
  const { days, hours, minutes, isPast } = useCountdown(profile.weddingDate);

  const bookedVenue = vendors.find((v) => v.category && v.category.trim().toLowerCase() === "venue" && v.vendor);
  const venueLabel = profile.venueOverride?.trim() || bookedVenue?.vendor || "Venue not yet set";

  const dateLabel = new Date(profile.weddingDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const statusStyle = STATUS_COLOR[profile.weddingStatus] || STATUS_COLOR.Planning;

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, height: HEADER_HEIGHT, zIndex: 100,
      background: "#FFFFFF", borderBottom: "1px solid #E7E2D5", display: "flex", alignItems: "center",
      padding: "0 24px", gap: 18, boxSizing: "border-box", boxShadow: "0 1px 4px rgba(29,30,26,0.04)",
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: "50%", flexShrink: 0, overflow: "hidden",
        background: "#F4EDE0", border: "2px solid #E7D6B8", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {profile.couplePhotoUrl ? (
          <img src={profile.couplePhotoUrl} alt="Couple" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Heart size={20} color="#B58A4A" strokeWidth={1.75} />
        )}
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 15.5, fontWeight: 700, color: "#1D1E1A", fontFamily: "Georgia, serif", whiteSpace: "nowrap" }}>{profile.coupleNames}</span>
          <span className="wg-header-status-pill" style={{ background: statusStyle.bg, color: statusStyle.text, fontSize: 9.5, fontWeight: 700, padding: "2px 9px", borderRadius: 100, whiteSpace: "nowrap" }}>{profile.weddingStatus}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "#8A8577", marginTop: 2, flexWrap: "wrap" }}>
          <span>{dateLabel}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><MapPin size={11} /> {venueLabel}</span>
        </div>
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        {!isPast ? (
          <div style={{ display: "flex", gap: 10, background: "#FBFAF6", border: "1px solid #E7E2D5", borderRadius: 10, padding: "6px 14px" }}>
            {[{ v: days, l: "Days" }, { v: hours, l: "Hrs" }, { v: minutes, l: "Min" }].map((c) => (
              <div key={c.l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#B58A4A", fontFamily: "ui-monospace,monospace", lineHeight: 1 }}>{c.v}</div>
                <div style={{ fontSize: 8, color: "#8A8577", textTransform: "uppercase", letterSpacing: "0.04em" }}>{c.l}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 12, fontWeight: 700, color: "#5F7A5A" }}>🎉 Married!</div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 14, borderLeft: "1px solid #E7E2D5" }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
            background: "#1D1E1A", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {profile.plannerPhotoUrl ? (
              <img src={profile.plannerPhotoUrl} alt="Planner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ color: "#E7D6B8", fontSize: 12, fontWeight: 700, fontFamily: "Georgia, serif" }}>
                {(profile.plannerName || "W G").split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </span>
            )}
          </div>
          <div className="wg-header-planner-name" style={{ display: "none" }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#1D1E1A" }}>{profile.plannerName || "Your Planner"}</div>
          </div>
          <button
            onClick={() => navigate("/portal/contacts")}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#B58A4A", color: "#1D1E1A", border: "none", borderRadius: 8, padding: "7px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
          >
            <PhoneCall size={12} /> Contact Planner
          </button>
        </div>
      </div>

      <style>{`
        @media (min-width: 980px) {
          .wg-header-planner-name { display: block !important; }
        }
      `}</style>
    </header>
  );
}
