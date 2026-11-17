// Successive cards leave the circular lip at golden-angle intervals.
const clamp = (value, low, high) => Math.min(high, Math.max(low, value))
const random = (index, salt = 0) => {
  const n = Math.sin((index + 1) * 127.1 + salt * 311.7 + 5) * 43758.5453
  return n - Math.floor(n)
}
const startupTime = seconds => {
  const t = clamp(seconds / 2.5, 0, 1)
  return seconds + 2.8 * (1 - (1 - t) ** 3)
}
const lipPosition = (along, radius, minor) => {
  const turn = 50 * Math.PI / 180
  const arcLength = minor * (Math.PI - turn)
  const angle = clamp(Math.PI - Math.max(0, along) / minor, turn, Math.PI)
  const beyond = Math.max(0, along - arcLength)
  const rho = radius + minor * Math.cos(angle) + beyond * Math.sin(turn)
  const depth = minor * Math.sin(angle) - minor - beyond * Math.cos(turn)
  return { radius: rho * 1100 / (1100 - depth), depth }
}

export function artworkTrajectory(seconds, width, height, count, compact = false, aspects = []) {
  const time = startupTime(Math.max(0, seconds))
  const interval = compact ? 1.9 : 1.18
  const short = Math.min(width, height)
  const radius = clamp(short * .312, 110, 350)
  const minor = clamp(short * .11, 39, 125)
  const longest = 300 * clamp(short / 900, .55, 1.15)
  const frames = []
  const last = Math.floor((time - .6) / interval)
  const lookback = Math.ceil(14 / interval)
  for (let serial = Math.max(0, last - lookback); serial <= last; serial++) {
    const born = .6 + serial * interval
    const age = time - born
    if (age < 0) continue
    const index = serial % count
    const aspect = aspects[index] || 16 / 9
    const paperWidth = aspect >= 1 ? longest : longest * aspect
    const paperHeight = paperWidth / aspect
    const initialScale = .55
    const half = paperHeight * initialScale / 2
    const freeAt = 3.72 + half / longest * 2.25 + random(serial, 1) * .24
    const near = .7 + random(serial, 2) * .5
    const angle = serial * Math.PI * (3 - Math.sqrt(5)) + (random(serial, 3) * 2 - 1) * .1
    const start = -half - minor * .1
    const end = minor * (Math.PI - 50 * Math.PI / 180) + half
    const unfolded = clamp(age / freeAt, 0, 1)
    const feed = 2.3 * unfolded ** 2 - 1.3 * unfolded ** 3
    const along = start + (end - start) * feed
    const tube = lipPosition(along, radius, minor)
    const release = lipPosition(end, radius, minor)
    const edge = Math.min(width / 2 / Math.max(.001, Math.abs(Math.cos(angle))), height / 2 / Math.max(.001, Math.abs(Math.sin(angle))))
    const exit = edge + longest * near * .8
    const flightDuration = 4.8 + random(serial, 4) * 1.1 + Math.max(0, exit - 900) / 500
    const life = freeAt + flightDuration
    if (age >= life) continue
    const flying = clamp((age - freeAt) / flightDuration, 0, 1)
    const travel = .4 * flying + .48 * flying ** 2 + .12 * flying ** 3
    const r = age < freeAt ? tube.radius : release.radius + (exit - release.radius) * travel
    const scale = initialScale + (near - initialScale) * flying
    const blend = clamp((age - freeAt) / .4, 0, 1)
    const wrapped = 1 - blend * blend * (3 - 2 * blend)
    const rotation = angle - Math.PI / 2 + (random(serial, 5) - .5) * .65 * flying
    frames.push({
      slot: serial, serial, index, born, age, freeAt, life, angle,
      x: width / 2 + Math.cos(angle) * r,
      y: height / 2 + Math.sin(angle) * r,
      width: paperWidth * scale,
      rotation,
      tilt: (random(serial, 6) - .5) * .5 * flying,
      opacity: clamp((age - .5) / .65, 0, 1),
      curve: .07 + Math.sin(flying * Math.PI) * .17,
      chroma: 0, blur: 0, reveal: 1, birthLight: 0,
      wrapped,
      tube: { radius, minor, along, angle },
    })
  }
  return frames
}
