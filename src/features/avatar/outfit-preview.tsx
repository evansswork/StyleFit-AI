"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
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

function AvatarPreview({ items, onModeChange, children }: { items: Item[]; onModeChange: (mode: PreviewMode) => void; children?: ReactNode }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [viewer, setViewer] = useState<Awaited<ReturnType<typeof mountOutfitScene>> | null>(null);
  const [view, setView] = useState(initialView);
  const drag = useRef<{ id: number; x: number; rotation: number } | null>(null);
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
      <button type="button" className="lock-button" aria-pressed={view.framing === "trousers"}
        onClick={() => setView({ ...view, framing: "trousers" })}>Detail celana</button>
    </div>}
    <figure>
      <canvas ref={canvas} role="img" aria-label={`Avatar 3D dengan ${items.map(item => item.name).join(", ")}`}
        onPointerDown={event => {
          if (!viewer || !event.isPrimary || event.button !== 0) return;
          drag.current = { id: event.pointerId, x: event.clientX, rotation: view.rotation };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={event => {
          const start = drag.current;
          if (start?.id !== event.pointerId) return;
          const degrees = Math.round(start.rotation + (event.clientX - start.x) * 300 / event.currentTarget.clientWidth);
          setView(current => ({ ...current, rotation: ((degrees % 360) + 360) % 360 }));
        }}
        onLostPointerCapture={() => { drag.current = null; }} />
      {!viewer && <p className="fine-print" role="status">Memuat avatar 3D…</p>}
      <figcaption>Model pakaian serupa. Warna mengikuti pilihanmu. Potongan dan bahan memakai template studio.</figcaption>
    </figure>
    {viewer && children}
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

export function OutfitPreview({ items, startIn3D, children }: { items: Item[]; startIn3D: boolean; children?: ReactNode }) {
  const [mode, setMode] = useState<PreviewMode>(startIn3D ? "3d" : "2d");
  return <>
    <div className="preview-options" role="group" aria-label="Mode preview">
      <button type="button" className="lock-button" aria-pressed={mode !== "3d"} onClick={() => setMode("2d")}>Ilustrasi 2D</button>
      <button type="button" className="lock-button" aria-pressed={mode === "3d"} onClick={() => setMode("3d")}>Avatar 3D</button>
    </div>
    {mode === "fallback" && <p className="privacy-note" role="status">
      Preview 3D tidak dapat dimuat. Kamu masih bisa melihat ilustrasi 2D atau mencoba 3D lagi.
    </p>}
    {mode === "2d" ? <OutfitArt items={items} /> : <div className="avatar-workspace">
      {mode === "3d" ? <AvatarPreview items={items} onModeChange={setMode}>{children}</AvatarPreview> : <OutfitArt items={items} />}
      <aside className="avatar-reference" aria-label="Referensi foto dan sumber avatar">
        <figure>
          <Image src="/demo/sunrise-through-the-rain.png" alt="Dua orang berkemeja putih berbagi earphone"
            width={640} height={360} unoptimized />
          <figcaption><strong>Foto referensi outfit</strong>Sunrise Through the Rain Concept Idea</figcaption>
        </figure>
        <p>Model studio diadaptasi dari aset <a href="https://www.innerscene.com/tools/library/3d-parts/daniel-3d-person-standing-casual-f788af5a">Innerscene</a> berbasis MakeHuman dan potret 3D <a href="https://grab3d.com/models/anatomy/human-head/">Grab3D</a>. <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0</a></p>
      </aside>
    </div>}
  </>;
}
