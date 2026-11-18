# Mobile profile and typography v5 Implementation Plan

**Goal:** Produce locally tested design proofs for user approval before updating any public mobile demo.

**Architecture:** Work on local branch mobile-design-v5 from published v4 b52ba5e. Keep the existing mobile app and phone review shell; change profile composition and overview typography only. No push, Cloudflare update or public mobile revision until user approval.

**Tech Stack:** Existing React/Vite, Inter Tight, mobile image component, PC portrait reference and glass tokens. Isolated Chrome/Playwright testing is already authorized. No installed test/webapp-testing skill was found; use actual recorded browser review instead of claiming a nonexistent skill.

**Spec:** User's three screenshots and corrections of 2026-11-18: About photo with Apple-like soft corners; Contact photo landscape above independently laid-out contact details, smaller subordinate skills; Work overview larger, lighter headings with more open tracking. Design first, review, approval, then mobile deployment.

## Design decisions

- Existing neutral palette: #f4f4f6 ground, #080808 main type, #66666a secondary type, #08080820 dividers and PC glass tokens.
- About: keep original 4:5 portrait, add roughly 26px soft corners and remove angular crop marks. Preserve image framing, content, heading and biography.
- Contact: full-width landscape head-and-shoulders image in a quiet rounded glass frame based on the PC reference; at least 28px separation before independent full-width contact rows. Telephone/email remain actionable. Values at 19–21px; labels11px. Skills10–11px in a compact lower grid; copyright stays at the bottom.
- Overview: keep v4 inset20px/173px editorial row rhythm. Raise category titles to 40–42px, use weight320 and tracking-.01em. Longest category must remain one readable line at375/390 without overflow; soften only if visual review shows it is crowded.
- No change to home, nav, wave, routes, project content or PC production.

## Tasks

- [x] Profile: revise MobileProfile.jsx and mobile-profile.css to round About image and create stacked landscape Contact composition with subordinate skills.
- [x] Overview: revise only overview heading typography in mobile-work.css, preserving regular metadata and routes.
- [x] Review actual375×812 and390×844 rendering, face crop, corners, hierarchy, link targets/touch size, no overflow, menu navigation and return; inspect saved screenshots and adjust if needed.
- [x] Run appropriate existing checks/build, independent scope review and create three local design proof images plus a review board. Deliver design approval stage only; do not deploy.

**Self-review:** A horizontal photograph and a separate information table remove the original narrow competing columns. Enlarging contact values and reducing lower skills establishes the hierarchy the user requested. About uses a calm soft-corner photograph, while Contact borrows the PC portrait frame; neither changes the supplied portrait itself.

**Completed local review:** Actual 390×844 and375×812 Chrome checks passed, plus narrow320px overflow checks. About26px corners retain the4:5 image and remove crop marks. Contact uses a2:1 inner capsule with center8% crop and a30px outer glass frame; it preserves the full hairline, face and shoulder edge. Contact details start30px below the portrait, values19.5–20.28px, skills10.31–10.73px. Phone/mail link targets and44px touch height passed. Overview titles are40.5/42.12px, weight320, tracking-.01em; longest title widths286.16/297.61px fit the available335/350px. Menu and category return still work. Default-state overview imagery is fully clipped after transitions settle. No page errors; build and20existing regressions passed. Independent screenshot review found no face crop or hierarchy blocker and confirmed PC/home/navigation source unchanged.

**Deliverable:** Workspace review/mobile-v5/design-review-board.png plus separate actual page screenshots and review-report.json. Local preview is labelled as an unpublished design draft. No GitHub push or public deployment is authorized until the user approves this design.
