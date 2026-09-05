'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import { ChevronRight, FileText, Mic2, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const VIDEO_URL = '/assets/vordia-duo-scroll.mp4';
const VIDEO_SOURCE_ID = '8cff47c1-cef1-4d06-b837-35a715ac2f16';

const services = [
  'Detachable voice capture',
  'AI transcription',
  'Searchable memory',
];

const capabilities = [
  {
    title: 'Capture naturally',
    body: 'Wear Duo on your wrist, then detach the Pod when the microphone needs to move closer.',
  },
  {
    title: 'Understand instantly',
    body: 'Turn real-world conversations into transcripts, summaries, decisions, and clear context.',
  },
  {
    title: 'Act without replay',
    body: 'Surface owners and next steps, or ask across your conversation history when work moves on.',
  },
];

const productStory = [
  {
    icon: Mic2,
    title: 'Capture closer',
    body: 'Detach the Pod from the wristband and place or clip it nearer the conversation, so voices stay clear while everyone speaks naturally.',
  },
  {
    icon: FileText,
    title: 'Understand faster',
    body: 'Vordia turns every recording into a structured transcript, concise summary, key decisions, and clearly owned next steps.',
  },
  {
    icon: Search,
    title: 'Recall anything',
    body: 'Search across past conversations to recover the exact promise, task, or idea you need—without replaying the entire meeting.',
  },
];

function reveal(delay = 0) {
  return {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: {
      duration: 0.7,
      delay: delay / 1000,
      ease: [0.2, 0.8, 0.2, 1] as const,
    },
  };
}

function waitForMediaEvent(
  media: HTMLMediaElement,
  event: 'loadedmetadata' | 'loadeddata' | 'seeked',
) {
  return new Promise<void>((resolve, reject) => {
    const onSuccess = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error(`Unable to load video event: ${event}`));
    };
    const cleanup = () => {
      media.removeEventListener(event, onSuccess);
      media.removeEventListener('error', onError);
    };

    media.addEventListener(event, onSuccess, { once: true });
    media.addEventListener('error', onError, { once: true });
  });
}

function ScrollVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasDecodedFrame, setHasDecodedFrame] = useState(false);
  const [hasFrameCache, setHasFrameCache] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) return;

    let disposed = false;
    let animationFrame = 0;
    let extractionTimer = 0;
    let targetProgress = 0;
    let smoothedProgress = 0;
    let lastFrameIndex = -1;
    let frameCacheReady = false;
    let frameCache: ImageBitmap[] = [];

    const setTargetFromScroll = () => {
      const scrollable = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      targetProgress = Math.min(1, Math.max(0, window.scrollY / scrollable));
    };

    const fitCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(window.innerWidth * dpr);
      const height = Math.round(window.innerHeight * dpr);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        lastFrameIndex = -1;
      }
    };

    const drawCover = (
      source: CanvasImageSource,
      sourceWidth: number,
      sourceHeight: number,
    ) => {
      if (!sourceWidth || !sourceHeight) return;

      fitCanvas();
      const scale = Math.max(
        canvas.width / sourceWidth,
        canvas.height / sourceHeight,
      );
      const width = sourceWidth * scale;
      const height = sourceHeight * scale;
      const left = (canvas.width - width) / 2;
      const top = (canvas.height - height) / 2;

      context.fillStyle = '#0a0a0a';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(source, left, top, width, height);
    };

    const render = () => {
      smoothedProgress += (targetProgress - smoothedProgress) * 0.12;

      if (frameCacheReady && frameCache.length) {
        const index = Math.min(
          frameCache.length - 1,
          Math.round(smoothedProgress * (frameCache.length - 1)),
        );

        if (index !== lastFrameIndex) {
          const frame = frameCache[index];
          drawCover(frame, frame.width, frame.height);
          lastFrameIndex = index;
        }
      } else if (!reduceMotion && video.readyState >= 2 && video.duration) {
        const desiredTime =
          smoothedProgress * Math.max(0, video.duration - 0.05);
        if (!video.seeking && Math.abs(video.currentTime - desiredTime) > 0.04) {
          video.currentTime = desiredTime;
        }
      }

      animationFrame = window.requestAnimationFrame(render);
    };

    const extractFrames = async () => {
      if (reduceMotion || disposed) return;

      const sampler = document.createElement('video');
      sampler.src = VIDEO_URL;
      sampler.preload = 'auto';
      sampler.muted = true;
      sampler.playsInline = true;
      sampler.crossOrigin = 'anonymous';

      try {
        sampler.load();
        if (sampler.readyState < 1) {
          await waitForMediaEvent(sampler, 'loadedmetadata');
        }
        if (sampler.readyState < 2) {
          await waitForMediaEvent(sampler, 'loadeddata');
        }

        const totalFrames = Math.min(
          90,
          Math.max(24, Math.round(sampler.duration * 12)),
        );
        const maxWidth = window.innerWidth < 768 ? 640 : 960;
        const sampleWidth = Math.min(maxWidth, sampler.videoWidth);
        const sampleHeight = Math.round(
          sampleWidth * (sampler.videoHeight / sampler.videoWidth),
        );
        const sampleCanvas = document.createElement('canvas');
        const sampleContext = sampleCanvas.getContext('2d', { alpha: false });

        if (!sampleContext) return;

        sampleCanvas.width = sampleWidth;
        sampleCanvas.height = sampleHeight;

        for (let index = 0; index < totalFrames; index += 1) {
          if (disposed) return;

          const time =
            (index / Math.max(1, totalFrames - 1)) *
            Math.max(0, sampler.duration - 0.05);

          if (Math.abs(sampler.currentTime - time) > 0.01) {
            sampler.currentTime = time;
            await waitForMediaEvent(sampler, 'seeked');
          }

          sampleContext.drawImage(sampler, 0, 0, sampleWidth, sampleHeight);
          frameCache.push(await createImageBitmap(sampleCanvas));
        }

        if (!disposed && frameCache.length) {
          frameCacheReady = true;
          setHasFrameCache(true);
          setTargetFromScroll();
        }
      } catch {
        frameCache.forEach((frame) => frame.close());
        frameCache = [];
      } finally {
        sampler.removeAttribute('src');
        sampler.load();
      }
    };

    const onLoadedData = () => {
      setHasDecodedFrame(true);
      if (!reduceMotion) {
        extractionTimer = window.setTimeout(extractFrames, 300);
      }
    };

    setTargetFromScroll();
    window.addEventListener('scroll', setTargetFromScroll, { passive: true });
    window.addEventListener('resize', fitCanvas);
    video.addEventListener('loadeddata', onLoadedData, { once: true });

    if (video.readyState >= 2) onLoadedData();
    animationFrame = window.requestAnimationFrame(render);

    return () => {
      disposed = true;
      window.clearTimeout(extractionTimer);
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', setTargetFromScroll);
      window.removeEventListener('resize', fitCanvas);
      video.removeEventListener('loadeddata', onLoadedData);
      frameCache.forEach((frame) => frame.close());
    };
  }, []);

  return (
    <div
      className="scroll-video"
      aria-hidden="true"
      data-higgsfield-media-id={VIDEO_SOURCE_ID}
    >
      <Image
        src="/assets/vordia-duo-scroll-poster.png"
        alt=""
        fill
        priority
        unoptimized
        className={`scroll-video__poster ${
          hasDecodedFrame || hasFrameCache ? 'is-hidden' : ''
        }`}
      />
      <video
        ref={videoRef}
        src={VIDEO_URL}
        muted
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        className={`scroll-video__video ${
          hasDecodedFrame && !hasFrameCache ? 'is-visible' : ''
        }`}
      />
      <canvas
        ref={canvasRef}
        className={`scroll-video__canvas ${hasFrameCache ? 'is-visible' : ''}`}
      />
      <div className="scroll-video__scrim" />
      <div className="scroll-video__grain" />
    </div>
  );
}

function GlassBadge({ children }: { children: ReactNode }) {
  return <div className="glass-badge">{children}</div>;
}

