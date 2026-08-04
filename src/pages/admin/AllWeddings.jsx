import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, Users, BookUser, CalendarDays, CheckSquare, Wallet, BarChart3, Settings,
  Search, Plus, MapPin, X,
} from "lucide-react";
import { useWeddingsData } from "../../context/WeddingsDataContext.jsx";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "weddings", label: "Clients", icon: Users },
  { id: "vendors", label: "Vendor Library", icon: BookUser },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "payments", label: "Payments", icon: Wallet },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

const STATUS_COLOR = {
  Planning: { bg: "#F4EDE0", text: "#B58A4A" },
  "Contracts Signed": { bg: "#EAF0EE", text: "#5F7A5A" },
  "Final Details": { bg: "#EAF0EE", text: "#5F7A5A" },
  Completed: { bg: "#F0EBE1", text: "#8A8577" },
};

function yearOf(dateStr) {
  if (!dateStr) return "No Date Set";
  return new Date(dateStr + "T00:00:00").getFullYear().toString();
}

function NewWeddingModal({ onSave, onClose }) {
  const [form, setForm] = useState({ coupleNames: "", weddingDate: "", venueOverride: "" });
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(29,30,26,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 20 }} onClick={onClose}>
      <div style={{ background: "#FFFFFF", borderRadius: 16, width: "100%", maxWidth: 400, padding: 24 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#1D1E1A", fontFamily: "Georgia, serif" }}>New Wedding</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#8A8577" }}><X size={18} /></button>
        </div>
        <div style={{ fontSize: 11, color: "#8A8577", marginBottom: 16 }}>Creates a brand new wedding with its own completely separate data.</div>
        {[
          { key: "coupleNames", label: "Couple Names", type: "text", placeholder: "e.g. Priya & Arjun" },
          { key: "weddingDate", label: "Wedding Date", type: "date" },
          { key: "venueOverride", label: "Venue (optional)", type: "text", placeholder: "" },
        ].map((f) => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 10.5, fontWeight: 700, color: "#8A8577", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 5 }}>{f.label}</label>
            <input
              type={f.type} placeholder={f.placeholder}
              value={form[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              style={{ width: "100%", border: "1px solid #E7E2D5", borderRadius: 8, padding: "9px 11px", fontSize: 12.5, outline: "none", boxSizing: "border-box" }}
            />
          </div>
        ))}
        <button
          disabled={!form.coupleNames.trim()}
          onClick={() => onSave(form)}
          style={{ width: "100%", background: form.coupleNames.trim() ? "#B58A4A" : "#E7E2D5", color: form.coupleNames.trim() ? "#1D1E1A" : "#8A8577", border: "none", borderRadius: 9, padding: 11, fontSize: 12.5, fontWeight: 700, cursor: form.coupleNames.trim() ? "pointer" : "not-allowed" }}
        >
          Create Wedding
        </button>
      </div>
    </div>
  );
}

