import React, { useState, useMemo } from "react";
import {
  Home, Users, BookUser, CalendarDays, BarChart3, Bell, Settings,
  Search, Plus, Copy, Archive, Eye, Wallet, CheckSquare, Camera,
  MapPin, User, Table2, LayoutGrid, X, ArrowUpDown, ArrowRight,
} from "lucide-react";

/* ---------------------------------------------------------
   White Glove Events — PLANNER ADMIN PORTAL
   Page: All Weddings (Client List) — v2
   Card view (default) + Table view toggle.
   Includes the "Duplicate Wedding" one-click creation flow.
--------------------------------------------------------- */

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "weddings", label: "All Weddings", icon: Users },
  { id: "vendors", label: "Vendor Library", icon: BookUser },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "payments", label: "Payments", icon: Wallet },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

const FILTERS = ["All", "Today's Meetings", "Wedding This Week", "Payment Due", "Needs Attention", "Completed", "Archived"];

const WEDDING_TYPES = [
  "Not specified", "Telugu Wedding", "Tamil Wedding", "Gujarati Wedding", "Punjabi Wedding",
  "Marathi Wedding", "Bengali Wedding", "Reception Only", "Destination Wedding", "Other",
];

// Every field a new wedding gets by default when duplicated from the
// Master Template — same shape, blank until the planner fills it in.
function makeFromTemplate({ names, dateLabel, dateISO, venue, planner, weddingType, photoUrl }) {
  const initials = names
    .split(/&| and /i)
    .map((n) => n.trim()[0])
    .filter(Boolean)
    .join("&");
  return {
    id: `${names}-${Date.now()}`,
    names,
    initials: initials || "—",
    date: dateISO,
    dateLabel,
    venue: venue || "Venue not added yet",
    weddingType: weddingType || "Not specified yet",
    planner: planner || "Unassigned",
    photoUrl: photoUrl || null,
    status: "Active",
    progress: 0,
    health: "Getting Started",
    budget: "Not added yet",
    guestCount: "Not added yet",
    vendors: "0 / 0",
    nextMeeting: "Not scheduled",
    outstanding: "—",
    phone: "",
  };
}

const INITIAL_WEDDINGS = [
  makeFromTemplate({ names: "Shrestha & Nishanth", dateLabel: "Aug 22, 2026", dateISO: "2026-08-22", venue: "" }),
];

// Colored progress logic: never mislabel a brand-new wedding as "at risk" —
// 0% just means not started yet, not a problem.
function progressColor(w) {
  if (w.health === "Needs Attention") return "#6B2A3A";
  if (w.progress === 0) return "#8A8577";
  if (w.progress >= 70) return "#5F7A5A";
  return "#B58A4A";
}
function progressStatusLabel(w) {
  if (w.health === "Needs Attention") return "Needs Attention";
  if (w.progress === 0) return "Not Started";
  return `${w.progress}% Complete`;
}

function PhotoBox({ w }) {
  if (w.photoUrl) {
    return <div className="wg-photo-box has-photo" style={{ backgroundImage: `url(${w.photoUrl})` }} />;
  }
  return (
    <div className="wg-photo-box">
      <Camera size={20} strokeWidth={1.5} />
      <span className="wg-photo-initials">{w.initials}</span>
      <span className="wg-photo-hint">No photo yet</span>
    </div>
  );
}

