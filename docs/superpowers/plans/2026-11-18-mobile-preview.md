# Fixed Mobile Preview Implementation Plan

> **For agentic workers:** Execute this small preview-shell task inline; no production branch changes.

**Goal:** Provide a desktop-clickable preview that always displays the existing mobile demo at a real mobile CSS viewport.

**Architecture:** Add a static Vite entry containing a same-origin iframe fixed at 390×844 or 375×812. Scale only its enclosing device shell to fit the desktop window. Keep the current mobile site responsible for all navigation, images and playback.

**Tech Stack:** Existing Vite, plain HTML/CSS/JavaScript. No new dependencies.

**Spec:** User requests a simulated phone-sized clickable version for visual review; the existing wide desktop rendering cannot be accepted visually.

## Global Constraints

- Preserve the portfolio's existing visual content and mobile runtime.
- Use only the mobile-demo preview branch; leave main unchanged.
- Iframe stays fixed in CSS pixels; its scale must never change internal media-query breakpoints.
- Allow iframe scrolling, dialogs and video fullscreen without overlaying fake phone controls.
- Do not present viewport simulation as physical iPhone WeChat performance validation.

## Task 1: Fixed mobile review entry

**Files:** Create mobile-preview.html, src/mobile-preview.css, src/mobile-preview.js; modify vite.config.js and mobile.html.

- [x] Add mobile-preview.html to Vite rollup input. Include a title, two viewport buttons, fit/100% controls, home and reload actions, a fixed-size iframe with allowfullscreen, and a short scroll instruction.
- [x] Reuse Inter Tight and neutral black/grey materials for the review shell. Keep the framed site visually dominant. Give the iframe exact width and height attributes and corresponding CSS dimensions; scale its outer shell only.
- [x] Implement fit using the available stage bounds and fixed viewport dimensions. Recalculate on resize using ResizeObserver. Set the outer spacer to the scaled dimensions so the shell remains centered.
- [x] Switching dimensions must preserve the iframe document and route. Home resets the same-origin mobile URL; reload calls the frame's existing location.reload().
- [x] In framed mode only, hide root scrollbars so desktop scrollbar settings cannot narrow the mobile CSS layout. Keep normal scrolling and keyboard navigation.
- [x] Build and inspect the fixed viewport and switching behavior in a browser; inspect image/video navigation remains interactive. Check emitted HTML and referenced assets.
- [ ] Commit and push preview branch. Confirm Cloudflare Pages succeeds and the new anonymous preview entry is served. Return the precise link to the user.

**Review:** This adds review controls outside the portfolio only; no decorative content, device notch or artificial OS controls obscure the design.
