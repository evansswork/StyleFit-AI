import {
  CanvasTexture, DirectionalLight, Group, HemisphereLight, Mesh,
  MeshBasicMaterial, OrthographicCamera, PlaneGeometry, Scene, WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import type { Item } from "../styling/engine";
import { dressModel, disposeModel } from "./outfit-model";
import { scannedShoe } from "./scanned-shoe";
import type { WinterLayer } from "./winter-layers";

export type AvatarView = {
  rotation: number;
  zoom: number;
  height: number;
  width: number;
  showOuter: boolean;
  framing: "outfit" | "face" | "trousers" | "shoes" | "layers";
  winter?: WinterLayer;
};

const frames = {
  outfit: [0.90, 0.98, 0.41],
  face: [1.62, 0.211, 0.16],
  trousers: [0.58, 0.61, 0.30],
  shoes: [0.135, 0.235, 0.24],
  layers: [1.24, 0.38, 0.34],
};

export async function mountOutfitScene(canvas: HTMLCanvasElement, onError: () => void, signal: AbortSignal) {
  const gl = canvas.getContext("webgl2", { antialias: true, alpha: true });
  if (!gl) throw new Error("WebGL 2 unavailable");

  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const { scene: subject } = await loader.loadAsync("/avatar/studio-wardrobe.glb");
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
  let shoePair: Group | undefined;
  let pendingPair: Promise<void> | undefined;
  let showScannedShoes = false;
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
    const shoes = view.framing === "shoes";
    const [center, height, width] = frames[view.framing];
    const targetY = center * subject.scale.y;
    const halfHeight = Math.max(height, width / aspect);
    camera.left = -halfHeight * aspect;
    camera.right = halfHeight * aspect;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.position.set(0, targetY + (face ? 0 : shoes ? 1.35 : 0.22), 5);
    camera.lookAt(0, targetY, 0);
    camera.zoom = view.zoom / 100;
    camera.updateProjectionMatrix();
    render();
  }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  canvas.addEventListener("webglcontextlost", fail);
  resize();

  function updateOutfit() {
    if (shoePair) shoePair.visible = showScannedShoes && !view?.winter;
    dressModel(subject, items, view?.showOuter ?? true, Boolean(shoePair?.visible), view?.winter);
  }

  return {
    setOutfit(nextItems: Item[]) {
      items = nextItems;
      updateOutfit();
      applyView();
    },
    setView(next: AvatarView) {
      const changedLayers = view?.showOuter !== next.showOuter || view?.winter !== next.winter;
      view = next;
      if (changedLayers) updateOutfit();
      applyView();
    },
    async setScannedShoes(visible: boolean) {
      showScannedShoes = visible;
      if (visible && !shoePair) {
        pendingPair ??= loader.loadAsync(scannedShoe.model).then(({ scene: scan }) => {
          if (signal.aborted) {
            disposeModel(scan);
            signal.throwIfAborted();
          }
          const otherFoot = scan.clone();
          scan.position.set(-0.112, 0, -0.033);
          scan.rotation.y = -0.06;
          otherFoot.position.set(0.109, 0, -0.058);
          otherFoot.rotation.y = 0.06;
          // The source contains one shoe. Mirroring supplies the opposite foot.
          otherFoot.scale.x = -1;
          shoePair = new Group();
          shoePair.add(scan, otherFoot);
          subject.add(shoePair);
        }).finally(() => { pendingPair = undefined; });
        try {
          await pendingPair;
        } catch (error) {
          showScannedShoes = false;
          throw error;
        }
      }
      if (signal.aborted) return;
      updateOutfit();
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
