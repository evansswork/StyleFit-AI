import { Mesh, MeshStandardMaterial, Texture, type BufferGeometry, type Group, type Material } from "three";
import type { Item } from "../styling/engine";
import { winterLayers, type WinterLayer } from "./winter-layers";

export function dressModel(model: Group, items: Item[], showOuter: boolean, showScannedShoes = false, winter?: WinterLayer) {
  const garment = (name: string, color: string | undefined, visible: boolean) => {
    const mesh = model.getObjectByName(name)?.getObjectByProperty("isMesh", true);
    if (!(mesh instanceof Mesh) || !(mesh.material instanceof MeshStandardMaterial)) {
      throw new Error(`Missing garment ${name}`);
    }
    mesh.visible = visible;
    mesh.material.color.set(color ?? "#dad9d3");
  };
  const top = items.find(item => item.slot === "top");
  const jacket = items.find(item => item.slot === "outer");
  const layered = winter ? winter === "outer" : Boolean(jacket) && showOuter;
  const topColor = winter ? winterLayers[0].color : top?.color;
  const outerColor = winter ? winterLayers[2].color : jacket?.color;

  garment("Outer", outerColor, layered);
  garment("Vest", winterLayers[1].color, winter === "mid");
  garment("VestUnder", winterLayers[1].color, winter === "outer");
  const tee = !winter && /ka[ou]s|t[- ]?shirt/i.test(top?.name ?? "");
  // Separate inner panels keep sleeves and the shirt back from poking through the jacket.
  garment("ShirtUnder", topColor, layered && !tee && !winter);
  garment("ShirtForVest", topColor, winter === "mid");
  garment("WinterCollar", topColor, winter === "outer");
  garment("TeeUnder", topColor, layered && tee);
  garment("Shirt", topColor, !layered && !tee && winter !== "mid");
  garment("Tee", topColor, !layered && tee);
  model.traverse(node => {
    if (node.name.startsWith("Arms")) node.visible = tee && !layered;
    if (node.name.startsWith("Skin")) node.visible = !tee || layered;
  });
  const bottom = items.find(item => item.slot === "bottom");
  const denim = /jeans|denim/i.test(bottom?.name ?? "");
  garment("Denim", bottom?.color, denim);
  garment("Chinos", bottom?.color, !denim);
  const shoes = items.find(item => item.slot === "shoes");
  const trainers = /sneaker|trainer|olahraga/i.test(shoes?.name ?? "");
  garment("Trainers", shoes?.color, !showScannedShoes && trainers);
  garment("Shoes", shoes?.color, !showScannedShoes && !trainers);
}

export function disposeModel(model: Group) {
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();
  const textures = new Set<Texture>();
  model.traverse(node => {
    if (!(node instanceof Mesh)) return;
    geometries.add(node.geometry);
    for (const material of Array.isArray(node.material) ? node.material : [node.material]) materials.add(material);
  });
  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) {
    for (const property of Object.values(material)) {
      if (property instanceof Texture) textures.add(property);
    }
    material.dispose();
  }
  for (const texture of textures) {
    texture.dispose();
    if (texture.image instanceof ImageBitmap) texture.image.close();
  }
}
