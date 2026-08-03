import React, { createContext, useContext, useState, useEffect } from "react";

const STORAGE_KEY = "wg-budget-data-v1";

function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function makePayment() {
  return { id: uid(), name: "", amount: "", dueDate: "", status: "Pending", paidDate: "", method: "", reference: "", receiptName: "", receiptUrl: "", notes: "" };
}
export function makeItem(overrides = {}) {
  return {
    id: uid(), category: "", vendor: "", initialBudget: "", contractAmount: "",
    payments: [], whoIsPaying: "", bridePct: "50", groomPct: "50", notes: "", attachments: [],
    ...overrides,
  };
}

const BudgetDataContext = createContext(null);

export function BudgetDataProvider({ children }) {
  const saved = loadState();
  const [vendors, setVendors] = useState(saved?.vendors || []);
  const [rentals, setRentals] = useState(saved?.rentals || []);
  const [misc, setMisc] = useState(saved?.misc || []);
  const [initialOverallBudget, setInitialOverallBudget] = useState(saved?.initialOverallBudget || 0);
  const [categoryBudgets, setCategoryBudgets] = useState(saved?.categoryBudgets || []);
  const [savingsLog, setSavingsLog] = useState(saved?.savingsLog || []);
  const [timelineGeniusLink, setTimelineGeniusLink] = useState(saved?.timelineGeniusLink || "");

  useEffect(() => {
    const data = { vendors, rentals, misc, initialOverallBudget, categoryBudgets, savingsLog, timelineGeniusLink };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) { /* storage unavailable */ }
  }, [vendors, rentals, misc, initialOverallBudget, categoryBudgets, savingsLog, timelineGeniusLink]);

  function bookVendorToBudget({ category, vendorName, contractAmount, notes, attachments }) {
    const item = makeItem({ category: category || "", vendor: vendorName || "", contractAmount: contractAmount || "", notes: notes || "", attachments: attachments || [] });
    setVendors((v) => [...v, item]);
    return item.id;
  }

  const value = {
    vendors, setVendors, rentals, setRentals, misc, setMisc,
    initialOverallBudget, setInitialOverallBudget,
    categoryBudgets, setCategoryBudgets,
    savingsLog, setSavingsLog,
    timelineGeniusLink, setTimelineGeniusLink,
    bookVendorToBudget,
  };

  return <BudgetDataContext.Provider value={value}>{children}</BudgetDataContext.Provider>;
}

export function useBudgetData() {
  const ctx = useContext(BudgetDataContext);
  if (!ctx) throw new Error("useBudgetData must be used inside BudgetDataProvider");
  return ctx;
}
