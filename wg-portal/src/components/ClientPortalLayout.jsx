import React from "react";
import { Outlet } from "react-router-dom";
import ClientHeader, { HEADER_HEIGHT } from "./ClientHeader.jsx";

export default function ClientPortalLayout() {
  return (
    <>
      <ClientHeader />
      <div style={{ paddingTop: HEADER_HEIGHT }}>
        <Outlet />
      </div>
    </>
  );
}
