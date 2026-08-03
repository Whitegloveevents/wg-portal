import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home, Wallet, Users, CreditCard, CalendarClock, NotebookPen, ClipboardList,
  Table2, Palette, FolderOpen, PhoneCall, Settings, Search, Menu,
  Plus, X, Check, ChevronDown, ChevronRight, Paperclip, Star,
  Phone, Mail, Globe, Instagram, MessageCircle, ArrowLeft, LayoutGrid, CalendarDays,
} from "lucide-react";

/* ---------------------------------------------------------
   White Glove Events — Client Portal
   PAGE 3 OF N: Vendors — full Vendor CRM.
   Couple: Shrestha & Nishanth   Wedding: August 22, 2026

   DEMO LIBRARY DATA: the two vendors below are placeholder
   entries used only to demonstrate assignment + pricing
   history end-to-end. Not confirmed real records — replace
   with real contact info once confirmed.
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

const CATEGORIES = ["Venue", "Catering", "Décor", "Photography", "Makeup", "DJ", "Rentals", "Transportation", "Hotel", "Miscellaneous"];
const EVENTS = ["Haldi", "Mehendi", "Sangeet", "Wedding", "Reception", "Cocktail", "Welcome Dinner", "Brunch"];

function sidebarTheme(mode) {
  return mode === "dark"
    ? { bg: "#1D1E1A", text: "#F6F4EF", muted: "rgba(246,244,239,0.58)", border: "rgba(246,244,239,0.1)", hover: "rgba(246,244,239,0.07)", activeBg: "rgba(181,138,74,0.18)", activeText: "#E7D6B8", logoBg: "#B58A4A", logoText: "#1D1E1A", sectionLabel: "rgba(246,244,239,0.4)" }
    : { bg: "#FBFAF6", text: "#26261F", muted: "#8A8577", border: "#E7E2D5", hover: "#F4EDE0", activeBg: "#F4EDE0", activeText: "#B58A4A", logoBg: "#B58A4A", logoText: "#FFFFFF", sectionLabel: "#8A8577" };
}

function currency(n) {
  const num = Number(n) || 0;
  return `$${num.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
function initialsOf(name) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}
function waLink(phone) {
  const digits = (phone || "").replace(/[^0-9]/g, "");
  return `https://wa.me/${digits}`;
}

const INITIAL_LIBRARY = [
  { id: "v1", name: "Seema Verma", contactPerson: "Seema Verma", category: "Makeup", phone: "(555) 214-7788", email: "seema@example.com", website: "www.example-makeup.com", instagram: "@seemavermamakeup", serviceArea: "", rating: 0, preferred: true, priceHistory: [] },
  { id: "v2", name: "Mahen Photography", contactPerson: "", category: "Photography", phone: "(555) 907-2231", email: "hello@example-photo.com", website: "www.example-photo.com", instagram: "@mahenphoto", serviceArea: "", rating: 0, preferred: true, priceHistory: [] },
];

class PageBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return <div style={{ padding: 40, textAlign: "center", color: "#8A8577", fontSize: 13 }}>This section couldn't load. The rest of the page is unaffected.</div>;
    }
    return this.props.children;
  }
}

export default function Vendors() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarView, setSidebarView] = useState("feature");
  const [sidebarTheme_, setSidebarTheme_] = useState("light");
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [expandedNavEvents, setExpandedNavEvents] = useState({});
  const [weddingSwitcherOpen, setWeddingSwitcherOpen] = useState(false);

  const [library, setLibrary] = useState(INITIAL_LIBRARY);
  const [assigned, setAssigned] = useState([]);
  const [tab, setTab] = useState("assigned");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [detailVendorId, setDetailVendorId] = useState(null);
  const [receiptPreviewVendor, setReceiptPreviewVendor] = useState(null);

  const [assignStep, setAssignStep] = useState(null);
  const [assignCategory, setAssignCategory] = useState(null);
  const [assignSearch, setAssignSearch] = useState("");
  const [selectedLibVendor, setSelectedLibVendor] = useState(null);
  const [detailsForm, setDetailsForm] = useState({ services: "", events: [], datetime: "", cost: "", deposit: "", dueDate: "", arrivalTime: "", setupTime: "", notes: "" });

  const [showNewVendorModal, setShowNewVendorModal] = useState(false);
  const [newVendorForm, setNewVendorForm] = useState({ name: "", contactPerson: "", category: CATEGORIES[0], phone: "", email: "", website: "", instagram: "", serviceArea: "" });

  const daysLeft = Math.max(0, Math.ceil((WEDDING_DATE.getTime() - Date.now()) / 86400000));
  const bookedCount = assigned.filter((v) => v.status === "Booked").length;
  const pendingCount = assigned.filter((v) => v.status === "Pending").length;
  const waitingContractCount = assigned.filter((v) => v.status === "Waiting on Contract").length;
  const missingCoiCount = assigned.filter((v) => !v.coiName).length;

  const commandAlerts = useMemo(() => {
    const alerts = [];
    assigned.forEach((v) => {
      if (!v.coiName) alerts.push({ level: "yellow", text: `COI missing from ${v.name}` });
      if (!v.contractName) alerts.push({ level: "yellow", text: `Contract missing from ${v.name}` });
      const due = (Number(v.cost) || 0) - (Number(v.deposit) || 0);
      if (due > 0 && v.dueDate) {
        const days = Math.ceil((new Date(v.dueDate) - new Date()) / 86400000);
        if (days < 0) alerts.push({ level: "red", text: `${v.name} payment is overdue` });
        else if (days <= 3) alerts.push({ level: "yellow", text: `${v.name} payment due in ${days}d` });
      }
    });
    return alerts;
  }, [assigned]);
  const ALERT_DOT = { red: "🔴", yellow: "🟡", green: "🟢", blue: "🔵" };

  const filteredAssigned = useMemo(() => {
    const q = search.toLowerCase();
    return assigned.filter((v) => (categoryFilter === "All" || v.category === categoryFilter) && v.name.toLowerCase().includes(q));
  }, [assigned, search, categoryFilter]);

  const filteredLibrary = useMemo(() => {
    const q = search.toLowerCase();
    return library.filter((v) => (categoryFilter === "All" || v.category === categoryFilter) && v.name.toLowerCase().includes(q));
  }, [library, search, categoryFilter]);

  const assignFilteredLib = useMemo(
    () => library.filter((v) => (!assignCategory || v.category === assignCategory) && v.name.toLowerCase().includes(assignSearch.toLowerCase())),
    [library, assignCategory, assignSearch]
  );

  function openAssignFlow() {
    setAssignStep("category"); setAssignCategory(null); setSelectedLibVendor(null); setAssignSearch("");
  }
  function toggleDetailsEvent(ev) {
    setDetailsForm((f) => ({ ...f, events: f.events.includes(ev) ? f.events.filter((e) => e !== ev) : [...f.events, ev] }));
  }
  function saveAssignment() {
    const record = {
      ...selectedLibVendor,
      ...detailsForm,
      assignId: `${selectedLibVendor.id}-${Date.now()}`,
      status: "Pending",
      contractName: "", coiName: "",
    };
    setAssigned((a) => [...a, record]);
    if (detailsForm.cost) {
      setLibrary((lib) => lib.map((v) => (v.id === selectedLibVendor.id ? { ...v, priceHistory: [...v.priceHistory, { wedding: COUPLE, price: Number(detailsForm.cost) }] } : v)));
    }
    setAssignStep(null);
    setDetailsForm({ services: "", events: [], datetime: "", cost: "", deposit: "", dueDate: "", arrivalTime: "", setupTime: "", notes: "" });
  }
  function addLibraryVendor() {
    if (!newVendorForm.name.trim()) return;
    setLibrary((lib) => [...lib, { ...newVendorForm, id: `v${Date.now()}`, preferred: false, rating: 0, priceHistory: [] }]);
    setShowNewVendorModal(false);
    setNewVendorForm({ name: "", contactPerson: "", category: CATEGORIES[0], phone: "", email: "", website: "", instagram: "", serviceArea: "" });
  }
  function updateAssignedVendor(assignId, patch) {
    setAssigned((a) => a.map((v) => (v.assignId === assignId ? { ...v, ...patch } : v)));
  }
  function setLibraryVendorRating(id, rating) {
    setLibrary((lib) => lib.map((v) => (v.id === id ? { ...v, rating } : v)));
  }
  function uploadDoc(assignId, field, file) {
    if (!file) return;
    updateAssignedVendor(assignId, { [field]: file.name, [`${field}Url`]: URL.createObjectURL(file), [`${field}Type`]: file.type });
  }

  const detailVendor = assigned.find((v) => v.assignId === detailVendorId);

  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100vh", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif", background: "#F6F4EF", color: "#26261F" }}>
      <style>{`
        .wg-card { background:#FFFFFF; border:1px solid #E7E2D5; border-top:3px solid #B58A4A; border-radius:14px; padding:18px 20px; }
        .wg-primary-btn { display:flex; align-items:center; gap:7px; background:#B58A4A; color:#1D1E1A; border:none; border-radius:9px; padding:9px 15px; font-size:12.5px; font-weight:700; cursor:pointer; }
        .wg-primary-btn:hover { background:#a37b40; }
        .wg-secondary-btn { display:flex; align-items:center; gap:7px; background:#FFFFFF; border:1px solid #E7E2D5; border-radius:9px; padding:9px 15px; font-size:12.5px; font-weight:600; color:#26261F; cursor:pointer; }
        .wg-tab-btn { padding:8px 16px; border-radius:8px; border:1px solid #E7E2D5; background:#FFFFFF; font-size:12px; font-weight:700; color:#8A8577; cursor:pointer; }
        .wg-tab-btn.active { background:#F4EDE0; border-color:#E7D6B8; color:#B58A4A; }
        .wg-chip { padding:6px 12px; border-radius:100px; background:#FFFFFF; border:1px solid #E7E2D5; font-size:11px; font-weight:600; color:#8A8577; cursor:pointer; }
        .wg-chip.active { background:#F4EDE0; border-color:#E7D6B8; color:#B58A4A; }
        .wg-modal-overlay { position:fixed; inset:0; background:rgba(29,30,26,0.55); display:flex; align-items:center; justify-content:center; z-index:50; padding:20px; }
        .wg-modal { background:#FFFFFF; border-radius:16px; width:100%; max-width:460px; max-height:88vh; overflow-y:auto; padding:22px 24px; }
        .wg-modal-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
        .wg-modal-title { font-size:15px; font-weight:700; color:#1D1E1A; }
        .wg-modal-close { background:none; border:none; color:#8A8577; cursor:pointer; }
        .wg-field { margin-bottom:12px; }
        .wg-field label { display:block; font-size:11px; font-weight:600; color:#8A8577; margin-bottom:5px; text-transform:uppercase; letter-spacing:0.04em; }
        .wg-field input, .wg-field select, .wg-field textarea { width:100%; border:1px solid #E7E2D5; border-radius:8px; padding:8px 10px; font-size:12.5px; outline:none; box-sizing:border-box; }
        .wg-field-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .wg-event-chip-row { display:flex; flex-wrap:wrap; gap:6px; }
        .wg-event-chip { padding:6px 11px; border-radius:100px; border:1px solid #E7E2D5; font-size:11px; font-weight:600; color:#8A8577; cursor:pointer; }
        .wg-event-chip.on { background:#F4EDE0; border-color:#E7D6B8; color:#B58A4A; }
        .wg-contact-icon-btn { width:30px; height:30px; border-radius:8px; border:1px solid #E7E2D5; background:#FBFAF6; color:#8A8577; display:flex; align-items:center; justify-content:center; }
        .wg-contact-icon-btn:hover { border-color:#B58A4A; color:#B58A4A; }
        .wg-status-pill { font-size:10px; font-weight:700; padding:2px 8px; border-radius:100px; }
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
                    <div style={{ fontSize: 10.5, color: t.muted }}>{WEDDING_DATE.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", background: t.activeBg, color: t.activeText, padding: "3px 8px", borderRadius: 100 }}>Planning</span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: t.activeText }}>{daysLeft} days left</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 }}>
                {[
                  { label: "Booked", value: bookedCount },
                  { label: "Pending", value: pendingCount },
                  { label: "Waiting on Contract", value: waitingContractCount },
                  { label: "Missing COI", value: missingCoiCount, warn: missingCoiCount > 0 },
                ].map((s) => (
                  <div key={s.label} style={{ background: sidebarTheme_ === "light" ? "#FFFFFF" : "rgba(246,244,239,0.05)", border: `1px solid ${s.warn ? "#6B2A3A" : t.border}`, borderRadius: 8, padding: "7px 9px" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: s.warn ? "#6B2A3A" : t.text, fontFamily: "ui-monospace, monospace" }}>{s.value}</div>
                    <div style={{ fontSize: 9, color: s.warn ? "#6B2A3A" : t.muted, textTransform: "uppercase" }}>{s.label}</div>
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
                              const isVendorsLink = sub.id === "vendors";
                              return (
                                <button key={sub.id} onClick={() => { if (isVendorsLink) setCategoryFilter("All"); else navigate("/portal/" + sub.id); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "6px 8px", borderRadius: 6, background: "transparent", color: t.muted, border: "none", cursor: "pointer", fontSize: 11.5, textAlign: "left" }}>
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
            <div style={{ fontSize: 12.5, color: "rgba(246,244,239,0.7)" }}>🟢 No vendor alerts right now — contracts, COIs, and payments look clear.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {commandAlerts.map((a, i) => <div key={i} style={{ fontSize: 12.5, color: "rgba(246,244,239,0.85)" }}>{ALERT_DOT[a.level]} {a.text}</div>)}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 23, fontWeight: 700, color: "#1D1E1A", letterSpacing: "-0.01em" }}>Vendors</div>
            <div style={{ fontSize: 12, color: "#8A8577", marginTop: 2 }}>Assign once from your library — pricing and contact info stay in sync everywhere.</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="wg-secondary-btn" onClick={() => setShowNewVendorModal(true)}><Plus size={14} /> New Library Vendor</button>
            <button className="wg-primary-btn" onClick={openAssignFlow}><Plus size={14} /> Assign Vendor</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button className={`wg-tab-btn${tab === "assigned" ? " active" : ""}`} onClick={() => setTab("assigned")}>Assigned to This Wedding ({assigned.length})</button>
          <button className={`wg-tab-btn${tab === "library" ? " active" : ""}`} onClick={() => setTab("library")}>Vendor Library ({library.length})</button>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FFFFFF", border: "1px solid #E7E2D5", borderRadius: 9, padding: "8px 12px", flex: 1, minWidth: 200 }}>
            <Search size={14} strokeWidth={1.75} color="#8A8577" />
            <input placeholder="Search vendors..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ border: "none", outline: "none", background: "transparent", fontSize: 12.5, width: "100%" }} />
          </div>
          <button className={`wg-chip${categoryFilter === "All" ? " active" : ""}`} onClick={() => setCategoryFilter("All")}>All</button>
          {CATEGORIES.map((c) => (
            <button key={c} className={`wg-chip${categoryFilter === c ? " active" : ""}`} onClick={() => setCategoryFilter(c)}>{c}</button>
          ))}
        </div>

        <PageBoundary>
          {tab === "assigned" ? (
            filteredAssigned.length === 0 ? (
              <div className="wg-card" style={{ textAlign: "center", padding: "50px 24px", border: "1.5px dashed #E7E2D5" }}>
                <p style={{ fontSize: 12.5, color: "#8A8577", marginBottom: 14 }}>
                  {assigned.length === 0 ? "No vendors assigned to this wedding yet." : "No vendors match your search/filter."}
                </p>
                {assigned.length === 0 && <button className="wg-primary-btn" style={{ margin: "0 auto" }} onClick={openAssignFlow}><Plus size={14} /> Assign Your First Vendor</button>}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
                {filteredAssigned.map((v) => {
                  const remaining = (Number(v.cost) || 0) - (Number(v.deposit) || 0);
                  return (
                    <div key={v.assignId} className="wg-card">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 100, background: "#F4EDE0", color: "#B58A4A", fontFamily: "Georgia, serif", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>{initialsOf(v.name)}</div>
                          <div>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1D1E1A", display: "flex", alignItems: "center", gap: 4 }}>{v.name}{v.preferred && <Star size={11} fill="#B58A4A" strokeWidth={0} />}</div>
                            <div style={{ fontSize: 11, color: "#8A8577" }}>{v.category}</div>
                          </div>
                        </div>
                        <select value={v.status} onChange={(e) => updateAssignedVendor(v.assignId, { status: e.target.value })} style={{ fontSize: 10.5, fontWeight: 700, border: "1px solid #E7E2D5", borderRadius: 100, padding: "3px 8px", background: v.status === "Booked" ? "#E7EDE4" : v.status === "Waiting on Contract" ? "#F3E6E8" : "#F4EDE0", color: v.status === "Booked" ? "#5F7A5A" : v.status === "Waiting on Contract" ? "#6B2A3A" : "#B58A4A" }}>
                          <option>Pending</option>
                          <option>Booked</option>
                          <option>Waiting on Contract</option>
                        </select>
                      </div>

                      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                        <a href={`tel:${v.phone}`} className="wg-contact-icon-btn" title="Call"><Phone size={13} /></a>
                        <a href={`mailto:${v.email}`} className="wg-contact-icon-btn" title="Email"><Mail size={13} /></a>
                        <a href={waLink(v.phone)} target="_blank" rel="noreferrer" className="wg-contact-icon-btn" title="WhatsApp"><MessageCircle size={13} /></a>
                        {v.website && <a href={`https://${v.website.replace(/^https?:\/\//, "")}`} target="_blank" rel="noreferrer" className="wg-contact-icon-btn" title="Website"><Globe size={13} /></a>}
                        {v.instagram && <span className="wg-contact-icon-btn" title={v.instagram}><Instagram size={13} /></span>}
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11, marginBottom: 10 }}>
                        <div><span style={{ color: "#8A8577" }}>Cost</span><div style={{ fontFamily: "ui-monospace,monospace" }}>{currency(v.cost)}</div></div>
                        <div><span style={{ color: "#8A8577" }}>Remaining</span><div style={{ fontFamily: "ui-monospace,monospace", color: remaining > 0 ? "#6B2A3A" : "#5F7A5A" }}>{currency(remaining)}</div></div>
                      </div>

                      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                        <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 100, background: v.contractName ? "#E7EDE4" : "#F3E6E8", color: v.contractName ? "#5F7A5A" : "#6B2A3A" }}>{v.contractName ? "Contract ✓" : "No contract"}</span>
                        <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 100, background: v.coiName ? "#E7EDE4" : "#F3E6E8", color: v.coiName ? "#5F7A5A" : "#6B2A3A" }}>{v.coiName ? "COI ✓" : "No COI"}</span>
                      </div>

                      <button className="wg-secondary-btn" style={{ width: "100%", justifyContent: "center" }} onClick={() => setDetailVendorId(v.assignId)}>View Full Profile</button>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
              {filteredLibrary.map((v) => (
                <div key={v.id} className="wg-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 100, background: "#F4EDE0", color: "#B58A4A", fontFamily: "Georgia, serif", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>{initialsOf(v.name)}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1D1E1A", display: "flex", alignItems: "center", gap: 4 }}>{v.name}{v.preferred && <Star size={10} fill="#B58A4A" strokeWidth={0} />}</div>
                      <div style={{ fontSize: 10.5, color: "#8A8577" }}>{v.category}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "#8A8577", marginBottom: 6 }}>{v.phone} · {v.email}</div>
                  {v.priceHistory.length > 0 && (
                    <div style={{ fontSize: 10.5, color: "#B58A4A", fontWeight: 600, marginBottom: 10 }}>
                      Price history: {v.priceHistory.map((p) => currency(p.price)).join(", ")}
                    </div>
                  )}
                  <button className="wg-primary-btn" style={{ width: "100%", justifyContent: "center" }} onClick={() => { setSelectedLibVendor(v); setAssignStep("confirm"); }}>Assign to This Wedding</button>
                </div>
              ))}
            </div>
          )}
        </PageBoundary>
        </div>
      </main>

      {assignStep && (
        <div className="wg-modal-overlay" onClick={() => setAssignStep(null)}>
          <div className="wg-modal" onClick={(e) => e.stopPropagation()}>
            {assignStep === "category" && (
              <>
                <div className="wg-modal-head"><span className="wg-modal-title">Choose a Category</span><button className="wg-modal-close" onClick={() => setAssignStep(null)}><X size={16} /></button></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {CATEGORIES.map((c) => (
                    <div key={c} onClick={() => { setAssignCategory(c); setAssignStep("select"); }} style={{ border: "1px solid #E7E2D5", borderRadius: 10, padding: 14, textAlign: "center", fontSize: 12.5, fontWeight: 600, cursor: "pointer", background: "#FBFAF6" }}>{c}</div>
                  ))}
                </div>
              </>
            )}
            {assignStep === "select" && (
              <>
                <div className="wg-modal-head">
                  <button className="wg-modal-close" onClick={() => setAssignStep("category")}><ArrowLeft size={16} /></button>
                  <span className="wg-modal-title">{assignCategory}</span>
                  <button className="wg-modal-close" onClick={() => setAssignStep(null)}><X size={16} /></button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FBFAF6", border: "1px solid #E7E2D5", borderRadius: 9, padding: "9px 12px", marginBottom: 12 }}>
                  <Search size={14} /><input autoFocus placeholder="Search vendors..." value={assignSearch} onChange={(e) => setAssignSearch(e.target.value)} style={{ border: "none", outline: "none", background: "transparent", fontSize: 12.5, width: "100%" }} />
                </div>
                {assignFilteredLib.length === 0 && <p style={{ fontSize: 12, color: "#8A8577" }}>No vendors in this category yet — add one to your library first.</p>}
                {assignFilteredLib.map((v) => (
                  <div key={v.id} onClick={() => { setSelectedLibVendor(v); setAssignStep("confirm"); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, border: "1px solid #E7E2D5", borderRadius: 10, marginBottom: 8, cursor: "pointer" }}>
                    <div style={{ width: 30, height: 30, borderRadius: 100, background: "#F4EDE0", color: "#B58A4A", fontFamily: "Georgia, serif", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>{initialsOf(v.name)}</div>
                    <div><div style={{ fontSize: 12.5, fontWeight: 700 }}>{v.name}{v.preferred && " ⭐"}</div><div style={{ fontSize: 10.5, color: "#8A8577" }}>{v.phone} · {v.email}</div></div>
                  </div>
                ))}
              </>
            )}
            {assignStep === "confirm" && selectedLibVendor && (
              <>
                <div className="wg-modal-head">
                  <button className="wg-modal-close" onClick={() => setAssignStep("select")}><ArrowLeft size={16} /></button>
                  <span className="wg-modal-title">Confirm Vendor</span>
                  <button className="wg-modal-close" onClick={() => setAssignStep(null)}><X size={16} /></button>
                </div>
                <div style={{ background: "#F4EDE0", borderRadius: 8, padding: 10, marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{selectedLibVendor.name}</div>
                  <div style={{ fontSize: 11, color: "#8A8577" }}>{selectedLibVendor.category} · {selectedLibVendor.phone} · {selectedLibVendor.email}</div>
                  {selectedLibVendor.priceHistory.length > 0 && (
                    <div style={{ fontSize: 11, color: "#B58A4A", fontWeight: 600, marginTop: 6 }}>Typical price: {selectedLibVendor.priceHistory.map((p) => currency(p.price)).join(", ")}</div>
                  )}
                </div>
                <button className="wg-primary-btn" style={{ width: "100%", justifyContent: "center" }} onClick={() => setAssignStep("details")}>Assign to Wedding</button>
              </>
            )}
            {assignStep === "details" && selectedLibVendor && (
              <>
                <div className="wg-modal-head">
                  <button className="wg-modal-close" onClick={() => setAssignStep("confirm")}><ArrowLeft size={16} /></button>
                  <span className="wg-modal-title">{selectedLibVendor.name} — Details</span>
                  <button className="wg-modal-close" onClick={() => setAssignStep(null)}><X size={16} /></button>
                </div>
                <div className="wg-field"><label>Services Booked</label><input value={detailsForm.services} onChange={(e) => setDetailsForm({ ...detailsForm, services: e.target.value })} /></div>
                <div className="wg-field"><label>Events Covered</label>
                  <div className="wg-event-chip-row">{EVENTS.map((ev) => <span key={ev} className={`wg-event-chip${detailsForm.events.includes(ev) ? " on" : ""}`} onClick={() => toggleDetailsEvent(ev)}>{ev}</span>)}</div>
                </div>
                <div className="wg-field"><label>Date &amp; Time</label><input value={detailsForm.datetime} onChange={(e) => setDetailsForm({ ...detailsForm, datetime: e.target.value })} /></div>
                <div className="wg-field-row">
                  <div className="wg-field"><label>Package Cost ($)</label><input type="number" value={detailsForm.cost} onChange={(e) => setDetailsForm({ ...detailsForm, cost: e.target.value })} /></div>
                  <div className="wg-field"><label>Deposit Paid ($)</label><input type="number" value={detailsForm.deposit} onChange={(e) => setDetailsForm({ ...detailsForm, deposit: e.target.value })} /></div>
                </div>
                <div className="wg-field"><label>Next Payment Due</label><input type="date" value={detailsForm.dueDate} onChange={(e) => setDetailsForm({ ...detailsForm, dueDate: e.target.value })} /></div>
                <div className="wg-field-row">
                  <div className="wg-field"><label>Arrival Time</label><input placeholder="e.g. 2:00 PM" value={detailsForm.arrivalTime} onChange={(e) => setDetailsForm({ ...detailsForm, arrivalTime: e.target.value })} /></div>
                  <div className="wg-field"><label>Setup Time</label><input placeholder="e.g. 2:30 PM" value={detailsForm.setupTime} onChange={(e) => setDetailsForm({ ...detailsForm, setupTime: e.target.value })} /></div>
                </div>
                <div className="wg-field"><label>Notes</label><textarea rows={3} value={detailsForm.notes} onChange={(e) => setDetailsForm({ ...detailsForm, notes: e.target.value })} /></div>
                <button className="wg-primary-btn" style={{ width: "100%", justifyContent: "center" }} onClick={saveAssignment}>Save to This Wedding</button>
              </>
            )}
          </div>
        </div>
      )}

      {showNewVendorModal && (
        <div className="wg-modal-overlay" onClick={() => setShowNewVendorModal(false)}>
          <div className="wg-modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="wg-modal-head"><span className="wg-modal-title">Add Vendor to Library</span><button className="wg-modal-close" onClick={() => setShowNewVendorModal(false)}><X size={16} /></button></div>
            <div className="wg-field"><label>Business Name</label><input value={newVendorForm.name} onChange={(e) => setNewVendorForm({ ...newVendorForm, name: e.target.value })} /></div>
            <div className="wg-field"><label>Contact Person</label><input value={newVendorForm.contactPerson} onChange={(e) => setNewVendorForm({ ...newVendorForm, contactPerson: e.target.value })} /></div>
            <div className="wg-field"><label>Category</label>
              <select value={newVendorForm.category} onChange={(e) => setNewVendorForm({ ...newVendorForm, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="wg-field"><label>Service Area</label><input placeholder="e.g. Bay Area, CA" value={newVendorForm.serviceArea} onChange={(e) => setNewVendorForm({ ...newVendorForm, serviceArea: e.target.value })} /></div>
            <div className="wg-field-row">
              <div className="wg-field"><label>Phone</label><input value={newVendorForm.phone} onChange={(e) => setNewVendorForm({ ...newVendorForm, phone: e.target.value })} /></div>
              <div className="wg-field"><label>Email</label><input value={newVendorForm.email} onChange={(e) => setNewVendorForm({ ...newVendorForm, email: e.target.value })} /></div>
            </div>
            <div className="wg-field-row">
              <div className="wg-field"><label>Website</label><input value={newVendorForm.website} onChange={(e) => setNewVendorForm({ ...newVendorForm, website: e.target.value })} /></div>
              <div className="wg-field"><label>Instagram</label><input value={newVendorForm.instagram} onChange={(e) => setNewVendorForm({ ...newVendorForm, instagram: e.target.value })} /></div>
            </div>
            <button className="wg-primary-btn" style={{ width: "100%", justifyContent: "center" }} onClick={addLibraryVendor}>Add to Library</button>
          </div>
        </div>
      )}

      {detailVendor && (
        <div className="wg-modal-overlay" onClick={() => setDetailVendorId(null)}>
          <div className="wg-modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="wg-modal-head"><span className="wg-modal-title">{detailVendor.name}</span><button className="wg-modal-close" onClick={() => setDetailVendorId(null)}><X size={16} /></button></div>

            {/* Quick Actions */}
            <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
              <a href={`tel:${detailVendor.phone}`} className="wg-secondary-btn"><Phone size={13} /> Call</a>
              <a href={waLink(detailVendor.phone)} target="_blank" rel="noreferrer" className="wg-secondary-btn"><MessageCircle size={13} /> WhatsApp</a>
              <a href={`mailto:${detailVendor.email}`} className="wg-secondary-btn"><Mail size={13} /> Email</a>
              {detailVendor.contractName ? (
                <button className="wg-secondary-btn" onClick={() => setReceiptPreviewVendor(detailVendor)}><Paperclip size={13} /> View Contract</button>
              ) : (
                <span className="wg-secondary-btn" style={{ opacity: 0.5, cursor: "default" }} title="No contract uploaded yet"><Paperclip size={13} /> View Contract</span>
              )}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(detailVendor.serviceArea || detailVendor.name)}`}
                target="_blank" rel="noreferrer" className="wg-secondary-btn"
              >
                <Globe size={13} /> View Location
              </a>
              <button onClick={() => navigate("/portal/meetings")} className="wg-secondary-btn">
                <CalendarClock size={13} /> Add Meeting
              </button>
            </div>

            {/* Basic Information */}
            <div style={{ fontSize: 11, fontWeight: 700, color: "#8A8577", textTransform: "uppercase", marginBottom: 6 }}>Basic Information</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, marginBottom: 16 }}>
              <div>Business: <strong>{detailVendor.name}</strong></div>
              <div>Contact: <strong>{detailVendor.contactPerson || "—"}</strong></div>
              <div>Phone: <strong>{detailVendor.phone || "—"}</strong></div>
              <div>Email: <strong>{detailVendor.email || "—"}</strong></div>
              <div>Website: <strong>{detailVendor.website || "—"}</strong></div>
              <div>Instagram: <strong>{detailVendor.instagram || "—"}</strong></div>
            </div>

            {/* Business */}
            <div style={{ fontSize: 11, fontWeight: 700, color: "#8A8577", textTransform: "uppercase", marginBottom: 6 }}>Business</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, marginBottom: 8 }}>
              <div>Category: <strong>{detailVendor.category}</strong></div>
              <div>Service Area: <strong>{detailVendor.serviceArea || "Not set"}</strong></div>
              <div>Avg. Pricing: <strong>{detailVendor.priceHistory?.length ? currency(detailVendor.priceHistory.reduce((s, p) => s + p.price, 0) / detailVendor.priceHistory.length) : "No data yet"}</strong></div>
              <div>Years w/ Studio: <strong>{detailVendor.priceHistory?.length ? "2026–present" : "New this year"}</strong></div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 16 }}>
              <span style={{ fontSize: 11, color: "#8A8577", marginRight: 4 }}>Internal Rating:</span>
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  size={14}
                  fill={n <= (detailVendor.rating || 0) ? "#B58A4A" : "none"}
                  color="#B58A4A"
                  strokeWidth={1.5}
                  style={{ cursor: "pointer" }}
                  onClick={() => setLibraryVendorRating(detailVendor.id, n)}
                />
              ))}
            </div>

            {/* Wedding Information */}
            <div style={{ fontSize: 11, fontWeight: 700, color: "#8A8577", textTransform: "uppercase", marginBottom: 6 }}>Wedding Information — {COUPLE}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, marginBottom: 8 }}>
              <div>Assigned Events: <strong>{detailVendor.events?.length ? detailVendor.events.join(", ") : "None set"}</strong></div>
              <div>Status: <strong>{detailVendor.status}</strong></div>
              <div>Contract: <strong style={{ color: detailVendor.contractName ? "#5F7A5A" : "#6B2A3A" }}>{detailVendor.contractName ? "On File" : "Missing"}</strong></div>
              <div>COI: <strong style={{ color: detailVendor.coiName ? "#5F7A5A" : "#6B2A3A" }}>{detailVendor.coiName ? "On File" : "Missing"}</strong></div>
              <div>Arrival Time: <strong>{detailVendor.arrivalTime || "—"}</strong></div>
              <div>Setup Time: <strong>{detailVendor.setupTime || "—"}</strong></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, marginBottom: 16 }}>
              <div>Cost: <strong>{currency(detailVendor.cost)}</strong></div>
              <div>Deposit Paid: <strong>{currency(detailVendor.deposit)}</strong></div>
              <div>Balance Due: <strong style={{ color: (Number(detailVendor.cost) || 0) - (Number(detailVendor.deposit) || 0) > 0 ? "#6B2A3A" : "#5F7A5A" }}>{currency((Number(detailVendor.cost) || 0) - (Number(detailVendor.deposit) || 0))}</strong></div>
              <div>Due Date: <strong>{detailVendor.dueDate || "—"}</strong></div>
            </div>

            {/* Documents */}
            <div style={{ fontSize: 11, fontWeight: 700, color: "#8A8577", textTransform: "uppercase", marginBottom: 6 }}>Documents</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <label className="wg-secondary-btn" style={{ cursor: "pointer" }}>
                <Paperclip size={13} /> {detailVendor.contractName || "Upload Contract"}
                <input type="file" style={{ display: "none" }} onChange={(e) => uploadDoc(detailVendor.assignId, "contractName", e.target.files?.[0])} />
              </label>
              <label className="wg-secondary-btn" style={{ cursor: "pointer" }}>
                <Paperclip size={13} /> {detailVendor.coiName || "Upload COI"}
                <input type="file" style={{ display: "none" }} onChange={(e) => uploadDoc(detailVendor.assignId, "coiName", e.target.files?.[0])} />
              </label>
              <label className="wg-secondary-btn" style={{ cursor: "pointer" }}>
                <Paperclip size={13} /> {detailVendor.w9Name || "Upload W-9"}
                <input type="file" style={{ display: "none" }} onChange={(e) => uploadDoc(detailVendor.assignId, "w9Name", e.target.files?.[0])} />
              </label>
              <label className="wg-secondary-btn" style={{ cursor: "pointer" }}>
                <Paperclip size={13} /> {detailVendor.inspirationName || "Upload Inspiration Photos"}
                <input type="file" style={{ display: "none" }} onChange={(e) => uploadDoc(detailVendor.assignId, "inspirationName", e.target.files?.[0])} />
              </label>
            </div>

            {/* History */}
            <div style={{ fontSize: 11, fontWeight: 700, color: "#8A8577", textTransform: "uppercase", marginBottom: 6 }}>Weddings With White Glove Events</div>
            {detailVendor.priceHistory?.length ? (
              <div style={{ marginBottom: 16 }}>
                {detailVendor.priceHistory.map((p, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0" }}>
                    <span>{p.wedding} ✅</span>
                    <span className="wg-num">{currency(p.price)}</span>
                  </div>
                ))}
                <div style={{ fontSize: 11, color: "#B58A4A", fontWeight: 600, marginTop: 6 }}>
                  Average price: {currency(detailVendor.priceHistory.reduce((s, p) => s + p.price, 0) / detailVendor.priceHistory.length)}
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 12, color: "#8A8577", marginBottom: 16 }}>No completed weddings on file yet for this vendor. This list grows automatically each time they're assigned with a price.</p>
            )}

            <div className="wg-field"><label>Notes</label>
              <textarea rows={3} value={detailVendor.notes || ""} onChange={(e) => updateAssignedVendor(detailVendor.assignId, { notes: e.target.value })} />
            </div>
          </div>
        </div>
      )}

      {receiptPreviewVendor && (
        <div className="wg-modal-overlay" onClick={() => setReceiptPreviewVendor(null)}>
          <div className="wg-modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="wg-modal-head"><span className="wg-modal-title">Contract — {receiptPreviewVendor.name}</span><button className="wg-modal-close" onClick={() => setReceiptPreviewVendor(null)}><X size={16} /></button></div>
            {receiptPreviewVendor.contractNameType?.startsWith("image/") ? (
              <img src={receiptPreviewVendor.contractNameUrl} alt="Contract" style={{ width: "100%", borderRadius: 10, border: "1px solid #E7E2D5" }} />
            ) : (
              <div style={{ background: "#FBFAF6", borderRadius: 10, padding: 24, textAlign: "center", color: "#8A8577", fontSize: 12 }}>
                <Paperclip size={20} style={{ marginBottom: 8 }} />
                <div>{receiptPreviewVendor.contractName}</div>
                <div style={{ fontSize: 10.5, marginTop: 4 }}>No inline preview for this file type — it's safely on file.</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
