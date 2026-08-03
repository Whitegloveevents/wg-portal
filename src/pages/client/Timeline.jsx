import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home, Wallet, Users, CreditCard, CalendarClock, NotebookPen, ClipboardList,
  Table2, Palette, FolderOpen, PhoneCall, Settings, Menu,
  Plus, X, ChevronDown, ChevronRight, CalendarDays, LayoutGrid,
  Check, Clock, MapPin, Trash2,
} from "lucide-react";

/* ---------------------------------------------------------
   White Glove Events — Client Portal
   PAGE 4 OF N: Timeline — Planning / Wedding Week / Wedding Day
   Couple: Shrestha & Nishanth   Wedding: August 22, 2026
--------------------------------------------------------- */

const COUPLE = "Shrestha & Nishanth";
const INITIALS = "S&N";
const WEDDING_DATE = new Date("2026-08-22T16:00:00");

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: Home, finished: true },
  { id: "budget", label: "Budget", icon: Wallet, finished: true },
  { id: "vendors", label: "Vendors", icon: Users, finished: true },
  { id: "timeline", label: "Timeline", icon: CalendarClock, finished: true },
  { id: "payments", label: "Payments", icon: CreditCard, finished: false },
  { id: "meetings", label: "Meeting Notes", icon: NotebookPen, finished: true },
  { id: "guestlist", label: "Guest List", icon: ClipboardList, finished: true },
  { id: "seating", label: "Seating", icon: Table2, finished: false },
  { id: "design", label: "Design", icon: Palette, finished: false },
  { id: "documents", label: "Documents", icon: FolderOpen, finished: true },
  { id: "contacts", label: "Contacts", icon: PhoneCall, finished: true },
  { id: "settings", label: "Settings", icon: Settings, finished: true },
];
const FEATURE_GROUPS = [
  { title: "Planning", items: [NAV_ITEMS[0], NAV_ITEMS[1], NAV_ITEMS[2], NAV_ITEMS[3], NAV_ITEMS[4], NAV_ITEMS[5]] },
  { title: "More", items: [NAV_ITEMS[6], NAV_ITEMS[7], NAV_ITEMS[8], NAV_ITEMS[9], NAV_ITEMS[10], NAV_ITEMS[11]] },
];
const EVENT_NAV = ["Haldi", "Mehendi", "Sangeet", "Wedding", "Reception", "Cocktail", "Welcome Dinner", "Brunch"];
const EVENT_SUBLINKS = [
  { id: "budget", label: "Budget", icon: Wallet },
  { id: "vendors", label: "Vendors", icon: Users },
  { id: "timeline", label: "Timeline", icon: CalendarClock },
];

function sidebarTheme(mode) {
  return mode === "dark"
    ? { bg: "#1D1E1A", text: "#F6F4EF", muted: "rgba(246,244,239,0.58)", border: "rgba(246,244,239,0.1)", hover: "rgba(246,244,239,0.07)", activeBg: "rgba(181,138,74,0.18)", activeText: "#E7D6B8", logoBg: "#B58A4A", logoText: "#1D1E1A", sectionLabel: "rgba(246,244,239,0.4)" }
    : { bg: "#FBFAF6", text: "#26261F", muted: "#8A8577", border: "#E7E2D5", hover: "#F4EDE0", activeBg: "#F4EDE0", activeText: "#B58A4A", logoBg: "#B58A4A", logoText: "#FFFFFF", sectionLabel: "#8A8577" };
}

// Planning milestones — real, standard wedding-planning checkpoints. Empty
// "done" state and no dates pre-filled, since nothing has actually happened
// yet for this real wedding.
const INITIAL_MILESTONES = [
  { id: 1, task: "Book venue", dueDate: "", done: false },
  { id: 2, task: "Finalize guest list", dueDate: "", done: false },
  { id: 3, task: "Book photographer & videographer", dueDate: "", done: false },
  { id: 4, task: "Send invitations", dueDate: "", done: false },
  { id: 5, task: "Finalize menu & catering", dueDate: "", done: false },
  { id: 6, task: "Confirm décor & floral plan", dueDate: "", done: false },
  { id: 7, task: "Finalize day-of timeline with all vendors", dueDate: "", done: false },
  { id: 8, task: "Final headcount to caterer", dueDate: "", done: false },
];

