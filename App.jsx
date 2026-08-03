import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/client/Dashboard.jsx";
import Budget from "./pages/client/Budget.jsx";
import Vendors from "./pages/client/Vendors.jsx";
import MeetingNotes from "./pages/client/MeetingNotes.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AllWeddings from "./pages/admin/AllWeddings.jsx";
import VendorLibrary from "./pages/admin/VendorLibrary.jsx";

import ComingSoon from "./components/ComingSoon.jsx";

// Client Portal nav items that don't have a real page yet.
const CLIENT_STUBS = [
  { path: "payments", label: "Payments" },
  { path: "timeline", label: "Timeline" },
  { path: "guestlist", label: "Guest List" },
  { path: "seating", label: "Seating" },
  { path: "design", label: "Design" },
  { path: "documents", label: "Documents" },
  { path: "contacts", label: "Contacts" },
  { path: "settings", label: "Settings" },
];

// Admin Portal nav items that don't have a real page yet.
const ADMIN_STUBS = [
  { path: "calendar", label: "Calendar" },
  { path: "tasks", label: "Tasks" },
  { path: "payments", label: "Payments" },
  { path: "analytics", label: "Analytics" },
  { path: "notifications", label: "Notifications" },
  { path: "settings", label: "Settings" },
];

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/portal/dashboard" replace />} />

      <Route path="/portal/dashboard" element={<Dashboard />} />
      <Route path="/portal/budget" element={<Budget />} />
      <Route path="/portal/vendors" element={<Vendors />} />
      <Route path="/portal/meetings" element={<MeetingNotes />} />
      {CLIENT_STUBS.map((s) => (
        <Route key={s.path} path={`/portal/${s.path}`} element={<ComingSoon label={s.label} backTo="/portal/dashboard" />} />
      ))}

      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/weddings" element={<AllWeddings />} />
      <Route path="/admin/vendors" element={<VendorLibrary />} />
      {ADMIN_STUBS.map((s) => (
        <Route key={s.path} path={`/admin/${s.path}`} element={<ComingSoon label={s.label} backTo="/admin/dashboard" />} />
      ))}

      <Route path="*" element={<Navigate to="/portal/dashboard" replace />} />
    </Routes>
  );
}