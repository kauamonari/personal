import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function initScene() {
  const canvas = document.getElementById('scene-canvas');

  // ---------- Renderer ----------
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap; // soft shadows — PCFSoftShadowMap is no longer supported by the renderer
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // ---------- Scene / camera ----------
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0b);
  scene.fog = new THREE.Fog(0x0a0a0b, 6, 16);

  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 50);
  camera.position.set(0, 0.4, 5.2);

  // ---------- Environment (procedural, no external HDRI needed) ----------
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

  // ---------- Lights ----------
  const ambient = new THREE.AmbientLight(0x40403c, 0.55);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xfff2e0, 2.5);
  key.position.set(3.4, 5, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 12;
  key.shadow.camera.left = -3;
  key.shadow.camera.right = 3;
  key.shadow.camera.top = 3;
  key.shadow.camera.bottom = -3;
  key.shadow.bias = -0.0018;
  key.shadow.radius = 3;
  key.shadow.blurSamples = 16;
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xc9a35a, 2.2);
  rim.position.set(-4, 2.4, -3.2);
  scene.add(rim);

  const fill = new THREE.PointLight(0x9fb4ff, 0.5, 14);
  fill.position.set(-2.2, 0.6, 3);
  scene.add(fill);

  // ---------- Kettlebell (procedural, no external model) ----------
  const kettlebell = new THREE.Group();

  const profile = [
    [0.0, 0.0], [0.55, 0.02], [0.63, 0.16], [0.64, 0.36],
    [0.59, 0.56], [0.47, 0.73], [0.30, 0.83], [0.19, 0.87],
    [0.145, 0.91], [0.145, 0.99],
  ].map(([x, y]) => new THREE.Vector2(x, y));

  const bodyGeo = new THREE.LatheGeometry(profile, 56);
  const metalMat = new THREE.MeshPhysicalMaterial({
    color: 0x161616,
    metalness: 1,
    roughness: 0.32,
    clearcoat: 0.5,
    clearcoatRoughness: 0.25,
    envMapIntensity: 1.3,
  });
  const body = new THREE.Mesh(bodyGeo, metalMat);
  body.position.y = -0.55;
  body.castShadow = true;
  body.receiveShadow = true;
  kettlebell.add(body);

  const handleGeo = new THREE.TorusGeometry(0.34, 0.075, 20, 48);
  const handleMat = new THREE.MeshPhysicalMaterial({
    color: 0x1a1a1a,
    metalness: 1,
    roughness: 0.24,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2,
    envMapIntensity: 1.3,
  });
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.scale.set(1, 1.45, 1);
  handle.position.y = -0.55 + 0.99 + 0.34 * 1.45 * 0.62;
  handle.castShadow = true;
  kettlebell.add(handle);

  kettlebell.rotation.y = 0.4;
  scene.add(kettlebell);

  // Orbiting glass ring — the "vidro" PBR accent, doubles as a light-catcher.
  // Note: real `transmission` forces a framebuffer copy every frame it's
  // visible (expensive, and stalls software-rendered/low-power GPUs) — a
  // transparent clearcoat reads as glass just as well here for far less cost.
  const ringGeo = new THREE.TorusGeometry(1.65, 0.018, 16, 120);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xe8c888,
    metalness: 0.1,
    roughness: 0.08,
    transparent: true,
    opacity: 0.55,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.6,
  });
  const ring = new THREE.Mesh(ringGeo, glassMat);
  ring.rotation.x = Math.PI / 2.35;
  ring.rotation.y = 0.3;
  scene.add(ring);

  // Soft contact shadow — a void floor, not a visible surface
  const floorGeo = new THREE.PlaneGeometry(24, 24);
  const floorMat = new THREE.ShadowMaterial({ opacity: 0.38 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.12;
  floor.receiveShadow = true;
  scene.add(floor);

  // ---------- Scroll storytelling: camera keyframes per section ----------
  const beatNames = ['home', 'manifesto', 'metodo', 'resultados', 'planos', 'contato'];
  const keyframes = {
    home:       { pos: [0.0,  0.4,  5.2], look: [0, 0.1, 0], fov: 42 },
    manifesto:  { pos: [-2.6, 0.6,  4.4], look: [-0.6, 0.3, 0], fov: 36 },
    metodo:     { pos: [-1.8, 0.15, 3.0], look: [0, 0.0, 0], fov: 40 },
    resultados: { pos: [0.0,  1.7,  4.7], look: [0, -0.25, 0], fov: 46 },
    planos:     { pos: [2.0, -0.25, 2.6], look: [0, 0.25, 0], fov: 36 },
    contato:    { pos: [0.0,  0.35, 6.4], look: [0, 0.0, 0], fov: 44 },
  };

  let beatEls = [];
  let beatProgress = [];

  function measureBeats() {
    beatEls = beatNames
      .map((name) => document.querySelector(`[data-camera="${name}"]`))
      .filter(Boolean);
    const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    beatProgress = beatEls.map((el) => {
      const center = el.offsetTop + el.offsetHeight / 2 - window.innerHeight / 2;
      return Math.min(Math.max(center / scrollable, 0), 1);
    });
  }
  measureBeats();

  function currentTarget() {
    const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max(window.scrollY / scrollable, 0), 1);

    let i = 0;
    while (i < beatProgress.length - 1 && progress > beatProgress[i + 1]) i++;
    const a = keyframes[beatNames[i]] || keyframes.home;
    const b = keyframes[beatNames[Math.min(i + 1, beatNames.length - 1)]] || a;
    const span = Math.max(beatProgress[i + 1] - beatProgress[i], 1e-4);
    const t = beatProgress.length > 1
      ? Math.min(Math.max((progress - beatProgress[i]) / span, 0), 1)
      : 0;

    return {
      pos: a.pos.map((v, idx) => THREE.MathUtils.lerp(v, b.pos[idx], t)),
      look: a.look.map((v, idx) => THREE.MathUtils.lerp(v, b.look[idx], t)),
      fov: THREE.MathUtils.lerp(a.fov, b.fov, t),
    };
  }

  // ---------- Mouse parallax ----------
  const mouse = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  // ---------- Resize ----------
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      measureBeats();
    }, 150);
  });

  // ---------- Render loop ----------
  const timer = new THREE.Timer();
  timer.connect(document); // zeroes delta while hidden, auto-resets on return — avoids a huge jump

  // Cancel the rAF loop outright when hidden, instead of relying on browser throttling
  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(animate);
  });

  const lookAtVec = new THREE.Vector3(0, 0.1, 0);
  const targetLook = new THREE.Vector3();
  const targetPos = new THREE.Vector3();

  function animate(ts) {
    if (!running) return;
    requestAnimationFrame(animate);
    timer.update(ts);
    const dt = Math.min(timer.getDelta(), 0.1);
    const elapsed = timer.getElapsed();

    const target = currentTarget();
    targetPos.set(
      target.pos[0] + mouse.x * 0.35,
      target.pos[1] + mouse.y * 0.18,
      target.pos[2]
    );
    targetLook.set(target.look[0], target.look[1], target.look[2]);

    const damp = 1 - Math.pow(0.001, dt);
    camera.position.lerp(targetPos, damp);
    lookAtVec.lerp(targetLook, damp);
    camera.fov = THREE.MathUtils.lerp(camera.fov, target.fov, damp);
    camera.updateProjectionMatrix();
    camera.lookAt(lookAtVec);

    kettlebell.rotation.y += dt * 0.18;
    kettlebell.position.y = Math.sin(elapsed * 0.6) * 0.05;
    ring.rotation.z += dt * 0.12;

    renderer.render(scene, camera);
  }
  animate();
}
