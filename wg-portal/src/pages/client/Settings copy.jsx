import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBudgetData } from "../../context/BudgetDataContext.jsx";
import { useWeddingProfile } from "../../context/WeddingProfileContext.jsx";
import {
  Home, Wallet, Users, CreditCard, CalendarClock, NotebookPen, ClipboardList,
  Table2, Palette, FolderOpen, PhoneCall, Settings as SettingsIcon,
  ChevronDown, ChevronRight, CalendarDays, LayoutGrid,
  User, Bell, Shield, Sliders, Lock, Check, AlertTriangle,
} from "lucide-react";

const COUPLE_DEFAULT = "Shrestha & Nishanth";
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
  { id: "settings", label: "Settings", icon: SettingsIcon, finished: true },
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

const SETTINGS_SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "preferences", label: "Wedding Preferences", icon: CalendarDays },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "theme", label: "Theme", icon: Sliders },
  { id: "account", label: "Account", icon: Lock },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "customization", label: "Portal Customization", icon: Palette },
];

const WEDDING_TYPES = ["Not specified", "Telugu Wedding", "Tamil Wedding", "Gujarati Wedding", "Punjabi Wedding", "Marathi Wedding", "Bengali Wedding", "Reception Only", "Destination Wedding", "Other"];

function Toggle({ on, onClick }) {
  return (
    <div onClick={onClick} style={{ width: 38, height: 22, borderRadius: 100, background: on ? "#5F7A5A" : "#E7E2D5", cursor: "pointer", position: "relative", transition: "background 0.15s ease", flexShrink: 0 }}>
      <div style={{ width: 18, height: 18, borderRadius: 100, background: "#fff", position: "absolute", top: 2, left: on ? 18 : 2, transition: "left 0.15s ease", boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }} />
    </div>
  );
}

function SavedBadge({ show }) {
  if (!show) return null;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 600, color: "#5F7A5A", marginLeft: 10 }}><Check size={13} /> Saved</span>;
}

