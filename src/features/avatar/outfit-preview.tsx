"use client";

import { useEffect, useRef, useState } from "react";
import { OutfitArt } from "@/components/outfit-art";
import type { Item } from "../styling/engine";
import type { AvatarView, mountOutfitScene } from "./outfit-scene";

const initialView: AvatarView = { rotation: 22, zoom: 100, height: 100, width: 100, showOuter: true };
const ranges = [
  { key: "rotation", label: "Rotasi avatar", min: 0, max: 360, unit: "°" },
  { key: "zoom", label: "Zoom", min: 80, max: 130, unit: "%" },
  { key: "height", label: "Tinggi relatif", min: 90, max: 110, unit: "%" },
  { key: "width", label: "Lebar relatif", min: 85, max: 115, unit: "%" },
] as const;

type PreviewMode = "2d" | "3d" | "fallback";

function AvatarPreview({ items, onModeChange }: { items: Item[]; onModeChange: (mode: PreviewMode) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [viewer, setViewer] = useState<ReturnType<typeof mountOutfitScene> | null>(null);
  const [view, setView] = useState(initialView);
  const hasOuter = items.some(item => item.slot === "outer");

  useEffect(() => {
    let active = true;
    let scene: ReturnType<typeof mountOutfitScene> | undefined;
    function showFallback() {
      if (active) onModeChange("fallback");
    }

    void import("./outfit-scene").then(({ mountOutfitScene }) => {
      if (!active || !canvas.current) return;
      scene = mountOutfitScene(canvas.current, showFallback);
      setViewer(scene);
    }).catch(showFallback);

    return () => {
      active = false;
      scene?.dispose();
    };
  }, [onModeChange]);

  useEffect(() => { viewer?.setOutfit(items); }, [viewer, items]);
  useEffect(() => { viewer?.setView(view); }, [viewer, view]);

  return <div className="avatar-preview">
    <figure>
      <canvas ref={canvas} role="img" aria-label={`Avatar 3D dengan ${items.map(item => item.name).join(", ")}`} />
      {!viewer && <p className="fine-print" role="status">Memuat avatar 3D…</p>}
      <figcaption>Model pakaian serupa berdasarkan kategori dan warna. Proporsi hanya untuk visualisasi.</figcaption>
    </figure>
    {viewer && <div className="avatar-controls">
      <div className="avatar-ranges">
        {ranges.map(({ key, label, min, max, unit }) => <label key={key}>
          <span>{label}<span aria-hidden="true">{view[key]}{unit}</span></span>
          <input type="range" min={min} max={max} value={view[key]}
            aria-valuetext={`${view[key]}${unit}`}
            onChange={event => setView({ ...view, [key]: Number(event.target.value) })} />
        </label>)}
      </div>
      {hasOuter && <label className="checkbox-label"><input type="checkbox" checked={view.showOuter}
        onChange={event => setView({ ...view, showOuter: event.target.checked })} /> Tampilkan outer</label>}
      <button type="button" className="text-button avatar-reset" onClick={() => setView(initialView)}>Reset tampilan 3D</button>
    </div>}
  </div>;
}

export function OutfitPreview({ items }: { items: Item[] }) {
  const [mode, setMode] = useState<PreviewMode>("2d");
  return <>
    <div className="preview-options" role="group" aria-label="Mode preview">
      <button type="button" className="lock-button" aria-pressed={mode !== "3d"} onClick={() => setMode("2d")}>Ilustrasi 2D</button>
      <button type="button" className="lock-button" aria-pressed={mode === "3d"} onClick={() => setMode("3d")}>Avatar 3D</button>
    </div>
    {mode === "fallback" && <p className="privacy-note" role="status">
      Preview 3D tidak dapat dimuat. Kamu masih bisa melihat ilustrasi 2D atau mencoba 3D lagi.
    </p>}
    {mode === "3d" ? <AvatarPreview items={items} onModeChange={setMode} /> : <OutfitArt items={items} />}
  </>;
}
