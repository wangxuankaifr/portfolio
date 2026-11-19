// The explicit /mobile and /mobile-preview entries bypass this root-page policy.
export function shouldOpenMobile({ userAgent = '', width, coarsePointer = false }) {
  const phone = /iPhone|iPod|Android.*Mobile/i.test(userAgent)
  return phone || (coarsePointer && width <= 767)
}

export function mobileEntryURL(currentHref, basePath = '/') {
  const current = new URL(currentHref)
  const target = new URL('mobile.html', new URL(basePath, current.origin))
  target.search = current.search
  target.hash = current.hash
  return target.href
}
