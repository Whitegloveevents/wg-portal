import React from "react";
import { useWeddingsData, uid } from "./WeddingsDataContext.jsx";

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

export function BudgetDataProvider({ children }) {
  return children;
}

export function useBudgetData() {
  const { weddings, currentWeddingId, updateWeddingField } = useWeddingsData();
  const current = weddings.find((w) => w.id === currentWeddingId) || weddings[0] || null;

  if (!current) {
    const noop = () => {};
    return {
      vendors: [], setVendors: noop, rentals: [], setRentals: noop, misc: [], setMisc: noop,
      initialOverallBudget: 0, setInitialOverallBudget: noop,
      categoryBudgets: [], setCategoryBudgets: noop,
      savingsLog: [], setSavingsLog: noop,
      timelineGeniusLink: "", setTimelineGeniusLink: noop,
      bookVendorToBudget: noop,
    };
  }

  const id = current.id;
  const setVendors = (v) => updateWeddingField(id, "vendors", v);
  const setRentals = (v) => updateWeddingField(id, "rentals", v);
  const setMisc = (v) => updateWeddingField(id, "misc", v);
  const setInitialOverallBudget = (v) => updateWeddingField(id, "initialOverallBudget", v);
  const setCategoryBudgets = (v) => updateWeddingField(id, "categoryBudgets", v);
  const setSavingsLog = (v) => updateWeddingField(id, "savingsLog", v);
  const setTimelineGeniusLink = (v) => updateWeddingField(id, "timelineGeniusLink", v);

  function bookVendorToBudget({ category, vendorName, contractAmount, notes, attachments }) {
    const item = makeItem({ category: category || "", vendor: vendorName || "", contractAmount: contractAmount || "", notes: notes || "", attachments: attachments || [] });
    setVendors((v) => [...(v || []), item]);
    return item.id;
  }

  return {
    vendors: current.vendors || [], setVendors,
    rentals: current.rentals || [], setRentals,
    misc: current.misc || [], setMisc,
    initialOverallBudget: current.initialOverallBudget || 0, setInitialOverallBudget,
    categoryBudgets: current.categoryBudgets || [], setCategoryBudgets,
    savingsLog: current.savingsLog || [], setSavingsLog,
    timelineGeniusLink: current.timelineGeniusLink || "", setTimelineGeniusLink,
    bookVendorToBudget,
  };
}