"use client";

import Link from "next/link";
import { useState } from "react";
import { OutfitArt } from "@/components/outfit-art";
import { slotNames, type Slot, type Style, type Weather } from "../styling/engine";
import { changeDemoContext, demoHref, demoItems, preset, type DemoState } from "./data";

export function DemoStudio() {
  const [state, setState] = useState<DemoState>({ style: "casual", weather: "tropical", selected: preset("casual", "tropical"), locked: [] });
  const [message, setMessage] = useState("");
  const items = demoItems.filter(item => Object.values(state.selected).includes(item.id));
  function changeContext(style: Style, weather: Weather) {
    const result = changeDemoContext(state, style, weather);
    setState(result.state);
    setMessage(result.error || `Pilihan berubah menjadi ${style === "casual" ? "casual" : "smart casual"}, ${weather === "tropical" ? "tropis" : "sejuk"}.`);
  }
  function swap(slot: Slot) {
    const options = demoItems.filter(item => item.slot === slot && item.styles.includes(state.style) && item.weather.includes(state.weather));
    const current = options.findIndex(item => item.id === state.selected[slot]);
    const next = options[(current + 1) % options.length];
    if (!next) return;
    setState({ ...state, selected: { ...state.selected, [slot]: next.id } });
    setMessage(`${slotNames[slot]} diganti menjadi ${next.name}; pilihan lain tetap.`);
  }
  return <section className="demo-studio" aria-labelledby="demo-title" id="demo">
    <div className="studio-heading">
      <div><h2 id="demo-title">Ruang coba</h2><p>Ubah gaya, cuaca, atau satu item.</p></div>
      <span className="pill">Demo contoh</span>
    </div>
    <OutfitArt items={items} />
    <div className="studio-controls">
      <fieldset className="choice-group"><legend>Gaya kamu</legend><div className="segmented">
        <button type="button" aria-pressed={state.style === "casual"} onClick={() => changeContext("casual", state.weather)}>Casual</button>
        <button type="button" aria-pressed={state.style === "smart-casual"} onClick={() => changeContext("smart-casual", state.weather)}>Smart casual</button>
      </div></fieldset>
      <fieldset className="choice-group"><legend>Konteks cuaca</legend><div className="segmented">
        <button type="button" aria-pressed={state.weather === "tropical"} onClick={() => changeContext(state.style, "tropical")}>Tropis</button>
        <button type="button" aria-pressed={state.weather === "cool"} onClick={() => changeContext(state.style, "cool")}>Sejuk</button>
      </div></fieldset>
      <div className="demo-item-list">{items.map(item => <div className="demo-item" key={item.id}>
        <div className="item-description">
          <span aria-hidden="true" className="color-swatch" style={{ backgroundColor: item.color }} />
          <span><small>{slotNames[item.slot]}</small><strong>{item.name}</strong></span>
        </div>
        <button type="button" className="text-button" aria-label={`Ganti ${slotNames[item.slot].toLowerCase()}`} disabled={state.locked.includes(item.slot)} onClick={() => swap(item.slot)}>Ganti</button>
        <button type="button" className="lock-button" aria-label={`Pertahankan ${slotNames[item.slot].toLowerCase()}`} aria-pressed={state.locked.includes(item.slot)} onClick={() => {
          setState({ ...state, locked: state.locked.includes(item.slot) ? state.locked.filter(slot => slot !== item.slot) : [...state.locked, item.slot] });
          setMessage(state.locked.includes(item.slot) ? `Kunci ${item.name} dilepas.` : `${item.name} dipertahankan.`);
        }}>{state.locked.includes(item.slot) ? "Terkunci" : "Kunci"}</button>
      </div>)}</div>
      <p className="feedback" role="status">{message}</p>
      <Link className="button primary full" href={demoHref(state)}>Lanjutkan pilihan ke stylist</Link>
    </div>
  </section>;
}
