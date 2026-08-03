import React, { useState } from "react";
import {
  Home,
  Users,
  BookUser,
  CalendarDays,
  BarChart3,
  Bell,
  Settings,
  Search,
  Plus,
  Star,
  Phone,
  Mail,
  Globe,
} from "lucide-react";

/* ---------------------------------------------------------
   White Glove Events — PLANNER ADMIN PORTAL
   Page: Global Vendor Library
   Reusable vendor records — select once, reuse on every wedding.
--------------------------------------------------------- */

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "weddings", label: "All Weddings", icon: Users },
  { id: "vendors", label: "Vendor Library", icon: BookUser },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

const CATEGORIES = [
  "All", "Venue", "Catering", "Décor", "Photography", "Videography",
  "DJ / Entertainment", "Beauty", "Florals", "Rentals", "Transportation", "Attire",
];

// No vendors added yet — real records require at least a name + contact info.
const VENDORS = [];

function EmptyLibraryState() {
  return (
    <div className="wg-empty-library">
      <div className="wg-empty-library-icon"><BookUser size={22} strokeWidth={1.5} /></div>
      <div className="wg-empty-library-title">Your vendor library is empty</div>
      <div className="wg-empty-library-text">
        Add a vendor once — their contact info, contract, and insurance stay on file.
        From then on, assigning them to any wedding is a single click instead of re-entering everything.
      </div>
      <button className="wg-primary-btn"><Plus size={14} strokeWidth={2.2} /> Add Your First Vendor</button>
    </div>
  );
}

function VendorCard({ vendor }) {
  return (
    <div className="wg-vendor-card">
      <div className="wg-vendor-top">
        <div className="wg-vendor-avatar">{vendor.initials}</div>
        {vendor.preferred && (
          <span className="wg-preferred-badge"><Star size={11} strokeWidth={0} fill="#B58A4A" /> Preferred</span>
        )}
      </div>
      <div className="wg-vendor-name">{vendor.name}</div>
      <div className="wg-vendor-category">{vendor.category}</div>
      <div className="wg-vendor-contacts">
        <span><Phone size={12} strokeWidth={1.75} /> {vendor.phone}</span>
        <span><Mail size={12} strokeWidth={1.75} /> {vendor.email}</span>
      </div>
      <div className="wg-vendor-usage">Used in {vendor.weddingCount} wedding{vendor.weddingCount === 1 ? "" : "s"}</div>
      <button className="wg-view-portal-btn">View Profile</button>
    </div>
  );
}

