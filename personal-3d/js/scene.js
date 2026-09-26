/* Feature-detection gate, kept dependency-free on purpose: this file must
   decide whether to load Three.js WITHOUT importing it first — a static
   `import` at the top of a module is fetched before any of the module's own
   code runs, which would mean mobile visitors downloading the whole 3D
   engine just to immediately throw it away. The heavy scene module is only
   ever requested when the gate below actually passes. */

const html = document.documentElement;

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isNarrow = window.matchMedia('(max-width: 820px)').matches;

if (!supportsWebGL() || isNarrow || prefersReducedMotion) {
  html.classList.add('no-webgl');
} else {
  import('./three-scene.js').then((m) => m.initScene());
}
