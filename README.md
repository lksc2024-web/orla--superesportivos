# Orla Superesportivos — Interactive Automotive Showcase

**Status:** fictional brand / technical demonstration. Not an operating dealership or an official Lamborghini project.

## Problem and approach

Explore how a high-end automotive presentation can combine guided storytelling with a real-time 3D vehicle configurator in a static website.

## What the project demonstrates

- A dark 3D studio, reflective floor, and staged lighting
- Scroll-directed camera progression across five chapters
- Interactive customization of paint, wheels, and brake calipers
- A static deployment approach using `index.html`, `car.glb`, and `vercel.json`

## Technology

HTML, CSS, JavaScript, Three.js, and a GLB vehicle asset. The repository has no package build step.

## Run locally

Serve the repository directory with a static HTTP server, for example:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`. Using an HTTP server is recommended for browser asset loading.

## Demo

[Live project](https://orla-superesportivos.vercel.app/) — deployment URL supplied by the project owner; verify availability before publishing.

## Limitations and attribution

This is a demonstration, not a commercial dealership. Inventory, contacts, and test-drive flows are fictional. The 3D model was adapted from the [automotive-configurator project](https://github.com/codeagencybe/automotive-configurator), originally attributed there to tf3dm.com; license and redistribution terms must be verified before commercial reuse. Lamborghini and Aventador are trademarks of Automobili Lamborghini S.p.A. This project is unaffiliated with the manufacturer.

## Asset provenance and reuse checklist

The earlier project README attributes the adapted 3D vehicle to the [automotive-configurator source repository](https://github.com/codeagencybe/automotive-configurator), which in turn attributes its original model to tf3dm.com. The original documentation states that the GLB was Draco-compressed and that emblems were removed.

**Before reusing or commercially distributing the model:** identify the original asset license and its applicable terms, confirm whether modification and redistribution are allowed, retain any required notices, and replace the asset if the permissions cannot be established. Removing emblems alone does not establish licensing rights.

## Runtime dependencies and demo behavior

The tracked `index.html` imports Three.js 0.170.0 and its addons from jsDelivr. It first attempts to load the local `./car.glb` model and, on failure, attempts to load the original model from a third-party GitHub raw-content URL. This fallback introduces a network dependency and does **not** resolve asset licensing. The visit form shows a local demonstration confirmation; it does **not** submit a booking to a business backend. If WebGL initialization fails, the page displays a message; successful operation of the remaining content still requires browser testing.

## Quality verification

No automated test suite or independently verified performance and accessibility results are claimed in this README. Browser/device checks and licensing review remain open tasks.
