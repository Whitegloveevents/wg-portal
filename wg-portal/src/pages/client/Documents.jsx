import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home, Wallet, Users, CreditCard, CalendarClock, NotebookPen, ClipboardList,
  Table2, Palette, FolderOpen, PhoneCall, Settings,
  Plus, X, ChevronDown, ChevronRight, CalendarDays,
  Search, Trash2, FileText, Upload, PenTool, Download, Eye,
} from "lucide-react";

/* ---------------------------------------------------------
   White Glove Events — Client Portal
   PAGE 8 OF N: Documents — contracts, invoices, COIs,
   vendor contracts, with real upload + typed e-signature.
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

const CATEGORIES = ["Contracts", "Invoices", "Insurance (COI)", "Vendor Contracts", "Other"];

export default function Documents() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarView, setSidebarView] = useState("feature");
  const [sidebarTheme_, setSidebarTheme_] = useState("light");
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [expandedNavEvents, setExpandedNavEvents] = useState({});
  const [weddingSwitcherOpen, setWeddingSwitcherOpen] = useState(false);

  const [docs, setDocs] = useState([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState(null); // doc id
  const [signatureName, setSignatureName] = useState("");
  const [previewDoc, setPreviewDoc] = useState(null);

  const [form, setForm] = useState({ name: "", category: "Contracts", vendor: "", requiresSignature: false, fileName: "", fileUrl: "", fileType: "" });

  const daysLeft = Math.max(0, Math.ceil((WEDDING_DATE.getTime() - Date.now()) / 86400000));
  const weddingDateLabel = WEDDING_DATE.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return docs.filter((d) => (category === "All" || d.category === category) && (d.name.toLowerCase().includes(q) || (d.vendor || "").toLowerCase().includes(q)));
  }, [docs, category, search]);

  const needingSignature = docs.filter((d) => d.requiresSignature && !d.signed);

  const commandAlerts = useMemo(() => {
    return needingSignature.map((d) => ({ level: "yellow", text: `"${d.name}" is waiting on your signature` }));
  }, [needingSignature]);
  const ALERT_DOT = { red: "🔴", yellow: "🟡", green: "🟢", blue: "🔵" };

  function handleFilePick(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm((f) => ({ ...f, fileName: file.name, fileUrl: url, fileType: file.type, name: f.name || file.name }));
  }
  function addDocument() {
    if (!form.name.trim() || !form.fileUrl) return;
    setDocs((d) => [...d, { ...form, id: Date.now(), uploadedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), signed: null }]);
    setForm({ name: "", category: "Contracts", vendor: "", requiresSignature: false, fileName: "", fileUrl: "", fileType: "" });
    setShowUploadModal(false);
  }
  function removeDocument(id) {
    setDocs((d) => d.filter((x) => x.id !== id));
  }
  function signDocument() {
    if (!signatureName.trim()) return;
    setDocs((d) => d.map((x) => (x.id === showSignModal ? { ...x, signed: { name: signatureName.trim(), date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) } } : x)));
    setShowSignModal(null);
    setSignatureName("");
  }

  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100vh", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif", background: "#F6F4EF", color: "#26261F" }}>
      <style>{`
        .wg-card { background:#FFFFFF; border:1px solid #E7E2D5; border-top:3px solid #B58A4A; border-radius:14px; padding:16px 18px; }
        .wg-primary-btn { display:flex; align-items:center; gap:7px; background:#B58A4A; color:#1D1E1A; border:none; border-radius:9px; padding:9px 15px; font-size:12.5px; font-weight:700; cursor:pointer; }
        .wg-primary-btn:hover { background:#a37b40; }
        .wg-secondary-btn { display:flex; align-items:center; gap:6px; background:#FFFFFF; border:1px solid #E7E2D5; border-radius:8px; padding:7px 12px; font-size:11.5px; font-weight:600; color:#26261F; cursor:pointer; }
        .wg-secondary-btn:hover { border-color:#B58A4A; color:#B58A4A; }
        .wg-chip { padding:6px 12px; border-radius:100px; background:#FFFFFF; border:1px solid #E7E2D5; font-size:11px; font-weight:600; color:#8A8577; cursor:pointer; }
        .wg-chip.active { background:#F4EDE0; border-color:#E7D6B8; color:#B58A4A; }
        .wg-icon-btn { width:26px; height:26px; border-radius:7px; background:#FBFAF6; border:1px solid #E7E2D5; color:#8A8577; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; }
        .wg-icon-btn:hover { color:#6B2A3A; border-color:#6B2A3A; }
        .wg-modal-overlay { position:fixed; inset:0; background:rgba(29,30,26,0.55); display:flex; align-items:center; justify-content:center; z-index:50; padding:20px; }
        .wg-modal { background:#FFFFFF; border-radius:16px; width:100%; max-width:440px; max-height:88vh; overflow-y:auto; padding:22px 24px; }
        .wg-modal-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
        .wg-modal-title { font-size:15px; font-weight:700; color:#1D1E1A; }
        .wg-modal-close { background:none; border:none; color:#8A8577; cursor:pointer; }
        .wg-field { margin-bottom:12px; }
        .wg-field label { display:block; font-size:11px; font-weight:600; color:#8A8577; margin-bottom:5px; text-transform:uppercase; letter-spacing:0.04em; }
        .wg-field input, .wg-field select { width:100%; border:1px solid #E7E2D5; border-radius:8px; padding:8px 10px; font-size:12.5px; outline:none; box-sizing:border-box; font-family:inherit; }
        .wg-upload-drop { border:1.5px dashed #E7E2D5; border-radius:10px; padding:20px; text-align:center; cursor:pointer; color:#8A8577; }
        .wg-upload-drop:hover { border-color:#B58A4A; color:#B58A4A; }
        .wg-status-pill { font-size:10px; font-weight:700; padding:2px 8px; border-radius:100px; }
        .wg-sig-canvas { border:2px solid #E7E2D5; border-radius:10px; padding:20px; text-align:center; font-family:'Brush Script MT', cursive; font-size:26px; color:#1D1E1A; background:#FBFAF6; min-height:70px; display:flex; align-items:center; justify-content:center; }
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
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "ui-monospace, monospace" }}>{docs.length}</div>
                  <div style={{ fontSize: 9, color: t.muted, textTransform: "uppercase" }}>Documents</div>
                </div>
                <div style={{ background: sidebarTheme_ === "light" ? "#FFFFFF" : "rgba(246,244,239,0.05)", border: `1px solid ${needingSignature.length > 0 ? "#B58A4A" : t.border}`, borderRadius: 8, padding: "7px 9px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "ui-monospace, monospace" }}>{needingSignature.length}</div>
                  <div style={{ fontSize: 9, color: t.muted, textTransform: "uppercase" }}>Need Signature</div>
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
              <div style={{ fontSize: 12.5, color: "rgba(246,244,239,0.7)" }}>🟢 Nothing waiting on your signature right now.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {commandAlerts.map((a, i) => <div key={i} style={{ fontSize: 12.5, color: "rgba(246,244,239,0.85)" }}>{ALERT_DOT[a.level]} {a.text}</div>)}
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 23, fontWeight: 700, color: "#1D1E1A", letterSpacing: "-0.01em" }}>Documents</div>
              <div style={{ fontSize: 12, color: "#8A8577", marginTop: 2 }}>Contracts, invoices, insurance, and vendor paperwork — all in one place.</div>
            </div>
            <button className="wg-primary-btn" onClick={() => setShowUploadModal(true)}><Upload size={14} /> Upload Document</button>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FFFFFF", border: "1px solid #E7E2D5", borderRadius: 9, padding: "8px 12px", flex: 1, minWidth: 200 }}>
              <Search size={14} strokeWidth={1.75} color="#8A8577" />
              <input placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ border: "none", outline: "none", background: "transparent", fontSize: 12.5, width: "100%" }} />
            </div>
            <button className={`wg-chip${category === "All" ? " active" : ""}`} onClick={() => setCategory("All")}>All ({docs.length})</button>
            {CATEGORIES.map((c) => (
              <button key={c} className={`wg-chip${category === c ? " active" : ""}`} onClick={() => setCategory(c)}>{c} ({docs.filter((d) => d.category === c).length})</button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="wg-card" style={{ textAlign: "center", padding: "50px 24px", border: "1.5px dashed #E7E2D5", borderTop: "1.5px dashed #E7E2D5" }}>
              <FileText size={22} color="#8A8577" style={{ marginBottom: 10 }} />
              <p style={{ fontSize: 12.5, color: "#8A8577", marginBottom: 14 }}>
                {docs.length === 0 ? "No documents uploaded yet." : "No documents match your search/filter."}
              </p>
              <button className="wg-primary-btn" style={{ margin: "0 auto" }} onClick={() => setShowUploadModal(true)}><Upload size={14} /> Upload Your First Document</button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {filtered.map((d) => (
                <div className="wg-card" key={d.id}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 9 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: "#F4EDE0", color: "#B58A4A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FileText size={16} /></div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1D1E1A" }}>{d.name}</div>
                        <div style={{ fontSize: 10.5, color: "#8A8577" }}>{d.category}{d.vendor && ` · ${d.vendor}`}</div>
                      </div>
                    </div>
                    <button className="wg-icon-btn" onClick={() => removeDocument(d.id)} title="Delete"><Trash2 size={12} /></button>
                  </div>

                  <div style={{ fontSize: 10.5, color: "#8A8577", marginBottom: 10 }}>Uploaded {d.uploadedDate}</div>

                  {d.requiresSignature && (
                    <div style={{ marginBottom: 10 }}>
                      {d.signed ? (
                        <span className="wg-status-pill" style={{ background: "#E7EDE4", color: "#5F7A5A" }}>Signed by {d.signed.name} · {d.signed.date}</span>
                      ) : (
                        <span className="wg-status-pill" style={{ background: "#F4EDE0", color: "#B58A4A" }}>Awaiting Signature</span>
                      )}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button className="wg-secondary-btn" onClick={() => setPreviewDoc(d)}><Eye size={12} /> View</button>
                    <a className="wg-secondary-btn" href={d.fileUrl} download={d.fileName}><Download size={12} /> Download</a>
                    {d.requiresSignature && !d.signed && (
                      <button className="wg-secondary-btn" style={{ background: "#F4EDE0", borderColor: "#E7D6B8", color: "#B58A4A" }} onClick={() => setShowSignModal(d.id)}><PenTool size={12} /> Sign</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      {showUploadModal && (
        <div className="wg-modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="wg-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wg-modal-head">
              <span className="wg-modal-title">Upload Document</span>
              <button className="wg-modal-close" onClick={() => setShowUploadModal(false)}><X size={16} /></button>
            </div>

            <label className="wg-upload-drop" style={{ display: "block", marginBottom: 14 }}>
              <Upload size={18} style={{ marginBottom: 6 }} />
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{form.fileName || "Click to choose a file"}</div>
              <input type="file" style={{ display: "none" }} onChange={(e) => handleFilePick(e.target.files?.[0])} />
            </label>

            <div className="wg-field"><label>Document Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="wg-field">
              <label>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="wg-field"><label>Related Vendor (optional)</label><input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} /></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <input type="checkbox" checked={form.requiresSignature} onChange={(e) => setForm({ ...form, requiresSignature: e.target.checked })} id="reqsig" />
              <label htmlFor="reqsig" style={{ fontSize: 12.5, color: "#1D1E1A", cursor: "pointer" }}>This document requires a signature</label>
            </div>
            <button className="wg-primary-btn" style={{ width: "100%", justifyContent: "center" }} onClick={addDocument}>Upload</button>
          </div>
        </div>
      )}

      {showSignModal && (
        <div className="wg-modal-overlay" onClick={() => setShowSignModal(null)}>
          <div className="wg-modal" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
            <div className="wg-modal-head">
              <span className="wg-modal-title">Sign Document</span>
              <button className="wg-modal-close" onClick={() => setShowSignModal(null)}><X size={16} /></button>
            </div>
            <p style={{ fontSize: 11.5, color: "#8A8577", marginBottom: 14 }}>
              Type your full name below as your electronic signature. This is a typed signature captured in your portal — it isn't routed through a legal e-signature provider.
            </p>
            <div className="wg-field"><label>Full Name</label><input value={signatureName} onChange={(e) => setSignatureName(e.target.value)} placeholder="Type your name" /></div>
            <div className="wg-sig-canvas">{signatureName || "Your signature preview"}</div>
            <button className="wg-primary-btn" style={{ width: "100%", justifyContent: "center", marginTop: 14 }} onClick={signDocument}>Sign & Submit</button>
          </div>
        </div>
      )}

      {previewDoc && (
        <div className="wg-modal-overlay" onClick={() => setPreviewDoc(null)}>
          <div className="wg-modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="wg-modal-head">
              <span className="wg-modal-title">{previewDoc.name}</span>
              <button className="wg-modal-close" onClick={() => setPreviewDoc(null)}><X size={16} /></button>
            </div>
            {previewDoc.fileType?.startsWith("image/") ? (
              <img src={previewDoc.fileUrl} alt={previewDoc.name} style={{ width: "100%", borderRadius: 10, border: "1px solid #E7E2D5" }} />
            ) : previewDoc.fileType === "application/pdf" ? (
              <iframe src={previewDoc.fileUrl} title={previewDoc.name} style={{ width: "100%", height: 420, border: "1px solid #E7E2D5", borderRadius: 10 }} />
            ) : (
              <div style={{ background: "#FBFAF6", borderRadius: 10, padding: 30, textAlign: "center", color: "#8A8577", fontSize: 12.5 }}>
                <FileText size={22} style={{ marginBottom: 8 }} />
                <div>{previewDoc.fileName}</div>
                <div style={{ fontSize: 10.5, marginTop: 4 }}>No inline preview for this file type — use Download to open it.</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
