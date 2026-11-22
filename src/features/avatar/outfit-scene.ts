import {
  Color, CylinderGeometry, DirectionalLight, HemisphereLight, Mesh,
  MeshStandardMaterial, OrthographicCamera, Scene, WebGLRenderer,
} from "three";
import type { Item } from "../styling/engine";
import { createOutfitModel, disposeModel } from "./outfit-model";

export type AvatarView = {
  rotation: number;
  zoom: number;
  height: number;
  width: number;
  showOuter: boolean;
};

export function mountOutfitScene(canvas: HTMLCanvasElement, onError: () => void) {
  const gl = canvas.getContext("webgl2", { antialias: true });
  if (!gl) throw new Error("WebGL 2 unavailable");

  const renderer = new WebGLRenderer({ canvas, context: gl });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  const scene = new Scene();
  scene.background = new Color("#eaf1f5");
  const camera = new OrthographicCamera(-2, 2, 2, -2, 0.1, 30);
  camera.position.set(0, 2.13, 7);
  camera.lookAt(0, 1.61, 0);

  scene.add(new HemisphereLight("#f5f9ff", "#71685c", 2.0));
  const key = new DirectionalLight("#fff0d5", 2.3);
  key.position.set(3, 7, 5);
  scene.add(key);
  const fill = new DirectionalLight("#c9e4fc", 1.35);
  fill.position.set(-4, 4, -3);
  scene.add(fill);
  const base = new Mesh(new CylinderGeometry(1.12, 1.12, 0.075, 48),
    new MeshStandardMaterial({ color: "#cad9e2", roughness: 0.85 }));
  base.position.y = 0.005;
  scene.add(base);

  let outfit: ReturnType<typeof createOutfitModel> | undefined;
  let view: AvatarView | undefined;
  let failed = false;
  function fail() {
    if (failed) return;
    failed = true;
    onError();
  }
  function render() {
    if (!outfit || !view || failed) return;
    try {
      renderer.render(scene, camera);
    } catch {
      fail();
    }
  }
  function resize() {
    const { clientWidth: width, clientHeight: height } = canvas;
    if (!width || !height || failed) return;
    const aspect = width / height;
    const halfHeight = Math.max(1.91, 1.4 / aspect);
    camera.left = -halfHeight * aspect;
    camera.right = halfHeight * aspect;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    render();
  }
  function applyView() {
    if (!outfit || !view) return;
    outfit.model.rotation.y = view.rotation * Math.PI / 180;
    outfit.model.scale.set(view.width / 100, view.height / 100, view.width / 100);
    outfit.outer.visible = view.showOuter;
    camera.zoom = view.zoom / 100;
    camera.updateProjectionMatrix();
    render();
  }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  canvas.addEventListener("webglcontextlost", fail);
  resize();

  return {
    setOutfit(items: Item[]) {
      if (failed) return;
      if (outfit) {
        scene.remove(outfit.model);
        disposeModel(outfit.model);
      }
      outfit = createOutfitModel(items);
      scene.add(outfit.model);
      applyView();
    },
    setView(next: AvatarView) {
      view = next;
      applyView();
    },
    dispose() {
      observer.disconnect();
      canvas.removeEventListener("webglcontextlost", fail);
      if (outfit) disposeModel(outfit.model);
      base.geometry.dispose();
      base.material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