export function VordiaLanding() {
  return (
    <div className="vordia-page">
      <ScrollVideo />

      <div className="vordia-content">
        <header className="site-header">
          <nav className="site-nav" aria-label="Primary navigation">
            <motion.a
              href="#duo"
              className="brand-lockup"
              aria-label="Vordia home"
              {...reveal(0)}
            >
              <Image
                src="/assets/vordia-mark.png"
                alt=""
                width={25}
                height={24}
                priority
              />
              <span>vordia</span>
            </motion.a>

            <div className="nav-links">
              {[
                ['Duo', '#duo'],
                ['How it works', '#how-it-works'],
                ['Vordia Agent', '#capabilities'],
                ['Pilot', '#early-access'],
              ].map(
                ([label, href], index) => (
                  <motion.a
                    key={label}
                    href={href}
                    {...reveal(100 + index * 100)}
                  >
                    {label}
                    {label === 'Duo' ? <sup>2</sup> : null}
                  </motion.a>
                ),
              )}
            </div>

            <motion.a
              href="#early-access"
              className="nav-cta"
              {...reveal(500)}
            >
              Join early access
            </motion.a>
          </nav>
        </header>

        <main>
          <section id="duo" className="screen-section hero-section">
            <div className="section-topline">
              <div className="service-list">
                {services.map((service, index) => (
                  <motion.span
                    key={service}
                    className="mono-label"
                    {...reveal(150 + index * 120)}
                  >
                    / {service}
                  </motion.span>
                ))}
              </div>

              <motion.p className="intro-copy" {...reveal(300)}>
                A detachable voice-first AI wearable that moves with the
                conversation—and turns every recording into useful memory.
              </motion.p>
            </div>

            <div className="hero-bottom">
              <div className="headline-block">
                <motion.div {...reveal(150)}>
                  <GlassBadge>One Pod · Two ways to wear</GlassBadge>
                </motion.div>
                <motion.h1 {...reveal(280)}>
                  Remember the room.
                  <br />
                  Keep moving.
                </motion.h1>
              </div>

              <motion.aside className="product-card" {...reveal(420)}>
                <Image
                  src="/assets/vordia-duo-clip.png"
                  alt="Vordia Duo in detachable clip mode"
                  width={220}
                  height={220}
                  priority
                />
                <div className="product-card__copy">
                  <strong>Meet Vordia Duo</strong>
                  <span>Detachable AI voice wearable</span>
                  <a href="#capabilities">
                    See the system
                    <ChevronRight aria-hidden="true" size={14} />
                  </a>
                </div>
              </motion.aside>
            </div>
          </section>

          <section
            id="how-it-works"
            className="product-story"
            aria-labelledby="product-story-title"
          >
            <motion.header className="product-story__heading" {...reveal(80)}>
              <span>Vordia Duo</span>
              <h2 id="product-story-title">One Pod. Full context.</h2>
            </motion.header>

            <div className="product-story__feature-slot">
              {productStory.slice(0, 1).map((feature) => {
                const Icon = feature.icon;

                return (
                  <motion.article
                    key={feature.title}
                    className="story-feature"
                    {...reveal(140)}
                  >
                    <div className="story-feature__heading">
                      <span className="story-feature__icon">
                        <Icon aria-hidden="true" size={18} strokeWidth={1.7} />
                      </span>
                      <h3>{feature.title}</h3>
                    </div>
                    <p>{feature.body}</p>
                  </motion.article>
                );
              })}
            </div>

            <div className="product-story__clearspace" aria-hidden="true" />

            <div className="product-story__features">
              {productStory.slice(1).map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <motion.article
                    key={feature.title}
                    className="story-feature"
                    {...reveal(230 + index * 140)}
                  >
                    <div className="story-feature__heading">
                      <span className="story-feature__icon">
                        <Icon aria-hidden="true" size={18} strokeWidth={1.7} />
                      </span>
                      <h3>{feature.title}</h3>
                    </div>
                    <p>{feature.body}</p>
                  </motion.article>
                );
              })}
            </div>
          </section>

          <section
            id="capabilities"
            className="screen-section capability-section"
          >
            <div className="section-topline">
              <motion.div {...reveal(120)}>
                <GlassBadge>Intelligence on demand</GlassBadge>
              </motion.div>

              <motion.p className="intro-copy" {...reveal(220)}>
                Vordia doesn&apos;t just record—it transcribes, organises, and
                surfaces what matters before the moment disappears.
              </motion.p>
            </div>

            <div className="capability-bottom">
              <div className="capability-copy">
                <motion.h2 {...reveal(180)}>
                  From conversation
                  <br />
                  to clarity.
                </motion.h2>
                <motion.p {...reveal(320)}>
                  Duo captures the room without pulling you out of it. Vordia
                  Agent turns the result into searchable memory, decisions,
                  and next steps your team can use.
                </motion.p>
                <motion.div
                  id="early-access"
                  className="section-actions"
                  {...reveal(420)}
                >
                  <a className="button button--primary" href="mailto:hello@vordia.ai">
                    Join early access
                    <ChevronRight aria-hidden="true" size={14} />
                  </a>
                  <a className="button button--secondary" href="#duo">
                    Replay the product story
                  </a>
                </motion.div>
              </div>

              <div className="capability-panel">
                {capabilities.map((capability, index) => (
                  <motion.article
                    key={capability.title}
                    className="capability-row"
                    {...reveal(300 + index * 110)}
                  >
                    <span className="capability-index">0{index + 1}</span>
                    <div>
                      <a href="#early-access">
                        {capability.title}
                        <ChevronRight aria-hidden="true" size={16} />
                      </a>
                      <p>{capability.body}</p>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
