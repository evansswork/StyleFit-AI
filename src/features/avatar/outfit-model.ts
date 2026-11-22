import {
  CylinderGeometry, DoubleSide, Group, LatheGeometry, Mesh,
  MeshStandardMaterial, SphereGeometry, Vector2, Vector3, type BufferGeometry,
} from "three";
import type { Item } from "../styling/engine";

type Point = [radius: number, height: number];
type Position = [x: number, y: number, z: number];
const fullTurn = Math.PI * 2;

function material(color: string) {
  return new MeshStandardMaterial({ color, roughness: 0.86, side: DoubleSide });
}

function addMesh(parent: Group, geometry: BufferGeometry, surface: MeshStandardMaterial) {
  const mesh = new Mesh(geometry, surface);
  parent.add(mesh);
  return mesh;
}

function ellipsoid(parent: Group, surface: MeshStandardMaterial, center: Position, proportions: Position) {
  const mesh = addMesh(parent, new SphereGeometry(1, 20, 14), surface);
  mesh.position.set(...center);
  mesh.scale.set(...proportions);
}

function taper(parent: Group, surface: MeshStandardMaterial, from: Position, to: Position, base: number, tip: number) {
  const start = new Vector3(...from);
  const end = new Vector3(...to);
  const axis = end.clone().sub(start);
  const mesh = addMesh(parent, new CylinderGeometry(tip, base, axis.length(), 18), surface);
  mesh.position.copy(start).lerp(end, 0.5);
  mesh.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), axis.normalize());
}

function shell(parent: Group, surface: MeshStandardMaterial, profile: Point[], depth: number, opening = 0) {
  const mesh = addMesh(parent, new LatheGeometry(profile.map(([radius, y]) => new Vector2(radius, y)),
    36, opening / 2, fullTurn - opening), surface);
  mesh.scale.z = depth;
}

export function createOutfitModel(items: Item[]) {
  const model = new Group();
  const outer = new Group();
  const template = (slot: Item["slot"]) => items.find(item => item.slot === slot);
  const skin = material("#ad9b88");
  const top = template("top");
  const bottom = template("bottom");
  const shoes = template("shoes");
  const jacket = template("outer");

  const shirtFabric = top ? material(top.color) : skin;
  const trousers = bottom ? material(bottom.color) : skin;
  const footwear = shoes ? material(shoes.color) : skin;

  ellipsoid(model, skin, [0, 2.85, 0.02], [0.182, 0.248, 0.171]);
  taper(model, skin, [0, 2.49, 0], [0, 2.76, 0], 0.132, 0.112);
  shell(model, shirtFabric, [[0, 1.54], [0.34, 1.54], [0.35, 1.59], [0.33, 1.91], [0.39, 2.23],
    [0.41, 2.42], [0.37, 2.48], [0.18, 2.55], [0.13, 2.51]], 0.58);
  shell(model, trousers, [[0, 1.3], [0.327, 1.3], [0.346, 1.49], [0.337, 1.65], [0, 1.65]], 0.59);

  if (top?.name.toLowerCase().includes("kemeja")) {
    const seam = material("#c2c7c8");
    taper(model, seam, [0, 1.59, 0.207], [0, 2.45, 0.233], 0.007, 0.008);
    for (const side of [-1, 1]) {
      taper(model, seam, [side * 0.105, 2.54, 0.09], [side * 0.067, 2.35, 0.228], 0.014, 0.025);
    }
    for (const height of [1.76, 1.95, 2.12, 2.27]) {
      ellipsoid(model, seam, [0, height, 0.235], [0.016, 0.016, 0.012]);
    }
  }

  for (const side of [-1, 1]) {
    const shoulder: Position = [side * 0.35, 2.365, 0];
    const cuff: Position = [side * 0.45, 2.085, 0];
    const wrist: Position = [side * 0.52, 1.543, 0.018];
    taper(model, shirtFabric, shoulder, cuff, 0.132, 0.103);
    taper(model, skin, cuff, wrist, 0.077, 0.052);
    ellipsoid(model, skin, [wrist[0], 1.496, 0.022], [0.063, 0.104, 0.052]);
    taper(model, trousers, [side * 0.162, 1.572, 0], [side * 0.205, 0.245, 0], 0.169, 0.127);
    ellipsoid(model, footwear, [side * 0.205, 0.153, 0.104], [0.145, 0.112, 0.253]);
  }

  if (jacket) {
    const fabric = material(jacket.color);
    shell(outer, fabric, [[0.417, 1.43], [0.423, 1.56], [0.407, 1.95], [0.469, 2.32],
      [0.445, 2.47], [0.365, 2.52], [0.179, 2.586]], 0.64, 1.46);
    for (const side of [-1, 1]) {
      taper(outer, fabric, [side * 0.38, 2.386, 0], [side * 0.475, 2.022, 0.015], 0.155, 0.121);
      taper(outer, fabric, [side * 0.475, 2.025, 0.015], [side * 0.524, 1.57, 0.018], 0.122, 0.084);
    }
    model.add(outer);
  }

  return { model, outer };
}

export function disposeModel(model: Group) {
  const surfaces = new Set<MeshStandardMaterial>();
  model.traverse(object => {
    if (object instanceof Mesh) {
      object.geometry.dispose();
      surfaces.add(object.material);
    }
  });
  surfaces.forEach(surface => surface.dispose());
}