function ClientRow({ w, onOpen }) {
  const statusStyle = STATUS_COLOR[w.weddingStatus] || STATUS_COLOR.Planning;
  const [copied, setCopied] = useState(false);

  function handleCopyLink(e) {
    e.stopPropagation();
    const link = `${window.location.origin}/portal/dashboard?w=${w.id}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div
      onClick={() => onOpen(w)}
      style={{
        display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left",
        background: "#FFFFFF", border: "1px solid #E7E2D5", borderRadius: 10, padding: "12px 16px",
        cursor: "pointer", marginBottom: 8,
      }}
    >
      <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "linear-gradient(135deg, #F4EDE0, #EAD9BC)", border: "2px solid #E7D6B8", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {w.couplePhotoUrl ? <img src={w.couplePhotoUrl} alt={w.coupleNames} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 24 }}>❤️</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1D1E1A", fontFamily: "Georgia, serif" }}>{w.coupleNames || "Untitled Wedding"}</div>
        <div style={{ fontSize: 11, color: "#8A8577" }}>
          {w.weddingDate ? new Date(w.weddingDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Date not set"}
        </div>
      </div>
      <div style={{ fontSize: 11, color: "#8A8577", display: "flex", alignItems: "center", gap: 4, minWidth: 140 }}>
        <MapPin size={11} /> {w.venueOverride || "Venue not set"}
      </div>
      <span style={{ background: statusStyle.bg, color: statusStyle.text, fontSize: 9.5, fontWeight: 700, padding: "3px 10px", borderRadius: 100, whiteSpace: "nowrap" }}>{w.weddingStatus}</span>
      <button
        onClick={handleCopyLink}
        style={{ background: copied ? "#EAF0EE" : "#FFFFFF", border: "1px solid #E7E2D5", borderRadius: 8, padding: "6px 12px", fontSize: 10.5, fontWeight: 700, color: copied ? "#5F7A5A" : "#8A8577", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
      >
        {copied ? "Copied!" : "Copy Client Link"}
      </button>
    </div>
  );
}

export default function AllWeddings() {
  const navigate = useNavigate();
  const { weddings, setCurrentWeddingId, addWedding } = useWeddingsData();

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("All");
  const [showNewModal, setShowNewModal] = useState(false);

  const filtered = useMemo(() => {
    let list = weddings.filter((w) => !w.archived && w.coupleNames.toLowerCase().includes(search.toLowerCase()));
    if (yearFilter !== "All") list = list.filter((w) => yearOf(w.weddingDate) === yearFilter);
    return [...list].sort((a, b) => {
      const da = a.weddingDate ? new Date(a.weddingDate) : new Date(8640000000000000);
      const db = b.weddingDate ? new Date(b.weddingDate) : new Date(8640000000000000);
      return da - db;
    });
  }, [weddings, search, yearFilter]);

  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach((w) => {
      const key = yearOf(w.weddingDate);
      if (!g[key]) g[key] = [];
      g[key].push(w);
    });
    return Object.keys(g).sort().map((key) => ({ key, items: g[key] }));
  }, [filtered]);

  const availableYears = useMemo(() => {
    const years = new Set(weddings.filter((w) => !w.archived).map((w) => yearOf(w.weddingDate)));
    return ["All", ...[...years].sort()];
  }, [weddings]);

  function handleOpen(w) {
    setCurrentWeddingId(w.id);
    navigate("/portal/dashboard");
  }
  function handleCreate(form) {
    const newId = addWedding(form);
    setShowNewModal(false);
    setCurrentWeddingId(newId);
    navigate("/portal/dashboard");
  }

  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100vh", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif", background: "#F6F4EF", color: "#26261F" }}>
      <aside style={{ width: 220, flexShrink: 0, background: "#1D1E1A", color: "#F6F4EF", padding: "20px 12px", position: "sticky", top: 0, height: "100vh", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "2px 6px 18px 6px", borderBottom: "1px solid rgba(246,244,239,0.1)", marginBottom: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "#B58A4A", color: "#1D1E1A", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>W</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>White Glove Events</div>
            <div style={{ fontSize: 9.5, color: "rgba(246,244,239,0.5)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Planner Portal</div>
          </div>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === "weddings";
            return (
              <button key={item.id} onClick={() => navigate(item.id === "weddings" ? "/admin/weddings" : item.id === "dashboard" ? "/admin/dashboard" : item.id === "vendors" ? "/admin/vendors" : "/admin/" + item.id)}
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", borderRadius: 7, color: isActive ? "#E7D6B8" : "rgba(246,244,239,0.65)", background: isActive ? "rgba(181,138,74,0.18)" : "transparent", fontSize: 12.5, fontWeight: 500, border: "none", cursor: "pointer", textAlign: "left" }}>
                <Icon size={15} strokeWidth={1.75} /> {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main style={{ flex: 1, minWidth: 0, padding: "28px 36px 50px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontSize: 21, fontWeight: 700, color: "#1D1E1A", fontFamily: "Georgia, serif" }}>Clients</div>
              <div style={{ fontSize: 11.5, color: "#8A8577" }}>Click a couple to open their portal. Nothing opens automatically.</div>
            </div>
            <button onClick={() => setShowNewModal(true)} style={{ display: "flex", alignItems: "center", gap: 7, background: "#B58A4A", color: "#1D1E1A", border: "none", borderRadius: 9, padding: "9px 16px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
              <Plus size={14} /> New Wedding
            </button>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 20 }}>
            <div style={{ position: "relative", flex: "1 1 220px", minWidth: 200 }}>
              <Search size={14} color="#8A8577" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
              <input placeholder="Search by couple name..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: "100%", border: "1px solid #E7E2D5", borderRadius: 9, padding: "9px 12px 9px 32px", fontSize: 12.5, outline: "none", boxSizing: "border-box", background: "#FFFFFF" }} />
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {availableYears.map((y) => (
                <button key={y} onClick={() => setYearFilter(y)} style={{ padding: "8px 14px", borderRadius: 100, border: `1.5px solid ${yearFilter === y ? "#B58A4A" : "#E7E2D5"}`, background: yearFilter === y ? "#F4EDE0" : "#FFFFFF", color: yearFilter === y ? "#B58A4A" : "#8A8577", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>
                  {y === "All" ? "All" : y}
                </button>
              ))}
            </div>
          </div>

          {grouped.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "#8A8577", fontSize: 12.5 }}>
              {weddings.length === 0 ? "No weddings yet - click \"New Wedding\" to add your first one." : "No weddings match this search/filter."}
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.key} style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1D1E1A", fontFamily: "Georgia, serif", marginBottom: 10 }}>{group.key}</div>
                {group.items.map((w) => <ClientRow key={w.id} w={w} onOpen={handleOpen} />)}
              </div>
            ))
          )}

        </div>
      </main>

      {showNewModal && (
        <NewWeddingModal onClose={() => setShowNewModal(false)} onSave={handleCreate} />
      )}
    </div>
  );
}