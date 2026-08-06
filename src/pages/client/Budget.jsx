import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home, Wallet, Users, CalendarClock, NotebookPen, ClipboardList,
  FolderOpen, PhoneCall, Settings, Plus, X, Trash2, Check, ArrowLeft, Mail, Phone, FileText,
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

const PIE_COLORS = [GOLD, SAGE, BORDEAUX, STONE, "#A9BFA2", "#C48A94", "#7E9E93", "#D9C9A3", "#C9BFA8", "#E7D6B8"];
const CATERING_DEFAULT_EVENTS = ["Mehendi", "Haldi", "Sangeet", "Wedding", "Reception", "Brunch"];
const DECOR_DEFAULT_ITEMS = ["Ceremony Decor", "Reception Decor", "Cocktail Decor", "Stage", "Mandap", "Florals", "Lighting", "Furniture", "Rentals"];

function isCatering(category) { return (category || "").toLowerCase().includes("cater"); }
function isDecor(category) { return (category || "").toLowerCase().includes("decor"); }

function SummaryCard({ label, value, accent }) {
  return (
    <div style={{ flex: 1, minWidth: 160, background: "#FFFFFF", border: `1px solid ${LINE}`, borderRadius: 14, padding: "16px 18px" }}>
      <div style={{ fontSize: 10, color: STONE, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: accent || INK, fontFamily: "Georgia, serif" }}>{value}</div>
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

function CateringSection({ item, onUpdate }) {
  const events = item.cateringEvents && item.cateringEvents.length > 0
    ? item.cateringEvents
    : CATERING_DEFAULT_EVENTS.map((name) => ({ id: `${Date.now()}-${name}`, name, items: [], taxPct: 0, servicePct: 0 }));

  React.useEffect(() => {
    if (!item.cateringEvents || item.cateringEvents.length === 0) onUpdate(item.id, "cateringEvents", events);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateEvent(eventId, field, value) {
    onUpdate(item.id, "cateringEvents", events.map((e) => (e.id === eventId ? { ...e, [field]: value } : e)));
  }
  function addMenuItem(eventId) {
    const ev = events.find((e) => e.id === eventId);
    updateEvent(eventId, "items", [...(ev.items || []), { id: Date.now(), name: "", quantity: "", pricePerPerson: "" }]);
  }
  function updateMenuItem(eventId, lineId, field, value) {
    const ev = events.find((e) => e.id === eventId);
    updateEvent(eventId, "items", ev.items.map((l) => (l.id === lineId ? { ...l, [field]: value } : l)));
  }
  function removeMenuItem(eventId, lineId) {
    const ev = events.find((e) => e.id === eventId);
    updateEvent(eventId, "items", ev.items.filter((l) => l.id !== lineId));
  }

  return (
    <div>
      {events.map((ev) => {
        const subtotal = (ev.items || []).reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.pricePerPerson) || 0), 0);
        const tax = subtotal * ((Number(ev.taxPct) || 0) / 100);
        const service = subtotal * ((Number(ev.servicePct) || 0) / 100);
        const final = subtotal + tax + service;
        return (
          <div key={ev.id} style={{ marginBottom: 20, border: `1px solid ${LINE}`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: INK, fontFamily: "Georgia, serif", marginBottom: 10 }}>{ev.name}</div>
            {(ev.items || []).map((l) => (
              <div key={l.id} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
                <input placeholder="Item (e.g. Welcome Drink)" value={l.name} onChange={(e) => updateMenuItem(ev.id, l.id, "name", e.target.value)} style={{ flex: 1, border: `1px solid ${LINE}`, borderRadius: 6, padding: "6px 8px", fontSize: 12 }} />
                <input type="number" placeholder="Qty" value={l.quantity} onChange={(e) => updateMenuItem(ev.id, l.id, "quantity", e.target.value)} style={{ width: 60, border: `1px solid ${LINE}`, borderRadius: 6, padding: "6px 8px", fontSize: 12 }} />
                <input type="number" placeholder="Price/person" value={l.pricePerPerson} onChange={(e) => updateMenuItem(ev.id, l.id, "pricePerPerson", e.target.value)} style={{ width: 80, border: `1px solid ${LINE}`, borderRadius: 6, padding: "6px 8px", fontSize: 12 }} />
                <span style={{ fontSize: 11.5, fontWeight: 700, width: 65, textAlign: "right" }}>{currency((Number(l.quantity) || 0) * (Number(l.pricePerPerson) || 0))}</span>
                <button onClick={() => removeMenuItem(ev.id, l.id)} style={{ background: "none", border: "none", color: STONE, cursor: "pointer" }}><Trash2 size={13} /></button>
              </div>
            ))}
            <button onClick={() => addMenuItem(ev.id)} style={{ display: "flex", alignItems: "center", gap: 5, background: "#FBFAF6", border: `1px solid ${LINE}`, borderRadius: 7, padding: "5px 10px", fontSize: 10.5, fontWeight: 600, color: STONE, cursor: "pointer", marginTop: 4, marginBottom: 10 }}>
              <Plus size={11} /> Add Item
            </button>
            <div style={{ display: "flex", gap: 16, fontSize: 11.5, borderTop: `1px solid ${LINE}`, paddingTop: 8, flexWrap: "wrap" }}>
              <span style={{ color: STONE }}>Subtotal: <strong style={{ color: INK }}>{currency(subtotal)}</strong></span>
              <span style={{ color: STONE, display: "flex", alignItems: "center", gap: 4 }}>Tax %: <input type="number" value={ev.taxPct} onChange={(e) => updateEvent(ev.id, "taxPct", e.target.value)} style={{ width: 45, border: `1px solid ${LINE}`, borderRadius: 5, padding: "2px 5px" }} /></span>
              <span style={{ color: STONE, display: "flex", alignItems: "center", gap: 4 }}>Service %: <input type="number" value={ev.servicePct} onChange={(e) => updateEvent(ev.id, "servicePct", e.target.value)} style={{ width: 45, border: `1px solid ${LINE}`, borderRadius: 5, padding: "2px 5px" }} /></span>
              <span style={{ color: SAGE, fontWeight: 700 }}>Final: {currency(final)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DecorSection({ item, onUpdate }) {
  const decorItems = item.decorItems && item.decorItems.length > 0
    ? item.decorItems
    : DECOR_DEFAULT_ITEMS.map((name) => ({ id: `${Date.now()}-${name}`, name, cost: "" }));

  React.useEffect(() => {
    if (!item.decorItems || item.decorItems.length === 0) onUpdate(item.id, "decorItems", decorItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateDecorItem(lineId, field, value) {
    onUpdate(item.id, "decorItems", decorItems.map((l) => (l.id === lineId ? { ...l, [field]: value } : l)));
  }
  function addDecorItem() {
    onUpdate(item.id, "decorItems", [...decorItems, { id: Date.now(), name: "", cost: "" }]);
  }
  function removeDecorItem(lineId) {
    onUpdate(item.id, "decorItems", decorItems.filter((l) => l.id !== lineId));
  }
  const total = decorItems.reduce((s, l) => s + (Number(l.cost) || 0), 0);

  return (
    <div>
      {decorItems.map((l) => (
        <div key={l.id} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
          <input value={l.name} onChange={(e) => updateDecorItem(l.id, "name", e.target.value)} style={{ flex: 1, border: `1px solid ${LINE}`, borderRadius: 6, padding: "7px 9px", fontSize: 12.5 }} />
          <input type="number" placeholder="Cost" value={l.cost} onChange={(e) => updateDecorItem(l.id, "cost", e.target.value)} style={{ width: 90, border: `1px solid ${LINE}`, borderRadius: 6, padding: "7px 9px", fontSize: 12.5, textAlign: "right" }} />
          <button onClick={() => removeDecorItem(l.id)} style={{ background: "none", border: "none", color: STONE, cursor: "pointer" }}><Trash2 size={13} /></button>
        </div>
      ))}
      <button onClick={addDecorItem} style={{ display: "flex", alignItems: "center", gap: 5, background: "#FBFAF6", border: `1px solid ${LINE}`, borderRadius: 7, padding: "6px 12px", fontSize: 11, fontWeight: 600, color: STONE, cursor: "pointer", marginTop: 6, marginBottom: 10 }}>
        <Plus size={12} /> Add Decor Item
      </button>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: INK, borderTop: `1px solid ${LINE}`, paddingTop: 8 }}>Total: {currency(total)}</div>
    </div>
  );
}

function GenericLineItemsSection({ item, onUpdate }) {
  const lineItems = item.lineItems || [];
  function addLine() { onUpdate(item.id, "lineItems", [...lineItems, { id: Date.now(), name: "", quantity: 1, unitPrice: "" }]); }
  function updateLine(lineId, field, value) { onUpdate(item.id, "lineItems", lineItems.map((l) => (l.id === lineId ? { ...l, [field]: value } : l))); }
  function removeLine(lineId) { onUpdate(item.id, "lineItems", lineItems.filter((l) => l.id !== lineId)); }
  const subtotal = lineItems.reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0);

  return (
    <div>
      {lineItems.map((l) => (
        <div key={l.id} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
          <input placeholder="Item" value={l.name} onChange={(e) => updateLine(l.id, "name", e.target.value)} style={{ flex: 1, border: `1px solid ${LINE}`, borderRadius: 6, padding: "6px 8px", fontSize: 12 }} />
          <input type="number" placeholder="Qty" value={l.quantity} onChange={(e) => updateLine(l.id, "quantity", e.target.value)} style={{ width: 55, border: `1px solid ${LINE}`, borderRadius: 6, padding: "6px 8px", fontSize: 12 }} />
          <input type="number" placeholder="Price" value={l.unitPrice} onChange={(e) => updateLine(l.id, "unitPrice", e.target.value)} style={{ width: 75, border: `1px solid ${LINE}`, borderRadius: 6, padding: "6px 8px", fontSize: 12 }} />
          <span style={{ fontSize: 11.5, fontWeight: 700, width: 65, textAlign: "right" }}>{currency((Number(l.quantity) || 0) * (Number(l.unitPrice) || 0))}</span>
          <button onClick={() => removeLine(l.id)} style={{ background: "none", border: "none", color: STONE, cursor: "pointer" }}><Trash2 size={13} /></button>
        </div>
      ))}
      <button onClick={addLine} style={{ display: "flex", alignItems: "center", gap: 5, background: "#FBFAF6", border: `1px solid ${LINE}`, borderRadius: 7, padding: "6px 12px", fontSize: 11, fontWeight: 600, color: STONE, cursor: "pointer", marginTop: 4, marginBottom: 10 }}>
        <Plus size={12} /> Add Item
      </button>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: INK, borderTop: `1px solid ${LINE}`, paddingTop: 8 }}>Subtotal: {currency(subtotal)}</div>
    </div>
  );
}

function VendorDetailOverlay({ item, onUpdate, onClose }) {
  const status = statusOf(item);
  function addPayment() {
    onUpdate(item.id, "payments", [...(item.payments || []), { id: Date.now(), name: "", amount: "", dueDate: "", paidDate: "", method: "", notes: "", status: "Pending" }]);
  }
  function updatePayment(pid, field, value) {
    onUpdate(item.id, "payments", item.payments.map((p) => (p.id === pid ? { ...p, [field]: value } : p)));
  }
  function removePayment(pid) {
    onUpdate(item.id, "payments", item.payments.filter((p) => p.id !== pid));
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#F6F4EF", zIndex: 80, overflowY: "auto" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 40px 80px" }}>
        <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: STONE, cursor: "pointer", fontSize: 12.5, fontWeight: 600, marginBottom: 20 }}>
          <ArrowLeft size={15} /> Back to Budget
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 10 }}>
          <div>
            <input placeholder="Category" value={item.category} onChange={(e) => onUpdate(item.id, "category", e.target.value)} style={{ fontSize: 24, fontWeight: 700, color: INK, fontFamily: "Georgia, serif", border: "none", background: "transparent", outline: "none", display: "block", marginBottom: 2 }} />
            <input placeholder="Vendor name" value={item.vendor} onChange={(e) => onUpdate(item.id, "vendor", e.target.value)} style={{ fontSize: 13, color: STONE, border: "none", background: "transparent", outline: "none" }} />
          </div>
          {status.label === "Fully Paid" && (
            <span style={{ display: "flex", alignItems: "center", gap: 6, background: SAGE, color: "#FFFFFF", fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 100 }}>
              <Check size={13} /> Paid in Full
            </span>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
          <div style={{ background: "#FFFFFF", border: `1px solid ${LINE}`, borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: INK, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 14, fontFamily: "Georgia, serif" }}>Vendor Information</div>
            {[
              { key: "contactPerson", label: "Contact Person", icon: null },
              { key: "phone", label: "Phone", icon: Phone },
              { key: "email", label: "Email", icon: Mail },
            ].map((f) => (
              <div key={f.key} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: STONE, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3 }}>{f.label}</div>
                <input value={item[f.key]} onChange={(e) => onUpdate(item.id, f.key, e.target.value)} style={{ width: "100%", border: `1px solid ${LINE}`, borderRadius: 7, padding: "7px 9px", fontSize: 12.5, boxSizing: "border-box" }} />
              </div>
            ))}
            <div>
              <div style={{ fontSize: 10, color: STONE, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3 }}>Contract / Notes</div>
              <textarea value={item.contractNotes} onChange={(e) => onUpdate(item.id, "contractNotes", e.target.value)} rows={3} style={{ width: "100%", border: `1px solid ${LINE}`, borderRadius: 7, padding: "7px 9px", fontSize: 12.5, boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }} />
            </div>
          </div>

          <div style={{ background: "#FFFFFF", border: `1px solid ${LINE}`, borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: INK, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 14, fontFamily: "Georgia, serif" }}>Financial Summary</div>
            {[
              { key: "initialBudget", label: "Estimated Budget" },
              { key: "contractAmount", label: "Actual Cost" },
              { key: "discount", label: "Discount" },
            ].map((f) => (
              <div key={f.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: STONE }}>{f.label}</span>
                <input type="number" value={item[f.key]} onChange={(e) => onUpdate(item.id, f.key, e.target.value)} style={{ width: 100, border: `1px solid ${LINE}`, borderRadius: 6, padding: "5px 8px", fontSize: 12.5, textAlign: "right" }} />
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: `1px solid ${LINE}`, marginBottom: 6 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: INK }}>Final Cost</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{currency(finalCostOf(item))}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: STONE }}>Remaining Balance</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: remainingOf(item) === 0 ? SAGE : BORDEAUX }}>{currency(remainingOf(item))}</span>
            </div>
          </div>
        </div>

        <div style={{ background: "#FFFFFF", border: `1px solid ${LINE}`, borderRadius: 14, padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: INK, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 14, fontFamily: "Georgia, serif" }}>Payment History</div>
          {(item.payments || []).map((p, i) => (
            <div key={p.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10.5, color: STONE, minWidth: 85 }}>{i === 0 ? "Deposit" : i === (item.payments.length - 1) ? "Final Payment" : `Payment ${i + 1}`}</span>
              <input type="number" placeholder="Amount" value={p.amount} onChange={(e) => updatePayment(p.id, "amount", e.target.value)} style={{ width: 85, border: `1px solid ${LINE}`, borderRadius: 6, padding: "6px 8px", fontSize: 11.5 }} />
              <input type="date" value={p.paidDate || p.dueDate} onChange={(e) => updatePayment(p.id, "paidDate", e.target.value)} style={{ border: `1px solid ${LINE}`, borderRadius: 6, padding: "6px 8px", fontSize: 11 }} />
              <select value={p.method} onChange={(e) => updatePayment(p.id, "method", e.target.value)} style={{ border: `1px solid ${LINE}`, borderRadius: 6, padding: "6px 6px", fontSize: 11 }}>
                <option value="">Method</option><option>Card</option><option>Check</option><option>Zelle</option><option>Bank Transfer</option><option>Cash</option>
              </select>
              <input placeholder="Notes" value={p.notes} onChange={(e) => updatePayment(p.id, "notes", e.target.value)} style={{ flex: 1, minWidth: 100, border: `1px solid ${LINE}`, borderRadius: 6, padding: "6px 8px", fontSize: 11.5 }} />
              <select value={p.status} onChange={(e) => updatePayment(p.id, "status", e.target.value)} style={{ border: `1px solid ${LINE}`, borderRadius: 6, padding: "6px 6px", fontSize: 11 }}>
                <option>Pending</option><option>Paid</option>
              </select>
              <button onClick={() => removePayment(p.id)} style={{ background: "none", border: "none", color: STONE, cursor: "pointer" }}><X size={13} /></button>
            </div>
          ))}
          <button onClick={addPayment} style={{ display: "flex", alignItems: "center", gap: 5, background: "#FBFAF6", border: `1px solid ${LINE}`, borderRadius: 7, padding: "6px 12px", fontSize: 11, fontWeight: 600, color: STONE, cursor: "pointer", marginTop: 4 }}>
            <Plus size={12} /> Add Payment
          </button>
        </div>

        <div style={{ background: "#FFFFFF", border: `1px solid ${LINE}`, borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: INK, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 14, fontFamily: "Georgia, serif" }}>
            {isCatering(item.category) ? "Menu by Event" : isDecor(item.category) ? "Decor Breakdown" : "Line Items"}
          </div>
          {isCatering(item.category) ? (
            <CateringSection item={item} onUpdate={onUpdate} />
          ) : isDecor(item.category) ? (
            <DecorSection item={item} onUpdate={onUpdate} />
          ) : (
            <GenericLineItemsSection item={item} onUpdate={onUpdate} />
          )}
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
    setVendors((v) => [...v, { id: Date.now() + Math.random(), category: "", vendor: "", initialBudget: "", contractAmount: "", discount: "", payments: [], lineItems: [], cateringEvents: [], decorItems: [], contactPerson: "", phone: "", email: "", contractNotes: "" }]);
  }
  function removeVendor(id) {
    setVendors((v) => v.filter((it) => it.id !== id));
  }

  const totalEstimate = useMemo(() => vendors.reduce((s, it) => s + (Number(it.initialBudget) || 0), 0), [vendors]);
  const totalActual = useMemo(() => vendors.reduce((s, it) => s + finalCostOf(it), 0), [vendors]);
  const totalPaid = useMemo(() => vendors.reduce((s, it) => s + totalPaidOf(it), 0), [vendors]);
  const totalRemaining = useMemo(() => vendors.reduce((s, it) => s + remainingOf(it), 0), [vendors]);

  const pieData = useMemo(
    () => vendors.filter((it) => finalCostOf(it) > 0).map((it) => ({ name: it.category || "Untitled", value: finalCostOf(it) })),
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
                      <tr key={item.id} onClick={() => setDetailItem(item)} style={{ cursor: "pointer", transition: "background 0.15s ease" }}
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
                <div style={{ fontSize: 11, color: STONE, textAlign: "center", padding: "30px 0" }}>Add a vendor to see this populate.</div>
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