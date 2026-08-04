import React, { useState, useRef, useEffect } from "react";
import { Outlet, useSearchParams } from "react-router-dom";
import ClientHeader from "./ClientHeader.jsx";
import { useWeddingsData } from "../context/WeddingsDataContext.jsx";

export default function ClientPortalLayout() {
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(76);
  const [searchParams] = useSearchParams();
  const { setCurrentWeddingId, weddings } = useWeddingsData();

  useEffect(() => {
    const urlWeddingId = searchParams.get("w");
    if (urlWeddingId && weddings.some((w) => w.id === urlWeddingId)) {
      setCurrentWeddingId(urlWeddingId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("w")]);

  useEffect(() => {
    const el = headerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeaderHeight(entry.contentRect.height);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <ClientHeader ref={headerRef} />
      <div style={{ paddingTop: headerHeight }}>
        <Outlet />
      </div>
    </>
  );
}