export default function Timeline() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarView, setSidebarView] = useState("feature");
  const [sidebarTheme_, setSidebarTheme_] = useState("light");
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [expandedNavEvents, setExpandedNavEvents] = useState({});
  const [weddingSwitcherOpen, setWeddingSwitcherOpen] = useState(false);

  const [tab, setTab] = useState("planning"); // 'planning' | 'week' | 'day'
  const [milestones, setMilestones] = useState(INITIAL_MILESTONES);
  const [newMilestone, setNewMilestone] = useState({ task: "", dueDate: "" });

  const [weekEvents, setWeekEvents] = useState([]);
  const [newWeekEvent, setNewWeekEvent] = useState({ date: "", title: "", notes: "" });

  const [dayEvents, setDayEvents] = useState([]);
  const [newDayEvent, setNewDayEvent] = useState({ time: "", activity: "", responsible: "", location: "" });

  const daysLeft = Math.max(0, Math.ceil((WEDDING_DATE.getTime() - Date.now()) / 86400000));
  const weddingDateLabel = WEDDING_DATE.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const doneCount = milestones.filter((m) => m.done).length;
  const progressPct = milestones.length ? Math.round((doneCount / milestones.length) * 100) : 0;

  const sortedDayEvents = useMemo(
    () => [...dayEvents].sort((a, b) => (a.time || "").localeCompare(b.time || "")),
    [dayEvents]
  );
  const sortedWeekEvents = useMemo(
    () => [...weekEvents].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [weekEvents]
  );

  const commandAlerts = useMemo(() => {
    const alerts = [];
    const overdue = milestones.filter((m) => !m.done && m.dueDate && new Date(m.dueDate) < new Date());
    overdue.forEach((m) => alerts.push({ level: "red", text: `"${m.task}" is overdue` }));
    const soon = milestones.filter((m) => {
      if (m.done || !m.dueDate) return false;
      const days = Math.ceil((new Date(m.dueDate) - new Date()) / 86400000);
      return days >= 0 && days <= 7;
    });
    soon.forEach((m) => alerts.push({ level: "yellow", text: `"${m.task}" due within a week` }));
    if (daysLeft <= 14 && dayEvents.length === 0) {
      alerts.push({ level: "yellow", text: "Wedding is under 2 weeks away and no day-of schedule has been built yet" });
    }
    return alerts;
  }, [milestones, dayEvents, daysLeft]);
  const ALERT_DOT = { red: "🔴", yellow: "🟡", green: "🟢", blue: "🔵" };

  function toggleMilestone(id) {
    setMilestones((ms) => ms.map((m) => (m.id === id ? { ...m, done: !m.done } : m)));
  }
  function addMilestone() {
    if (!newMilestone.task.trim()) return;
    setMilestones((ms) => [...ms, { id: Date.now(), task: newMilestone.task.trim(), dueDate: newMilestone.dueDate, done: false }]);
    setNewMilestone({ task: "", dueDate: "" });
  }
  function removeMilestone(id) {
    setMilestones((ms) => ms.filter((m) => m.id !== id));
  }
  function addWeekEvent() {
    if (!newWeekEvent.date || !newWeekEvent.title.trim()) return;
    setWeekEvents((w) => [...w, { ...newWeekEvent, id: Date.now() }]);
    setNewWeekEvent({ date: "", title: "", notes: "" });
  }
  function removeWeekEvent(id) {
    setWeekEvents((w) => w.filter((e) => e.id !== id));
  }
  function addDayEvent() {
    if (!newDayEvent.time || !newDayEvent.activity.trim()) return;
    setDayEvents((d) => [...d, { ...newDayEvent, id: Date.now() }]);
    setNewDayEvent({ time: "", activity: "", responsible: "", location: "" });
  }
  function removeDayEvent(id) {
    setDayEvents((d) => d.filter((e) => e.id !== id));
  }

  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100vh", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif", background: "#F6F4EF", color: "#26261F" }}>
      <style>{`
        .wg-card { background:#FFFFFF; border:1px solid #E7E2D5; border-top:3px solid #B58A4A; border-radius:14px; padding:18px 20px; }
        .wg-primary-btn { display:flex; align-items:center; gap:7px; background:#B58A4A; color:#1D1E1A; border:none; border-radius:9px; padding:9px 15px; font-size:12.5px; font-weight:700; cursor:pointer; }
        .wg-primary-btn:hover { background:#a37b40; }
        .wg-tab-btn { padding:8px 16px; border-radius:8px; border:1px solid #E7E2D5; background:#FFFFFF; font-size:12px; font-weight:700; color:#8A8577; cursor:pointer; }
        .wg-tab-btn.active { background:#F4EDE0; border-color:#E7D6B8; color:#B58A4A; }
        .wg-field input, .wg-field textarea { border:1px solid #E7E2D5; border-radius:8px; padding:8px 10px; font-size:12.5px; outline:none; font-family:inherit; }
        .wg-icon-btn { width:28px; height:28px; border-radius:7px; background:#FBFAF6; border:1px solid #E7E2D5; color:#8A8577; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; }
        .wg-icon-btn:hover { color:#6B2A3A; border-color:#6B2A3A; }
      `}</style>

      <aside style={{ width: 296, flexShrink: 0, background: sidebarTheme(sidebarTheme_).bg, color: sidebarTheme(sidebarTheme_).text, display: "flex", flexDirection: "column", padding: "20px 12px", position: "sticky", top: 0, height: "100vh", boxSizing: "border-box", overflow: "hidden", borderRight: sidebarTheme_ === "light" ? `1px solid ${sidebarTheme(sidebarTheme_).border}` : "none" }}>
        {(() => {
          const t = sidebarTheme(sidebarTheme_);
          return (
            <>
              <div style={{ position: "relative", marginBottom: 12 }}>
                <button onClick={() => setWeddingSwitcherOpen((o) => !o)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: t.hover, border: `1px solid ${t.border}`, borderRadius: 8, padding: "7px 10px", cursor: "pointer" }}>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 8.5, color: t.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Current Wedding</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{COUPLE}</div>
                  </div>
                  <ChevronDown size={13} color={t.muted} />
                </button>
                {weddingSwitcherOpen && (
                  <div style={{ position: "absolute", top: "105%", left: 0, right: 0, background: "#FFFFFF", border: `1px solid ${t.border}`, borderRadius: 8, boxShadow: "0 8px 20px rgba(0,0,0,0.12)", zIndex: 40, padding: 6 }}>
                    <div style={{ padding: "7px 8px", fontSize: 12, fontWeight: 600, color: t.activeText, background: t.activeBg, borderRadius: 6 }}>✓ {COUPLE}</div>
                    <div style={{ borderTop: `1px solid ${t.border}`, margin: "6px 0" }} />
                    <div style={{ padding: "7px 8px", fontSize: 11.5, color: t.muted }}>New weddings are created from the Studio Admin Portal.</div>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "2px 6px 18px 6px", borderBottom: `1px solid ${t.border}`, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: t.logoBg, color: t.logoText, fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "Georgia, serif" }}>W</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>White Glove Events</div>
                  <div style={{ fontSize: 9.5, color: t.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>Client Portal</div>
                </div>
                <button onClick={() => setSidebarTheme_(sidebarTheme_ === "light" ? "dark" : "light")} style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${t.border}`, background: "transparent", color: t.muted, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  {sidebarTheme_ === "light" ? "🌙" : "☀️"}
                </button>
              </div>

              <div style={{ display: "flex", gap: 3, background: sidebarTheme_ === "light" ? "#F0EBE1" : "rgba(246,244,239,0.06)", borderRadius: 8, padding: 3, marginBottom: 14 }}>
                {[{ id: "feature", label: "By Feature" }, { id: "event", label: "By Event" }].map((v) => (
                  <button key={v.id} onClick={() => setSidebarView(v.id)} style={{ flex: 1, padding: "6px 4px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 10.5, fontWeight: 700, background: sidebarView === v.id ? t.activeBg : "transparent", color: sidebarView === v.id ? t.activeText : t.muted }}>
                    {v.label}
                  </button>
                ))}
              </div>

              <div style={{ background: sidebarTheme_ === "light" ? "#FFFFFF" : "rgba(246,244,239,0.05)", border: `1px solid ${t.border}`, borderRadius: 10, padding: 12, marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 9, background: t.hover, border: `1px dashed ${t.border}`, color: t.muted, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: "Georgia, serif", fontSize: 12, color: t.activeText, fontWeight: 700 }}>{INITIALS}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: t.text }}>{COUPLE}</div>
                    <div style={{ fontSize: 10.5, color: t.muted }}>{weddingDateLabel}</div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", background: t.activeBg, color: t.activeText, padding: "3px 8px", borderRadius: 100 }}>Planning</span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: t.activeText }}>{daysLeft} days left</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 }}>
                <div style={{ background: sidebarTheme_ === "light" ? "#FFFFFF" : "rgba(246,244,239,0.05)", border: `1px solid ${t.border}`, borderRadius: 8, padding: "7px 9px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "ui-monospace, monospace" }}>{progressPct}%</div>
                  <div style={{ fontSize: 9, color: t.muted, textTransform: "uppercase" }}>Plan Complete</div>
                </div>
                <div style={{ background: sidebarTheme_ === "light" ? "#FFFFFF" : "rgba(246,244,239,0.05)", border: `1px solid ${t.border}`, borderRadius: 8, padding: "7px 9px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "ui-monospace, monospace" }}>{milestones.length - doneCount}</div>
                  <div style={{ fontSize: 9, color: t.muted, textTransform: "uppercase" }}>Milestones Left</div>
                </div>
                <div style={{ background: sidebarTheme_ === "light" ? "#FFFFFF" : "rgba(246,244,239,0.05)", border: `1px solid ${t.border}`, borderRadius: 8, padding: "7px 9px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "ui-monospace, monospace" }}>{dayEvents.length}</div>
                  <div style={{ fontSize: 9, color: t.muted, textTransform: "uppercase" }}>Day-Of Items</div>
                </div>
                <div style={{ background: sidebarTheme_ === "light" ? "#FFFFFF" : "rgba(246,244,239,0.05)", border: `1px solid ${t.border}`, borderRadius: 8, padding: "7px 9px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "ui-monospace, monospace" }}>{weekEvents.length}</div>
                  <div style={{ fontSize: 9, color: t.muted, textTransform: "uppercase" }}>Week Events</div>
                </div>
              </div>

              <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, overflowY: "auto", minHeight: 0 }}>
                {sidebarView === "feature" ? (
                  FEATURE_GROUPS.map((group) => {
                    const isCollapsed = collapsedGroups[group.title];
                    return (
                      <div key={group.title} style={{ marginBottom: 6 }}>
                        <button onClick={() => setCollapsedGroups((c) => ({ ...c, [group.title]: !c[group.title] }))} style={{ display: "flex", alignItems: "center", gap: 5, width: "100%", background: "none", border: "none", cursor: "pointer", padding: "5px 8px", color: t.sectionLabel }}>
                          {isCollapsed ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
                          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>{group.title}</span>
                        </button>
                        {!isCollapsed && group.items.filter((item) => item.finished).map((item) => {
                          const Icon = item.icon;
                          const isActive = location.pathname === "/portal/" + item.id;
                          return (
                            <button key={item.id} onClick={() => { navigate("/portal/" + item.id); setMobileOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px 8px 20px", borderRadius: 7, color: isActive ? t.activeText : t.muted, background: isActive ? t.activeBg : "transparent", fontSize: 12.5, fontWeight: 500, border: "none", cursor: "pointer", textAlign: "left" }}>
                              <Icon size={15} strokeWidth={1.75} />
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })
                ) : (
                  EVENT_NAV.map((ev) => {
                    const isOpen = expandedNavEvents[ev];
                    return (
                      <div key={ev}>
                        <button onClick={() => setExpandedNavEvents((c) => ({ ...c, [ev]: !c[ev] }))} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px", borderRadius: 7, background: "transparent", color: t.text, border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 600, textAlign: "left" }}>
                          {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          <CalendarDays size={14} strokeWidth={1.75} />
                          {ev}
                        </button>
                        {isOpen && (
                          <div style={{ paddingLeft: 22 }}>
                            {EVENT_SUBLINKS.map((sub) => {
                              const SubIcon = sub.icon;
                              return (
                                <button key={sub.id} onClick={() => navigate("/portal/" + sub.id)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "6px 8px", borderRadius: 6, background: "transparent", color: t.muted, border: "none", cursor: "pointer", fontSize: 11.5, textAlign: "left" }}>
                                  <SubIcon size={12} strokeWidth={1.75} />
                                  {sub.label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </nav>

              <div style={{ borderTop: `1px solid ${t.border}`, marginTop: 10, paddingTop: 10, fontSize: 10, color: t.muted, textAlign: "center" }}>
                White Glove Events Client Portal
              </div>
            </>
          );
        })()}
      </aside>

      <main style={{ flex: 1, minWidth: 0, padding: "40px 56px 72px" }}>
        <div style={{ maxWidth: 1920, margin: "0 auto" }}>

          <div style={{ background: "#1D1E1A", borderRadius: 12, padding: "14px 18px", marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#E7D6B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Planner Command Center</div>
            {commandAlerts.length === 0 ? (
              <div style={{ fontSize: 12.5, color: "rgba(246,244,239,0.7)" }}>🟢 No timeline alerts right now — milestones and schedule look clear.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {commandAlerts.map((a, i) => <div key={i} style={{ fontSize: 12.5, color: "rgba(246,244,239,0.85)" }}>{ALERT_DOT[a.level]} {a.text}</div>)}
              </div>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 23, fontWeight: 700, color: "#1D1E1A", letterSpacing: "-0.01em" }}>Timeline</div>
            <div style={{ fontSize: 12, color: "#8A8577", marginTop: 2 }}>Planning milestones, wedding-week agenda, and the day-of run-of-show — all in one place.</div>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <button className={`wg-tab-btn${tab === "planning" ? " active" : ""}`} onClick={() => setTab("planning")}>Planning Timeline ({progressPct}%)</button>
            <button className={`wg-tab-btn${tab === "week" ? " active" : ""}`} onClick={() => setTab("week")}>Wedding Week ({weekEvents.length})</button>
            <button className={`wg-tab-btn${tab === "day" ? " active" : ""}`} onClick={() => setTab("day")}>Wedding Day ({dayEvents.length})</button>
          </div>

          {tab === "planning" && (
            <div className="wg-card">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: "#F0EBE1", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${progressPct}%`, background: "#5F7A5A", borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "#1D1E1A", fontFamily: "ui-monospace,monospace" }}>{doneCount} / {milestones.length}</span>
              </div>

              {milestones.map((m) => {
                const overdue = !m.done && m.dueDate && new Date(m.dueDate) < new Date();
                return (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #E7E2D5" }}>
                    <div
                      onClick={() => toggleMilestone(m.id)}
                      style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${m.done ? "#5F7A5A" : "#E7E2D5"}`, background: m.done ? "#5F7A5A" : "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
                    >
                      {m.done && <Check size={13} color="#fff" strokeWidth={3} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: m.done ? "#8A8577" : "#1D1E1A", textDecoration: m.done ? "line-through" : "none" }}>{m.task}</div>
                      {m.dueDate && <div style={{ fontSize: 10.5, color: overdue ? "#6B2A3A" : "#8A8577", fontWeight: overdue ? 700 : 400 }}>{overdue ? "Overdue — " : "Due "}{m.dueDate}</div>}
                    </div>
                    <button className="wg-icon-btn" onClick={() => removeMilestone(m.id)} title="Remove"><Trash2 size={13} /></button>
                  </div>
                );
              })}

              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <div className="wg-field" style={{ flex: 1 }}>
                  <input placeholder="Add a milestone..." value={newMilestone.task} onChange={(e) => setNewMilestone({ ...newMilestone, task: e.target.value })} style={{ width: "100%", boxSizing: "border-box" }} />
                </div>
                <div className="wg-field">
                  <input type="date" value={newMilestone.dueDate} onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })} />
                </div>
                <button className="wg-primary-btn" onClick={addMilestone}><Plus size={14} /> Add</button>
              </div>
            </div>
          )}

          {tab === "week" && (
            <div className="wg-card">
              {sortedWeekEvents.length === 0 ? (
                <p style={{ fontSize: 12.5, color: "#8A8577", marginBottom: 16 }}>No wedding-week events added yet — build out the day-by-day agenda for the week leading up to {weddingDateLabel}.</p>
              ) : (
                sortedWeekEvents.map((e) => (
                  <div key={e.id} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid #E7E2D5", alignItems: "flex-start" }}>
                    <div style={{ minWidth: 90, fontSize: 12, fontWeight: 700, color: "#B58A4A", fontFamily: "ui-monospace,monospace" }}>
                      {new Date(e.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1D1E1A" }}>{e.title}</div>
                      {e.notes && <div style={{ fontSize: 11.5, color: "#8A8577" }}>{e.notes}</div>}
                    </div>
                    <button className="wg-icon-btn" onClick={() => removeWeekEvent(e.id)} title="Remove"><Trash2 size={13} /></button>
                  </div>
                ))
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                <div className="wg-field"><input type="date" value={newWeekEvent.date} onChange={(e) => setNewWeekEvent({ ...newWeekEvent, date: e.target.value })} /></div>
                <div className="wg-field" style={{ flex: 1, minWidth: 160 }}><input placeholder="Event title (e.g. Mehendi)" value={newWeekEvent.title} onChange={(e) => setNewWeekEvent({ ...newWeekEvent, title: e.target.value })} style={{ width: "100%", boxSizing: "border-box" }} /></div>
                <div className="wg-field" style={{ flex: 1, minWidth: 160 }}><input placeholder="Notes (optional)" value={newWeekEvent.notes} onChange={(e) => setNewWeekEvent({ ...newWeekEvent, notes: e.target.value })} style={{ width: "100%", boxSizing: "border-box" }} /></div>
                <button className="wg-primary-btn" onClick={addWeekEvent}><Plus size={14} /> Add</button>
              </div>
            </div>
          )}

          {tab === "day" && (
            <div className="wg-card">
              {sortedDayEvents.length === 0 ? (
                <p style={{ fontSize: 12.5, color: "#8A8577", marginBottom: 16 }}>No wedding-day schedule built yet — this is your run-of-show: ceremony, reception, and vendor arrival/setup times.</p>
              ) : (
                sortedDayEvents.map((e) => (
                  <div key={e.id} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid #E7E2D5", alignItems: "center" }}>
                    <div style={{ minWidth: 70, display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#B58A4A", fontFamily: "ui-monospace,monospace" }}>
                      <Clock size={12} /> {e.time}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1D1E1A" }}>{e.activity}</div>
                      <div style={{ fontSize: 11.5, color: "#8A8577", display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {e.responsible && <span>{e.responsible}</span>}
                        {e.location && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><MapPin size={10} /> {e.location}</span>}
                      </div>
                    </div>
                    <button className="wg-icon-btn" onClick={() => removeDayEvent(e.id)} title="Remove"><Trash2 size={13} /></button>
                  </div>
                ))
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                <div className="wg-field"><input type="time" value={newDayEvent.time} onChange={(e) => setNewDayEvent({ ...newDayEvent, time: e.target.value })} /></div>
                <div className="wg-field" style={{ flex: 1, minWidth: 160 }}><input placeholder="Activity (e.g. Ceremony begins)" value={newDayEvent.activity} onChange={(e) => setNewDayEvent({ ...newDayEvent, activity: e.target.value })} style={{ width: "100%", boxSizing: "border-box" }} /></div>
                <div className="wg-field" style={{ flex: 1, minWidth: 140 }}><input placeholder="Vendor/responsible party" value={newDayEvent.responsible} onChange={(e) => setNewDayEvent({ ...newDayEvent, responsible: e.target.value })} style={{ width: "100%", boxSizing: "border-box" }} /></div>
                <div className="wg-field" style={{ flex: 1, minWidth: 140 }}><input placeholder="Location" value={newDayEvent.location} onChange={(e) => setNewDayEvent({ ...newDayEvent, location: e.target.value })} style={{ width: "100%", boxSizing: "border-box" }} /></div>
                <button className="wg-primary-btn" onClick={addDayEvent}><Plus size={14} /> Add</button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
