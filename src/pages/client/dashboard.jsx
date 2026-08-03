import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Wallet,
  Users,
  CreditCard,
  CalendarClock,
  NotebookPen,
  ClipboardList,
  Table2,
  Palette,
  FolderOpen,
  PhoneCall,
  Settings,
  Search,
  Bell,
  Menu,
  CalendarDays,
  Upload,
  Phone,
  Megaphone,
  CheckSquare,
  Sun,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ---------------------------------------------------------
   White Glove Events — Client Portal
   PAGE 1 OF N: Dashboard, redesigned per design-system.md
   Couple: Shrestha & Nishanth   Wedding: August 22, 2026
--------------------------------------------------------- */

const WEDDING_DATE = new Date("2026-08-22T16:00:00");
const COUPLE = "Shrestha & Nishanth";
const INITIALS = "S&N";
const TODAY_LABEL = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" });

const COLORS = {
  champagne: "#B58A4A",
  champagneSoft: "#E7D6B8",
  sage: "#5F7A5A",
  bordeaux: "#6B2A3A",
  stone: "#8A8577",
  line: "#E7E2D5",
};

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

const QUICK_ACTIONS = [
  { id: "meeting", label: "Schedule Meeting", icon: CalendarDays, to: "/portal/meetings" },
  { id: "upload", label: "Upload Document", icon: Upload, to: "/portal/documents" },
  { id: "contact", label: "Contact Planner", icon: Phone, to: "/portal/contacts" },
  { id: "timeline", label: "View Timeline", icon: CalendarClock, to: "/portal/timeline" },
  { id: "payment", label: "Make Payment", icon: CreditCard, to: "/portal/budget" },
];

const TODO_ITEMS = [
  "Choose first dance song",
  "Finalize guest list",
  "Approve menu selections",
  "Upload family photos",
];

const PIE_DATA = [{ name: "No data yet", value: 1 }];
const BAR_DATA = [
  { name: "Budget", amount: 0 },
  { name: "Actual", amount: 0 },
];

// Wedding Health uses real status colors. "Not Started" is a genuine 4th
// state — a brand-new wedding with no data yet isn't accurately "On Track"
// (nothing's confirmed) or "Behind Schedule" (nothing's overdue either).
const HEALTH_STATUS = {
  onTrack: { label: "On Track", color: "#5F7A5A", dot: "🟢" },
  needsAttention: { label: "Needs Attention", color: "#B58A4A", dot: "🟡" },
  behindSchedule: { label: "Behind Schedule", color: "#6B2A3A", dot: "🔴" },
  notStarted: { label: "Not Started Yet", color: "#8A8577", dot: "⚪" },
};
const CURRENT_HEALTH = HEALTH_STATUS.notStarted;

function useCountdown(target) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);
  const diffMs = target.getTime() - now.getTime();
  const totalMinutes = Math.max(0, Math.floor(diffMs / 60000));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  return { days, hours, isPast: diffMs < 0 };
}

function Card({ title, icon: Icon, children }) {
  return (
    <div className="wg-card">
      <div className="wg-card-head">
        {Icon && (
          <div className="wg-card-icon">
            <Icon size={16} strokeWidth={1.75} />
          </div>
        )}
        <h3>{title}</h3>
      </div>
      <div className="wg-card-body">{children}</div>
    </div>
  );
}

