# Final mobile production publication

**Goal:** Publish the accepted mobile v5 to GitHub main and existing Cloudflare production, preserving every existing PC page, content item, style and asset.

**User authorization:** On2026-11-19 the user accepted v5 as the final mobile version and explicitly requested GitHub/Cloudflare publication and the usable website URL. User also stated: “PC端内容完全不用改”.

**Architecture:** Existing mobile work is additive on top of main f472207. Keep PC main.jsx/App/styles/data/media unchanged. Replace only the HTML module entry reference with a tiny selector: phones (phone UA or narrow coarse pointer) replace the URL with the same-base mobile.html preserving query/hash; other devices import the original PC main.jsx. This prevents a phone downloading the PC application before redirecting. Direct/mobile and/mobile-preview remain independent.

**Constraints:** No redesign, no new dependencies, no PC content edits, no force push, no deployment configuration changes. Fetch current main before promotion; if it moved, integrate instead of overwriting. Publish only tested source. Keep intentionally untracked node_modules out of commits.

## Implementation and validation

- [x] Add deviceEntry.js policy and site-entry.js loader; modify only index.html module src. Phone UA works in landscape, narrow mouse desktop stays PC, narrow coarse-pointer device uses mobile. No resize-triggered switching.
- [x] Add meaningful routing checks for phone, desktop, tablet and hash/query/base preservation; run existing regressions/build.
- [x] Capture current production PC reference and compare candidate PC content/layout; verify candidate phone root chooses accepted mobile without requesting PC bundle, keeps deep project links, and direct phone/preview endpoints work.
- [ ] Recheck remote main, publish accepted additive source to main through a non-forced fast-forward, wait for Cloudflare production checks.
- [ ] Verify anonymous formal URL on desktop and phone emulation, portrait/overview/nav and a sample video, then deliver stable production website and direct mobile URL.

**Design preservation evidence:** Approved mobile v5 is b71a21d. Existing PC files are byte-identical through that commit; only the Vite multi-entry configuration is modified. Runtime route selection is the necessary integration step, not a content/design revision.

**Candidate verification:** All24Node checks and Vite build passed. Isolated Chrome compared Contact/About against the original public production site at1440×1000: identical page text, selected computed typography/material styles and24selected element rectangles within0.25px. Phone root redirected to final mobile preserving query/hash, did not request the PC main bundle, retained approved375/390layout/navigation and played the optimized Brand Website video without a preceding gesture. Explicit phone preview also passed. Reports/screenshots retained in workspace review/mobile-final-production; no candidate page errors. Remote main fetched and remainsf472207, an ancestor of candidate source.