export default function VendorLibrary() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

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

        .wg-sidebar { width: 296px; flex-shrink: 0; background: var(--ink); color: var(--paper); display: flex; flex-direction: column; padding: 22px 14px; position: sticky; top: 0; height: 100vh; }
        .wg-brand { display: flex; align-items: center; gap: 9px; padding: 0 8px 20px 8px; border-bottom: 1px solid rgba(246,244,239,0.1); margin-bottom: 14px; }
        .wg-brand-mark { width: 28px; height: 28px; border-radius: 8px; background: var(--champagne); color: var(--ink); font-family: 'Fraunces', serif; font-size: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .wg-brand-text-name { font-size: 12.5px; font-weight: 600; color: var(--paper); line-height: 1.2; }
        .wg-brand-text-sub { font-size: 10px; color: rgba(246,244,239,0.45); letter-spacing: 0.08em; text-transform: uppercase; }
        .wg-nav { display: flex; flex-direction: column; gap: 1px; flex: 1; }
        .wg-nav-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 7px; color: rgba(246,244,239,0.58); font-size: 12.5px; font-weight: 500; background: transparent; border: none; cursor: pointer; text-align: left; }
        .wg-nav-item:hover { background: rgba(246,244,239,0.06); color: var(--paper); }
        .wg-nav-item.active { background: rgba(181,138,74,0.18); color: var(--champagne-soft); }
        .wg-sidebar-foot { border-top: 1px solid rgba(246,244,239,0.1); margin-top: 10px; padding-top: 12px; display: flex; align-items: center; gap: 9px; }
        .wg-avatar { width: 26px; height: 26px; border-radius: 100px; background: rgba(246,244,239,0.1); color: var(--paper); font-size: 10.5px; font-weight: 600; display: flex; align-items: center; justify-content: center; }
        .wg-sidebar-foot-text { font-size: 11px; color: rgba(246,244,239,0.5); line-height: 1.3; }
        .wg-sidebar-foot-text strong { color: rgba(246,244,239,0.85); font-size: 11.5px; display: block; }

        .wg-mobile-bar { display: none; align-items: center; justify-content: space-between; padding: 13px 16px; background: var(--ink); color: var(--paper); position: sticky; top: 0; z-index: 20; }
        .wg-mobile-bar button { background: transparent; border: none; color: var(--paper); cursor: pointer; display: flex; }
        .wg-mobile-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 29; }

        .wg-main { flex: 1; min-width: 0; padding: 40px 56px 72px; }
        .wg-main-inner { max-width: 1920px; margin: 0 auto; }
        .wg-utilitybar { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
        .wg-page-title { font-size: 23px; font-weight: 700; color: var(--ink); letter-spacing: -0.01em; }
        .wg-page-sub { font-size: 12px; color: var(--stone); margin-top: 2px; }
        .wg-utility-right { display: flex; align-items: center; gap: 10px; }
        .wg-search { display: flex; align-items: center; gap: 8px; background: var(--surface); border: 1px solid var(--line); border-radius: 9px; padding: 8px 12px; width: 220px; color: var(--stone); }
        .wg-search input { border: none; outline: none; background: transparent; font-size: 12.5px; color: var(--text); width: 100%; font-family: 'Inter', sans-serif; }
        .wg-primary-btn { display: flex; align-items: center; gap: 7px; background: var(--champagne); color: var(--ink); border: none; border-radius: 9px; padding: 9px 15px; font-size: 12.5px; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .wg-primary-btn:hover { background: #a37b40; }

        .wg-category-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
        .wg-category-tab { padding: 7px 13px; border-radius: 100px; background: var(--surface); border: 1px solid var(--line); font-size: 11.5px; font-weight: 600; color: var(--stone); cursor: pointer; }
        .wg-category-tab.active { background: var(--champagne-wash); border-color: var(--champagne-soft); color: var(--champagne); }

        .wg-vendor-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }

        .wg-vendor-card { background: var(--surface); border: 1px solid var(--line); border-top: 3px solid var(--champagne); border-radius: 14px; padding: 18px 20px; display: flex; flex-direction: column; }
        .wg-vendor-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .wg-vendor-avatar { width: 34px; height: 34px; border-radius: 100px; background: var(--champagne-wash); color: var(--champagne); font-family: 'Fraunces', serif; font-size: 12px; display: flex; align-items: center; justify-content: center; }
        .wg-preferred-badge { display: flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 700; color: var(--champagne); background: var(--champagne-wash); padding: 3px 8px; border-radius: 100px; }
        .wg-vendor-name { font-size: 14px; font-weight: 700; color: var(--ink); }
        .wg-vendor-category { font-size: 11px; color: var(--stone); margin-bottom: 10px; }
        .wg-vendor-contacts { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
        .wg-vendor-contacts span { display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: var(--text); }
        .wg-vendor-usage { font-size: 10.5px; color: var(--stone); margin-bottom: 12px; }
        .wg-view-portal-btn { display: flex; align-items: center; justify-content: center; gap: 6px; background: var(--paper); border: 1px solid var(--line); border-radius: 8px; padding: 8px; font-size: 12px; font-weight: 600; color: var(--ink); cursor: pointer; margin-top: auto; }
        .wg-view-portal-btn:hover { border-color: var(--champagne); color: var(--champagne); }

        .wg-empty-library { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 60px 30px; background: var(--surface); border: 1.5px dashed var(--line); border-radius: 16px; }
        .wg-empty-library-icon { width: 48px; height: 48px; border-radius: 100px; background: var(--champagne-wash); color: var(--champagne); display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
        .wg-empty-library-title { font-size: 15px; font-weight: 700; color: var(--ink); margin-bottom: 8px; }
        .wg-empty-library-text { font-size: 12.5px; color: var(--stone); max-width: 420px; line-height: 1.6; margin-bottom: 18px; }

        @media (max-width: 1150px) { .wg-vendor-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 720px) {
          .wg-sidebar { display: none; }
          .wg-sidebar.wg-sidebar-mobile-open { display: flex; position: fixed; z-index: 30; left: 0; top: 0; }
          .wg-mobile-bar { display: flex; }
          .wg-mobile-overlay.open { display: block; }
          .wg-main { padding: 18px 14px 48px; }
          .wg-vendor-grid { grid-template-columns: 1fr; }
          .wg-search { width: 100%; }
          .wg-utilitybar { flex-direction: column; align-items: flex-start; }
          .wg-utility-right { width: 100%; }
        }
      `}</style>

      <div className="wg-mobile-bar">
        <button aria-label="Open menu" onClick={() => setMobileOpen(true)}>
          <Home size={20} />
        </button>
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
              <button
                key={item.id}
                className={`wg-nav-item${item.id === "vendors" ? " active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={16} strokeWidth={1.75} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="wg-sidebar-foot">
          <div className="wg-avatar">WG</div>
          <div className="wg-sidebar-foot-text">
            Signed in as
            <strong>Planner</strong>
          </div>
        </div>
      </aside>

      <main className="wg-main">
        <div className="wg-main-inner">
        <div className="wg-utilitybar">
          <div>
            <div className="wg-page-title">Vendor Library</div>
            <div className="wg-page-sub">Add a vendor once. Assign them to any wedding in one click.</div>
          </div>
          <div className="wg-utility-right">
            <div className="wg-search">
              <Search size={14} strokeWidth={1.75} />
              <input
                placeholder="Search vendors..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button className="wg-primary-btn"><Plus size={14} strokeWidth={2.2} /> Add Vendor</button>
          </div>
        </div>

        <div className="wg-category-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`wg-category-tab${activeCategory === cat ? " active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="wg-vendor-grid">
          {VENDORS.length === 0 ? (
            <EmptyLibraryState />
          ) : (
            VENDORS.map((v) => <VendorCard key={v.id} vendor={v} />)
          )}
        </div>
        </div>
      </main>
    </div>
  );
}
