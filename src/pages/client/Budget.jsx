import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home, Wallet, Users, CreditCard, CalendarClock, NotebookPen, ClipboardList,
  Table2, Palette, FolderOpen, PhoneCall, Settings,
  Plus, Trash2, ChevronDown, ChevronRight, CalendarDays,
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

/* ---------------------------------------------------------
   White Glove Events — Client Portal
   Budget — compact two-column finance dashboard
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

const PAYMENT_METHODS = ["Credit Card", "Check", "Cash", "Zelle", "ACH/Bank Transfer", "Other"];
const PAYMENT_STATUSES = ["Not Paid", "Deposit Paid", "Partially Paid", "Paid in Full", "Overdue"];
const STATUS_COLOR = {
  "Not Paid": "#8A8577", "Deposit Paid": "#B58A4A", "Partially Paid": "#B58A4A",
  "Paid in Full": "#5F7A5A", "Overdue": "#6B2A3A",
};
const CHART_COLORS = ["#B58A4A", "#5F7A5A", "#6B2A3A", "#8A8577", "#E7D6B8", "#A9BFA2", "#C48A94", "#C9BFA8", "#D9C9A3", "#7E9E93"];

function currency(n) {
  const num = Number(n) || 0;
  return `$${num.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
function num(v) { return Number(v) || 0; }

class ChartBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <div style={{ fontSize: 10.5, color: "#8A8577", textAlign: "center", padding: "16px 0" }}>Chart couldn't load.</div>;
    return this.props.children;
  }
}

export default function Budget() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarView, setSidebarView] = useState("feature");
  const [sidebarTheme_, setSidebarTheme_] = useState("light");
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [expandedNavEvents, setExpandedNavEvents] = useState({});
  const [weddingSwitcherOpen, setWeddingSwitcherOpen] = useState(false);

  const [rows, setRows] = useState([]);

  const daysLeft = Math.max(0, Math.ceil((WEDDING_DATE.getTime() - Date.now()) / 86400000));
  const weddingDateLabel = WEDDING_DATE.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  function addRow() {
    setRows((r) => [...r, {
      id: Date.now(), vendorCategory: "", estimatedBudget: "", contractAmount: "", amountPaid: "",
      nextPaymentDue: "", finalPaymentDue: "", datePaid: "", paymentMethod: "", paymentStatus: "Not Paid",
    }]);
  }
  function updateRow(id, field, value) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }
  function removeRow(id) {
    setRows((rs) => rs.filter((r) => r.id !== id));
  }
  function balanceOf(r) {
    const base = num(r.contractAmount) || num(r.estimatedBudget);
    return base - num(r.amountPaid);
  }

  const totals = useMemo(() => {
    const estimated = rows.reduce((s, r) => s + num(r.estimatedBudget), 0);
    const contracted = rows.reduce((s, r) => s + num(r.contractAmount), 0);
    const paid = rows.reduce((s, r) => s + num(r.amountPaid), 0);
    const remaining = rows.reduce((s, r) => s + Math.max(balanceOf(r), 0), 0);
    const upcoming = rows
      .filter((r) => r.paymentStatus !== "Paid in Full" && balanceOf(r) > 0)
      .reduce((s, r) => s + Math.max(balanceOf(r), 0), 0);
    return { estimated, contracted, paid, remaining, upcoming };
  }, [rows]);

  const donutData = useMemo(() => {
    const paid = totals.paid;
    const remaining = Math.max(totals.remaining, 0);
    if (paid === 0 && remaining === 0) return [{ name: "No data yet", value: 1 }];
    return [{ name: "Paid", value: paid }, { name: "Remaining", value: remaining }];
  }, [totals]);

  const byVendorData = useMemo(() => {
    return rows
      .filter((r) => r.vendorCategory.trim())
      .map((r) => ({ name: r.vendorCategory, value: num(r.contractAmount) || num(r.estimatedBudget) }))
      .sort((a, b) => b.value - a.value);
  }, [rows]);

  const comparisonData = [
    { name: "Estimated", amount: totals.estimated },
    { name: "Contracted", amount: totals.contracted },
    { name: "Paid", amount: totals.paid },
  ];

  const upcomingPayments = useMemo(() => {
    return rows
      .filter((r) => r.nextPaymentDue && balanceOf(r) > 0 && r.paymentStatus !== "Paid in Full")
      .sort((a, b) => new Date(a.nextPaymentDue) - new Date(b.nextPaymentDue));
  }, [rows]);

  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100vh", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif", background: "#F6F4EF", color: "#26261F" }}>
      <style>{`
        .bg-card { background:#FFFFFF; border:1px solid #E7E2D5; border-top:3px solid #B58A4A; border-radius:12px; }
        .bg-summary-card { background:#FFFFFF; border:1px solid #E7E2D5; border-radius:10px; padding:10px 12px; }
        .bg-summary-label { font-size:9.5px; color:#8A8577; text-transform:uppercase; letter-spacing:0.04em; font-weight:700; margin-bottom:4px; }
        .bg-summary-value { font-family:ui-monospace,'SF Mono',Consolas,monospace; font-size:17px; font-weight:600; color:#1D1E1A; }
        .bg-primary-btn { display:flex; align-items:center; gap:6px; background:#B58A4A; color:#1D1E1A; border:none; border-radius:8px; padding:7px 12px; font-size:11.5px; font-weight:700; cursor:pointer; }
        .bg-primary-btn:hover { background:#a37b40; }
        .bg-icon-btn { width:24px; height:24px; border-radius:6px; background:#FBFAF6; border:1px solid #E7E2D5; color:#8A8577; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; }
        .bg-icon-btn:hover { color:#6B2A3A; border-color:#6B2A3A; }
        .bg-table-wrap { overflow-x:auto; }
        table.bg-table { width:100%; border-collapse:collapse; min-width:920px; }
        table.bg-table th { text-align:left; font-size:9px; text-transform:uppercase; letter-spacing:0.03em; color:#8A8577; font-weight:700; padding:6px 6px; background:#FBFAF6; border-bottom:1px solid #E7E2D5; white-space:nowrap; }
        table.bg-table td { padding:4px 6px; border-bottom:1px solid #F0EBE1; vertical-align:middle; }
        table.bg-table tr:last-child td { border-bottom:none; }
        .bg-cell-input { width:100%; border:1px solid transparent; border-radius:5px; padding:4px 5px; font-size:11px; font-family:inherit; background:transparent; outline:none; box-sizing:border-box; }
        .bg-cell-input:hover, .bg-cell-input:focus { border-color:#E7E2D5; background:#FBFAF6; }
        .bg-cell-input.num { font-family:ui-monospace,monospace; text-align:right; }
        select.bg-cell-input { -webkit-appearance:none; appearance:none; cursor:pointer; }
        .bg-status-pill { font-size:9.5px; font-weight:700; padding:2px 7px; border-radius:100px; white-space:nowrap; }
        .bg-chart-card { padding:12px 14px; margin-bottom:12px; }
        .bg-chart-title { font-size:11px; font-weight:700; color:#1D1E1A; margin-bottom:6px; }
        .bg-upcoming-row { display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid #F0EBE1; font-size:11px; }
        .bg-upcoming-row:last-child { border-bottom:none; }
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

      <main style={{ flex: 1, minWidth: 0, padding: "28px 36px 40px", overflow: "hidden" }}>
        <div style={{ maxWidth: 1920, margin: "0 auto" }}>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#1D1E1A", letterSpacing: "-0.01em" }}>Budget</div>
              <div style={{ fontSize: 11.5, color: "#8A8577" }}>Every vendor payment, estimated vs. actual, in one glance.</div>
            </div>
          </div>

          {/* 5 summary cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 14 }}>
            <div className="bg-summary-card">
              <div className="bg-summary-label">Total Estimated</div>
              <div className="bg-summary-value">{currency(totals.estimated)}</div>
            </div>
            <div className="bg-summary-card">
              <div className="bg-summary-label">Total Contracted</div>
              <div className="bg-summary-value">{currency(totals.contracted)}</div>
            </div>
            <div className="bg-summary-card">
              <div className="bg-summary-label">Total Paid</div>
              <div className="bg-summary-value" style={{ color: "#5F7A5A" }}>{currency(totals.paid)}</div>
            </div>
            <div className="bg-summary-card">
              <div className="bg-summary-label">Remaining Balance</div>
              <div className="bg-summary-value" style={{ color: totals.remaining > 0 ? "#6B2A3A" : "#1D1E1A" }}>{currency(totals.remaining)}</div>
            </div>
            <div className="bg-summary-card">
              <div className="bg-summary-label">Upcoming Amount Due</div>
              <div className="bg-summary-value" style={{ color: "#B58A4A" }}>{currency(totals.upcoming)}</div>
            </div>
          </div>

          {/* Two-column layout */}
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>

            {/* LEFT: editable payment table */}
            <div className="bg-card" style={{ flex: "1 1 560px", minWidth: 320, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#1D1E1A" }}>Vendor Payments</div>
                <button className="bg-primary-btn" onClick={addRow}><Plus size={12} /> Add Vendor Payment</button>
              </div>

              {rows.length === 0 ? (
                <div style={{ textAlign: "center", padding: "28px 10px", color: "#8A8577", fontSize: 11.5 }}>
                  No vendor payments added yet — click "Add Vendor Payment" to start tracking.
                </div>
              ) : (
                <div className="bg-table-wrap">
                  <table className="bg-table">
                    <thead>
                      <tr>
                        <th>Vendor / Category</th>
                        <th>Estimated</th>
                        <th>Contract</th>
                        <th>Paid</th>
                        <th>Balance</th>
                        <th>Next Due</th>
                        <th>Final Due</th>
                        <th>Date Paid</th>
                        <th>Method</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => {
                        const balance = balanceOf(r);
                        return (
                          <tr key={r.id}>
                            <td style={{ minWidth: 130 }}>
                              <input className="bg-cell-input" placeholder="e.g. Venue" value={r.vendorCategory} onChange={(e) => updateRow(r.id, "vendorCategory", e.target.value)} />
                            </td>
                            <td>
                              <input className="bg-cell-input num" type="number" style={{ width: 76 }} value={r.estimatedBudget} onChange={(e) => updateRow(r.id, "estimatedBudget", e.target.value)} />
                            </td>
                            <td>
                              <input className="bg-cell-input num" type="number" style={{ width: 76 }} value={r.contractAmount} onChange={(e) => updateRow(r.id, "contractAmount", e.target.value)} />
                            </td>
                            <td>
                              <input className="bg-cell-input num" type="number" style={{ width: 76 }} value={r.amountPaid} onChange={(e) => updateRow(r.id, "amountPaid", e.target.value)} />
                            </td>
                            <td className="bg-cell-input num" style={{ width: 76, fontWeight: 700, color: balance > 0 ? "#6B2A3A" : "#5F7A5A" }}>
                              {currency(balance)}
                            </td>
                            <td>
                              <input className="bg-cell-input" type="date" style={{ width: 118 }} value={r.nextPaymentDue} onChange={(e) => updateRow(r.id, "nextPaymentDue", e.target.value)} />
                            </td>
                            <td>
                              <input className="bg-cell-input" type="date" style={{ width: 118 }} value={r.finalPaymentDue} onChange={(e) => updateRow(r.id, "finalPaymentDue", e.target.value)} />
                            </td>
                            <td>
                              <input className="bg-cell-input" type="date" style={{ width: 118 }} value={r.datePaid} onChange={(e) => updateRow(r.id, "datePaid", e.target.value)} />
                            </td>
                            <td>
                              <select className="bg-cell-input" style={{ width: 120 }} value={r.paymentMethod} onChange={(e) => updateRow(r.id, "paymentMethod", e.target.value)}>
                                <option value=""></option>
                                {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
                              </select>
                            </td>
                            <td>
                              <select
                                className="bg-cell-input"
                                style={{ width: 116, color: STATUS_COLOR[r.paymentStatus], fontWeight: 700 }}
                                value={r.paymentStatus}
                                onChange={(e) => updateRow(r.id, "paymentStatus", e.target.value)}
                              >
                                {PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
                              </select>
                            </td>
                            <td>
                              <button className="bg-icon-btn" onClick={() => removeRow(r.id)}><Trash2 size={11} /></button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* RIGHT: charts + upcoming payments */}
            <div style={{ flex: "1 1 340px", minWidth: 280, maxWidth: 420 }}>

              <div className="bg-card bg-chart-card">
                <div className="bg-chart-title">Paid vs. Remaining</div>
                <ChartBoundary>
                  <ResponsiveContainer width="100%" height={130}>
                    <PieChart>
                      <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={34} outerRadius={54} paddingAngle={donutData[0].name === "No data yet" ? 0 : 2} isAnimationActive={false}>
                        {donutData.map((d, i) => (
                          <Cell key={d.name} fill={d.name === "No data yet" ? "#E7E2D5" : d.name === "Paid" ? "#5F7A5A" : "#B58A4A"} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [currency(v), n]} />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartBoundary>
              </div>

              <div className="bg-card bg-chart-card">
                <div className="bg-chart-title">By Vendor / Category</div>
                {byVendorData.length === 0 ? (
                  <div style={{ fontSize: 10.5, color: "#8A8577", textAlign: "center", padding: "16px 0" }}>Add a vendor to see this populate.</div>
                ) : (
                  <ChartBoundary>
                    <ResponsiveContainer width="100%" height={Math.min(Math.max(byVendorData.length * 26, 60), 170)}>
                      <BarChart data={byVendorData} layout="vertical" margin={{ left: 4, right: 10, top: 2, bottom: 2 }}>
                        <CartesianGrid horizontal={false} stroke="#E7E2D5" />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 9.5, fill: "#8A8577" }} width={78} axisLine={{ stroke: "#E7E2D5" }} tickLine={false} />
                        <Tooltip formatter={(v) => currency(v)} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive={false} barSize={12}>
                          {byVendorData.map((d, i) => <Cell key={d.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartBoundary>
                )}
              </div>

              <div className="bg-card bg-chart-card">
                <div className="bg-chart-title">Estimated vs. Contracted vs. Paid</div>
                <ChartBoundary>
                  <ResponsiveContainer width="100%" height={100}>
                    <BarChart data={comparisonData} barSize={26}>
                      <CartesianGrid vertical={false} stroke="#E7E2D5" />
                      <XAxis dataKey="name" tick={{ fontSize: 9.5, fill: "#8A8577" }} axisLine={{ stroke: "#E7E2D5" }} tickLine={false} />
                      <YAxis hide />
                      <Tooltip formatter={(v) => currency(v)} />
                      <Bar dataKey="amount" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                        <Cell fill="#8A8577" />
                        <Cell fill="#B58A4A" />
                        <Cell fill="#5F7A5A" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartBoundary>
              </div>

              <div className="bg-card" style={{ padding: "12px 14px" }}>
                <div className="bg-chart-title">Upcoming Payments</div>
                {upcomingPayments.length === 0 ? (
                  <div style={{ fontSize: 10.5, color: "#8A8577", textAlign: "center", padding: "10px 0" }}>Nothing due right now.</div>
                ) : (
                  upcomingPayments.map((r) => (
                    <div className="bg-upcoming-row" key={r.id}>
                      <span style={{ fontWeight: 600, color: "#1D1E1A" }}>{r.vendorCategory || "Untitled"}</span>
                      <span style={{ fontFamily: "ui-monospace,monospace", color: "#B58A4A", fontWeight: 700 }}>{currency(balanceOf(r))}</span>
                      <span style={{ color: "#8A8577" }}>{r.nextPaymentDue}</span>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
