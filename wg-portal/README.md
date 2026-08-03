# White Glove Events — Client Portal (Vite + React)

A real, runnable React app for the White Glove Events wedding planning platform.

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

To build for production:

```bash
npm run build
npm run preview
```

**Verified before packaging:** `npm install` completes cleanly (114 packages),
`npm run build` compiles with zero errors (2309 modules transformed), and
`npm run dev` boots and serves the app. A static audit was also run across
every `.jsx` file checking for undefined component references — all clean.

## Routes

**Client Portal** (single wedding — Shrestha & Nishanth, Aug 22, 2026)
- `/portal/dashboard` — Home dashboard
- `/portal/budget` — Full budget module (live expense tracking, charts, health score)
- `/portal/vendors` — Full Vendor CRM (library, assignment, contracts, COIs, pricing history)
- `/portal/payments`, `/timeline`, `/meetings`, `/guestlist`, `/seating`, `/design`, `/documents`, `/contacts`, `/settings` — placeholder "coming soon" pages; sidebar nav is fully wired, just no page built yet

**Planner Admin Portal** (studio-wide, manages all weddings)
- `/admin/dashboard` — Studio dashboard: KPIs, client roster, vendor library preview
- `/admin/weddings` — All Weddings: card/table views, search, filters, Duplicate Wedding
- `/admin/vendors` — Standalone Global Vendor Library browser
- `/admin/calendar`, `/tasks`, `/payments`, `/analytics`, `/notifications`, `/settings` — placeholder pages

Root `/` redirects to `/portal/dashboard`.

## What's real vs. placeholder

- **Sidebar navigation is real** — every click actually routes via React Router; the active highlight follows the real URL.
- **Budget and Vendors pages are fully interactive** — add expenses, assign vendors, upload files (stored as in-memory object URLs, not persisted), export to Excel, etc.
- **Data does not persist** between page loads or across users — everything lives in local React state per component. Connecting this to a real backend (a database + auth) is the next major step for turning this into a multi-user product; see the note in the original design-system.md about Airtable+Softr vs. a custom backend.
- **Demo library data**: two vendors ("Seema Verma," "Mahen Photography") are seeded in Vendors.jsx and VendorLibrary.jsx as clearly-commented placeholders for demonstrating the assignment flow — not confirmed real vendor records.

## Known limitation

The production bundle is a single ~1MB JS file (Vite warns about this). It
works fine but could be code-split by route later for faster initial loads
— not necessary at this stage, worth revisiting once there are more pages.
