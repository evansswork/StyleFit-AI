import {
  Color, CylinderGeometry, DirectionalLight, Group, HemisphereLight, Mesh,
  MeshStandardMaterial, OrthographicCamera, Plane, Scene, Vector3, WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { Item } from "../styling/engine";
import { createOutfitModel, disposeModel } from "./outfit-model";

export type AvatarView = {
  rotation: number;
  zoom: number;
  height: number;
  width: number;
  showOuter: boolean;
  framing: "outfit" | "face";
};

export async function mountOutfitScene(canvas: HTMLCanvasElement, onError: () => void, signal: AbortSignal) {
  const gl = canvas.getContext("webgl2", { antialias: true });
  if (!gl) throw new Error("WebGL 2 unavailable");

  const { scene: head } = await new GLTFLoader().loadAsync("/avatar/infinite-head.glb");
  let renderer: WebGLRenderer;
  try {
    signal.throwIfAborted();
    if (gl.isContextLost()) throw new Error("WebGL context lost during avatar loading");
    renderer = new WebGLRenderer({ canvas, context: gl });
  } catch (error) {
    disposeModel(head);
    throw error;
  }
  renderer.localClippingEnabled = true;
  // The published bust includes shoulders; start the portrait at the neckline of our clothes.
  const neckline = 2.52;
  const headCrop = new Plane(new Vector3(0, 1, 0), -neckline);
  head.traverse(node => {
    if (node instanceof Mesh) node.material.clippingPlanes = [headCrop];
  });
  head.scale.setScalar(0.108);
  head.position.set(0.008, neckline + 1.18 * head.scale.y, -0.024);
  const subject = new Group();
  subject.add(head);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  const scene = new Scene();
  scene.background = new Color("#eaf1f5");
  scene.add(subject);
  const camera = new OrthographicCamera(-2, 2, 2, -2, 0.1, 30);

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
  let aspect = 1;
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
    aspect = width / height;
    renderer.setSize(width, height, false);
    applyView();
  }
  function applyView() {
    if (!outfit || !view || failed) return;
    const closeUp = view.framing === "face";
    subject.rotation.y = view.rotation * Math.PI / 180;
    subject.scale.set(view.width / 100, view.height / 100, view.width / 100);
    headCrop.constant = -neckline * subject.scale.y;
    outfit.outer.visible = view.showOuter;
    const targetY = closeUp ? 2.82 * subject.scale.y : 1.61;
    const halfHeight = closeUp ? Math.max(0.40, 0.34 / aspect) : Math.max(1.91, 1.4 / aspect);
    camera.left = -halfHeight * aspect;
    camera.right = halfHeight * aspect;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.position.set(0, targetY + (closeUp ? 0.05 : 0.52), 7);
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
    setOutfit(items: Item[]) {
      if (failed) return;
      if (outfit) {
        subject.remove(outfit.model);
        disposeModel(outfit.model);
      }
      outfit = createOutfitModel(items);
      subject.add(outfit.model);
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
      disposeModel(head);
      base.geometry.dispose();
      base.material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