function EmptyState({ text, cta, onClick }) {
  return (
    <div className="wg-empty">
      <p>{text}</p>
      {cta && <span className="wg-empty-cta" onClick={onClick} style={onClick ? { cursor: "pointer" } : undefined}>{cta}</span>}
    </div>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  return <div className="wg-tooltip">No data yet</div>;
}

export default function Dashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [checked, setChecked] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarView, setSidebarView] = useState("feature");
  const [sidebarTheme_, setSidebarTheme_] = useState("light");
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [expandedNavEvents, setExpandedNavEvents] = useState({});
  const [weddingSwitcherOpen, setWeddingSwitcherOpen] = useState(false);
  const { days, hours, isPast } = useCountdown(WEDDING_DATE);

  const weddingDateLabel = useMemo(
    () =>
      WEDDING_DATE.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    []
  );

  // Honest status line — reflects actual data on file rather than assuming
  // everything is fine before anything has been entered.
  const statusMessage = `${CURRENT_HEALTH.dot} ${CURRENT_HEALTH.label} — you're just getting started, here's where things stand today.`;

  return (
    <div className="wg-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

        .wg-root {
          --ink: #1D1E1A;
          --paper: #F6F4EF;
          --surface: #FFFFFF;
          --line: #E7E2D5;
          --champagne: #B58A4A;
          --champagne-soft: #E7D6B8;
          --champagne-wash: #F4EDE0;
          --sage: #5F7A5A;
          --sage-wash: #E7EDE4;
          --bordeaux: #6B2A3A;
          --bordeaux-wash: #F3E6E8;
          --stone: #8A8577;
          --text: #26261F;

          font-family: 'Inter', sans-serif;
          background: var(--paper);
          color: var(--text);
          min-height: 100vh;
          display: flex;
          width: 100%;
        }
        .wg-root * { box-sizing: border-box; }

        /* Sidebar */
        /* Sidebar now uses inline styles for reliability (see aside element) */

        .wg-mobile-bar { display: none; align-items: center; justify-content: space-between; padding: 13px 16px; background: var(--ink); color: var(--paper); position: sticky; top: 0; z-index: 20; }
        .wg-mobile-bar button { background: transparent; border: none; color: var(--paper); cursor: pointer; display: flex; }
        .wg-mobile-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 29; }

        .wg-main { flex: 1; min-width: 0; padding: 40px 56px 72px; }
        .wg-main-inner { max-width: 1920px; margin: 0 auto; }
        .wg-utilitybar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .wg-page-title { font-size: 23px; font-weight: 700; color: var(--ink); letter-spacing: -0.01em; }
        .wg-utility-icons { display: flex; align-items: center; gap: 12px; }
        .wg-utility-icon-btn { width: 32px; height: 32px; border-radius: 9px; background: var(--surface); border: 1px solid var(--line); display: flex; align-items: center; justify-content: center; color: var(--stone); cursor: pointer; }

        /* Welcome banner */
        .wg-welcome-banner { display: flex; align-items: center; gap: 16px; background: var(--ink); border-radius: 14px; padding: 16px 24px; margin-bottom: 16px; }
        .wg-welcome-photo { width: 56px; height: 56px; border-radius: 12px; background: rgba(231,214,184,0.12); border: 1px solid rgba(231,214,184,0.25); color: var(--champagne-soft); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-family: 'Fraunces', serif; font-size: 15px; }
        .wg-welcome-text { flex: 1; }
        .wg-welcome-greeting { font-size: 17px; font-weight: 700; color: var(--paper); margin-bottom: 4px; }
        .wg-welcome-countdown { font-size: 13px; color: var(--champagne-soft); margin-bottom: 2px; }
        .wg-welcome-status { font-size: 12.5px; color: rgba(246,244,239,0.65); }

        /* Today's Focus */
        .wg-focus { display: flex; align-items: center; gap: 12px; background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 13px 18px; margin-bottom: 16px; }
        .wg-focus-icon { width: 30px; height: 30px; border-radius: 8px; background: var(--champagne-wash); color: var(--champagne); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .wg-focus-title { font-size: 12px; font-weight: 700; color: var(--champagne); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 2px; }
        .wg-focus-text { font-size: 12.5px; color: var(--stone); }
        .wg-focus-list { list-style: none; margin: 2px 0 0; padding: 0; }
        .wg-focus-list li { font-size: 12.5px; color: var(--text); padding: 2px 0; }
        .wg-focus-list li::before { content: "• "; color: var(--champagne); font-weight: 700; }
        .wg-focus-empty { color: var(--stone) !important; }
        .wg-focus-empty::before { content: "" !important; }

        /* KPI strip */
        .wg-kpi-strip { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 20px; }
        .wg-kpi { background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 13px 15px; display: flex; flex-direction: column; gap: 6px; }
        .wg-kpi-top { display: flex; align-items: center; gap: 6px; }
        .wg-kpi-dot { width: 8px; height: 8px; border-radius: 100px; background: var(--stone); flex-shrink: 0; }
        .wg-kpi-label { font-size: 10px; color: var(--stone); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
        .wg-kpi-value { font-family: 'IBM Plex Mono', monospace; font-size: 16px; color: var(--ink); font-weight: 500; }
        .wg-kpi-sub { font-size: 10px; color: var(--stone); }

        /* Quick actions */
        .wg-quick-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 18px; }
        .wg-qa-btn { display: flex; align-items: center; gap: 8px; padding: 9px 14px; border-radius: 10px; background: var(--surface); border: 1px solid var(--line); font-size: 12px; font-weight: 600; color: var(--ink); cursor: pointer; }
        .wg-qa-btn:hover { border-color: var(--champagne); background: var(--champagne-wash); }
        .wg-primary-btn-sm { width: 100%; background: var(--champagne); color: var(--ink); border: none; border-radius: 8px; padding: 8px 10px; font-size: 12px; font-weight: 700; cursor: pointer; margin-top: 4px; }
        .wg-primary-btn-sm:hover { background: #a37b40; }
        .wg-qa-icon { width: 24px; height: 24px; border-radius: 7px; background: var(--champagne-wash); color: var(--champagne); display: flex; align-items: center; justify-content: center; }

        .wg-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 22px; }

        .wg-card { background: var(--surface); border: 1px solid var(--line); border-top: 3px solid var(--champagne); border-radius: 14px; padding: 18px 20px; display: flex; flex-direction: column; min-width: 0; }
        .wg-card-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
        .wg-card-icon { width: 24px; height: 24px; border-radius: 7px; background: var(--paper); color: var(--stone); display: flex; align-items: center; justify-content: center; }
        .wg-card-head h3 { font-size: 12px; font-weight: 600; color: var(--ink); }
        .wg-card-body { flex: 1; }

        .wg-empty p { font-size: 11.5px; color: var(--stone); margin-bottom: 4px; }
        .wg-empty-cta { font-size: 11px; color: var(--champagne); font-weight: 600; cursor: pointer; }

        .wg-chart-caption { font-size: 10.5px; color: var(--stone); text-align: center; margin-top: 4px; }
        .wg-tooltip { background: var(--surface); border: 1px solid var(--line); border-radius: 8px; padding: 5px 9px; font-size: 11px; color: var(--text); }

        /* Vendor status (3-state) */
        .wg-vendor-counts { display: flex; gap: 14px; margin-bottom: 10px; }
        .wg-vendor-stat { display: flex; flex-direction: column; align-items: flex-start; gap: 3px; }
        .wg-vendor-num { font-family: 'IBM Plex Mono', monospace; font-size: 18px; color: var(--ink); }
        .wg-vendor-tag { display: flex; align-items: center; gap: 5px; font-size: 10px; color: var(--stone); text-transform: uppercase; letter-spacing: 0.04em; }
        .wg-vendor-dot { width: 6px; height: 6px; border-radius: 100px; }

        /* Timeline progress */
        .wg-progress-line { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
        .wg-progress-track { flex: 1; height: 6px; border-radius: 4px; background: var(--paper); overflow: hidden; }
        .wg-progress-fill { height: 100%; background: var(--sage); width: 0%; }
        .wg-progress-pct { font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: var(--ink); }

        /* Planner updates */
        .wg-update-date { font-size: 10px; font-weight: 700; color: var(--champagne); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
        .wg-update-item { display: flex; gap: 9px; }
        .wg-update-dot { width: 6px; height: 6px; border-radius: 100px; background: var(--champagne); margin-top: 5px; flex-shrink: 0; }
        .wg-update-text { font-size: 11.5px; color: var(--ink); line-height: 1.5; }

        /* Client action items */
        .wg-todo-list { display: flex; flex-direction: column; gap: 2px; }
        .wg-todo-item { display: flex; align-items: center; gap: 9px; padding: 6px 0; border-bottom: 1px solid var(--line); }
        .wg-todo-item:last-child { border-bottom: none; }
        .wg-todo-check { width: 16px; height: 16px; border-radius: 5px; border: 1.5px solid var(--line); flex-shrink: 0; cursor: pointer; display: flex; align-items: center; justify-content: center; background: var(--surface); }
        .wg-todo-check.done { background: var(--sage); border-color: var(--sage); color: #fff; }
        .wg-todo-label { font-size: 12px; color: var(--ink); }
        .wg-todo-label.done { color: var(--stone); text-decoration: line-through; }

        @media (min-width: 1800px) {
          .wg-main { padding: 40px 64px 72px; }
        }
        @media (max-width: 1150px) {
          .wg-row { grid-template-columns: repeat(2, 1fr); }
          .wg-kpi-strip { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 720px) {
          .wg-mobile-bar { display: flex; }
          .wg-mobile-overlay.open { display: block; }
          .wg-main { padding: 18px 14px 48px; }
          .wg-row { grid-template-columns: 1fr; }
          .wg-kpi-strip { grid-template-columns: repeat(2, 1fr); }
          .wg-quick-actions { overflow-x: auto; flex-wrap: nowrap; }
          .wg-focus { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="wg-mobile-bar">
        <button aria-label="Open menu" onClick={() => setMobileOpen(true)}>
          <Menu size={22} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#E7D6B8" }}>White Glove Events</span>
        <span style={{ width: 22 }} />
      </div>
      <div className={`wg-mobile-overlay${mobileOpen ? " open" : ""}`} onClick={() => setMobileOpen(false)} />

      <aside
        style={{
          width: 296, flexShrink: 0, background: sidebarTheme(sidebarTheme_).bg, color: sidebarTheme(sidebarTheme_).text,
          display: "flex", flexDirection: "column", padding: "20px 12px", position: "sticky", top: 0, height: "100vh",
          boxSizing: "border-box", overflow: "hidden",
          borderRight: sidebarTheme_ === "light" ? `1px solid ${sidebarTheme(sidebarTheme_).border}` : "none",
        }}
      >
        {(() => {
          const t = sidebarTheme(sidebarTheme_);
          return (
            <>
              {/* Wedding switcher */}
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

              {/* Logo row */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "2px 6px 18px 6px", borderBottom: `1px solid ${t.border}`, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: t.logoBg, color: t.logoText, fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "Georgia, serif" }}>W</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>White Glove Events</div>
                  <div style={{ fontSize: 9.5, color: t.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>Client Portal</div>
                </div>
                <button onClick={() => setSidebarTheme_(sidebarTheme_ === "light" ? "dark" : "light")} title="Toggle theme" style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${t.border}`, background: "transparent", color: t.muted, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  {sidebarTheme_ === "light" ? "🌙" : "☀️"}
                </button>
              </div>

              {/* View toggle */}
              <div style={{ display: "flex", gap: 3, background: sidebarTheme_ === "light" ? "#F0EBE1" : "rgba(246,244,239,0.06)", borderRadius: 8, padding: 3, marginBottom: 14 }}>
                {[{ id: "feature", label: "By Feature" }, { id: "event", label: "By Event" }].map((v) => (
                  <button key={v.id} onClick={() => setSidebarView(v.id)} style={{ flex: 1, padding: "6px 4px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 10.5, fontWeight: 700, background: sidebarView === v.id ? t.activeBg : "transparent", color: sidebarView === v.id ? t.activeText : t.muted }}>
                    {v.label}
                  </button>
                ))}
              </div>

              {/* Wedding card */}
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
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: t.activeText }}>{isPast ? "Today!" : `${days} days left`}</span>
                </div>
              </div>

              {/* Quick stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 }}>
                {[
                  { label: "Days Left", value: isPast ? 0 : days },
                  { label: "Budget Used", value: "0%" },
                  { label: "Vendors", value: "0 / 0" },
                  { label: "Tasks", value: Object.values(checked).filter((v) => !v).length + Object.keys(checked).length === 0 ? 4 : Object.values(checked).filter((v) => !v).length },
                ].map((s) => (
                  <div key={s.label} style={{ background: sidebarTheme_ === "light" ? "#FFFFFF" : "rgba(246,244,239,0.05)", border: `1px solid ${t.border}`, borderRadius: 8, padding: "7px 9px" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "ui-monospace, monospace" }}>{s.value}</div>
                    <div style={{ fontSize: 9, color: t.muted, textTransform: "uppercase", letterSpacing: "0.03em" }}>{s.label}</div>
                  </div>
                ))}
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
                            <button
                              key={item.id}
                              onClick={() => { navigate("/portal/" + item.id); setMobileOpen(false); }}
                              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px 8px 20px", borderRadius: 7, color: isActive ? t.activeText : t.muted, background: isActive ? t.activeBg : "transparent", fontSize: 12.5, fontWeight: 500, border: "none", cursor: "pointer", textAlign: "left" }}
                            >
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
                                <button
                                  key={sub.id}
                                  onClick={() => navigate("/portal/" + sub.id)}
                                  style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "6px 8px", borderRadius: 6, background: "transparent", color: t.muted, border: "none", cursor: "pointer", fontSize: 11.5, textAlign: "left" }}
                                >
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

      <main className="wg-main">
        <div className="wg-main-inner">
        <div className="wg-utilitybar">
          <div className="wg-page-title">Dashboard</div>
          <div className="wg-utility-icons">
            <div className="wg-utility-icon-btn"><Search size={15} strokeWidth={1.75} /></div>
            <div className="wg-utility-icon-btn"><Bell size={15} strokeWidth={1.75} /></div>
            <div className="wg-utility-icon-btn"><Settings size={15} strokeWidth={1.75} /></div>
          </div>
        </div>

        {/* Welcome banner */}
        <div className="wg-welcome-banner">
          <div className="wg-welcome-photo">{INITIALS}</div>
          <div className="wg-welcome-text">
            <div className="wg-welcome-greeting">Welcome back, {COUPLE} ❤️</div>
            <div className="wg-welcome-countdown">
              {isPast ? "Today is the big day!" : `${days} days until your wedding.`}
            </div>
            <div className="wg-welcome-status">{statusMessage}</div>
          </div>
        </div>

        {/* Today's Focus */}
        <div className="wg-focus">
          <div className="wg-focus-icon"><Sun size={15} strokeWidth={1.9} /></div>
          <div style={{ flex: 1 }}>
            <div className="wg-focus-title">Today's Focus</div>
            <ul className="wg-focus-list">
              <li className="wg-focus-empty">Nothing flagged for today yet — your planner will list what matters most here each day.</li>
            </ul>
          </div>
        </div>

        {/* KPI strip */}
        <div className="wg-kpi-strip">
          <button className="wg-kpi" onClick={() => navigate("/portal/budget")} style={{ textAlign: "left", cursor: "pointer" }} title="Open Budget">
            <div className="wg-kpi-top"><span className="wg-kpi-dot" style={{ background: CURRENT_HEALTH.color }} /><span className="wg-kpi-label">Wedding Health</span></div>
            <div className="wg-kpi-value" style={{ fontSize: 13, color: CURRENT_HEALTH.color }}>{CURRENT_HEALTH.dot} {CURRENT_HEALTH.label}</div>
            <div className="wg-kpi-sub">Updates automatically as data is added</div>
          </button>
          <button className="wg-kpi" onClick={() => navigate("/portal/budget")} style={{ textAlign: "left", cursor: "pointer" }} title="Open Budget">
            <div className="wg-kpi-top"><Wallet size={12} color="#8A8577" /><span className="wg-kpi-label">Budget Used</span></div>
            <div className="wg-kpi-value">$0</div>
            <div className="wg-kpi-sub">Remaining: $0 · Next payment: none</div>
          </button>
          <button className="wg-kpi" onClick={() => navigate("/portal/vendors")} style={{ textAlign: "left", cursor: "pointer" }} title="Open Vendors">
            <div className="wg-kpi-top"><Users size={12} color="#8A8577" /><span className="wg-kpi-label">Vendors Booked</span></div>
            <div className="wg-kpi-value">0 / 0</div>
            <div className="wg-kpi-sub">0 pending · 0 waiting on contract</div>
          </button>
          <button className="wg-kpi" onClick={() => document.getElementById("client-action-items")?.scrollIntoView({ behavior: "smooth", block: "center" })} style={{ textAlign: "left", cursor: "pointer" }} title="Jump to Client Action Items">
            <div className="wg-kpi-top"><CheckSquare size={12} color="#8A8577" /><span className="wg-kpi-label">Tasks</span></div>
            <div className="wg-kpi-value">{Object.keys(checked).length - Object.values(checked).filter(Boolean).length}</div>
            <div className="wg-kpi-sub">Due today · 0 this week</div>
          </button>
          <button className="wg-kpi" onClick={() => navigate("/portal/meetings")} style={{ textAlign: "left", cursor: "pointer" }} title="Open Meeting Notes">
            <div className="wg-kpi-top"><CalendarClock size={12} color="#8A8577" /><span className="wg-kpi-label">Next Meeting</span></div>
            <div className="wg-kpi-value" style={{ fontSize: 13 }}>Not scheduled</div>
            <div className="wg-kpi-sub">Use Quick Actions to add one</div>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="wg-quick-actions">
          {QUICK_ACTIONS.map((qa) => {
            const Icon = qa.icon;
            return (
              <button
                key={qa.id}
                className="wg-qa-btn"
                onClick={() => qa.to && navigate(qa.to)}
                disabled={!qa.to}
                title={qa.to ? undefined : "Documents module isn't built yet"}
                style={!qa.to ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
              >
                <span className="wg-qa-icon"><Icon size={13} strokeWidth={1.9} /></span>
                {qa.label}
              </button>
            );
          })}
        </div>

        {/* Home page essentials */}
        <div className="wg-row">
          <Card title="Next Meeting" icon={CalendarClock}>
            <EmptyState text="No meeting scheduled yet." cta="Schedule one →" onClick={() => navigate("/portal/meetings")} />
          </Card>

          <Card title="Upcoming Payment" icon={CreditCard}>
            <EmptyState text="No payments due in the next 30 days." cta="Open Budget →" onClick={() => navigate("/portal/budget")} />
          </Card>

          <Card title="Timeline" icon={CalendarClock}>
            <div className="wg-progress-line">
              <div className="wg-progress-track"><div className="wg-progress-fill" style={{ width: "0%" }} /></div>
              <span className="wg-progress-pct">0%</span>
            </div>
            <button className="wg-primary-btn-sm" onClick={() => navigate("/portal/timeline")}>View Timeline →</button>
          </Card>

          <Card title="Documents to Sign" icon={FolderOpen}>
            <EmptyState text="No documents pending signature right now." cta="Open Documents →" onClick={() => navigate("/portal/documents")} />
          </Card>
        </div>

        <div className="wg-row">
          <div style={{ gridColumn: "span 2" }}>
          <Card title="Planner Messages" icon={Megaphone}>
            <div className="wg-update-date">{TODAY_LABEL}</div>
            <div className="wg-update-item">
              <span className="wg-update-dot" />
              <span className="wg-update-text">
                Welcome to your portal, {COUPLE}! Updates will appear here as your planner confirms vendors,
                uploads documents, and adjusts the timeline.
              </span>
            </div>
          </Card>
          </div>

          <div id="client-action-items" style={{ gridColumn: "span 2" }}>
          <Card title="Today's Tasks" icon={CheckSquare}>
            <div className="wg-todo-list">
              {TODO_ITEMS.map((item) => {
                const isDone = !!checked[item];
                return (
                  <div className="wg-todo-item" key={item}>
                    <div
                      className={`wg-todo-check${isDone ? " done" : ""}`}
                      onClick={() => setChecked((c) => ({ ...c, [item]: !c[item] }))}
                    >
                      {isDone && <CheckSquare size={10} strokeWidth={2.5} />}
                    </div>
                    <span className={`wg-todo-label${isDone ? " done" : ""}`}>{item}</span>
                  </div>
                );
              })}
            </div>
          </Card>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}
