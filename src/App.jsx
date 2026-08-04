import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { BudgetDataProvider } from "./context/BudgetDataContext.jsx";
import { WeddingProfileProvider } from "./context/WeddingProfileContext.jsx";
import { WeddingsDataProvider } from "./context/WeddingsDataContext.jsx";
import ClientPortalLayout from "./components/ClientPortalLayout.jsx";
import Dashboard from "./pages/client/Dashboard.jsx";
import Budget from "./pages/client/Budget.jsx";
import Vendors from "./pages/client/Vendors.jsx";
import Timeline from "./pages/client/Timeline.jsx";
import MeetingNotes from "./pages/client/MeetingNotes.jsx";
import Contacts from "./pages/client/Contacts.jsx";
import SettingsPage from "./pages/client/Settings.jsx";
import Documents from "./pages/client/Documents.jsx";
import GuestList from "./pages/client/GuestList.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AllWeddings from "./pages/admin/AllWeddings.jsx";
import VendorLibrary from "./pages/admin/VendorLibrary.jsx";

import ComingSoon from "./components/ComingSoon.jsx";

const CLIENT_STUBS = [
  { path: "payments", label: "Payments" },
  { path: "seating", label: "Seating" },
  { path: "design", label: "Design" },
];

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
    <WeddingsDataProvider>
    <BudgetDataProvider>
    <WeddingProfileProvider>
    <Routes>
<Route path="/" element={<Navigate to="/admin/weddings" replace />} />

      <Route element={<ClientPortalLayout />}>
        <Route path="/portal/dashboard" element={<Dashboard />} />
        <Route path="/portal/budget" element={<Budget />} />
        <Route path="/portal/vendors" element={<Vendors />} />
        <Route path="/portal/timeline" element={<Timeline />} />
        <Route path="/portal/meetings" element={<MeetingNotes />} />
        <Route path="/portal/contacts" element={<Contacts />} />
        <Route path="/portal/settings" element={<SettingsPage />} />
        <Route path="/portal/documents" element={<Documents />} />
        <Route path="/portal/guestlist" element={<GuestList />} />
        {CLIENT_STUBS.map((s) => (
          <Route key={s.path} path={`/portal/${s.path}`} element={<ComingSoon label={s.label} backTo="/portal/dashboard" />} />
        ))}
      </Route>

      <Route path="/admin" element={<Navigate to="/admin/weddings" replace />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/weddings" element={<AllWeddings />} />
      <Route path="/admin/vendors" element={<VendorLibrary />} />
      {ADMIN_STUBS.map((s) => (
        <Route key={s.path} path={`/admin/${s.path}`} element={<ComingSoon label={s.label} backTo="/admin/dashboard" />} />
      ))}

      <Route path="*" element={<Navigate to="/portal/dashboard" replace />} />
    </Routes>
    </WeddingProfileProvider>
    </BudgetDataProvider>
    </WeddingsDataProvider>
  );
}
