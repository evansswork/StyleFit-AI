import {
  CanvasTexture, DirectionalLight, HemisphereLight, Mesh,
  MeshBasicMaterial, OrthographicCamera, PlaneGeometry, Scene, WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import type { Item } from "../styling/engine";
import { dressModel, disposeModel } from "./outfit-model";

export type AvatarView = {
  rotation: number;
  zoom: number;
  height: number;
  width: number;
  showOuter: boolean;
  framing: "outfit" | "face" | "trousers";
};

export async function mountOutfitScene(canvas: HTMLCanvasElement, onError: () => void, signal: AbortSignal) {
  const gl = canvas.getContext("webgl2", { antialias: true, alpha: true });
  if (!gl) throw new Error("WebGL 2 unavailable");

  const { scene: subject } = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync("/avatar/studio-wardrobe.glb");
  let renderer: WebGLRenderer;
  try {
    signal.throwIfAborted();
    dressModel(subject, [], false);
    if (gl.isContextLost()) throw new Error("WebGL context lost during avatar loading");
    renderer = new WebGLRenderer({ canvas, context: gl, alpha: true });
  } catch (error) {
    disposeModel(subject);
    throw error;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  const scene = new Scene();
  renderer.setClearColor(0, 0);
  scene.add(subject);
  const camera = new OrthographicCamera(-2, 2, 2, -2, 0.01, 20);

  scene.add(new HemisphereLight("#fffaf2", "#e1d9ce", 1.65));
  const key = new DirectionalLight("#fff5e9", 1.85);
  key.position.set(-3, 5, 4);
  scene.add(key);
  const rim = new DirectionalLight("#dcebf8", 1.35);
  rim.position.set(3, 3, -4);
  scene.add(rim);

  const shadowMap = document.createElement("canvas");
  shadowMap.width = shadowMap.height = 128;
  const ctx = shadowMap.getContext("2d")!;
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(48, 43, 38, 0.32)");
  gradient.addColorStop(1, "rgba(48, 43, 38, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const shadow = new Mesh(new PlaneGeometry(0.82, 0.55),
    new MeshBasicMaterial({ map: new CanvasTexture(shadowMap), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  subject.add(shadow);

  let items: Item[] = [];
  let view: AvatarView | undefined;
  let failed = false;
  let aspect = 1;
  function fail() {
    if (failed) return;
    failed = true;
    onError();
  }
  function render() {
    if (!view || failed) return;
    try {
      renderer.render(scene, camera);
    } catch {
      fail();
    }
  }
  function resize() {
    const { clientWidth: width, clientHeight: height } = canvas;
    if (!width || !height || failed) return;
    aspect = width / height;
    renderer.setSize(width, height, false);
    applyView();
  }
  function applyView() {
    if (!view || failed) return;

    subject.rotation.y = view.rotation * Math.PI / 180;
    subject.scale.set(view.width / 100, view.height / 100, view.width / 100);
    const face = view.framing === "face";
    const trousers = view.framing === "trousers";
    const targetY = (face ? 1.62 : trousers ? 0.58 : 0.90) * subject.scale.y;
    const halfHeight = face ? Math.max(0.211, 0.16 / aspect)
      : trousers ? Math.max(0.61, 0.30 / aspect) : Math.max(0.98, 0.41 / aspect);
    camera.left = -halfHeight * aspect;
    camera.right = halfHeight * aspect;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.position.set(0, targetY + (face ? 0 : 0.22), 5);
    camera.lookAt(0, targetY, 0);
    camera.zoom = view.zoom / 100;
    camera.updateProjectionMatrix();
    render();
  }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  canvas.addEventListener("webglcontextlost", fail);
  resize();

  return {
    setOutfit(nextItems: Item[]) {
      items = nextItems;
      dressModel(subject, items, view?.showOuter ?? true);
      applyView();
    },
    setView(next: AvatarView) {
      if (view?.showOuter !== next.showOuter) dressModel(subject, items, next.showOuter);
      view = next;
      applyView();
    },
    dispose() {
      observer.disconnect();
      canvas.removeEventListener("webglcontextlost", fail);
      disposeModel(subject);
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
