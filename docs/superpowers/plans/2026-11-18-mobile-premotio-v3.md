# Mobile portrait composition and review plan

**User brief:** Restore PC waveform artwork on a portrait home; use the supplied Premotio mobile screenshots for navigation/expanded menu proportions; omit ancillary copy; restore PC whitespace/type in the project overview. Complete review before visual acceptance.

**Visual plan:** Existing neutral #f4f4f6/#080808 with PC glass tokens; Inter Tight with PC weight/tracking. Full-viewport artwork canvas behind large name at upper left and portfolio/date at lower right. Floating 56px top glass pill (logo, contact, menu) with an attached glass menu exposing only Works/About/Contact. Overview has 250px whitespace rows and horizontal rules; image feedback stays secondary.

**Implementation:** Keep mobile-demo branch and fixed phone preview. Reuse original shader/trajectory/pointer with real 480px phone assets (no PC source regression). New MobileNav component, adapt opening docking to actual top capsule, root controls menu closure/route gate. Keep project/video changes from previous accepted implementation.

**Review:** No installed skill named test/webapp-testing was found among 102 skills. CUA inspection repeatedly timed out. The user explicitly authorized isolated Playwright testing on 2026-11-18. Use actual Chrome mobile emulation and frontend review principles; build checks alone are not visual acceptance. The preview still needs the user's visual acceptance and physical iPhone WeChat/network validation.

- [x] Study reference mobile navigation closed/open plus motion in browser and supplied screenshots.
- [x] Integrate optimized PC artwork renderer and full-viewport portrait typography.
- [x] Implement top glass menu with focus/escape/backdrop dismissal, route close, and no ancillary small copy.
- [x] Restore whitespace overview rows, regular weight and PC tracking.
- [x] Check 375×812 and 390×844 actual layout, no overflow, home one screen, GL/fallback, animation, menu, history and video.
- [x] Capture actual screenshots; run final build and 20 regressions; independent code review.
- [ ] Publish preview only; verify anonymous entry and exact assets; provide verified phone-preview link and review evidence.

**Observed fixes:** Actual screenshots exposed Arial inherited from the inline boot style and an invisible difference-blended title against an isolated transparent home. Mobile-only font inheritance and explicit home background fixed both; screenshots were retaken. Final viewport checks confirm Inter Tight, visible title, and 56px glass navigation. All 12 wave textures total 158,618 bytes and use the original PC rendering/trajectory code.

**Completed browser checks:** Both viewport sizes cover opening, moving artwork, menu pause/focus/escape, all main destinations, whitespace overview, category/project/image dialog, scroll restoration and browser history. A fresh context verified muted inline autoplay without a preceding gesture. Reduced motion, no-WebGL artwork fallback, video failure/poster/retry, and desktop fixed-phone shell size switching/100% mode also passed. No site page errors were recorded. Reports and actual screenshots are retained in the workspace review folder; browser tooling stays outside project dependencies.
