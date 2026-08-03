import React, { useState, useRef, useEffect } from "react";
import { ZoomIn, ZoomOut, X, Check } from "lucide-react";

const DISPLAY_SIZE = 280;
const OUTPUT_SIZE = 320;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

export default function PhotoCropModal({ imageSrc, initialCrop, onSave, onClose }) {
  const [zoom, setZoom] = useState(initialCrop?.zoom || 1);
  const [offset, setOffset] = useState({ x: initialCrop?.x || 0, y: initialCrop?.y || 0 });
  const [imgNatural, setImgNatural] = useState(null);
  const [, forceRender] = useState(0);
  const draggingRef = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
  const imgRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setImgNatural({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = imageSrc;
  }, [imageSrc]);

  if (!imgNatural) {
    return (
      <div style={overlayStyle}>
        <div style={{ ...modalStyle, textAlign: "center", padding: 40 }}>
          <span style={{ fontSize: 12.5, color: "#8A8577" }}>Loading photo...</span>
        </div>
      </div>
    );
  }

  const baseScale = DISPLAY_SIZE / Math.min(imgNatural.width, imgNatural.height);
  const effectiveScale = baseScale * zoom;
  const drawWidth = imgNatural.width * effectiveScale;
  const drawHeight = imgNatural.height * effectiveScale;

  function clampOffset(x, y, currentZoom) {
    const scale = baseScale * currentZoom;
    const w = imgNatural.width * scale;
    const h = imgNatural.height * scale;
    const maxX = Math.max(0, (w - DISPLAY_SIZE) / 2);
    const maxY = Math.max(0, (h - DISPLAY_SIZE) / 2);
    return { x: Math.max(-maxX, Math.min(maxX, x)), y: Math.max(-maxY, Math.min(maxY, y)) };
  }

  function handlePointerDown(e) {
    draggingRef.current = true;
    forceRender((n) => n + 1);
    const point = e.touches ? e.touches[0] : e;
    dragStart.current = { x: point.clientX, y: point.clientY, offsetX: offset.x, offsetY: offset.y };
  }
  function handlePointerMove(e) {
    if (!draggingRef.current) return;
    const point = e.touches ? e.touches[0] : e;
    const dx = point.clientX - dragStart.current.x;
    const dy = point.clientY - dragStart.current.y;
    setOffset(clampOffset(dragStart.current.offsetX + dx, dragStart.current.offsetY + dy, zoom));
  }
  function handlePointerUp() {
    draggingRef.current = false;
    forceRender((n) => n + 1);
  }

  function handleZoomChange(newZoom) {
    setZoom(newZoom);
    setOffset((o) => clampOffset(o.x, o.y, newZoom));
  }

  function handleSave() {
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    const k = OUTPUT_SIZE / DISPLAY_SIZE;
    const outW = drawWidth * k;
    const outH = drawHeight * k;
    const centerX = (DISPLAY_SIZE / 2 + offset.x) * k;
    const centerY = (DISPLAY_SIZE / 2 + offset.y) * k;
    const img = imgRef.current;
    ctx.drawImage(img, centerX - outW / 2, centerY - outH / 2, outW, outH);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    onSave(dataUrl, { zoom, x: offset.x, y: offset.y });
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#1D1E1A", fontFamily: "Georgia, serif" }}>Reposition Photo</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#8A8577" }}><X size={18} /></button>
        </div>

        <div
          style={{
            width: DISPLAY_SIZE, height: DISPLAY_SIZE, margin: "0 auto 18px", position: "relative",
            borderRadius: "50%", overflow: "hidden", background: "#1D1E1A", cursor: draggingRef.current ? "grabbing" : "grab",
            border: "2px solid #E7D6B8", boxShadow: "0 0 0 4px rgba(181,138,74,0.12)",
          }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Crop preview"
            draggable={false}
            style={{
              position: "absolute",
              width: drawWidth, height: drawHeight,
              left: DISPLAY_SIZE / 2 + offset.x - drawWidth / 2,
              top: DISPLAY_SIZE / 2 + offset.y - drawHeight / 2,
              userSelect: "none", pointerEvents: "none",
            }}
          />
        </div>

        <div style={{ fontSize: 10.5, color: "#8A8577", textAlign: "center", marginBottom: 16 }}>Drag to reposition. Use the slider to zoom.</div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <ZoomOut size={16} color="#8A8577" />
          <input
            type="range" min={MIN_ZOOM} max={MAX_ZOOM} step="0.01"
            value={zoom}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
            style={{ flex: 1, accentColor: "#B58A4A", cursor: "pointer" }}
          />
          <ZoomIn size={16} color="#8A8577" />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, background: "#FFFFFF", border: "1px solid #E7E2D5", borderRadius: 9, padding: 11, fontSize: 12.5, fontWeight: 700, color: "#8A8577", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={handleSave} style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#B58A4A", color: "#1D1E1A", border: "none", borderRadius: 9, padding: 11, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
            <Check size={14} /> Save Photo
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed", inset: 0, background: "rgba(29,30,26,0.6)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 80, padding: 20,
};
const modalStyle = {
  background: "#FFFFFF", borderRadius: 16, width: "100%", maxWidth: 360, padding: 24,
};