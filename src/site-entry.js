import { mobileEntryURL, shouldOpenMobile } from './deviceEntry'

if (shouldOpenMobile({
  userAgent: navigator.userAgent,
  width: window.innerWidth,
  coarsePointer: window.matchMedia('(pointer: coarse)').matches,
})) {
  window.location.replace(mobileEntryURL(window.location.href, import.meta.env.BASE_URL))
} else {
  // Keep the original desktop application and all of its content untouched.
  import('./main.jsx')
}
