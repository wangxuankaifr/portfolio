# Mobile Contact portrait: remove glass backplate

**Scope:** User requests only removing the mobile Contact portrait's glass background plate, all other content unchanged, then delivering a fixed-phone acceptance window. Keep formal production/main at6fcad81 until acceptance; publish preview only.

**Implementation:** Remove the outer plate fill, border, blur, shadow and pseudo-element backdrops. Preserve geometry by replacing14px padding+1px border with15px padding, and20px+1px with21px at the existing wider breakpoint. Keep the2:1 capsule image, its crop and every text/link/position unchanged. Remove unused backdrop imports/style from MobileProfile. Preview opens Contact directly with a cache-busting revision.

- [x] Apply the mobile-only changes and build.
- [x] Compare actual390/375geometry, text, links and typography with current formal Contact; verify outer plate paints nothing and capture screenshots.
- [ ] Independent diff review; publish mobile-demo preview only and verify public fixed-phone window. Deliver that window for confirmation, without updating main.

**Candidate result:** Actual390×844 and375×812 Chrome checks found identical text, links and9selected image/content rectangles+typography compared with the formal page. Outer background is transparent; border0; shadow/filter/pseudo-elements absent. Fixed-phone preview opens Contact and switches sizes without losing the route. Build/diffcheck and independent source review passed; screenshot inspected. No page errors. Only preview publication is authorized at this stage.
