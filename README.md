# Vordia Duo landing page

This folder contains the first landing-page build for Vordia Duo: a responsive web preview, a Spline-ready hero, and a Framer Code Component for the same 3D stage.

## Current direction

- Audience: UK knowledge workers who spend much of the day in meetings.
- Core promise: remember important conversations without leaving the moment.
- Product story: one detachable Pod, worn as a wristband or a clip.
- Visual language: deep navy, electric blue, mist white, precise typography, and restrained motion.

## Local preview

Run `npm run dev` from this folder. Without a Spline URL, the hero automatically shows the current wrist-mode product render.

To connect the Spline model, copy `.env.example` to `.env.local`, then paste the Production scene URL into `NEXT_PUBLIC_SPLINE_SCENE_URL`.

## Framer handoff

Create a Code Component in Framer and paste in `framer/VordiaSplineStage.tsx`. Set its Scene URL property to the Spline Public URL, then use it as the right side of the hero layout. The component includes Framer Motion entry animation, responsive fill behavior, loading behavior, and an optional fallback image.

The page copy, section order, tokens, and asset requirements are documented here so the Framer canvas and the local preview stay aligned during the next build phase.
