# Vordia Duo — Spline scroll animation rebuild prompt

Use this prompt on the existing Vordia Duo scene. Select the complete product hierarchy before running it.

```text
Rebuild the animation system of this existing Vordia Duo scene into a controlled, scroll-driven product story for a premium website hero.

CRITICAL — PRESERVE THE PRODUCT:
- Keep the exact existing Vordia Duo geometry, proportions, materials, magnetic details, wrist strap, detachable pod, microphone holes, status light, and back plate.
- Do not generate a new wearable, watch, phone, case, or extra product copy.
- Do not change the product design.
- Reuse the existing environment, platform, lighting, orbital rings, and sound-wave elements only when they support the product story.

REMOVE THE CURRENT ANIMATION LOGIC:
- Delete or disable the current custom code that continuously updates the “Vordia Duo” position and rotation on every animation frame.
- Remove the automatic floating and sinusoidal rotation of the product.
- Remove global mouse-position parallax from the product and camera.
- Remove the temporary Mouse Hover explode behaviour.
- Do not use hover, autoplay, timers, physics, or an infinite loop to detach the product.
- Keep only a very subtle independent ambient movement on the orbital rings after the scroll sequence is working.

FIX THE OBJECT STRUCTURE:
- Use one master product rig named “Vordia Duo Scroll Rig”.
- Do not show three duplicated product versions at the same time.
- Organise the existing parts under these functional groups:
  1. Wrist Strap and Lower Cradle
  2. Magnetic Back Plate
  3. Detachable Pod
  4. Pod Front Shell
  5. Pod Internal Layer
- Use the existing components from “Pod Assembled A”, “Pod Detached”, “Pod Exploded C”, “Strap Assembly A”, “Strap Assembly”, and “Strap Assembly C”, but consolidate them into one visible stateful product rig. Hide or remove duplicate geometry after consolidation.
- Keep every part’s pivot centred and orient the local axes so the pieces separate along one clean magnetic assembly axis.

CREATE FIVE SCROLL STATES:

STATE 0 — ASSEMBLED / 0–18% SCROLL
- The device is fully assembled as a wrist wearable.
- The pod is seated precisely in the cradle.
- The magnetic back plate is flush and closed.
- Camera: premium front three-quarter view, slightly above the product.
- Product occupies the right 58–65% of a 16:10 website canvas, leaving clean negative space on the left.

STATE 1 — MAGNETIC RELEASE / 18–38% SCROLL
- Rotate the camera approximately 10–14 degrees horizontally and 3–5 degrees downward.
- Lift the Detachable Pod 18–24 units directly away from the cradle along the magnetic axis.
- Keep the movement mechanically straight and precise; do not make it float diagonally.
- Reveal a thin electric-blue light seam between the pod and magnetic plate.
- Slightly increase the blue rim light to make the separation readable.

STATE 2 — DETACHED / 38–58% SCROLL
- Move the Detachable Pod 70–90 units away from the wrist strap.
- Move the Magnetic Back Plate 25–35 units in the opposite direction.
- Move the Wrist Strap and Lower Cradle 12–18 units downward and slightly backward.
- Rotate the pod no more than 8–12 degrees so the magnetic contacts and rear surface become visible.
- Camera slowly pushes in by approximately 8% and moves toward a side three-quarter view.
- Keep all parts aligned on the same assembly axis.

STATE 3 — CONTROLLED EXPLODED VIEW / 58–82% SCROLL
- Separate the Pod Front Shell, Pod Internal Layer, Magnetic Back Plate, and Lower Cradle into a clean technical exploded view.
- Use consistent spacing of approximately 24–42 units between layers.
- Keep the wrist strap intact; do not explode or deform the strap.
- Do not scatter parts in multiple directions.
- Camera: close side three-quarter macro view showing the magnetic structure and modular construction.
- Orbital rings pull outward and become 35–45% less visible so they do not obscure the product.
- Sound waves fade almost completely during the technical exploded view.

STATE 4 — DETACHED POD HERO / 82–100% SCROLL
- Keep the pod detached and fully visible as the hero object.
- Re-align the pod into a clean upright three-quarter angle.
- Move the wrist strap and cradle lower in the frame as a supporting object.
- Bring the orbital rings back subtly around the detached pod.
- Camera eases out slightly and finishes in a stable, composed frame.
- Do not automatically reassemble at the end.

SCROLL EVENT:
- Use native Spline States, a Scroll Event, and Transition Actions. Do not use custom JavaScript for the main sequence.
- Event type: Scroll, not Steps.
- Start From: Enter View.
- Start At: Middle.
- End After: approximately 1800 px.
- The sequence must scrub forward and backward with page scroll.
- Use linear or very gentle Ease In Out interpolation so the animation follows the user’s scroll position precisely.
- Do not add spring overshoot, bounce, delay, looping, or cycling.
- Scrolling upward must smoothly reverse the entire sequence.

CAMERA AND INPUT:
- Use one perspective camera named “Hero Camera Scroll”.
- Animate that camera through states instead of switching abruptly between cameras.
- Disable camera zoom and pan for users.
- Keep page scrolling enabled.
- Allow only restrained soft orbit after direct pointer drag: maximum about 8 degrees horizontally and 4 degrees vertically.
- Do not let pointer movement continuously overwrite the scroll-controlled camera or product transforms.

COMPOSITION:
- Desktop canvas: 16:10, product on the right, negative space on the left.
- No giant empty area above the product.
- Keep the complete product inside the safe area at every state.
- Do not crop the strap, pod, or exploded components at any point.
- Background remains deep midnight navy with a restrained electric-blue glow.
- Reduce decorative rings and waves whenever they cross in front of the product.

RESPONSIVE STATE:
- Add a Screen Resize Event for canvases narrower than 760 px.
- On mobile, centre the product, reduce exploded spacing by approximately 35%, move the camera farther back, and keep every component inside the frame.

SUCCESS CRITERIA:
- At rest, the viewer immediately understands this is one wearable device.
- Scrolling clearly communicates: assembled wristband → magnetic release → pod detached → technical exploded view → detached pod hero.
- Every frame looks intentional and product-photography-led.
- No jitter, no constant product wobble, no duplicate devices, no diagonal scattering, and no animation conflict between scroll, mouse, and autoplay.
```

After rebuilding, export with Viewer and update/promote the Production version so the existing production URL points to the new scene.
