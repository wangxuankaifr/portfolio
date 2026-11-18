# Mobile Visual Revision Implementation Plan

> **For agentic workers:** Implement the assigned UI components in parallel; root integrates and verifies the phone-preview entry before publishing.

**Goal:** Restore desktop visual quality and opening/route transitions within the fixed phone viewport, following the user's eight review points.

**Architecture:** Keep the independent mobile runtime and existing phone-preview shell. Root owns the single-screen home, circular glass return logo, shared glass bottom navigation and route coordination. Dedicated components supply short-lived opening/route motion, the desktop-style category archive, and visibility-gated video autoplay.

**Tech Stack:** Existing React/Vite, shared brand artwork and typography; existing WebGL logo ripple during opening only; 2D brand-mask route canvas; no new dependencies.

**Spec:** User's current eight-point mobile visual review in this chat.

## Global Constraints

- Initial home uses the PC-quality logo loading sequence, followed by logo docking, glass navigation and content reveal. Loading prepares real hero assets with a bounded wait.
- Top navigation becomes only a round glass logo return control. Remove name and location from it.
- Home is one viewport with no vertical scroll; remove featured feed and all specified ancillary copy.
- Name and portfolio/date form one vertically stacked primary heading.
- Work overview restores five category strips and category archive hierarchy from desktop. Preserve consistent black logo-mask route transitions in both directions.
- Project layout stays; visible videos attempt muted inline autoplay and keep an actionable fallback when blocked. Remove normal playback instructions.
- Preserve the desktop glass tokens exactly: #fcfcfd52 fill, #ffffff80 border, blur(28px) saturate(150%), inset highlight and thin dark outline.
- Publish only mobile-demo preview branch; main desktop remains unchanged.

## Task 1: Home/navigation integration

- [x] Replace MobileDemo home with one primary heading and three real optimized artwork layers in a fixed height stage.
- [x] Use round .m-home-return and bottom .m-bottom-nav with PC glass tokens. Route return behavior follows current context.
- [x] Coordinate native hash/history transitions through MobileRouteTransition covered/complete callbacks; restore each list scroll position after covered route commit.
- [x] Replace initial HTML skeleton with center logo/0 so no retired text flashes before React.

## Task 2: Motion, work and playback components

- [x] Add MobileMotion.jsx/mobile-motion.css with bounded asset readiness, ripple logo docking, glass/nav/type/art reveal, and PC brand-mask transitions.
- [x] Add MobileWork.jsx/mobile-work.css: five category image strips and per-category hero/ordered project archive, all real cover sources.
- [x] Update MobileMedia/MobileProject for visible muted autoplay, policy fallback, offscreen pause and clean disposal; remove playback help copy.

## Task 3: Verify and publish

- [x] Build and run existing regression tests. Review interaction ownership and history/autoplay cleanup.
- [ ] In fixed phone preview, inspect 390×844 and 375×812 opening, no home scrolling, heading, glass controls, work/category/project transitions, video playback and return behavior.
- [ ] Save review screenshot. Commit/push preview only, verify Cloudflare Pages and anonymous final entry, deliver the same phone-preview URL.

Verification note: browser automation could not connect to the local preview tab during this revision, so the visual and interaction check remains unchecked. Local entry responds correctly; source audit confirmed PC glass tokens, valid gallery routes and optimized cover mappings.
