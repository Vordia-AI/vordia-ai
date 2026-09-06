import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const manifest = JSON.parse(
  readFileSync(
    new URL('../lib/scroll-sequence.json', import.meta.url),
  ),
);
const source = readFileSync(
  new URL('../components/mobile-scroll-sequence.tsx', import.meta.url),
  'utf8',
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.ReactJSX,
    esModuleInterop: true,
  },
}).outputText;

// Exercise the actual component effect with controllable image/network events.
// No HTMLMediaElement or video playback APIs exist in this environment.
function harness({ reduced = false, restoredY = 0 } = {}) {
  const listeners = new Map();
  const animations = new Map();
  const timers = new Map();
  const requests = new Set();
  let id = 0;
  let effect;
  let maxRequests = 0;
  let now = 0;
  let revealed = false;
  let draws = 0;
  const bounds = { width: 390, height: 844 };
  const canvas = {
    width: 0,
    height: 0,
    dataset: {},
    getBoundingClientRect: () => bounds,
    getContext: () => ({
      drawImage: () => {
        draws += 1;
      },
    }),
  };
  const events = (scope) => ({
    addEventListener: (name, fn) => listeners.set(`${scope}:${name}`, fn),
    removeEventListener: (name) => listeners.delete(`${scope}:${name}`),
  });
  const motion = { ...events('motion'), matches: reduced };
  class MockImage {
    naturalWidth = 960;
    naturalHeight = 540;
    set src(value) {
      this.url = value;
      requests.add(this);
      maxRequests = Math.max(maxRequests, requests.size);
    }
    removeAttribute() {
      requests.delete(this);
    }
    decode() {
      return Promise.resolve();
    }
  }
  const window = {
    ...events('window'),
    visualViewport: events('viewport'),
    innerHeight: 844,
    scrollY: restoredY,
    devicePixelRatio: 3,
    matchMedia: () => motion,
    Image: MockImage,
    requestAnimationFrame: (fn) => {
      animations.set(++id, fn);
      return id;
    },
    cancelAnimationFrame: (key) => animations.delete(key),
    setTimeout: (fn, delay) => {
      timers.set(++id, { fn, at: now + delay });
      return id;
    },
    clearTimeout: (key) => timers.delete(key),
  };
  const document = {
    ...events('document'),
    hidden: false,
    documentElement: { scrollHeight: 2844 },
  };
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    window,
    document,
    Date: class extends Date {
      static now() {
        return now;
      }
    },
    ResizeObserver: class {
      observe() {}
      disconnect() {}
    },
    require: (name) => {
      if (name === 'react')
        return {
          useRef: () => ({ current: canvas }),
          useState: () => [
            false,
            (value) => {
              revealed = value;
            },
          ],
          useEffect: (fn) => {
            effect = fn;
          },
        };
      if (name === 'react/jsx-runtime')
        return { jsx: () => null, jsxs: () => null };
      if (name === 'next/image') return {};
      if (name.endsWith('scroll-sequence.json')) return manifest;
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  exports.MobileScrollSequence();
  const cleanup = effect();

  const emit = (name) => listeners.get(name)?.();
  async function settle({ fail = false } = {}) {
    for (let round = 0; round < 200; round += 1) {
      if (!animations.size && !requests.size) return;
      const callbacks = [...animations.values()];
      animations.clear();
      callbacks.forEach((fn) => fn());
      for (const image of requests) {
        requests.delete(image);
        (fail ? image.onerror : image.onload)?.();
      }
      await Promise.resolve();
    }
    assert.fail('Renderer did not settle (possible loading/render loop)');
  }
  return {
    canvas,
    window,
    document,
    bounds,
    motion,
    emit,
    settle,
    cleanup,
    get revealed() {
      return revealed;
    },
    get draws() {
      return draws;
    },
    get maxRequests() {
      return maxRequests;
    },
    get pending() {
      return animations.size + timers.size + requests.size;
    },
    scroll(y) {
      window.scrollY = y;
      emit('window:scroll');
    },
    advance(ms) {
      now += ms;
      for (const [key, timer] of timers) {
        if (timer.at <= now) {
          timers.delete(key);
          timer.fn();
        }
      }
    },
  };
}

await test('scroll and reverse playback work without a video decoder; requests stay bounded', async () => {
  const h = harness();
  await h.settle();
  assert.equal(h.canvas.dataset.frame, '0');
  assert.equal(h.revealed, true);
  h.scroll(2000);
  await h.settle();
  assert.equal(h.canvas.dataset.frame, '89');
  h.scroll(1000);
  await h.settle();
  assert.equal(h.canvas.dataset.frame, '45');
  h.scroll(-80); // iOS elastic overscroll
  await h.settle();
  assert.equal(h.canvas.dataset.frame, '0');
  assert.ok(h.maxRequests <= 3);
  h.cleanup();
  assert.equal(h.pending, 0);
});

await test('cold load restores scroll position and rotation repaints the same frame', async () => {
  const h = harness({ restoredY: 1000 });
  await h.settle();
  assert.equal(h.canvas.dataset.frame, '45');
  const previousDraws = h.draws;
  h.bounds.width = 844;
  h.bounds.height = 390;
  h.emit('window:resize');
  await h.settle();
  assert.equal(h.canvas.dataset.frame, '45');
  assert.ok(h.draws > previousDraws);
  assert.equal(h.canvas.width, 1266); // DPR is capped at 1.5
  h.cleanup();
});

await test('failed images preserve the poster and retry after network recovery', async () => {
  const h = harness();
  await h.settle({ fail: true });
  assert.equal(h.revealed, false);
  assert.equal(h.canvas.dataset.frame, undefined);
  h.advance(5100);
  await h.settle();
  assert.equal(h.revealed, true);
  h.scroll(2000);
  await h.settle();
  assert.equal(h.canvas.dataset.frame, '89');
  h.cleanup();
});

await test('backgrounded pages resume at the current scroll position', async () => {
  const h = harness();
  await h.settle();
  h.document.hidden = true;
  h.emit('document:visibilitychange');
  h.scroll(2000);
  await h.settle();
  assert.equal(h.canvas.dataset.frame, '0');
  h.document.hidden = false;
  h.emit('window:pageshow');
  await h.settle();
  assert.equal(h.canvas.dataset.frame, '89');
  h.cleanup();
});

await test('reduced motion remains static until the preference changes', async () => {
  const h = harness({ reduced: true });
  h.scroll(2000);
  await h.settle();
  assert.equal(h.canvas.dataset.frame, '0');
  h.motion.matches = false;
  h.emit('motion:change');
  await h.settle();
  assert.equal(h.canvas.dataset.frame, '89');
  h.cleanup();
});

await test('all frames referenced by the manifest exist in the Pages public directory', () => {
  for (let index = 0; index < manifest.frameCount; index += 1) {
    const url = new URL(
      `../public${manifest.basePath}/frame-${String(index).padStart(3, '0')}.webp`,
      import.meta.url,
    );
    assert.ok(existsSync(url), `Missing frame ${index}`);
    assert.equal(readFileSync(url).toString('ascii', 8, 12), 'WEBP');
  }
});
