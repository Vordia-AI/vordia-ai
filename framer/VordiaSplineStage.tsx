import * as React from 'react';
import { addPropertyControls, ControlType, RenderTarget } from 'framer';
import { motion } from 'framer-motion';

type Props = {
  sceneUrl: string;
  fallbackImage: string;
  label: string;
  background: string;
  radius: number;
};

/**
 * Framer Code Component for the Vordia Duo hero.
 * Paste the Spline Public URL into the Scene URL property in Framer.
 */
export default function VordiaSplineStage(props: Props) {
  const { sceneUrl, fallbackImage, label, background, radius } = props;
  const isCanvas = RenderTarget.current() === RenderTarget.canvas;
  const [viewerReady, setViewerReady] = React.useState(false);

  React.useEffect(() => {
    if (!sceneUrl) return;

    const runtimeId = 'vordia-spline-viewer-runtime';
    const ready = () => {
      void customElements.whenDefined('spline-viewer').then(() => {
        setViewerReady(true);
      });
    };

    if (customElements.get('spline-viewer')) {
      ready();
      return;
    }

    const existing = document.getElementById(
      runtimeId,
    ) as HTMLScriptElement | null;
    const script = existing ?? document.createElement('script');

    if (!existing) {
      script.id = runtimeId;
      script.type = 'module';
      script.src =
        'https://unpkg.com/@splinetool/viewer@2.0.36/build/spline-viewer.js';
      document.head.appendChild(script);
    }

    script.addEventListener('load', ready, { once: true });
  }, [sceneUrl]);

  return (
    <motion.div
      initial={isCanvas ? false : { opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        borderRadius: radius,
        background,
        border: radius > 0 ? '1px solid rgba(255,255,255,0.12)' : 'none',
        boxShadow: radius > 0 ? '0 36px 90px rgba(0,0,0,0.22)' : 'none',
      }}
    >
      {sceneUrl && viewerReady ? (
        React.createElement('spline-viewer', {
          url: sceneUrl,
          'events-target': 'global',
          loading: isCanvas ? 'lazy' : 'eager',
          style: {
            position: 'absolute',
            inset: 0,
            display: 'block',
            width: '100%',
            height: '100%',
            cursor: 'grab',
          },
        })
      ) : fallbackImage ? (
        <img
          src={fallbackImage}
          alt="Vordia Duo"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            placeItems: 'center',
            width: '100%',
            height: '100%',
            color: '#5f6b7b',
            font: '500 14px/1.4 Inter, sans-serif',
          }}
        >
          Add your Spline Public URL
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          right: 18,
          bottom: 18,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '9px 12px',
          borderRadius: 999,
          color: '#1e2a3c',
          background: 'rgba(255,255,255,0.82)',
          font: '600 11px/1 Inter, sans-serif',
          backdropFilter: 'blur(12px)',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#1467ff',
          }}
        />
        {label}
      </div>
    </motion.div>
  );
}

VordiaSplineStage.defaultProps = {
  sceneUrl: 'https://prod.spline.design/3Eg8cbKZc8SLAfvW/scene.splinecode',
  fallbackImage: '',
  label: 'Drag or swipe to explore',
  background: '#041127',
  radius: 0,
};

addPropertyControls(VordiaSplineStage, {
  sceneUrl: {
    title: 'Scene URL',
    type: ControlType.String,
    placeholder: 'https://my.spline.design/...',
  },
  fallbackImage: {
    title: 'Fallback',
    type: ControlType.Image,
  },
  label: {
    title: 'Label',
    type: ControlType.String,
  },
  background: {
    title: 'Background',
    type: ControlType.Color,
  },
  radius: {
    title: 'Radius',
    type: ControlType.Number,
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
  },
});