function WeddingCard({ w }) {
  return (
    <div className="wg-wcard">
      <div className="wg-wcard-photo-wrap">
        <PhotoBox w={w} />
        <div className="wg-wcard-actions-mini">
          <button className="wg-icon-btn" title="Duplicate as template"><Copy size={13} strokeWidth={1.75} /></button>
          <button className="wg-icon-btn" title="Archive"><Archive size={13} strokeWidth={1.75} /></button>
        </div>
      </div>

      <div className="wg-wcard-body">
        <div className="wg-wcard-name">{w.names}</div>

        <div className="wg-wcard-tags">
          <span className="wg-tag-type">{w.weddingType}</span>
          <span className="wg-tag-health">Planner: {w.planner}</span>
        </div>

        <div className="wg-wcard-progress">
          <div className="wg-mini-track"><div className="wg-mini-fill" style={{ width: `${Math.max(w.progress, w.progress === 0 ? 3 : 0)}%`, background: progressColor(w) }} /></div>
          <span className="wg-mini-pct" style={{ color: progressColor(w) }}>{progressStatusLabel(w)}</span>
        </div>

        <div className="wg-wcard-summary">
          <div className="wg-summary-item"><MapPin size={12} strokeWidth={1.75} /> {w.venue}</div>
          <div className="wg-summary-item"><CalendarDays size={12} strokeWidth={1.75} /> {w.dateLabel}</div>
          <div className="wg-summary-item"><Users size={12} strokeWidth={1.75} /> {w.guestCount} guests</div>
          <div className="wg-summary-item"><Wallet size={12} strokeWidth={1.75} /> {w.budget}</div>
        </div>

        <div className="wg-wcard-quickrow">
          <button className="wg-qbtn"><Eye size={12} strokeWidth={1.75} /> Portal</button>
          <button className="wg-qbtn"><Wallet size={12} strokeWidth={1.75} /> Budget</button>
          <button className="wg-qbtn"><CalendarDays size={12} strokeWidth={1.75} /> Timeline</button>
          <button className="wg-qbtn"><Users size={12} strokeWidth={1.75} /> Vendors</button>
        </div>
      </div>
    </div>
  );
}

