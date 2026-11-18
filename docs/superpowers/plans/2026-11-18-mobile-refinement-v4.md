# Mobile visual refinement v4 Implementation Plan

> Implementation follows the user's four corrections to the published v3 preview. Use independent, scoped component changes and actual phone-size browser review before publication.

**Goal:** Refine the phone home, navigation and work overview while retaining the original waveform artwork and brand transitions.

**Architecture:** Keep the independent mobile entry and mobile-demo branch. Reuse the existing artwork renderer and project routes. Change only mobile composition, texture choice, navigation labels/type/reveal and overview proportions.

**Tech Stack:** Existing React/Vite, Inter Tight, CSS transitions, original artwork WebGL, isolated Playwright review already authorized by the user.

**Spec:** User corrections received 2026-11-18: restore “Great products / are triumphs of taste.” at home lower left; replace isolated AIA phone art with that project's screen mock-up cover; primary navigation action Works, menu only About/Contact with finer typography and upward text entrance; more comfortable portrait project overview.

## Global constraints

- PC source and production main stay unchanged; publish only mobile-demo.
- Retain original wave artwork, opening and SW-mask transitions.
- Home remains one viewport without scrolling.
- Maintain Inter Tight, #f4f4f6 ground, #080808 ink, #727274 secondary text, #08080820 hairlines, existing PC glass tokens.
- No new libraries or decorative content; no broad project-content changes.

## Visual decisions and review against brief

- Home: existing large two-group heading remains; quote is a quiet 13px/1.4 two-line block at the same 16px left edge and safe lower edge, clear of the right pause control.
- Artwork: use the real AIA desktop-screen project cover, optimized as a mobile texture with its full landscape composition. No isolated phone graphic in the mobile home sequence.
- Navigation: 13px Works primary label with the same glass shell; 28px regular About/Contact links, 56px touch rows and a short staggered upward text reveal. The links, rather than the entire panel, carry the user's requested upward motion.
- Overview: retain white space but use inset 20px editorial rows around 172px high, left-aligned 34–38px category names and a smaller metadata baseline, matching category archive edges. Avoid new cards, permanent photo strips, arbitrary numbering or tiny tap targets.

## Tasks

- [x] Home + image: add quote in MobileDemo.jsx/mobile-demo.css; replace only AIA mobile texture and manifest metadata using artworkByProject.aia.cover.
- [x] Navigation: update MobileNav.jsx/mobile-nav.css and any opening selectors; Works primary route, only About/Contact menu, smaller typography, staggered upward reveal; preserve focus trap and reduced motion.
- [x] Overview: revise MobileWork.jsx/mobile-work.css only as needed for inset, compact portrait rhythm, regular type and metadata alignment; retain every category route and image interaction.
- [x] Browser review at 375×812 and 390×844: quote edges/no overflow, new full cover, nav routes/menu labels/smaller font/upward reveal, overview size/spacing, project open/return and single home screen. Save and inspect actual screenshots.
- [ ] Final build, existing regressions, scoped independent review; publish mobile-demo and verify new public phone-preview entry in an anonymous browser.

**Self-review:** The current request specifically asks for more delicate navigation and less expansive rows. Reducing type alone would leave the old large empty bands; the row height and alignment therefore change together. The full AIA screen mock-up preserves a recognisable work image while keeping the wave engine intact.

**Local review results:** Both sizes passed in isolated Chrome. Quote left edge is exactly 16px, matching the heading, and stays clear of the pause control. AIA's loaded natural dimensions are 480×270, using the full screen mock-up. Menu label Y positions progress from 37.625px through 6–9px to 0, with opacity 0 to 1; final 28px/400 typography and reduced-motion behavior passed. Overview rows are 173px including the border, inset 20px; category names are 35.625px at 375px and 37.05px at 390px. Metadata baselines align, every title fits, category/project return scroll is restored, and there are no page errors. Actual screenshots were inspected and retained in the workspace review/mobile-v4 folder. Independent source review confirmed PC and shared rendering sources unchanged.
