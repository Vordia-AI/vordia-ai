'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import sequence from '@/public/assets/duo-scroll-v1/manifest.json';

const LAST_FRAME = sequence.frameCount - 1;
const CACHE_LIMIT = 12;
const MAX_LOADING = 3;
const frameUrl = (index: number) =>
  `${sequence.basePath}/frame-${String(index).padStart(3, '0')}.webp`;

export function MobileScrollSequence() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasFrame, setHasFrame] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: false });
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cache = new Map<number, HTMLImageElement>();
    const loading = new Map<
      number,
      { image: HTMLImageElement; timer: number }
    >();
    const failedUntil = new Map<number, number>();
    let disposed = false;
    let raf = 0;
    let retryTimer = 0;
    let target = 0;
    let current = 0;
    let direction = 1;
    let painted = -1;
    let ready = false;
    let resized = true;

    function schedule() {
      if (!disposed && !document.hidden && !raf) {
        raf = window.requestAnimationFrame(render);
      }
    }

    function measure() {
      const scrollable = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const next = reducedMotion.matches
        ? 0
        : Math.max(0, Math.min(1, window.scrollY / scrollable)) * LAST_FRAME;
      if (next !== target) direction = next > target ? 1 : -1;
      target = next;
      if (reducedMotion.matches) current = 0;
      schedule();
    }

    function fitCanvas() {
      // Read the fixed layer, so Safari's expanding/collapsing address bar and
      // landscape rotation cannot clear the canvas without repainting it.
      const rect = canvas!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round(rect.height * dpr));
      if (canvas!.width !== width || canvas!.height !== height) {
        canvas!.width = width;
        canvas!.height = height;
        painted = -1;
      }
      resized = false;
    }

    function trimCache() {
      // Keep decoded memory bounded; the browser may retain compressed files
      // in its HTTP cache for reverse scrolling without retaining every bitmap.
      const desired = Math.round(current);
      const farthest = [...cache.keys()].sort(
        (a, b) => Math.abs(b - desired) - Math.abs(a - desired),
      );
      for (const index of farthest) {
        if (cache.size <= CACHE_LIMIT) break;
        if (index !== painted) cache.delete(index);
      }
    }

    function load(index: number) {
      if (
        cache.has(index) ||
        loading.has(index) ||
        (failedUntil.get(index) ?? 0) > Date.now()
      )
        return;
      const image = new window.Image();
      image.decoding = 'async';

      const finish = (success: boolean) => {
        const pending = loading.get(index);
        if (!pending || pending.image !== image) return;
        window.clearTimeout(pending.timer);
        loading.delete(index);
        image.onload = null;
        image.onerror = null;
        if (disposed) return;
        if (success && image.naturalWidth) {
          failedUntil.delete(index);
          cache.set(index, image);
          trimCache();
        } else {
          failedUntil.set(index, Date.now() + 5000);
          image.removeAttribute('src');
          window.clearTimeout(retryTimer);
          retryTimer = window.setTimeout(schedule, 5100);
        }
        schedule();
      };

      image.onload = () => {
        // decode() is optional; an already loaded image can still be drawn if
        // Safari rejects the decode promise after a memory-pressure event.
        if (typeof image.decode === 'function') {
          void image.decode().then(
            () => finish(true),
            () => finish(true),
          );
        } else {
          finish(true);
        }
      };
      image.onerror = () => finish(false);
      loading.set(index, {
        image,
        timer: window.setTimeout(() => finish(false), 12000),
      });
      image.src = frameUrl(index);
    }

    function render() {
      raf = 0;
      if (disposed || document.hidden) return;
      const delta = target - current;
      current = Math.abs(delta) < 0.05 ? target : current + delta * 0.18;
      const desired = Math.round(current);

      if (resized) fitCanvas();
      let nearest = -1;
      for (const index of cache.keys()) {
        if (
          nearest < 0 ||
          Math.abs(index - desired) < Math.abs(nearest - desired)
        ) {
          nearest = index;
        }
      }
      if (nearest >= 0 && nearest !== painted) {
        const image = cache.get(nearest)!;
        const scale = Math.max(
          canvas!.width / image.naturalWidth,
          canvas!.height / image.naturalHeight,
        );
        const width = image.naturalWidth * scale;
        const height = image.naturalHeight * scale;
        context!.drawImage(
          image,
          (canvas!.width - width) / 2,
          (canvas!.height - height) / 2,
          width,
          height,
        );
        painted = nearest;
        canvas!.dataset.frame = String(nearest);
        if (!ready) {
          ready = true;
          setHasFrame(true);
        }
      }

      // Request the current scroll position first, even after a fast jump.
      // Only a small directional window is decoded; never load the MP4 here.
      const candidates = [desired, Math.round(target)];
      if (!reducedMotion.matches) {
        for (let offset = 1; offset <= 4; offset += 1) {
          candidates.push(
            desired + offset * direction,
            desired - offset * direction,
          );
        }
      }
      for (const index of new Set(candidates)) {
        if (loading.size >= MAX_LOADING) break;
        if (index >= 0 && index <= LAST_FRAME) load(index);
      }
      if (target !== current) schedule();
    }

    const resize = () => {
      resized = true;
      measure();
    };
    const resume = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      } else {
        resized = true;
        measure();
      }
    };
    const online = () => {
      failedUntil.clear();
      measure();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resizeObserver.observe(document.documentElement);
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', resize);
    window.addEventListener('pageshow', resume);
    window.addEventListener('online', online);
    window.visualViewport?.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', resume);
    reducedMotion.addEventListener('change', measure);
    measure();
    // Restored scroll positions should start at that frame, not rewind first.
    current = target;

    return () => {
      disposed = true;
      window.cancelAnimationFrame(raf);
      window.clearTimeout(retryTimer);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pageshow', resume);
      window.removeEventListener('online', online);
      window.visualViewport?.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', resume);
      reducedMotion.removeEventListener('change', measure);
      for (const { image, timer } of loading.values()) {
        window.clearTimeout(timer);
        image.onload = null;
        image.onerror = null;
        image.removeAttribute('src');
      }
      loading.clear();
      cache.clear();
    };
  }, []);

  return (
    <div
      className="scroll-video"
      aria-hidden="true"
      data-scroll-renderer="sequence"
    >
      <Image
        src={frameUrl(0)}
        alt=""
        width={sequence.width}
        height={sequence.height}
        priority
        unoptimized
        className={`scroll-video__poster ${hasFrame ? 'is-hidden' : ''}`}
      />
      <canvas
        ref={canvasRef}
        className={`scroll-video__canvas ${hasFrame ? 'is-visible' : ''}`}
      />
      <div className="scroll-video__scrim" />
      <div className="scroll-video__grain" />
    </div>
  );
}