export default function AllWeddings() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [weddings, setWeddings] = useState(INITIAL_WEDDINGS);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [view, setView] = useState("card"); // 'card' | 'table'
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("asc");
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [newForm, setNewForm] = useState({ names: "", date: "", venue: "", planner: "", weddingType: "", photoName: "" });

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const rows = useMemo(() => {
    const q = query.toLowerCase();
    let list = weddings.filter(
      (w) =>
        w.names.toLowerCase().includes(q) ||
        w.dateLabel.toLowerCase().includes(q) ||
        w.venue.toLowerCase().includes(q) ||
        (w.phone && w.phone.includes(q))
    );

    const today = new Date();
    const weekOut = new Date(today.getTime() + 7 * 86400000);

    if (activeFilter === "Today's Meetings") list = list.filter((w) => false); // no meetings scheduled yet
    if (activeFilter === "Wedding This Week") list = list.filter((w) => { const d = new Date(w.date); return d >= today && d <= weekOut; });
    if (activeFilter === "Payment Due") list = list.filter((w) => w.outstanding !== "—");
    if (activeFilter === "Needs Attention") list = list.filter((w) => w.health === "Attention Needed");
    if (activeFilter === "Completed") list = list.filter((w) => w.status === "Completed");
    if (activeFilter === "Archived") list = list.filter((w) => w.status === "Archived");

    list = [...list].sort((a, b) => {
      const av = sortKey === "date" ? new Date(a.date).getTime() : sortKey === "progress" ? a.progress : a.names.toLowerCase();
      const bv = sortKey === "date" ? new Date(b.date).getTime() : sortKey === "progress" ? b.progress : b.names.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [weddings, query, activeFilter, sortKey, sortDir]);

  function handleDuplicate() {
    if (!newForm.names.trim() || !newForm.date) return;
    const dateObj = new Date(newForm.date);
    const dateLabel = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const created = makeFromTemplate({
      names: newForm.names.trim(),
      dateLabel,
      dateISO: newForm.date,
      venue: newForm.venue.trim(),
      planner: newForm.planner.trim(),
      weddingType: newForm.weddingType && newForm.weddingType !== "Not specified" ? newForm.weddingType : "",
    });
    setWeddings((w) => [...w, created]);
    setShowDuplicateModal(false);
    setNewForm({ names: "", date: "", venue: "", planner: "", weddingType: "", photoName: "" });
  }

  return (
    <div className="wg-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        .wg-root { --ink:#1D1E1A; --paper:#F6F4EF; --surface:#FFFFFF; --line:#E7E2D5; --champagne:#B58A4A; --champagne-soft:#E7D6B8; --champagne-wash:#F4EDE0; --sage:#5F7A5A; --sage-wash:#E7EDE4; --bordeaux:#6B2A3A; --bordeaux-wash:#F3E6E8; --stone:#8A8577; --text:#26261F;
          font-family:'Inter',sans-serif; background:var(--paper); color:var(--text); min-height:100vh; display:flex; width:100%; }
        .wg-root * { box-sizing: border-box; }

        .wg-sidebar { width:296px; flex-shrink:0; background:var(--ink); color:var(--paper); display:flex; flex-direction:column; padding:22px 14px; position:sticky; top:0; height:100vh; }
        .wg-brand { display:flex; align-items:center; gap:9px; padding:0 8px 20px 8px; border-bottom:1px solid rgba(246,244,239,0.1); margin-bottom:14px; }
        .wg-brand-mark { width:28px; height:28px; border-radius:8px; background:var(--champagne); color:var(--ink); font-family:'Fraunces',serif; font-size:13px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .wg-brand-text-name { font-size:12.5px; font-weight:600; color:var(--paper); line-height:1.2; }
        .wg-brand-text-sub { font-size:10px; color:rgba(246,244,239,0.45); letter-spacing:0.08em; text-transform:uppercase; }
        .wg-nav { display:flex; flex-direction:column; gap:1px; flex:1; overflow-y:auto; }
        .wg-nav-item { display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:7px; color:rgba(246,244,239,0.58); font-size:12.5px; font-weight:500; background:transparent; border:none; cursor:pointer; text-align:left; }
        .wg-nav-item:hover { background:rgba(246,244,239,0.06); color:var(--paper); }
        .wg-nav-item.active { background:rgba(181,138,74,0.18); color:var(--champagne-soft); }
        .wg-sidebar-foot { border-top:1px solid rgba(246,244,239,0.1); margin-top:10px; padding-top:12px; display:flex; align-items:center; gap:9px; }
        .wg-avatar { width:26px; height:26px; border-radius:100px; background:rgba(246,244,239,0.1); color:var(--paper); font-size:10.5px; font-weight:600; display:flex; align-items:center; justify-content:center; }
        .wg-sidebar-foot-text { font-size:11px; color:rgba(246,244,239,0.5); line-height:1.3; }
        .wg-sidebar-foot-text strong { color:rgba(246,244,239,0.85); font-size:11.5px; display:block; }

        .wg-mobile-bar { display:none; align-items:center; justify-content:space-between; padding:13px 16px; background:var(--ink); color:var(--paper); position:sticky; top:0; z-index:20; }
        .wg-mobile-bar button { background:transparent; border:none; color:var(--paper); cursor:pointer; display:flex; }
        .wg-mobile-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:29; }

        .wg-main { flex:1; min-width:0; padding:40px 56px 72px; }
        .wg-main-inner { max-width: 1920px; margin: 0 auto; }
        .wg-utilitybar { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:14px; flex-wrap:wrap; }
        .wg-page-title { font-size:23px; font-weight:700; color:var(--ink); letter-spacing:-0.01em; }
        .wg-page-sub { font-size:12px; color:var(--stone); margin-top:2px; }
        .wg-utility-right { display:flex; align-items:center; gap:10px; flex-wrap: wrap; }
        .wg-search { display:flex; align-items:center; gap:8px; background:var(--surface); border:1px solid var(--line); border-radius:9px; padding:8px 12px; width:250px; color:var(--stone); }
        .wg-search input { border:none; outline:none; background:transparent; font-size:12.5px; color:var(--text); width:100%; font-family:'Inter',sans-serif; }
        .wg-primary-btn { display:flex; align-items:center; gap:7px; background:var(--champagne); color:var(--ink); border:none; border-radius:9px; padding:9px 15px; font-size:12.5px; font-weight:700; cursor:pointer; white-space:nowrap; }
        .wg-primary-btn:hover { background:#a37b40; }
        .wg-view-toggle { display:flex; border:1px solid var(--line); border-radius:9px; overflow:hidden; }
        .wg-view-toggle button { background:var(--surface); border:none; padding:8px 11px; color:var(--stone); cursor:pointer; display:flex; }
        .wg-view-toggle button.active { background:var(--champagne-wash); color:var(--champagne); }

        .wg-filter-row { display:flex; gap:8px; margin-bottom:18px; flex-wrap:wrap; }
        .wg-filter-chip { padding:7px 13px; border-radius:100px; background:var(--surface); border:1px solid var(--line); font-size:11.5px; font-weight:600; color:var(--stone); cursor:pointer; }
        .wg-filter-chip.active { background:var(--champagne-wash); border-color:var(--champagne-soft); color:var(--champagne); }

        /* Card view */
        .wg-card-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .wg-wcard { background:var(--surface); border:1px solid var(--line); border-radius:14px; overflow:hidden; display:flex; flex-direction:column; }
        .wg-wcard-photo-wrap { position:relative; }
        .wg-photo-box { width:100%; height:150px; background:var(--paper); border-bottom:1px solid var(--line); color:var(--stone); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; background-size:cover; background-position:center; }
        .wg-photo-box.has-photo { color:transparent; }
        .wg-photo-initials { font-family:'Fraunces',serif; font-size:15px; color:var(--stone); }
        .wg-photo-hint { font-size:10px; color:var(--stone); }
        .wg-wcard-actions-mini { position:absolute; top:10px; right:10px; display:flex; gap:6px; }
        .wg-icon-btn { width:26px; height:26px; border-radius:7px; background:var(--surface); border:1px solid var(--line); color:var(--stone); display:flex; align-items:center; justify-content:center; cursor:pointer; }
        .wg-icon-btn:hover { color:var(--champagne); border-color:var(--champagne); }
        .wg-wcard-body { padding:14px 16px 16px; display:flex; flex-direction:column; flex:1; }
        .wg-wcard-name { font-size:15px; font-weight:700; color:var(--ink); margin-bottom:8px; }
        .wg-wcard-tags { display:flex; gap:6px; margin-bottom:10px; flex-wrap:wrap; }
        .wg-tag-type { font-size:10px; font-weight:600; background:var(--paper); border:1px solid var(--line); color:var(--stone); padding:3px 8px; border-radius:100px; }
        .wg-tag-health { font-size:10px; font-weight:600; background:var(--champagne-wash); color:var(--champagne); padding:3px 8px; border-radius:100px; }
        .wg-wcard-progress { display:flex; align-items:center; gap:8px; margin-bottom:14px; }
        .wg-mini-track { flex:1; height:6px; border-radius:4px; background:var(--paper); overflow:hidden; }
        .wg-mini-fill { height:100%; border-radius:4px; }
        .wg-mini-pct { font-family:'IBM Plex Mono',monospace; font-size:10.5px; font-weight:600; white-space:nowrap; }
        .wg-wcard-summary { display:grid; grid-template-columns:1fr 1fr; gap:7px 10px; margin-bottom:14px; }
        .wg-summary-item { display:flex; align-items:center; gap:6px; font-size:11px; color:var(--stone); }
        .wg-wcard-quickrow { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:auto; }
        .wg-qbtn { display:flex; align-items:center; justify-content:center; gap:5px; background:var(--paper); border:1px solid var(--line); border-radius:8px; padding:8px 6px; font-size:11px; font-weight:600; color:var(--ink); cursor:pointer; }
        .wg-qbtn:hover { border-color:var(--champagne); color:var(--champagne); }

        /* Table view (reused pattern) */
        .wg-table-wrap { background:var(--surface); border:1px solid var(--line); border-radius:14px; overflow:hidden; overflow-x:auto; }
        table { width:100%; border-collapse:collapse; min-width:820px; }
        thead th { text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:0.05em; color:var(--stone); font-weight:700; padding:12px 14px; border-bottom:1px solid var(--line); background:var(--paper); cursor:pointer; white-space:nowrap; }
        thead th span { display:inline-flex; align-items:center; gap:4px; }
        tbody td { padding:12px 14px; font-size:12.5px; color:var(--text); border-bottom:1px solid var(--line); vertical-align:middle; white-space:nowrap; }
        tbody tr:last-child td { border-bottom:none; }
        tbody tr:hover { background:var(--paper); }
        .wg-row-name { display:flex; align-items:center; gap:10px; }
        .wg-row-name-text { font-weight:700; color:var(--ink); }

        .wg-empty-panel { grid-column:1/-1; text-align:center; padding:50px 24px; border:1.5px dashed var(--line); border-radius:16px; background:var(--surface); color:var(--stone); font-size:12.5px; }

        /* Duplicate modal */
        .wg-modal-overlay { position:fixed; inset:0; background:rgba(29,30,26,0.55); display:flex; align-items:center; justify-content:center; z-index:50; padding:20px; }
        .wg-modal { background:var(--surface); border-radius:16px; width:100%; max-width:420px; padding:22px 24px; }
        .wg-modal-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
        .wg-modal-title { font-size:15px; font-weight:700; color:var(--ink); }
        .wg-modal-close { background:none; border:none; color:var(--stone); cursor:pointer; }
        .wg-modal-sub { font-size:11.5px; color:var(--stone); margin-bottom:16px; }
        .wg-field { margin-bottom:12px; }
        .wg-field label { display:block; font-size:11px; font-weight:600; color:var(--stone); margin-bottom:5px; text-transform:uppercase; letter-spacing:0.04em; }
        .wg-field input, .wg-field select { width:100%; border:1px solid var(--line); border-radius:8px; padding:9px 10px; font-size:12.5px; font-family:'Inter',sans-serif; outline:none; background:var(--surface); color:var(--text); }
        .wg-field input:focus, .wg-field select:focus { border-color:var(--champagne); }
        .wg-photo-upload { display:flex; align-items:center; gap:8px; border:1px dashed var(--line); border-radius:8px; padding:10px 12px; font-size:12px; color:var(--stone); cursor:pointer; }
        .wg-photo-upload:hover { border-color:var(--champagne); color:var(--champagne); }

        @media (max-width: 1150px) { .wg-card-grid { grid-template-columns:repeat(2,1fr); } }
        @media (max-width: 720px) {
          .wg-sidebar { display:none; }
          .wg-sidebar.wg-sidebar-mobile-open { display:flex; position:fixed; z-index:30; left:0; top:0; }
          .wg-mobile-bar { display:flex; }
          .wg-mobile-overlay.open { display:block; }
          .wg-main { padding:18px 14px 48px; }
          .wg-card-grid { grid-template-columns:1fr; }
          .wg-search { width:100%; }
          .wg-utilitybar { flex-direction:column; align-items:flex-start; }
          .wg-utility-right { width:100%; }
        }
      `}</style>

      <div className="wg-mobile-bar">
        <button aria-label="Open menu" onClick={() => setMobileOpen(true)}><Home size={20} /></button>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#E7D6B8" }}>White Glove Events — Studio</span>
        <span style={{ width: 20 }} />
      </div>
      <div className={`wg-mobile-overlay${mobileOpen ? " open" : ""}`} onClick={() => setMobileOpen(false)} />

      <aside className={`wg-sidebar${mobileOpen ? " wg-sidebar-mobile-open" : ""}`}>
        <div className="wg-brand">
          <div className="wg-brand-mark">W</div>
          <div>
            <div className="wg-brand-text-name">White Glove Events</div>
            <div className="wg-brand-text-sub">Studio Admin</div>
          </div>
        </div>
        <nav className="wg-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={`wg-nav-item${item.id === "weddings" ? " active" : ""}`} onClick={() => setMobileOpen(false)}>
                <Icon size={16} strokeWidth={1.75} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="wg-sidebar-foot">
          <div className="wg-avatar">WG</div>
          <div className="wg-sidebar-foot-text">Signed in as<strong>Planner</strong></div>
        </div>
      </aside>

      <main className="wg-main">
        <div className="wg-main-inner">
        <div className="wg-utilitybar">
          <div>
            <div className="wg-page-title">All Weddings</div>
            <div className="wg-page-sub">{weddings.length} wedding on file · built to scale to hundreds</div>
          </div>
          <div className="wg-utility-right">
            <div className="wg-search">
              <Search size={14} strokeWidth={1.75} />
              <input placeholder="Search name, date, venue, vendor, phone..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="wg-view-toggle">
              <button className={view === "card" ? "active" : ""} onClick={() => setView("card")} title="Card view"><LayoutGrid size={14} strokeWidth={1.75} /></button>
              <button className={view === "table" ? "active" : ""} onClick={() => setView("table")} title="Table view"><Table2 size={14} strokeWidth={1.75} /></button>
            </div>
            <button className="wg-primary-btn" onClick={() => setShowDuplicateModal(true)}>
              <Plus size={14} strokeWidth={2.2} /> Duplicate Wedding
            </button>
          </div>
        </div>

        <div className="wg-filter-row">
          {FILTERS.map((f) => (
            <button key={f} className={`wg-filter-chip${activeFilter === f ? " active" : ""}`} onClick={() => setActiveFilter(f)}>
              {f}
            </button>
          ))}
        </div>

        {view === "card" ? (
          <div className="wg-card-grid">
            {rows.length === 0 ? (
              <div className="wg-empty-panel">No weddings match this filter.</div>
            ) : (
              rows.map((w) => <WeddingCard key={w.id} w={w} />)
            )}
          </div>
        ) : (
          <div className="wg-table-wrap">
            <table>
              <thead>
                <tr>
                  <th onClick={() => toggleSort("names")}><span>Couple <ArrowUpDown size={11} /></span></th>
                  <th onClick={() => toggleSort("date")}><span>Wedding Date <ArrowUpDown size={11} /></span></th>
                  <th>Venue</th>
                  <th>Type</th>
                  <th>Planner</th>
                  <th onClick={() => toggleSort("progress")}><span>Progress <ArrowUpDown size={11} /></span></th>
                  <th>Health</th>
                  <th>Outstanding</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((w) => (
                  <tr key={w.id}>
                    <td><div className="wg-row-name"><span className="wg-row-name-text">{w.names}</span></div></td>
                    <td>{w.dateLabel}</td>
                    <td>{w.venue}</td>
                    <td>{w.weddingType}</td>
                    <td>{w.planner}</td>
                    <td>{w.progress}%</td>
                    <td>{w.health}</td>
                    <td>{w.outstanding}</td>
                    <td>
                      <button className="wg-qbtn"><Eye size={12} strokeWidth={1.75} /> Open <ArrowRight size={11} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      </main>

      {showDuplicateModal && (
        <div className="wg-modal-overlay" onClick={() => setShowDuplicateModal(false)}>
          <div className="wg-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wg-modal-head">
              <span className="wg-modal-title">Duplicate Master Template</span>
              <button className="wg-modal-close" onClick={() => setShowDuplicateModal(false)}><X size={16} /></button>
            </div>
            <div className="wg-modal-sub">Every section — Budget, Vendors, Timeline, Documents, and more — is created automatically. Fill these in and you're done.</div>

            <div className="wg-field">
              <label>Couple Photo (optional)</label>
              <label className="wg-photo-upload">
                <Camera size={14} strokeWidth={1.75} />
                {newForm.photoName || "Upload a photo — or add later"}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => setNewForm({ ...newForm, photoName: e.target.files?.[0]?.name || "" })}
                />
              </label>
            </div>
            <div className="wg-field">
              <label>Couple Name</label>
              <input placeholder="e.g. Aditi & Rohan" value={newForm.names} onChange={(e) => setNewForm({ ...newForm, names: e.target.value })} />
            </div>
            <div className="wg-field">
              <label>Wedding Date</label>
              <input type="date" value={newForm.date} onChange={(e) => setNewForm({ ...newForm, date: e.target.value })} />
            </div>
            <div className="wg-field">
              <label>Venue (optional)</label>
              <input placeholder="Can be added later" value={newForm.venue} onChange={(e) => setNewForm({ ...newForm, venue: e.target.value })} />
            </div>
            <div className="wg-field">
              <label>Planner</label>
              <input placeholder="Who's running this wedding?" value={newForm.planner} onChange={(e) => setNewForm({ ...newForm, planner: e.target.value })} />
            </div>
            <div className="wg-field">
              <label>Wedding Type</label>
              <select value={newForm.weddingType} onChange={(e) => setNewForm({ ...newForm, weddingType: e.target.value })}>
                <option value="">Select a type...</option>
                {WEDDING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <button className="wg-primary-btn" style={{ width: "100%", justifyContent: "center" }} onClick={handleDuplicate}>
              Create Wedding
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