// Full-resolution phone photos can be several MB as base64 text, which can
// silently exceed localStorage's ~5-10MB quota and fail to save at all. This
// shrinks any uploaded image down to a small, safe size before storing it.
function resizeImageFile(file, maxDimension = 300, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not read that image."));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarView, setSidebarView] = useState("feature");
  const [sidebarTheme_, setSidebarTheme_] = useState("light");
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [expandedNavEvents, setExpandedNavEvents] = useState({});
  const [weddingSwitcherOpen, setWeddingSwitcherOpen] = useState(false);

  const [section, setSection] = useState("profile");
  const [savedFlags, setSavedFlags] = useState({});

  const [profile, setProfile] = useState({ email: "", phone: "" });
  const { profile: weddingProfile, updateProfile } = useWeddingProfile();
  const [prefs, setPrefs] = useState({ weddingType: "Not specified", guestEstimate: "" });
  const { timelineGeniusLink, setTimelineGeniusLink } = useBudgetData();
  const [notif, setNotif] = useState({ email: true, sms: false, payments: true, meetings: true, vendorUpdates: true });
  const [account, setAccount] = useState({ loginEmail: "", newPassword: "", confirmPassword: "" });
  const [passwordError, setPasswordError] = useState("");
  const [privacy, setPrivacy] = useState({ shareGuestListWithVendors: false, allowPlannerPhotoSharing: true });
  const [accent, setAccent] = useState("champagne");
  const [defaultSidebarView, setDefaultSidebarView] = useState("feature");

  const daysLeft = Math.max(0, Math.ceil((WEDDING_DATE.getTime() - Date.now()) / 86400000));
  const weddingDateLabel = WEDDING_DATE.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  function markSaved(key) {
    setSavedFlags((f) => ({ ...f, [key]: true }));
    setTimeout(() => setSavedFlags((f) => ({ ...f, [key]: false })), 2000);
  }
  function savePassword() {
    setPasswordError("");
    if (!account.newPassword) { setPasswordError("Enter a new password."); return; }
    if (account.newPassword !== account.confirmPassword) { setPasswordError("Passwords don't match."); return; }
    setAccount((a) => ({ ...a, newPassword: "", confirmPassword: "" }));
    markSaved("account");
  }

  const ACCENTS = [
    { id: "champagne", label: "Champagne Gold", color: "#B58A4A" },
    { id: "sage", label: "Sage Green", color: "#5F7A5A" },
    { id: "bordeaux", label: "Bordeaux", color: "#6B2A3A" },
  ];

  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100vh", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif", background: "#F6F4EF", color: "#26261F" }}>
      <style>{`
        .wg-card { background:#FFFFFF; border:1px solid #E7E2D5; border-top:3px solid #B58A4A; border-radius:14px; padding:22px 24px; margin-bottom:16px; }
        .wg-primary-btn { display:flex; align-items:center; gap:7px; background:#B58A4A; color:#1D1E1A; border:none; border-radius:9px; padding:9px 16px; font-size:12.5px; font-weight:700; cursor:pointer; }
        .wg-primary-btn:hover { background:#a37b40; }
        .wg-danger-btn { display:flex; align-items:center; gap:7px; background:#F3E6E8; color:#6B2A3A; border:1px solid #E8C9CE; border-radius:9px; padding:9px 16px; font-size:12.5px; font-weight:700; cursor:pointer; }
        .wg-field { margin-bottom:14px; max-width:420px; }
        .wg-field label { display:block; font-size:11px; font-weight:600; color:#8A8577; margin-bottom:5px; text-transform:uppercase; letter-spacing:0.04em; }
        .wg-field input, .wg-field select { width:100%; border:1px solid #E7E2D5; border-radius:8px; padding:9px 11px; font-size:12.5px; outline:none; box-sizing:border-box; font-family:inherit; }
        .wg-row-toggle { display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid #E7E2D5; max-width:520px; }
        .wg-row-toggle:last-child { border-bottom:none; }
        .wg-row-toggle-label { font-size:13px; font-weight:600; color:#1D1E1A; }
        .wg-row-toggle-sub { font-size:11.5px; color:#8A8577; margin-top:2px; }
        .wg-nav-settings-btn { display:flex; align-items:center; gap:9px; width:100%; padding:10px 12px; border-radius:8px; border:none; background:transparent; font-size:12.5px; font-weight:600; color:#8A8577; cursor:pointer; text-align:left; }
        .wg-nav-settings-btn.active { background:#F4EDE0; color:#B58A4A; }
        .wg-section-title { font-size:16px; font-weight:700; color:#1D1E1A; margin-bottom:4px; }
        .wg-section-sub { font-size:12px; color:#8A8577; margin-bottom:18px; }
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
                    <div style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{weddingProfile.coupleNames}</div>
                  </div>
                  </div>
                  <ChevronDown size={13} color={t.muted} />
                </button>
                {weddingSwitcherOpen && (
                  <div style={{ position: "absolute", top: "105%", left: 0, right: 0, background: "#FFFFFF", border: `1px solid ${t.border}`, borderRadius: 8, boxShadow: "0 8px 20px rgba(0,0,0,0.12)", zIndex: 40, padding: 6 }}>
                    <div style={{ padding: "7px 8px", fontSize: 12, fontWeight: 600, color: t.activeText, background: t.activeBg, borderRadius: 6 }}>✓ {weddingProfile.coupleNames}</div>
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
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: t.text }}>{weddingProfile.coupleNames}</div>
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

      <main style={{ flex: 1, minWidth: 0, padding: "40px 56px 72px" }}>
        <div style={{ maxWidth: 1920, margin: "0 auto" }}>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 23, fontWeight: 700, color: "#1D1E1A", letterSpacing: "-0.01em" }}>Settings</div>
            <div style={{ fontSize: 12, color: "#8A8577", marginTop: 2 }}>Manage your profile, preferences, and how the portal looks and notifies you.</div>
          </div>

          <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
            <div style={{ width: 220, flexShrink: 0, background: "#FFFFFF", border: "1px solid #E7E2D5", borderRadius: 14, padding: 10 }}>
              {SETTINGS_SECTIONS.map((s) => {
                const Icon = s.icon;
                return (
                  <button key={s.id} className={`wg-nav-settings-btn${section === s.id ? " active" : ""}`} onClick={() => setSection(s.id)}>
                    <Icon size={14} /> {s.label}
                  </button>
                );
              })}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>

              {section === "profile" && (
                <div className="wg-card">
                  <div className="wg-section-title">Profile</div>
                  <div className="wg-section-sub">Basic information for the couple on this wedding.</div>
                  <div className="wg-field"><label>Couple Names</label><input value={weddingProfile.coupleNames} onChange={(e) => updateProfile({ coupleNames: e.target.value })} /></div>
                  <div className="wg-field"><label>Contact Email</label><input placeholder="Not added yet" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></div>
                  <div className="wg-field"><label>Contact Phone</label><input placeholder="Not added yet" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
                  <button className="wg-primary-btn" onClick={() => markSaved("profile")}>Save Profile</button>
                  <SavedBadge show={savedFlags.profile} />
                </div>
              )}

              {section === "preferences" && (
                <div className="wg-card">
                  <div className="wg-section-title">Wedding Preferences</div>
                  <div className="wg-section-sub">Core details this wedding is built around.</div>

                  <div style={{ display: "flex", alignItems: "center", gap: 18, background: "#FBFAF6", border: "1px solid #E7E2D5", borderRadius: 12, padding: "16px 18px", marginBottom: 22, maxWidth: 480 }}>
                    <div style={{
                      width: weddingProfile.couplePhotoSize || 60, height: weddingProfile.couplePhotoSize || 60, borderRadius: "50%", flexShrink: 0, overflow: "hidden",
                      background: "linear-gradient(135deg, #F4EDE0, #EAD9BC)", border: "2.5px solid #E7D6B8",
                      display: "flex", alignItems: "center", justifyContent: "center", transition: "width 0.15s ease, height 0.15s ease",
                    }}>
                      {weddingProfile.couplePhotoUrl ? (
                        <img src={weddingProfile.couplePhotoUrl} alt="Couple" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontSize: Math.round((weddingProfile.couplePhotoSize || 60) * 0.35) }}>❤️</span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#1D1E1A", marginBottom: 2 }}>Couple Photo</div>
                      <div style={{ fontSize: 11, color: "#8A8577", marginBottom: 10 }}>Shows in the header at the top of every page. Saves automatically.</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                        <label className="wg-primary-btn" style={{ cursor: "pointer" }}>
                          {weddingProfile.couplePhotoUrl ? "Replace Photo" : "Upload Photo"}
                          <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const small = await resizeImageFile(file);
                              updateProfile({ couplePhotoUrl: small });
                            } catch (err) {
                              alert("That photo couldn't be saved — try a different image.");
                            }
                          }} />
                        </label>
                        {weddingProfile.couplePhotoUrl && (
                          <button className="wg-danger-btn" onClick={() => updateProfile({ couplePhotoUrl: "" })}>Remove Photo</button>
                        )}
                      </div>
                      <div>
                        <label style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 600, color: "#8A8577", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
                          <span>Photo Size</span><span style={{ fontFamily: "ui-monospace,monospace", color: "#B58A4A" }}>{weddingProfile.couplePhotoSize || 60}px</span>
                        </label>
                        <input
                          type="range" min="48" max="140" step="2"
                          value={weddingProfile.couplePhotoSize || 60}
                          onChange={(e) => updateProfile({ couplePhotoSize: Number(e.target.value) })}
                          style={{ width: "100%", maxWidth: 220, accentColor: "#B58A4A", cursor: "pointer" }}
