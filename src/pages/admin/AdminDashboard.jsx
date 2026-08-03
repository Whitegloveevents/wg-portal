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
  Copy,
  Archive,
  ArrowRight,
  Wallet,
  CheckSquare,
  Clock,
} from "lucide-react";

/* ---------------------------------------------------------
   White Glove Events — PLANNER ADMIN PORTAL
   Page 1: Admin Dashboard (studio-wide view of all weddings)
   Shares the same design system as the client portal.
   Real client on file: Shrestha & Nishanth (Aug 22, 2026)
--------------------------------------------------------- */

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "weddings", label: "All Weddings", icon: Users },
  { id: "vendors", label: "Vendor Database", icon: BookUser },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

// The only real client on file right now.
const CLIENTS = [
  {
    id: "shrestha-nishanth",
    names: "Shrestha & Nishanth",
    date: "Aug 22, 2026",
    initials: "S&N",
    progress: 0,
    health: "Getting Started",
    budgetLabel: "Not added yet",
    nextMeeting: "Not scheduled",
    outstanding: "—",
  },
];

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

function EmptyState({ text, cta }) {
  return (
    <div className="wg-empty">
      <p>{text}</p>
      {cta && <span className="wg-empty-cta">{cta}</span>}
    </div>
  );
}

function ClientCard({ client }) {
  return (
    <div className="wg-client-card">
      <div className="wg-client-top">
        <div className="wg-client-avatar">{client.initials}</div>
        <div className="wg-client-actions">
          <button className="wg-icon-btn" title="Duplicate as template"><Copy size={13} strokeWidth={1.75} /></button>
          <button className="wg-icon-btn" title="Archive wedding"><Archive size={13} strokeWidth={1.75} /></button>
        </div>
      </div>
      <div className="wg-client-name">{client.names}</div>
      <div className="wg-client-date">{client.date}</div>

      <div className="wg-client-progress">
        <div className="wg-progress-track"><div className="wg-progress-fill" style={{ width: `${client.progress}%` }} /></div>
        <span className="wg-progress-pct">{client.progress}%</span>
      </div>

      <div className="wg-client-meta-grid">
        <div className="wg-client-meta">
          <span className="wg-client-meta-label">Health</span>
          <span className="wg-client-meta-value">{client.health}</span>
        </div>
        <div className="wg-client-meta">
          <span className="wg-client-meta-label">Budget</span>
          <span className="wg-client-meta-value">{client.budgetLabel}</span>
        </div>
        <div className="wg-client-meta">
          <span className="wg-client-meta-label">Next Meeting</span>
          <span className="wg-client-meta-value">{client.nextMeeting}</span>
        </div>
        <div className="wg-client-meta">
          <span className="wg-client-meta-label">Outstanding</span>
          <span className="wg-client-meta-value">{client.outstanding}</span>
        </div>
      </div>

      <button className="wg-view-portal-btn">
        View Portal <ArrowRight size={13} strokeWidth={2} />
      </button>
    </div>
  );
}

