import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home, Wallet, Users, CalendarClock, NotebookPen, ClipboardList,
  FolderOpen, PhoneCall, Settings, Plus, X, Trash2, Check, ArrowLeft, Mail, Phone,
  ChevronDown, ChevronRight, Pencil,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useBudgetData } from "../../context/BudgetDataContext.jsx";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: Home, finished: true },
  { id: "budget", label: "Budget", icon: Wallet, finished: true },
  { id: "vendors", label: "Vendors", icon: Users, finished: true },
  { id: "timeline", label: "Timeline", icon: CalendarClock, finished: true },
  { id: "meetings", label: "Meeting Notes", icon: NotebookPen, finished: true },
  { id: "guestlist", label: "Guest List", icon: ClipboardList, finished: true },
  { id: "documents", label: "Documents", icon: FolderOpen, finished: true },
  { id: "contacts", label: "Contacts", icon: PhoneCall, finished: true },
  { id: "settings", label: "Settings", icon: Settings, finished: true },
];

const GOLD = "#B58A4A";
const SAGE = "#5F7A5A";
const BORDEAUX = "#6B2A3A";
const STONE = "#8A8577";
const INK = "#1D1E1A";
const LINE = "#E7E2D5";

function sidebarTheme() {
  return { bg: "#FBFAF6", text: "#26261F", muted: STONE, border: LINE, hover: "#F4EDE0", activeBg: "#F4EDE0", activeText: GOLD, logoBg: GOLD, logoText: "#FFFFFF" };
}

