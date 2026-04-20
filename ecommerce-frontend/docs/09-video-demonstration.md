# Video Demonstration

This document describes the included demonstration videos, how to preview them locally, and the recommended timestamps and highlights to reference when presenting the project.

---

## Overview

Two demonstration recordings are included in `docs/` for quick review:

- `ecommerce-project-real.mp4` — Primary walkthrough showing the full checkout flow, State Engine overlay, and simulated failure modes.
- `ecommerce-project-real2.mp4` — Alternate capture focusing on developer simulation presets and recovery flows.

These videos are intended for local review and short presentations; they are not optimized for upload to a public CDN. If you plan to ship them to GitHub or embed on an external page, consider compressing or hosting externally.

---

## Files & Locations

- Video files (already present): `docs/ecommerce-project-real.mp4`, `docs/ecommerce-project-real2.mp4`.
- Optional place for GitHub-friendly assets: `public/videos/` (copy there if you want to serve them via a static server).

---

## How to preview locally

1. Open the `docs/` folder in VS Code and double-click the `.mp4` file to play it using your OS default player.

2. For an in-markdown preview inside VS Code (Markdown Preview supports embedded HTML), add a small HTML `<video>` snippet to the Markdown file where you want the player to appear:

```html
<video controls style="max-width:100%;height:auto">
  <source src="./ecommerce-project-real.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
```

3. To serve the `public/` folder and play videos through a local HTTP server (recommended if you move files to `public/videos/`):

```bash
# from repository root
npx http-server public -p 8080
# open http://localhost:8080/videos/ecommerce-project-real.mp4
```

4. Alternatively, use the Live Server extension in VS Code and open a small HTML wrapper that embeds the video.

## Recording & Export Guidance

- For smooth playback during demos, export MP4 (H.264) at 720p to balance quality and file size.
- If you plan to publish the demo, upload to a video host (YouTube/Vimeo) and reference an embeddable link in this document instead of storing heavy binary assets in the repo.

---

## Notes

- These video files are included only for local review. If you want GitHub to render a playable preview, move the file to `public/videos/` and serve through a static host; GitHub's markdown viewer may not autoplay embedded video tags.
- If you want, I can add an HTML wrapper file that embeds the chosen video(s) and open it via Live Server for a quick browser preview.
<video controls src="ecommerce-project-real2.mp4" title="Title"></video> <video controls src="ecommerce-project-real.mp4" title="Title"></video>