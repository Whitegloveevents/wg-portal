import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home, Wallet, Users, CalendarClock, NotebookPen, ClipboardList,
  Table2, Palette, FolderOpen, PhoneCall, Settings,
  ChevronDown, ChevronRight, CalendarDays, Plus, X, Trash2, Check,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
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

function sidebarTheme(mode) {
  return mode === "dark"
    ? { bg: "#1D1E1A", text: "#F6F4EF", muted: "rgba(246,244,239,0.58)", border: "rgba(246,244,239,0.1)", hover: "rgba(246,244,239,0.07)", activeBg: "rgba(181,138,74,0.18)", activeText: "#E7D6B8", logoBg: "#B58A4A", logoText: "#1D1E1A" }
    : { bg: "#FBFAF6", text: "#26261F", muted: "#8A8577", border: "#E7E2D5", hover: "#F4EDE0", activeBg: "#F4EDE0", activeText: "#B58A4A", logoBg: "#B58A4A", logoText: "#FFFFFF" };
}

function currency(n) {
  const v = Number(n) || 0;
  return `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
function totalPaidOf(item) {
  return (item.payments || []).reduce((s, p) => (p.status === "Paid" ? s + (Number(p.amount) || 0) : s), 0);
}
function remainingOf(item) {
  return Math.max(0, (Number(item.contractAmount) || 0) - totalPaidOf(item));
}

const PIE_COLORS = ["#5F7A5A", "#B58A4A", "#6B2A3A", "#8A8577", "#A9BFA2", "#C48A94", "#7E9E93"];

function VendorDetailModal({ item, onUpdate, onClose }) {
  const lineItems = item.lineItems || [];
  function addLine() {
    onUpdate(item.id, "lineItems", [...lineItems, { id: Date.now(), name: "", quantity: 1, unitPrice: "" }]);
  }
  function updateLine(lineId, field, value) {
    onUpdate(item.id, "lineItems", lineItems.map((l) => (l.id === lineId ? { ...l, [field]: value } : l)));
  }
  function removeLine(lineId) {
    onUpdate(item.id, "lineItems", lineItems.filter((l) => l.id !== lineId));
  }
  const subtotal = lineItems.reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0);
  const discount = Number(item.discount) || 0;
  const finalTotal = Math.max(0, subtotal - discount);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(29,30,26,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 70, padding: 20 }} onClick={onClose}>
      <div style={{ background: "#FFFFFF", borderRadius: 16, width: "100%", maxWidth: 520, padding: 24, maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#1D1E1A", fontFamily: "Georgia, serif" }}>{item.category || "Vendor"} Details</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#8A8577" }}><X size={18} /></button>
        </div>
        <div style={{ fontSize: 11.5, color: "#8A8577", marginBottom: 16 }}>{item.vendor || "Vendor name not set"}</div>

        {(item.payments || []).length > 0 && (
          <div style={{ marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid #E7E2D5" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#8A8577", textTransform: "uppercase", marginBottom: 6 }}>Payments</div>
            {item.payments.map((p, i) => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                <span style={{ color: "#8A8577" }}>{i === 0 ? "First" : i === 1 ? "Second" : "Final"} - {p.dueDate || "no date"}</span>
                <span style={{ fontWeight: 600, color: p.status === "Paid" ? "#5F7A5A" : "#1D1E1A" }}>{currency(p.amount)} {p.status === "Paid" && "✓"}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#8A8577", textTransform: "uppercase", marginBottom: 6 }}>Line Items</div>
          {lineItems.map((l) => (
            <div key={l.id} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
              <input placeholder="Item (e.g. Paneer Tikka)" value={l.name} onChange={(e) => updateLine(l.id, "name", e.target.value)} style={{ flex: 1, border: "1px solid #E7E2D5", borderRadius: 6, padding: "6px 8px", fontSize: 12 }} />
              <input type="number" placeholder="Qty" value={l.quantity} onChange={(e) => updateLine(l.id, "quantity", e.target.value)} style={{ width: 55, border: "1px solid #E7E2D5", borderRadius: 6, padding: "6px 8px", fontSize: 12 }} />
              <input type="number" placeholder="Price" value={l.unitPrice} onChange={(e) => updateLine(l.id, "unitPrice", e.target.value)} style={{ width: 75, border: "1px solid #E7E2D5", borderRadius: 6, padding: "6px 8px", fontSize: 12 }} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "#1D1E1A", width: 65, textAlign: "right" }}>{currency((Number(l.quantity) || 0) * (Number(l.unitPrice) || 0))}</span>
              <button onClick={() => removeLine(l.id)} style={{ background: "none", border: "none", color: "#8A8577", cursor: "pointer" }}><Trash2 size={13} /></button>
            </div>
          ))}
          <button onClick={addLine} style={{ display: "flex", alignItems: "center", gap: 5, background: "#FBFAF6", border: "1px solid #E7E2D5", borderRadius: 7, padding: "6px 12px", fontSize: 11, fontWeight: 600, color: "#8A8577", cursor: "pointer", marginTop: 4 }}>
            <Plus size={12} /> Add Item
          </button>
        </div>

        <div style={{ borderTop: "1px solid #E7E2D5", paddingTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 6 }}>
            <span style={{ color: "#8A8577" }}>Subtotal</span><span>{currency(subtotal)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5, marginBottom: 8 }}>
            <span style={{ color: "#8A8577" }}>Discount</span>
            <input type="number" placeholder="0" value={item.discount} onChange={(e) => onUpdate(item.id, "discount", e.target.value)} style={{ width: 90, border: "1px solid #E7E2D5", borderRadius: 6, padding: "5px 7px", fontSize: 12, textAlign: "right" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, color: "#1D1E1A", paddingTop: 8, borderTop: "1px solid #E7E2D5" }}>
            <span>Total</span><span>{currency(finalTotal)}</span>
          </div>
          <button
            onClick={() => onUpdate(item.id, "contractAmount", String(finalTotal))}
            style={{ width: "100%", marginTop: 12, background: "#B58A4A", color: "#1D1E1A", border: "none", borderRadius: 8, padding: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >
            Use This as Contract Amount
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Budget() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarTheme_, setSidebarTheme_] = useState("light");

  const {
    vendors, setVendors,
    initialOverallBudget, setInitialOverallBudget,
  } = useBudgetData();

  const [detailItem, setDetailItem] = useState(null);

  function updateItem(id, field, value) {
    setVendors((v) => v.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  }
  function addVendor() {
    setVendors((v) => [...v, { id: Date.now() + Math.random(), category: "", vendor: "", initialBudget: "", contractAmount: "", payments: [], lineItems: [], discount: "" }]);
  }
  function removeVendor(id) {
    setVendors((v) => v.filter((it) => it.id !== id));
  }

  const totalEstimate = useMemo(() => vendors.reduce((s, it) => s + (Number(it.initialBudget) || 0), 0), [vendors]);
  const totalContract = useMemo(() => vendors.reduce((s, it) => s + (Number(it.contractAmount) || 0), 0), [vendors]);
  const totalPaid = useMemo(() => vendors.reduce((s, it) => s + totalPaidOf(it), 0), [vendors]);
  const totalRemaining = useMemo(() => vendors.reduce((s, it) => s + remainingOf(it), 0), [vendors]);

  const pieData = useMemo(() => [
    { name: "Paid", value: totalPaid },
    { name: "Remaining", value: totalRemaining },
  ].filter((d) => d.value > 0), [totalPaid, totalRemaining]);

  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100vh", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif", background: "#F6F4EF", color: "#26261F" }}>
      <aside style={{ width: 240, flexShrink: 0, background: sidebarTheme(sidebarTheme_).bg, color: sidebarTheme(sidebarTheme_).text, padding: "20px 12px", position: "sticky", top: 0, height: "100vh", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 16, borderBottom: `1px solid ${sidebarTheme(sidebarTheme_).border}`, marginBottom: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: sidebarTheme(sidebarTheme_).logoBg, color: sidebarTheme(sidebarTheme_).logoText, fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>W</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>White Glove Events</div>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === "/portal/" + item.id;
            const t = sidebarTheme(sidebarTheme_);
            return (
              <button key={item.id} onClick={() => navigate("/portal/" + item.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 10px", borderRadius: 7, color: isActive ? t.activeText : t.muted, background: isActive ? t.activeBg : "transparent", fontSize: 12.5, fontWeight: 500, border: "none", cursor: "pointer", textAlign: "left" }}>
                <Icon size={15} strokeWidth={1.75} /> {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main style={{ flex: 1, minWidth: 0, padding: "28px 40px 60px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1D1E1A", fontFamily: "Georgia, serif" }}>Budget</div>
            <div style={{ fontSize: 12, color: "#8A8577" }}>Every vendor, what's estimated, what's actual, and what's left to pay.</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#FFFFFF", border: "1px solid #E7E2D5", borderTop: "3px solid #B58A4A", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
            <span style={{ fontSize: 11, color: "#8A8577", textTransform: "uppercase", letterSpacing: "0.04em" }}>Total Estimated Budget</span>
            <input
              type="number" value={initialOverallBudget}
              onChange={(e) => setInitialOverallBudget(Number(e.target.value) || 0)}
              style={{ fontSize: 20, fontWeight: 700, color: "#1D1E1A", border: "none", background: "transparent", outline: "none", width: 160 }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>
            <div style={{ background: "#FFFFFF", border: "1px solid #E7E2D5", borderTop: "3px solid #B58A4A", borderRadius: 12, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead>
                  <tr style={{ background: "#1D1E1A" }}>
                    <th style={{ color: "#F6F4EF", padding: "10px 12px", textAlign: "left", fontSize: 10, textTransform: "uppercase" }}>Category / Vendor</th>
                    <th style={{ color: "#F6F4EF", padding: "10px 12px", textAlign: "right", fontSize: 10, textTransform: "uppercase" }}>Estimate</th>
                    <th style={{ color: "#F6F4EF", padding: "10px 12px", textAlign: "right", fontSize: 10, textTransform: "uppercase" }}>Contract</th>
                    <th style={{ color: "#F6F4EF", padding: "10px 12px", textAlign: "right", fontSize: 10, textTransform: "uppercase" }}>Paid</th>
                    <th style={{ color: "#F6F4EF", padding: "10px 12px", textAlign: "right", fontSize: 10, textTransform: "uppercase" }}>Remaining</th>
                    <th style={{ width: 90 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((item, i) => {
                    const remaining = remainingOf(item);
                    const paid = totalPaidOf(item);
                    const fullyPaid = Number(item.contractAmount) > 0 && remaining === 0;
                    return (
                      <tr key={item.id} style={{ background: fullyPaid ? "#EAF0EA" : (i % 2 === 0 ? "#FBFAF6" : "#FFFFFF") }}>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid #E7E2D5" }}>
                          <input placeholder="Category" value={item.category} onChange={(e) => updateItem(item.id, "category", e.target.value)} style={{ width: "100%", border: "none", background: "transparent", fontSize: 12.5, fontWeight: 700, color: "#1D1E1A", outline: "none", fontFamily: "Georgia, serif", marginBottom: 2 }} />
                          <input placeholder="Vendor name" value={item.vendor} onChange={(e) => updateItem(item.id, "vendor", e.target.value)} style={{ width: "100%", border: "none", background: "transparent", fontSize: 11, color: "#8A8577", outline: "none" }} />
                        </td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid #E7E2D5", textAlign: "right" }}>
                          <input type="number" value={item.initialBudget} onChange={(e) => updateItem(item.id, "initialBudget", e.target.value)} style={{ width: 85, border: "none", background: "transparent", fontSize: 12.5, textAlign: "right", outline: "none" }} />
                        </td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid #E7E2D5", textAlign: "right" }}>
                          <input type="number" value={item.contractAmount} onChange={(e) => updateItem(item.id, "contractAmount", e.target.value)} style={{ width: 85, border: "none", background: "transparent", fontSize: 12.5, textAlign: "right", outline: "none" }} />
                        </td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid #E7E2D5", textAlign: "right", fontSize: 12.5, color: "#5F7A5A", fontWeight: 600 }}>{currency(paid)}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid #E7E2D5", textAlign: "right" }}>
                          {fullyPaid ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#5F7A5A", color: "#FFFFFF", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 100 }}><Check size={10} /> Paid</span>
                          ) : (
                            <span style={{ fontSize: 12.5, fontWeight: 700, color: "#6B2A3A" }}>{currency(remaining)}</span>
                          )}
                        </td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid #E7E2D5", textAlign: "center", whiteSpace: "nowrap" }}>
                          <button onClick={() => setDetailItem(item)} style={{ background: "#FBFAF6", border: "1px solid #E7E2D5", borderRadius: 6, padding: "4px 8px", fontSize: 10.5, fontWeight: 600, color: "#8A8577", cursor: "pointer", marginRight: 4 }}>Details</button>
                          <button onClick={() => removeVendor(item.id)} style={{ background: "none", border: "none", color: "#8A8577", cursor: "pointer" }}><Trash2 size={13} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: "#F4EDE0" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 700, fontSize: 12.5 }}>Totals</td>
                    <td style={{ padding: "10px 12px", fontWeight: 700, fontSize: 12.5, textAlign: "right" }}>{currency(totalEstimate)}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 700, fontSize: 12.5, textAlign: "right" }}>{currency(totalContract)}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 700, fontSize: 12.5, textAlign: "right", color: "#5F7A5A" }}>{currency(totalPaid)}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 700, fontSize: 12.5, textAlign: "right", color: totalRemaining > 0 ? "#6B2A3A" : "#5F7A5A" }}>{currency(totalRemaining)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
              <div style={{ padding: 14 }}>
                <button onClick={addVendor} style={{ display: "flex", alignItems: "center", gap: 6, background: "#B58A4A", color: "#1D1E1A", border: "none", borderRadius: 9, padding: "9px 16px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
                  <Plus size={14} /> Add Vendor
                </button>
              </div>
            </div>

            <div style={{ background: "#FFFFFF", border: "1px solid #E7E2D5", borderTop: "3px solid #B58A4A", borderRadius: 12, padding: 18, position: "sticky", top: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1D1E1A", marginBottom: 12, fontFamily: "Georgia, serif" }}>Paid vs. Remaining</div>
              {pieData.length === 0 ? (
                <div style={{ fontSize: 11, color: "#8A8577", textAlign: "center", padding: "30px 0" }}>Add a vendor to see this populate.</div>
              ) : (
                <div style={{ width: "100%", height: 220 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => currency(v)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #E7E2D5" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span style={{ color: "#8A8577" }}>Total Paid</span><strong>{currency(totalPaid)}</strong></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span style={{ color: "#8A8577" }}>Total Remaining</span><strong style={{ color: totalRemaining > 0 ? "#6B2A3A" : "#5F7A5A" }}>{currency(totalRemaining)}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {detailItem && (
        <VendorDetailModal item={vendors.find((v) => v.id === detailItem.id) || detailItem} onUpdate={updateItem} onClose={() => setDetailItem(null)} />
      )}
    </div>
  );
}