function currency(n) {
  const v = Number(n) || 0;
  return `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
function totalPaidOf(item) {
  return (item.payments || []).reduce((s, p) => (p.status === "Paid" ? s + (Number(p.amount) || 0) : s), 0);
}
function finalCostOf(item) {
  return Math.max(0, (Number(item.contractAmount) || 0) - (Number(item.discount) || 0));
}
function remainingOf(item) {
  return Math.max(0, finalCostOf(item) - totalPaidOf(item));
}
function statusOf(item) {
  const hasContract = Number(item.contractAmount) > 0;
  if (!hasContract) return { label: "Quote Pending", color: STONE, dot: "#C9BFA8" };
  const today = new Date();
  const overdue = (item.payments || []).some((p) => p.status !== "Paid" && p.dueDate && new Date(p.dueDate) < today);
  if (overdue) return { label: "Overdue", color: BORDEAUX, dot: BORDEAUX };
  if (remainingOf(item) === 0) return { label: "Fully Paid", color: SAGE, dot: SAGE };
  return { label: "Partial Payment", color: GOLD, dot: GOLD };
}
function lineTotal(l) {
  const price = l.actualPrice !== "" && l.actualPrice != null ? l.actualPrice : l.estPrice;
  return (Number(l.quantity) || 0) * (Number(price) || 0);
}
function eventTotals(ev) {
  const subtotal = (ev.items || []).reduce((s, l) => s + lineTotal(l), 0);
  const tax = subtotal * ((Number(ev.taxPct) || 0) / 100);
  const service = subtotal * ((Number(ev.servicePct) || 0) / 100);
  const delivery = Number(ev.deliveryFee) || 0;
  const discount = Number(ev.discount) || 0;
  const total = Math.max(0, subtotal + tax + service + delivery - discount);
  return { subtotal, tax, service, delivery, discount, total };
}

const PIE_COLORS = [GOLD, SAGE, BORDEAUX, STONE, "#A9BFA2", "#C48A94", "#7E9E93", "#D9C9A3", "#C9BFA8", "#E7D6B8"];
const UNIT_OPTIONS = ["Trays", "Pieces", "Plates", "Guests", "Servings", "Hours", "Days", "Sets", "Each", "Photographers", "Albums", "Flat Rate"];
const CATERING_EVENTS = ["Mehendi", "Haldi", "Sangeet", "Wedding", "Reception", "Other"];
const DECOR_SECTIONS = ["Mandap", "Stage", "Florals", "Entrance Decor", "Centerpieces", "Lighting", "Furniture", "Rentals"];
const PAYMENT_STATUSES = [
  { label: "Upcoming", color: STONE, dot: "#C9BFA8" },
  { label: "Partial", color: GOLD, dot: GOLD },
  { label: "Paid", color: SAGE, dot: SAGE },
  { label: "Overdue", color: BORDEAUX, dot: BORDEAUX },
];

function isCatering(category) { return (category || "").toLowerCase().includes("cater"); }
function isDecor(category) { return (category || "").toLowerCase().includes("decor"); }

function SummaryCard({ label, value, accent, editable, onChange }) {
  return (
    <div style={{ flex: 1, minWidth: 140, background: "#FFFFFF", border: `1px solid ${LINE}`, borderRadius: 12, padding: "12px 14px" }}>
      <div style={{ fontSize: 9.5, color: STONE, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
      {editable ? (
        <input
          type="number" value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ fontSize: 18, fontWeight: 700, color: accent || INK, fontFamily: "Georgia, serif", border: "none", background: "transparent", outline: "none", width: "100%", padding: 0 }}
        />
      ) : (
        <div style={{ fontSize: 18, fontWeight: 700, color: accent || INK, fontFamily: "Georgia, serif" }}>{value}</div>
      )}
    </div>
  );
}

function StatusPill({ status }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, color: status.color }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: status.dot, display: "inline-block" }} />
      {status.label}
    </span>
  );
}

function EventLineItemsSection({ name, event, onChange, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const items = event.items || [];
  const totals = eventTotals(event);

  function updateField(field, value) { onChange({ ...event, [field]: value }); }
  function addItem() {
    updateField("items", [...items, { id: Date.now(), name: "", quantity: "", unit: "Each", estPrice: "", actualPrice: "", notes: "" }]);
  }
  function updateItem(id, field, value) {
    updateField("items", items.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  }
  function removeItem(id) {
    updateField("items", items.filter((l) => l.id !== id));
  }

  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 10, marginBottom: 10, overflow: "hidden" }}>
      <button onClick={() => setOpen((o) => !o)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#FBFAF6", border: "none", cursor: "pointer" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700, color: INK, fontFamily: "Georgia, serif" }}>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />} {name}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: GOLD }}>{currency(totals.total)}</span>
      </button>

      {open && (
        <div style={{ padding: 14 }}>
          {items.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 55px 85px 75px 75px 70px 1.2fr 50px", gap: 4, fontSize: 9.5, color: STONE, textTransform: "uppercase", letterSpacing: "0.03em", padding: "0 4px 4px", borderBottom: `1px solid ${LINE}`, marginBottom: 6 }}>
              <span>Item</span><span>Qty</span><span>Unit</span><span>Est.</span><span>Actual</span><span>Total</span><span>Notes</span><span></span>
            </div>
          )}
          {items.map((l) => (
            <div key={l.id} style={{ display: "grid", gridTemplateColumns: "1.6fr 55px 85px 75px 75px 70px 1.2fr 50px", gap: 4, alignItems: "center", marginBottom: 4 }}>
              <input value={l.name} onChange={(e) => updateItem(l.id, "name", e.target.value)} placeholder="Item" style={{ border: `1px solid ${LINE}`, borderRadius: 5, padding: "5px 6px", fontSize: 11.5, width: "100%", boxSizing: "border-box" }} />
              <input type="number" value={l.quantity} onChange={(e) => updateItem(l.id, "quantity", e.target.value)} style={{ border: `1px solid ${LINE}`, borderRadius: 5, padding: "5px 6px", fontSize: 11.5, width: "100%", boxSizing: "border-box" }} />
              <select value={l.unit} onChange={(e) => updateItem(l.id, "unit", e.target.value)} style={{ border: `1px solid ${LINE}`, borderRadius: 5, padding: "5px 3px", fontSize: 10.5, width: "100%", boxSizing: "border-box" }}>
                {UNIT_OPTIONS.map((u) => <option key={u}>{u}</option>)}
              </select>
              <input type="number" value={l.estPrice} onChange={(e) => updateItem(l.id, "estPrice", e.target.value)} placeholder="$" style={{ border: `1px solid ${LINE}`, borderRadius: 5, padding: "5px 6px", fontSize: 11.5, width: "100%", boxSizing: "border-box" }} />
              <input type="number" value={l.actualPrice} onChange={(e) => updateItem(l.id, "actualPrice", e.target.value)} placeholder="$" style={{ border: `1px solid ${LINE}`, borderRadius: 5, padding: "5px 6px", fontSize: 11.5, width: "100%", boxSizing: "border-box" }} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: INK, textAlign: "right", paddingRight: 4 }}>{currency(lineTotal(l))}</span>
              <input value={l.notes} onChange={(e) => updateItem(l.id, "notes", e.target.value)} placeholder="Notes" style={{ border: `1px solid ${LINE}`, borderRadius: 5, padding: "5px 6px", fontSize: 11, width: "100%", boxSizing: "border-box" }} />
              <div style={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <button onClick={() => removeItem(l.id)} style={{ background: "none", border: "none", color: STONE, cursor: "pointer" }}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
          <button onClick={addItem} style={{ display: "flex", alignItems: "center", gap: 5, background: "#FFFFFF", border: `1px solid ${LINE}`, borderRadius: 6, padding: "5px 10px", fontSize: 10.5, fontWeight: 600, color: STONE, cursor: "pointer", marginTop: 6, marginBottom: 10 }}>
            <Plus size={11} /> Add Item
          </button>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontSize: 11, borderTop: `1px solid ${LINE}`, paddingTop: 8, alignItems: "center" }}>
            <span style={{ color: STONE }}>Subtotal: <strong style={{ color: INK }}>{currency(totals.subtotal)}</strong></span>
            <span style={{ color: STONE, display: "flex", alignItems: "center", gap: 4 }}>Tax %: <input type="number" value={event.taxPct} onChange={(e) => updateField("taxPct", e.target.value)} style={{ width: 42, border: `1px solid ${LINE}`, borderRadius: 4, padding: "2px 4px" }} /></span>
            <span style={{ color: STONE, display: "flex", alignItems: "center", gap: 4 }}>Service %: <input type="number" value={event.servicePct} onChange={(e) => updateField("servicePct", e.target.value)} style={{ width: 42, border: `1px solid ${LINE}`, borderRadius: 4, padding: "2px 4px" }} /></span>
            <span style={{ color: STONE, display: "flex", alignItems: "center", gap: 4 }}>Delivery: <input type="number" value={event.deliveryFee} onChange={(e) => updateField("deliveryFee", e.target.value)} style={{ width: 55, border: `1px solid ${LINE}`, borderRadius: 4, padding: "2px 4px" }} /></span>
            <span style={{ color: STONE, display: "flex", alignItems: "center", gap: 4 }}>Discount: <input type="number" value={event.discount} onChange={(e) => updateField("discount", e.target.value)} style={{ width: 55, border: `1px solid ${LINE}`, borderRadius: 4, padding: "2px 4px" }} /></span>
            <span style={{ color: SAGE, fontWeight: 700, marginLeft: "auto" }}>Event Total: {currency(totals.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function CateringSection({ item, onUpdate }) {
  const events = item.cateringEvents && item.cateringEvents.length > 0
    ? item.cateringEvents
    : CATERING_EVENTS.map((name) => ({ id: `${Date.now()}-${name}`, name, items: [], taxPct: 0, servicePct: 0, deliveryFee: 0, discount: 0 }));

  React.useEffect(() => {
    if (!item.cateringEvents || item.cateringEvents.length === 0) onUpdate(item.id, "cateringEvents", events);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateEvent(eventId, newEvent) {
    onUpdate(item.id, "cateringEvents", events.map((e) => (e.id === eventId ? newEvent : e)));
  }
  const grandTotal = events.reduce((s, ev) => s + eventTotals(ev).total, 0);

  return (
    <div>
      {events.map((ev) => (
        <EventLineItemsSection key={ev.id} name={ev.name} event={ev} onChange={(newEv) => updateEvent(ev.id, newEv)} />
      ))}
      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8, marginTop: 4, borderTop: `2px solid ${LINE}` }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: INK, fontFamily: "Georgia, serif" }}>Catering Grand Total: <span style={{ color: GOLD }}>{currency(grandTotal)}</span></span>
      </div>
    </div>
  );
}

function DecorSection({ item, onUpdate }) {
  const sections = item.decorSections && item.decorSections.length > 0
    ? item.decorSections
    : DECOR_SECTIONS.map((name) => ({ id: `${Date.now()}-${name}`, name, items: [], taxPct: 0, servicePct: 0, deliveryFee: 0, discount: 0 }));

  React.useEffect(() => {
    if (!item.decorSections || item.decorSections.length === 0) onUpdate(item.id, "decorSections", sections);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateSection(sectionId, newSection) {
    onUpdate(item.id, "decorSections", sections.map((s) => (s.id === sectionId ? newSection : s)));
  }
  const grandTotal = sections.reduce((s, sec) => s + eventTotals(sec).total, 0);

  return (
    <div>
      {sections.map((sec) => (
        <EventLineItemsSection key={sec.id} name={sec.name} event={sec} onChange={(newSec) => updateSection(sec.id, newSec)} />
      ))}
      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8, marginTop: 4, borderTop: `2px solid ${LINE}` }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: INK, fontFamily: "Georgia, serif" }}>Decor Grand Total: <span style={{ color: GOLD }}>{currency(grandTotal)}</span></span>
      </div>
    </div>
  );
}

function GenericSection({ item, onUpdate }) {
  const generic = item.genericSection || { name: "Line Items", items: [], taxPct: 0, servicePct: 0, deliveryFee: 0, discount: 0 };
  function updateSection(newSection) { onUpdate(item.id, "genericSection", newSection); }
  return <EventLineItemsSection name="Line Items" event={generic} onChange={updateSection} defaultOpen />;
}

function VendorDetailOverlay({ item, onUpdate, onClose }) {
  const status = statusOf(item);
  function addPayment() {
    onUpdate(item.id, "payments", [...(item.payments || []), { id: Date.now(), amount: "", dueDate: "", paidDate: "", method: "", notes: "", status: "Upcoming" }]);
  }
  function updatePayment(pid, field, value) {
    onUpdate(item.id, "payments", item.payments.map((p) => (p.id === pid ? { ...p, [field]: value } : p)));
  }
  function removePayment(pid) {
    onUpdate(item.id, "payments", item.payments.filter((p) => p.id !== pid));
  }
  function statusMeta(label) { return PAYMENT_STATUSES.find((s) => s.label === label) || PAYMENT_STATUSES[0]; }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#F6F4EF", zIndex: 80, overflowY: "auto" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 36px 80px" }}>
        <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: STONE, cursor: "pointer", fontSize: 12.5, fontWeight: 600, marginBottom: 16 }}>
          <ArrowLeft size={15} /> Back to Budget
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <input placeholder="Category" value={item.category} onChange={(e) => onUpdate(item.id, "category", e.target.value)} style={{ fontSize: 22, fontWeight: 700, color: INK, fontFamily: "Georgia, serif", border: "none", background: "transparent", outline: "none", display: "block", marginBottom: 1 }} />
            <input placeholder="Vendor name" value={item.vendor} onChange={(e) => onUpdate(item.id, "vendor", e.target.value)} style={{ fontSize: 12.5, color: STONE, border: "none", background: "transparent", outline: "none" }} />
          </div>
          {status.label === "Fully Paid" && (
            <span style={{ display: "flex", alignItems: "center", gap: 6, background: SAGE, color: "#FFFFFF", fontSize: 11.5, fontWeight: 700, padding: "5px 12px", borderRadius: 100 }}>
              <Check size={12} /> Paid in Full
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
          <SummaryCard label="Estimated Budget" value={item.initialBudget} editable onChange={(v) => onUpdate(item.id, "initialBudget", v)} />
          <SummaryCard label="Actual Cost" value={item.contractAmount} editable onChange={(v) => onUpdate(item.id, "contractAmount", v)} />
          <SummaryCard label="Discount" value={item.discount} editable onChange={(v) => onUpdate(item.id, "discount", v)} />
          <SummaryCard label="Final Cost" value={currency(finalCostOf(item))} accent={GOLD} />
          <SummaryCard label="Amount Paid" value={currency(totalPaidOf(item))} accent={SAGE} />
          <SummaryCard label="Remaining" value={currency(remainingOf(item))} accent={remainingOf(item) === 0 ? SAGE : BORDEAUX} />
        </div>

        <div style={{ background: "#FFFFFF", border: `1px solid ${LINE}`, borderRadius: 12, padding: "14px 16px", marginBottom: 18 }}>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {[
              { key: "contactPerson", label: "Contact" },
              { key: "phone", label: "Phone" },
              { key: "email", label: "Email" },
            ].map((f) => (
              <div key={f.key} style={{ flex: "1 1 160px", minWidth: 140 }}>
                <div style={{ fontSize: 9.5, color: STONE, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3 }}>{f.label}</div>
                <input value={item[f.key]} onChange={(e) => onUpdate(item.id, f.key, e.target.value)} style={{ width: "100%", border: `1px solid ${LINE}`, borderRadius: 6, padding: "6px 8px", fontSize: 12, boxSizing: "border-box" }} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: INK, marginBottom: 10, fontFamily: "Georgia, serif" }}>
            {isCatering(item.category) ? "Catering by Event" : isDecor(item.category) ? "Decor by Category" : "Line Items"}
          </div>
          {isCatering(item.category) ? (
            <CateringSection item={item} onUpdate={onUpdate} />
          ) : isDecor(item.category) ? (
            <DecorSection item={item} onUpdate={onUpdate} />
          ) : (
            <GenericSection item={item} onUpdate={onUpdate} />
          )}
        </div>

        <div style={{ background: "#FFFFFF", border: `1px solid ${LINE}`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: INK, marginBottom: 10, fontFamily: "Georgia, serif" }}>Payment History</div>
          {(item.payments || []).map((p) => (
            <div key={p.id} style={{ display: "grid", gridTemplateColumns: "80px 90px 55px 1fr 105px 30px", gap: 6, alignItems: "center", marginBottom: 6 }}>
              <input type="number" placeholder="Amount" value={p.amount} onChange={(e) => updatePayment(p.id, "amount", e.target.value)} style={{ border: `1px solid ${LINE}`, borderRadius: 6, padding: "5px 7px", fontSize: 11.5, boxSizing: "border-box" }} />
              <input type="date" value={p.paidDate || p.dueDate} onChange={(e) => updatePayment(p.id, "paidDate", e.target.value)} style={{ border: `1px solid ${LINE}`, borderRadius: 6, padding: "5px 6px", fontSize: 10.5, boxSizing: "border-box" }} />
              <select value={p.method} onChange={(e) => updatePayment(p.id, "method", e.target.value)} style={{ border: `1px solid ${LINE}`, borderRadius: 6, padding: "5px 3px", fontSize: 10, boxSizing: "border-box" }}>
                <option value="">-</option><option>Card</option><option>Check</option><option>Zelle</option><option>Transfer</option><option>Cash</option>
              </select>
              <input placeholder="Notes" value={p.notes} onChange={(e) => updatePayment(p.id, "notes", e.target.value)} style={{ border: `1px solid ${LINE}`, borderRadius: 6, padding: "5px 7px", fontSize: 11, boxSizing: "border-box" }} />
              <select value={p.status} onChange={(e) => updatePayment(p.id, "status", e.target.value)} style={{ border: `1px solid ${statusMeta(p.status).color}`, borderRadius: 6, padding: "5px 4px", fontSize: 10.5, color: statusMeta(p.status).color, fontWeight: 600, boxSizing: "border-box" }}>
                {PAYMENT_STATUSES.map((s) => <option key={s.label}>{s.label}</option>)}
              </select>
              <button onClick={() => removePayment(p.id)} style={{ background: "none", border: "none", color: STONE, cursor: "pointer" }}><X size={13} /></button>
            </div>
          ))}
          <button onClick={addPayment} style={{ display: "flex", alignItems: "center", gap: 5, background: "#FBFAF6", border: `1px solid ${LINE}`, borderRadius: 7, padding: "6px 12px", fontSize: 11, fontWeight: 600, color: STONE, cursor: "pointer", marginTop: 4 }}>
            <Plus size={12} /> Add Payment
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Budget() {
  const navigate = useNavigate();
  const location = useLocation();

  const { vendors, setVendors } = useBudgetData();
  const [detailItem, setDetailItem] = useState(null);

  function updateItem(id, field, value) {
    setVendors((v) => v.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  }
  function addVendor() {
    setVendors((v) => [...v, {
      id: Date.now() + Math.random(), category: "", vendor: "", initialBudget: "", contractAmount: "", discount: "",
      payments: [], cateringEvents: [], decorSections: [], genericSection: null,
      contactPerson: "", phone: "", email: "", contractNotes: "",
    }]);
  }
  function removeVendor(id) {
    setVendors((v) => v.filter((it) => it.id !== id));
  }

  const totalEstimate = useMemo(() => vendors.reduce((s, it) => s + (Number(it.initialBudget) || 0), 0), [vendors]);
  const totalActual = useMemo(() => vendors.reduce((s, it) => s + finalCostOf(it), 0), [vendors]);
  const totalPaid = useMemo(() => vendors.reduce((s, it) => s + totalPaidOf(it), 0), [vendors]);
  const totalRemaining = useMemo(() => vendors.reduce((s, it) => s + remainingOf(it), 0), [vendors]);

  const pieData = useMemo(
    () => vendors
      .map((it) => ({ name: it.category || "Untitled", value: finalCostOf(it) > 0 ? finalCostOf(it) : (Number(it.initialBudget) || 0) }))
      .filter((d) => d.value > 0),
    [vendors]
  );

  const liveDetailItem = detailItem ? vendors.find((v) => v.id === detailItem.id) : null;

  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100vh", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif", background: "#F6F4EF", color: "#26261F" }}>
      <aside style={{ width: 230, flexShrink: 0, background: sidebarTheme().bg, color: sidebarTheme().text, padding: "20px 12px", position: "sticky", top: 0, height: "100vh", boxSizing: "border-box", borderRight: `1px solid ${LINE}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 16, borderBottom: `1px solid ${LINE}`, marginBottom: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: GOLD, color: "#FFFFFF", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>W</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>White Glove Events</div>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === "/portal/" + item.id;
            const t = sidebarTheme();
            return (
              <button key={item.id} onClick={() => navigate("/portal/" + item.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 10px", borderRadius: 7, color: isActive ? t.activeText : t.muted, background: isActive ? t.activeBg : "transparent", fontSize: 12.5, fontWeight: 500, border: "none", cursor: "pointer", textAlign: "left" }}>
                <Icon size={15} strokeWidth={1.75} /> {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main style={{ flex: 1, minWidth: 0, padding: "32px 44px 60px" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: INK, fontFamily: "Georgia, serif" }}>Budget</div>
            <div style={{ fontSize: 12, color: STONE }}>Where your money is going, and what's left to pay.</div>
          </div>

          <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
            <SummaryCard label="Estimated Wedding Budget" value={currency(totalEstimate)} />
            <SummaryCard label="Actual Committed Cost" value={currency(totalActual)} accent={GOLD} />
            <SummaryCard label="Amount Paid" value={currency(totalPaid)} accent={SAGE} />
            <SummaryCard label="Remaining Balance" value={currency(totalRemaining)} accent={totalRemaining > 0 ? BORDEAUX : SAGE} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>
            <div style={{ background: "#FFFFFF", border: `1px solid ${LINE}`, borderRadius: 16, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${LINE}` }}>
                    <th style={{ color: STONE, padding: "12px 16px", textAlign: "left", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>Category</th>
                    <th style={{ color: STONE, padding: "12px 16px", textAlign: "right", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>Budget</th>
                    <th style={{ color: STONE, padding: "12px 16px", textAlign: "right", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>Actual</th>
                    <th style={{ color: STONE, padding: "12px 16px", textAlign: "right", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>Paid</th>
                    <th style={{ color: STONE, padding: "12px 16px", textAlign: "right", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>Balance</th>
                    <th style={{ color: STONE, padding: "12px 16px", textAlign: "left", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>Status</th>
                    <th style={{ width: 36 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((item) => {
                    const status = statusOf(item);
                    return (
                      <tr key={item.id} onClick={() => setDetailItem(item)} style={{ cursor: "pointer" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#FBFAF6"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "14px 16px", borderBottom: `1px solid ${LINE}` }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: INK, fontFamily: "Georgia, serif" }}>{item.category || "Untitled"}</div>
                          <div style={{ fontSize: 10.5, color: STONE }}>{item.vendor || "No vendor yet"}</div>
                        </td>
                        <td style={{ padding: "14px 16px", borderBottom: `1px solid ${LINE}`, textAlign: "right" }}>{currency(item.initialBudget)}</td>
                        <td style={{ padding: "14px 16px", borderBottom: `1px solid ${LINE}`, textAlign: "right" }}>{currency(finalCostOf(item))}</td>
                        <td style={{ padding: "14px 16px", borderBottom: `1px solid ${LINE}`, textAlign: "right", color: SAGE, fontWeight: 600 }}>{currency(totalPaidOf(item))}</td>
                        <td style={{ padding: "14px 16px", borderBottom: `1px solid ${LINE}`, textAlign: "right", fontWeight: 700, color: remainingOf(item) === 0 && Number(item.contractAmount) > 0 ? SAGE : BORDEAUX }}>{currency(remainingOf(item))}</td>
                        <td style={{ padding: "14px 16px", borderBottom: `1px solid ${LINE}` }}><StatusPill status={status} /></td>
                        <td style={{ padding: "14px 16px", borderBottom: `1px solid ${LINE}` }} onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => removeVendor(item.id)} style={{ background: "none", border: "none", color: STONE, cursor: "pointer" }}><Trash2 size={13} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ padding: 16 }}>
                <button onClick={addVendor} style={{ display: "flex", alignItems: "center", gap: 6, background: GOLD, color: "#FFFFFF", border: "none", borderRadius: 9, padding: "10px 18px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
                  <Plus size={14} /> Add Vendor
                </button>
              </div>
            </div>

            <div style={{ background: "#FFFFFF", border: `1px solid ${LINE}`, borderRadius: 16, padding: 18, position: "sticky", top: 20 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: INK, marginBottom: 10, fontFamily: "Georgia, serif" }}>Budget Allocation</div>
              {pieData.length === 0 ? (
                <div style={{ fontSize: 11, color: STONE, textAlign: "center", padding: "30px 0" }}>Add a vendor and an estimate to see this populate.</div>
              ) : (
                <div style={{ width: "100%", height: 190 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => currency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div style={{ marginTop: 6 }}>
                {pieData.map((d, i) => (
                  <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, color: STONE, marginBottom: 3 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: PIE_COLORS[i % PIE_COLORS.length], display: "inline-block", flexShrink: 0 }} />
                    {d.name} <span style={{ marginLeft: "auto", fontWeight: 600 }}>{currency(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {liveDetailItem && (
        <VendorDetailOverlay item={liveDetailItem} onUpdate={updateItem} onClose={() => setDetailItem(null)} />
      )}
    </div>
  );
}