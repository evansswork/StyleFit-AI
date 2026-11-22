"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { OutfitArt } from "@/components/outfit-art";
import type { Item } from "../styling/engine";
import type { AvatarView, mountOutfitScene } from "./outfit-scene";

const initialView: AvatarView = { rotation: 22, zoom: 100, height: 100, width: 100, showOuter: true, framing: "outfit" };
const ranges = [
  { key: "rotation", label: "Rotasi avatar", min: 0, max: 360, unit: "°" },
  { key: "zoom", label: "Zoom", min: 80, max: 130, unit: "%" },
  { key: "height", label: "Tinggi relatif", min: 90, max: 110, unit: "%" },
  { key: "width", label: "Lebar relatif", min: 85, max: 115, unit: "%" },
] as const;

type PreviewMode = "2d" | "3d" | "fallback";

function AvatarPreview({ items, onModeChange }: { items: Item[]; onModeChange: (mode: PreviewMode) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [viewer, setViewer] = useState<Awaited<ReturnType<typeof mountOutfitScene>> | null>(null);
  const [view, setView] = useState(initialView);
  const hasOuter = items.some(item => item.slot === "outer");

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    let scene: Awaited<ReturnType<typeof mountOutfitScene>> | undefined;
    function showFallback() {
      if (!signal.aborted) onModeChange("fallback");
    }

    void import("./outfit-scene").then(async ({ mountOutfitScene }) => {
      if (signal.aborted || !canvas.current) return;
      scene = await mountOutfitScene(canvas.current, showFallback, signal);
      if (signal.aborted) {
        scene.dispose();
        return;
      }
      setViewer(scene);
    }).catch(showFallback);

    return () => {
      controller.abort();
      scene?.dispose();
    };
  }, [onModeChange]);

  useEffect(() => { viewer?.setOutfit(items); }, [viewer, items]);
  useEffect(() => { viewer?.setView(view); }, [viewer, view]);

  return <div className="avatar-preview">
    {viewer && <div className="preview-options" role="group" aria-label="Bingkai avatar">
      <button type="button" className="lock-button" aria-pressed={view.framing === "outfit"}
        onClick={() => setView({ ...view, framing: "outfit" })}>Outfit lengkap</button>
      <button type="button" className="lock-button" aria-pressed={view.framing === "face"}
        onClick={() => setView({ ...view, framing: "face" })}>Detail wajah</button>
    </div>}
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
    {mode === "2d" ? <OutfitArt items={items} /> : <div className="avatar-workspace">
      {mode === "3d" ? <AvatarPreview items={items} onModeChange={setMode} /> : <OutfitArt items={items} />}
      <aside className="avatar-reference" aria-label="Referensi foto dan sumber wajah">
        <figure>
          <Image src="/demo/sunrise-through-the-rain.png" alt="Dua orang berkemeja putih berbagi earphone"
            width={640} height={360} unoptimized />
          <figcaption><strong>Foto referensi outfit</strong>Sunrise Through the Rain Concept Idea</figcaption>
        </figure>
        <p>Template wajah berasal dari <a href="/avatar/LeePerrySmith_License.txt">scan Lee Perry-Smith</a>. <a href="https://creativecommons.org/licenses/by/3.0/" rel="noreferrer">CC BY 3.0</a></p>
      </aside>
    </div>}
  </>;
}
