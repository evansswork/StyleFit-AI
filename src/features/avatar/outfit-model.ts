import { Mesh, MeshStandardMaterial, Texture, type BufferGeometry, type Group, type Material } from "three";
import type { Item } from "../styling/engine";

export function dressModel(model: Group, items: Item[], showOuter: boolean, showScannedShoes = false) {
  const garment = (name: string, item: Item | undefined, visible: boolean) => {
    const mesh = model.getObjectByName(name)?.getObjectByProperty("isMesh", true);
    if (!(mesh instanceof Mesh) || !(mesh.material instanceof MeshStandardMaterial)) {
      throw new Error(`Missing garment ${name}`);
    }
    mesh.visible = visible;
    mesh.material.color.set(item?.color ?? "#dad9d3");
  };
  const top = items.find(item => item.slot === "top");
  const jacket = items.find(item => item.slot === "outer");
  const layered = Boolean(jacket) && showOuter;

  garment("Outer", jacket, layered);
  const tee = /ka[ou]s|t[- ]?shirt/i.test(top?.name ?? "");
  // Separate inner panels keep sleeves and the shirt back from poking through the jacket.
  garment("ShirtUnder", top, layered && !tee);
  garment("TeeUnder", top, layered && tee);
  garment("Shirt", top, !layered && !tee);
  garment("Tee", top, !layered && tee);
  model.traverse(node => {
    if (node.name.startsWith("Arms")) node.visible = tee && !layered;
    if (node.name.startsWith("Skin")) node.visible = !tee || layered;
  });
  const bottom = items.find(item => item.slot === "bottom");
  const denim = /jeans|denim/i.test(bottom?.name ?? "");
  garment("Denim", bottom, denim);
  garment("Chinos", bottom, !denim);
  const shoes = items.find(item => item.slot === "shoes");
  const trainers = /sneaker|trainer|olahraga/i.test(shoes?.name ?? "");
  garment("Trainers", shoes, !showScannedShoes && trainers);
  garment("Shoes", shoes, !showScannedShoes && !trainers);
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
