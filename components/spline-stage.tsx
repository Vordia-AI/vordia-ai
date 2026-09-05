'use client';

import * as React from 'react';
import Image from 'next/image';

type SplineStageProps = {
  sceneUrl: string;
};

export function SplineStage({ sceneUrl }: SplineStageProps) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [viewerReady, setViewerReady] = React.useState(false);
  const [viewerFailed, setViewerFailed] = React.useState(false);

  React.useEffect(() => {
    if (!sceneUrl) return;

    let active = true;
    const runtimeId = 'spline-viewer-runtime';
    const runtimeUrl =
      'https://unpkg.com/@splinetool/viewer@2.0.36/build/spline-viewer.js';

    const markReady = () => {
      void customElements
        .whenDefined('spline-viewer')
        .then(() => {
          if (active) setViewerReady(true);
        })
        .catch(() => {
          if (active) setViewerFailed(true);
        });
    };

    if (customElements.get('spline-viewer')) {
      markReady();
    } else {
      const existing = document.getElementById(
        runtimeId,
      ) as HTMLScriptElement | null;
      const script = existing ?? document.createElement('script');

      if (!existing) {
        script.id = runtimeId;
        script.type = 'module';
        script.src = runtimeUrl;
        document.head.appendChild(script);
      }

      script.addEventListener('load', markReady, { once: true });
      script.addEventListener(
        'error',
        () => {
          if (active) setViewerFailed(true);
        },
        { once: true },
      );
    }

    return () => {
      active = false;
    };
  }, [sceneUrl]);

  const showScene = Boolean(sceneUrl && viewerReady && !viewerFailed);

  return (
    <div
      ref={stageRef}
      className="spline-stage"
      aria-label="Interactive Vordia Duo 3D model"
    >
      <div className="spline-stage__glow" aria-hidden="true" />
      <div className="spline-stage__motion">
        {showScene ? (
          React.createElement('spline-viewer', {
            url: sceneUrl,
            'events-target': 'global',
            loading: 'eager',
            class: 'spline-stage__viewer',
          })
        ) : (
          <Image
            src="/assets/vordia-spline-preview.jpg"
            alt="Vordia Duo modular wearable shown in an exploded 3D view"
            fill
            priority
            sizes="(max-width: 1050px) 100vw, 62vw"
            className="spline-stage__fallback"
          />
        )}
      </div>
      <div className="spline-stage__label">
        <span className="spline-stage__pulse" aria-hidden="true" />
        {showScene
          ? 'Scroll to separate · Drag to orbit'
          : 'Loading interactive 3D'}
      </div>
    </div>
  );
}