function NewWeddingTile() {
  return (
    <div className="wg-new-client-card">
      <div className="wg-new-client-icon"><Plus size={20} strokeWidth={1.75} /></div>
      <div className="wg-new-client-text">Create New Wedding</div>
      <div className="wg-new-client-sub">Start from the standard template</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredClients = CLIENTS.filter((c) =>
    c.names.toLowerCase().includes(query.toLowerCase())
  );

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
        .wg-utilitybar { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 18px; flex-wrap: wrap; }
        .wg-page-title { font-size: 23px; font-weight: 700; color: var(--ink); letter-spacing: -0.01em; }
        .wg-utility-right { display: flex; align-items: center; gap: 10px; flex: 1; justify-content: flex-end; flex-wrap: wrap; }
        .wg-search { display: flex; align-items: center; gap: 8px; background: var(--surface); border: 1px solid var(--line); border-radius: 9px; padding: 8px 12px; width: 220px; color: var(--stone); }
        .wg-search input { border: none; outline: none; background: transparent; font-size: 12.5px; color: var(--text); width: 100%; font-family: 'Inter', sans-serif; }
        .wg-utility-icon-btn { width: 32px; height: 32px; border-radius: 9px; background: var(--surface); border: 1px solid var(--line); display: flex; align-items: center; justify-content: center; color: var(--stone); cursor: pointer; flex-shrink: 0; }
        .wg-primary-btn { display: flex; align-items: center; gap: 7px; background: var(--champagne); color: var(--ink); border: none; border-radius: 9px; padding: 9px 15px; font-size: 12.5px; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .wg-primary-btn:hover { background: #a37b40; }

        .wg-kpi-strip { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 22px; }
        .wg-kpi { background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 13px 15px; display: flex; flex-direction: column; gap: 6px; }
        .wg-kpi-top { display: flex; align-items: center; gap: 6px; }
        .wg-kpi-label { font-size: 10px; color: var(--stone); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
        .wg-kpi-value { font-family: 'IBM Plex Mono', monospace; font-size: 20px; color: var(--ink); font-weight: 500; }
        .wg-kpi-sub { font-size: 10px; color: var(--stone); }

        .wg-section-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 12px; }
        .wg-section-title { font-size: 14.5px; font-weight: 700; color: var(--ink); }
        .wg-section-count { font-size: 11.5px; color: var(--stone); }

        .wg-client-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 22px; }

        .wg-client-card { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 16px; display: flex; flex-direction: column; }
        .wg-client-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .wg-client-avatar { width: 36px; height: 36px; border-radius: 100px; background: var(--champagne-wash); color: var(--champagne); font-family: 'Fraunces', serif; font-size: 13px; display: flex; align-items: center; justify-content: center; }
        .wg-client-actions { display: flex; gap: 6px; }
        .wg-icon-btn { width: 26px; height: 26px; border-radius: 7px; background: var(--paper); border: 1px solid var(--line); color: var(--stone); display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .wg-icon-btn:hover { color: var(--champagne); border-color: var(--champagne); }
        .wg-client-name { font-size: 14px; font-weight: 700; color: var(--ink); }
        .wg-client-date { font-size: 11.5px; color: var(--stone); margin-bottom: 12px; }
        .wg-client-progress { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
        .wg-progress-track { flex: 1; height: 5px; border-radius: 4px; background: var(--paper); overflow: hidden; }
        .wg-progress-fill { height: 100%; background: var(--sage); }
        .wg-progress-pct { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--ink); }
        .wg-client-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
        .wg-client-meta { display: flex; flex-direction: column; gap: 2px; }
        .wg-client-meta-label { font-size: 9.5px; color: var(--stone); text-transform: uppercase; letter-spacing: 0.05em; }
        .wg-client-meta-value { font-size: 12px; color: var(--ink); font-weight: 600; }
        .wg-view-portal-btn { display: flex; align-items: center; justify-content: center; gap: 6px; background: var(--paper); border: 1px solid var(--line); border-radius: 8px; padding: 8px; font-size: 12px; font-weight: 600; color: var(--ink); cursor: pointer; margin-top: auto; }
        .wg-view-portal-btn:hover { border-color: var(--champagne); color: var(--champagne); }

        .wg-new-client-card { border: 1.5px dashed var(--line); border-radius: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 30px 16px; cursor: pointer; color: var(--stone); text-align: center; }
        .wg-new-client-card:hover { border-color: var(--champagne); color: var(--champagne); }
        .wg-new-client-icon { width: 34px; height: 34px; border-radius: 100px; background: var(--champagne-wash); color: var(--champagne); display: flex; align-items: center; justify-content: center; margin-bottom: 4px; }
        .wg-new-client-text { font-size: 13px; font-weight: 700; color: var(--ink); }
        .wg-new-client-sub { font-size: 11px; color: var(--stone); }

        .wg-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .wg-card { background: var(--surface); border: 1px solid var(--line); border-top: 3px solid var(--champagne); border-radius: 14px; padding: 18px 20px; display: flex; flex-direction: column; min-width: 0; }
        .wg-card-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
        .wg-card-icon { width: 24px; height: 24px; border-radius: 7px; background: var(--paper); color: var(--stone); display: flex; align-items: center; justify-content: center; }
        .wg-card-head h3 { font-size: 12px; font-weight: 600; color: var(--ink); }
        .wg-card-body { flex: 1; }
        .wg-empty p { font-size: 11.5px; color: var(--stone); margin-bottom: 4px; }
        .wg-empty-cta { font-size: 11px; color: var(--champagne); font-weight: 600; cursor: pointer; }

        @media (max-width: 1150px) {
          .wg-kpi-strip { grid-template-columns: repeat(3, 1fr); }
          .wg-client-grid { grid-template-columns: repeat(2, 1fr); }
          .wg-row { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 720px) {
          .wg-sidebar { display: none; }
          .wg-sidebar.wg-sidebar-mobile-open { display: flex; position: fixed; z-index: 30; left: 0; top: 0; }
          .wg-mobile-bar { display: flex; }
          .wg-mobile-overlay.open { display: block; }
          .wg-main { padding: 18px 14px 48px; }
          .wg-kpi-strip { grid-template-columns: repeat(2, 1fr); }
          .wg-client-grid, .wg-row { grid-template-columns: 1fr; }
          .wg-search { width: 100%; }
          .wg-utility-right { width: 100%; justify-content: space-between; }
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
                className={`wg-nav-item${item.id === "dashboard" ? " active" : ""}`}
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
          <div className="wg-page-title">Studio Dashboard</div>
          <div className="wg-utility-right">
            <div className="wg-search">
              <Search size={14} strokeWidth={1.75} />
              <input
                placeholder="Search clients..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button className="wg-primary-btn"><Plus size={14} strokeWidth={2.2} /> Create New Wedding</button>
            <div className="wg-utility-icon-btn"><Bell size={15} strokeWidth={1.75} /></div>
            <div className="wg-utility-icon-btn"><Settings size={15} strokeWidth={1.75} /></div>
          </div>
        </div>

        {/* Studio-wide KPI strip */}
        <div className="wg-kpi-strip">
          <div className="wg-kpi">
            <div className="wg-kpi-top"><Users size={12} color="#8A8577" /><span className="wg-kpi-label">Active Weddings</span></div>
            <div className="wg-kpi-value">{CLIENTS.length}</div>
            <div className="wg-kpi-sub">Currently in planning</div>
          </div>
          <div className="wg-kpi">
            <div className="wg-kpi-top"><CalendarDays size={12} color="#8A8577" /><span className="wg-kpi-label">Upcoming (30 Days)</span></div>
            <div className="wg-kpi-value">0</div>
            <div className="wg-kpi-sub">Weddings in next 30 days</div>
          </div>
          <div className="wg-kpi">
            <div className="wg-kpi-top"><Wallet size={12} color="#8A8577" /><span className="wg-kpi-label">Outstanding Payments</span></div>
            <div className="wg-kpi-value">—</div>
            <div className="wg-kpi-sub">Across all clients</div>
          </div>
          <div className="wg-kpi">
            <div className="wg-kpi-top"><CheckSquare size={12} color="#8A8577" /><span className="wg-kpi-label">Tasks Due Today</span></div>
            <div className="wg-kpi-value">0</div>
            <div className="wg-kpi-sub">Nothing due yet</div>
          </div>
          <div className="wg-kpi">
            <div className="wg-kpi-top"><Clock size={12} color="#8A8577" /><span className="wg-kpi-label">Meetings This Week</span></div>
            <div className="wg-kpi-value">0</div>
            <div className="wg-kpi-sub">None scheduled</div>
          </div>
        </div>

        {/* Client roster */}
        <div className="wg-section-head">
          <span className="wg-section-title">Your Weddings</span>
          <span className="wg-section-count">{filteredClients.length} of {CLIENTS.length}</span>
        </div>
        <div className="wg-client-grid">
          {filteredClients.map((c) => (
            <ClientCard key={c.id} client={c} />
          ))}
          <NewWeddingTile />
        </div>

        {/* Secondary studio-wide widgets */}
        <div className="wg-row">
          <Card title="Preferred Vendor Library" icon={BookUser}>
            <EmptyState text="No preferred vendors saved yet." cta="Add a vendor →" />
          </Card>
          <Card title="Upcoming Meetings — All Clients" icon={CalendarDays}>
            <EmptyState text="No meetings scheduled across any wedding." cta="Schedule one →" />
          </Card>
          <Card title="Studio Analytics" icon={BarChart3}>
            <EmptyState text="Analytics will appear once you have booking and revenue data." />
          </Card>
        </div>
        </div>
      </main>
    </div>
  );
}
