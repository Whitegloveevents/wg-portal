import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home, Wallet, Users, CreditCard, CalendarClock, NotebookPen, ClipboardList,
  Table2, Palette, FolderOpen, PhoneCall, Settings,
  Plus, X, ChevronDown, ChevronRight, CalendarDays, LayoutGrid,
  Check, Trash2, MessageSquare, Paperclip, Upload,
} from "lucide-react";

/* ---------------------------------------------------------
   White Glove Events — Client Portal
   PAGE 5 OF N: Meeting Notes
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

export default function MeetingNotes() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarView, setSidebarView] = useState("feature");
  const [sidebarTheme_, setSidebarTheme_] = useState("light");
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [expandedNavEvents, setExpandedNavEvents] = useState({});
  const [weddingSwitcherOpen, setWeddingSwitcherOpen] = useState(false);

  const [meetings, setMeetings] = useState([]);
  const [tab, setTab] = useState("upcoming"); // 'upcoming' | 'history'
  const [expandedMeetingId, setExpandedMeetingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ date: "", title: "", attendees: "", topics: "", decisions: "", pendingQuestions: "" });
  const [newActionItem, setNewActionItem] = useState({});

  const daysLeft = Math.max(0, Math.ceil((WEDDING_DATE.getTime() - Date.now()) / 86400000));
  const weddingDateLabel = WEDDING_DATE.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const sortedMeetings = useMemo(
    () => [...meetings].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [meetings]
  );
  const upcomingMeetings = useMemo(
    () => meetings.filter((m) => new Date(m.date) >= new Date(new Date().toDateString())).sort((a, b) => new Date(a.date) - new Date(b.date)),
    [meetings]
  );
  const historyMeetings = useMemo(
    () => meetings.filter((m) => new Date(m.date) < new Date(new Date().toDateString())).sort((a, b) => new Date(b.date) - new Date(a.date)),
    [meetings]
  );
  const visibleMeetings = tab === "upcoming" ? upcomingMeetings : historyMeetings;
  const allActionItems = useMemo(
    () => meetings.flatMap((m) => m.actionItems.map((a) => ({ ...a, meetingDate: m.date }))),
    [meetings]
  );
  const openActionItems = allActionItems.filter((a) => !a.done);
  const nextMeeting = useMemo(() => {
    const upcoming = meetings.filter((m) => new Date(m.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date));
    return upcoming[0] || null;
  }, [meetings]);

  const commandAlerts = useMemo(() => {
    const alerts = [];
    openActionItems.forEach((a) => {
      if (!a.dueDate) return;
      const days = Math.ceil((new Date(a.dueDate) - new Date()) / 86400000);
      if (days < 0) alerts.push({ level: "red", text: `Action item overdue: "${a.text}" (${a.responsible || "unassigned"})` });
      else if (days <= 3) alerts.push({ level: "yellow", text: `Action item due in ${days}d: "${a.text}"` });
    });
    return alerts;
  }, [openActionItems]);
  const ALERT_DOT = { red: "🔴", yellow: "🟡", green: "🟢", blue: "🔵" };

  function addMeeting() {
    if (!form.date) return;
    const id = Date.now();
    setMeetings((m) => [...m, { id, ...form, actionItems: [], attachments: [] }]);
    setForm({ date: "", title: "", attendees: "", topics: "", decisions: "", pendingQuestions: "" });
    setShowAddModal(false);
    setExpandedMeetingId(id);
  }
  function uploadAttachment(meetingId, file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setMeetings((ms) => ms.map((m) => (m.id === meetingId ? { ...m, attachments: [...(m.attachments || []), { id: Date.now(), name: file.name, url, type: file.type }] } : m)));
  }
  function removeAttachment(meetingId, attachmentId) {
    setMeetings((ms) => ms.map((m) => (m.id === meetingId ? { ...m, attachments: m.attachments.filter((a) => a.id !== attachmentId) } : m)));
  }
  function removeMeeting(id) {
    setMeetings((m) => m.filter((x) => x.id !== id));
  }
  function addActionItem(meetingId) {
    const draft = newActionItem[meetingId];
    if (!draft || !draft.text?.trim()) return;
    setMeetings((ms) => ms.map((m) => (m.id === meetingId ? { ...m, actionItems: [...m.actionItems, { id: Date.now(), text: draft.text.trim(), responsible: draft.responsible || "", dueDate: draft.dueDate || "", done: false }] } : m)));
    setNewActionItem((n) => ({ ...n, [meetingId]: { text: "", responsible: "", dueDate: "" } }));
  }
  function toggleActionItem(meetingId, itemId) {
    setMeetings((ms) => ms.map((m) => (m.id === meetingId ? { ...m, actionItems: m.actionItems.map((a) => (a.id === itemId ? { ...a, done: !a.done } : a)) } : m)));
  }
  function removeActionItem(meetingId, itemId) {
    setMeetings((ms) => ms.map((m) => (m.id === meetingId ? { ...m, actionItems: m.actionItems.filter((a) => a.id !== itemId) } : m)));
  }

  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100vh", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif", background: "#F6F4EF", color: "#26261F" }}>
      <style>{`
        .wg-card { background:#FFFFFF; border:1px solid #E7E2D5; border-top:3px solid #B58A4A; border-radius:14px; padding:18px 20px; margin-bottom:14px; }
        .wg-primary-btn { display:flex; align-items:center; gap:7px; background:#B58A4A; color:#1D1E1A; border:none; border-radius:9px; padding:9px 15px; font-size:12.5px; font-weight:700; cursor:pointer; }
        .wg-primary-btn:hover { background:#a37b40; }
        .wg-tab-btn { padding:8px 16px; border-radius:8px; border:1px solid #E7E2D5; background:#FFFFFF; font-size:12px; font-weight:700; color:#8A8577; cursor:pointer; }
        .wg-tab-btn.active { background:#F4EDE0; border-color:#E7D6B8; color:#B58A4A; }
        .wg-secondary-btn { display:flex; align-items:center; gap:6px; background:#FBFAF6; border:1px solid #E7E2D5; border-radius:8px; padding:6px 11px; font-size:11.5px; font-weight:600; color:#26261F; cursor:pointer; }
        .wg-secondary-btn:hover { border-color:#B58A4A; color:#B58A4A; }
        .wg-secondary-btn { display:flex; align-items:center; gap:7px; background:#FFFFFF; border:1px solid #E7E2D5; border-radius:9px; padding:8px 13px; font-size:12px; font-weight:600; color:#26261F; cursor:pointer; }
        .wg-field { margin-bottom:12px; }
        .wg-field label { display:block; font-size:11px; font-weight:600; color:#8A8577; margin-bottom:5px; text-transform:uppercase; letter-spacing:0.04em; }
        .wg-field input, .wg-field textarea { width:100%; border:1px solid #E7E2D5; border-radius:8px; padding:8px 10px; font-size:12.5px; outline:none; box-sizing:border-box; font-family:inherit; }
        .wg-icon-btn { width:26px; height:26px; border-radius:7px; background:#FBFAF6; border:1px solid #E7E2D5; color:#8A8577; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; }
        .wg-icon-btn:hover { color:#6B2A3A; border-color:#6B2A3A; }
        .wg-modal-overlay { position:fixed; inset:0; background:rgba(29,30,26,0.55); display:flex; align-items:center; justify-content:center; z-index:50; padding:20px; }
        .wg-modal { background:#FFFFFF; border-radius:16px; width:100%; max-width:460px; max-height:88vh; overflow-y:auto; padding:22px 24px; }
        .wg-modal-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
        .wg-modal-title { font-size:15px; font-weight:700; color:#1D1E1A; }
        .wg-modal-close { background:none; border:none; color:#8A8577; cursor:pointer; }
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
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "ui-monospace, monospace" }}>{meetings.length}</div>
                  <div style={{ fontSize: 9, color: t.muted, textTransform: "uppercase" }}>Meetings Logged</div>
                </div>
                <div style={{ background: sidebarTheme_ === "light" ? "#FFFFFF" : "rgba(246,244,239,0.05)", border: `1px solid ${openActionItems.length > 0 ? "#B58A4A" : t.border}`, borderRadius: 8, padding: "7px 9px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "ui-monospace, monospace" }}>{openActionItems.length}</div>
                  <div style={{ fontSize: 9, color: t.muted, textTransform: "uppercase" }}>Open Action Items</div>
                </div>
                <div style={{ gridColumn: "span 2", background: sidebarTheme_ === "light" ? "#FFFFFF" : "rgba(246,244,239,0.05)", border: `1px solid ${t.border}`, borderRadius: 8, padding: "7px 9px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{nextMeeting ? nextMeeting.date : "Not scheduled"}</div>
                  <div style={{ fontSize: 9, color: t.muted, textTransform: "uppercase" }}>Next Meeting</div>
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
              <div style={{ fontSize: 12.5, color: "rgba(246,244,239,0.7)" }}>🟢 No action-item alerts right now.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {commandAlerts.map((a, i) => <div key={i} style={{ fontSize: 12.5, color: "rgba(246,244,239,0.85)" }}>{ALERT_DOT[a.level]} {a.text}</div>)}
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 23, fontWeight: 700, color: "#1D1E1A", letterSpacing: "-0.01em" }}>Meeting Notes</div>
              <div style={{ fontSize: 12, color: "#8A8577", marginTop: 2 }}>Every meeting, decision, and follow-up in one running log.</div>
            </div>
            <button className="wg-primary-btn" onClick={() => setShowAddModal(true)}><Plus size={14} /> Log a Meeting</button>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <button className={`wg-tab-btn${tab === "upcoming" ? " active" : ""}`} onClick={() => setTab("upcoming")}>Upcoming Meetings ({upcomingMeetings.length})</button>
            <button className={`wg-tab-btn${tab === "history" ? " active" : ""}`} onClick={() => setTab("history")}>Meeting History ({historyMeetings.length})</button>
          </div>

          {visibleMeetings.length === 0 ? (
            <div className="wg-card" style={{ textAlign: "center", padding: "50px 24px", border: "1.5px dashed #E7E2D5", borderTop: "1.5px dashed #E7E2D5" }}>
              <MessageSquare size={22} color="#8A8577" style={{ marginBottom: 10 }} />
              <p style={{ fontSize: 12.5, color: "#8A8577", marginBottom: 14 }}>
                {meetings.length === 0 ? "No meetings logged yet — start with your first planning call." : tab === "upcoming" ? "No upcoming meetings scheduled." : "No past meetings on file yet."}
              </p>
              <button className="wg-primary-btn" style={{ margin: "0 auto" }} onClick={() => setShowAddModal(true)}><Plus size={14} /> Log a Meeting</button>
            </div>
          ) : (
            visibleMeetings.map((m) => {
              const isOpen = expandedMeetingId === m.id;
              const draft = newActionItem[m.id] || { text: "", responsible: "", dueDate: "" };
              return (
                <div className="wg-card" key={m.id}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} onClick={() => setExpandedMeetingId(isOpen ? null : m.id)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#1D1E1A" }}>{m.title || "Untitled Meeting"}</div>
                        <div style={{ fontSize: 11, color: "#B58A4A", fontWeight: 600, marginBottom: 2 }}>{m.date}{m.attendees && ` · ${m.attendees}`}</div>
                        <div style={{ fontSize: 11.5, color: "#8A8577" }}>{m.topics ? m.topics.slice(0, 70) + (m.topics.length > 70 ? "…" : "") : "No topics recorded"}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {m.actionItems.length > 0 && (
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: "#B58A4A", background: "#F4EDE0", padding: "3px 9px", borderRadius: 100 }}>
                          {m.actionItems.filter((a) => !a.done).length}/{m.actionItems.length} open
                        </span>
                      )}
                      <button className="wg-icon-btn" onClick={(e) => { e.stopPropagation(); removeMeeting(m.id); }} title="Delete meeting"><Trash2 size={13} /></button>
                    </div>
                  </div>

                  {isOpen && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #E7E2D5" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                        <div style={{ gridColumn: "span 2" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#8A8577", textTransform: "uppercase", marginBottom: 5 }}>Attendees</div>
                          <p style={{ fontSize: 12.5, color: "#26261F" }}>{m.attendees || "—"}</p>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#8A8577", textTransform: "uppercase", marginBottom: 5 }}>Topics Discussed</div>
                          <p style={{ fontSize: 12.5, color: "#26261F", whiteSpace: "pre-wrap" }}>{m.topics || "—"}</p>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#8A8577", textTransform: "uppercase", marginBottom: 5 }}>Decisions Made</div>
                          <p style={{ fontSize: 12.5, color: "#26261F", whiteSpace: "pre-wrap" }}>{m.decisions || "—"}</p>
                        </div>
                        <div style={{ gridColumn: "span 2" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#8A8577", textTransform: "uppercase", marginBottom: 5 }}>Pending Questions</div>
                          <p style={{ fontSize: 12.5, color: "#26261F", whiteSpace: "pre-wrap" }}>{m.pendingQuestions || "—"}</p>
                        </div>
                      </div>

                      <div style={{ fontSize: 11, fontWeight: 700, color: "#8A8577", textTransform: "uppercase", marginBottom: 8 }}>Action Items</div>
                      {m.actionItems.map((a) => {
                        const overdue = !a.done && a.dueDate && new Date(a.dueDate) < new Date();
                        return (
                          <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid #E7E2D5" }}>
                            <div onClick={() => toggleActionItem(m.id, a.id)} style={{ width: 17, height: 17, borderRadius: 5, border: `1.5px solid ${a.done ? "#5F7A5A" : "#E7E2D5"}`, background: a.done ? "#5F7A5A" : "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                              {a.done && <Check size={11} color="#fff" strokeWidth={3} />}
                            </div>
                            <div style={{ flex: 1 }}>
                              <span style={{ fontSize: 12.5, color: a.done ? "#8A8577" : "#1D1E1A", textDecoration: a.done ? "line-through" : "none" }}>{a.text}</span>
                              <span style={{ fontSize: 11, color: overdue ? "#6B2A3A" : "#8A8577", marginLeft: 8, fontWeight: overdue ? 700 : 400 }}>
                                {a.responsible && `· ${a.responsible}`} {a.dueDate && `· ${overdue ? "Overdue " : "Due "}${a.dueDate}`}
                              </span>
                            </div>
                            <button className="wg-icon-btn" onClick={() => removeActionItem(m.id, a.id)}><Trash2 size={12} /></button>
                          </div>
                        );
                      })}
                      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                        <input placeholder="New action item..." value={draft.text} onChange={(e) => setNewActionItem((n) => ({ ...n, [m.id]: { ...draft, text: e.target.value } }))} style={{ flex: 1, minWidth: 140, border: "1px solid #E7E2D5", borderRadius: 8, padding: "7px 10px", fontSize: 12 }} />
                        <input placeholder="Responsible" value={draft.responsible} onChange={(e) => setNewActionItem((n) => ({ ...n, [m.id]: { ...draft, responsible: e.target.value } }))} style={{ width: 130, border: "1px solid #E7E2D5", borderRadius: 8, padding: "7px 10px", fontSize: 12 }} />
                        <input type="date" value={draft.dueDate} onChange={(e) => setNewActionItem((n) => ({ ...n, [m.id]: { ...draft, dueDate: e.target.value } }))} style={{ border: "1px solid #E7E2D5", borderRadius: 8, padding: "7px 10px", fontSize: 12 }} />
                        <button className="wg-secondary-btn" onClick={() => addActionItem(m.id)}><Plus size={13} /> Add</button>
                      </div>

                      <div style={{ fontSize: 11, fontWeight: 700, color: "#8A8577", textTransform: "uppercase", marginTop: 18, marginBottom: 8 }}>Attachments</div>
                      {(m.attachments || []).length === 0 ? (
                        <p style={{ fontSize: 11.5, color: "#8A8577", marginBottom: 8 }}>No files attached to this meeting yet.</p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
                          {m.attachments.map((a) => (
                            <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, padding: "4px 0" }}>
                              <a href={a.url} download={a.name} style={{ display: "flex", alignItems: "center", gap: 6, color: "#B58A4A", fontWeight: 600 }}>
                                <Paperclip size={12} /> {a.name}
                              </a>
                              <button className="wg-icon-btn" onClick={() => removeAttachment(m.id, a.id)}><Trash2 size={11} /></button>
                            </div>
                          ))}
                        </div>
                      )}
                      <label className="wg-secondary-btn" style={{ cursor: "pointer", display: "inline-flex" }}>
                        <Upload size={13} /> Attach a File
                        <input type="file" style={{ display: "none" }} onChange={(e) => uploadAttachment(m.id, e.target.files?.[0])} />
                      </label>
                    </div>
                  )}
                </div>
              );
            })
          )}

        </div>
      </main>

      {showAddModal && (
        <div className="wg-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="wg-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wg-modal-head">
              <span className="wg-modal-title">Log a Meeting</span>
              <button className="wg-modal-close" onClick={() => setShowAddModal(false)}><X size={16} /></button>
            </div>
            <div className="wg-field"><label>Meeting Date</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div className="wg-field"><label>Title</label><input placeholder="e.g. Vendor Walkthrough Call" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="wg-field"><label>Attendees</label><input placeholder="e.g. Shrestha, Nishanth, Planner" value={form.attendees} onChange={(e) => setForm({ ...form, attendees: e.target.value })} /></div>
            <div className="wg-field"><label>Topics Discussed</label><textarea rows={3} value={form.topics} onChange={(e) => setForm({ ...form, topics: e.target.value })} /></div>
            <div className="wg-field"><label>Decisions Made</label><textarea rows={3} value={form.decisions} onChange={(e) => setForm({ ...form, decisions: e.target.value })} /></div>
            <div className="wg-field"><label>Pending Questions</label><textarea rows={2} value={form.pendingQuestions} onChange={(e) => setForm({ ...form, pendingQuestions: e.target.value })} /></div>
            <button className="wg-primary-btn" style={{ width: "100%", justifyContent: "center" }} onClick={addMeeting}>Save Meeting</button>
          </div>
        </div>
      )}
    </div>
  );
}
