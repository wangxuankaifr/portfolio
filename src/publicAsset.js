const siteBase = import.meta.env?.BASE_URL ?? '/'

export function publicAsset(path) {
  return path?.startsWith('/') && !path.startsWith('//') ? `${siteBase}${path.slice(1)}` : path
}
