const translationFrequency = 2 * Math.PI / 1.15
const rotationFrequency = 2 * Math.PI / 1.5
const maximumStep = 1 / 120
const maximumSpeed = 2000
const limit = (n, min, max) => Math.max(min, Math.min(n, max))

function easing(value, from, to) {
  const progress = limit((value - from) / (to - from), 0, 1)
  return progress * progress * (3 - 2 * progress)
}

function spring(axis, force, dt, frequency, damping) {
  const acceleration = force - frequency ** 2 * axis.offset
  axis.velocity = (axis.velocity + acceleration * dt) / (1 + 2 * damping * frequency * dt)
  axis.offset += axis.velocity * dt
}

const axis = () => ({ offset: 0, velocity: 0 })
function response() {
  return { x: axis(), y: axis(), pitch: axis(), yaw: axis(), roll: axis(), forceX: 0, forceY: 0, bend: 0, direction: 0 }
}

export function createArtworkPointer() {
  const cursor = { x: 0, y: 0, vx: 0, vy: 0, active: false }
  let previous = null
  let sheets = new Map()

  return {
    move(x, y) {
      Object.assign(cursor, { x, y, active: true })
    },
    leave() {
      cursor.active = false
      cursor.vx = cursor.vy = 0
      previous = null
    },
    apply(frames, width, height, elapsed) {
      if (elapsed > 0) {
        const weight = 1 - .65 ** (60 * elapsed)
        const vx = previous ? (cursor.x - previous.x) / elapsed : 0
        const vy = previous ? (cursor.y - previous.y) / elapsed : 0
        cursor.vx += (vx - cursor.vx) * weight
        cursor.vy += (vy - cursor.vy) * weight
        previous = cursor.active ? { x: cursor.x, y: cursor.y } : null
      }

      const shortSide = Math.min(width, height)
      const reach = Math.max(190, shortSide * .42)
      const ring = limit(shortSide * .312, 110, 350) + limit(shortSide * .11, 39, 125)
      const speed = Math.hypot(cursor.vx, cursor.vy)
      const limitedSpeed = Math.min(speed, maximumSpeed)
      const carry = limitedSpeed / Math.max(1, speed) * 4.8
      const push = 1950 + limitedSpeed * 4.4
      const active = new Map()

      for (const card of frames) {
        const pose = sheets.get(card.serial) ?? response()
        active.set(card.serial, pose)
        const outward = Math.hypot(card.x - width / 2, card.y - height / 2)
        const free = easing(card.age - card.freeAt, 0, .6)
        const exposure = .08 + .92 * easing(outward, .35 * ring, 1.45 * ring)

        for (let remaining = elapsed; remaining > 1e-6; remaining -= maximumStep) {
          const dt = Math.min(remaining, maximumStep)
          const dx = card.x + pose.x.offset - cursor.x
          const dy = card.y + pose.y.offset - cursor.y
          const distance = Math.hypot(dx, dy)
          const influence = cursor.active && distance < reach ? (1 - (distance / reach) ** 2) ** 2 * exposure : 0
          const towardX = distance > .001 ? dx / distance : cursor.vx / Math.max(1, speed)
          const towardY = distance > .001 ? dy / distance : cursor.vy / Math.max(1, speed)
          const follow = 1 - Math.exp(-dt * 8)
          pose.forceX += (influence * (towardX * push + cursor.vx * carry) - pose.forceX) * follow
          pose.forceY += (influence * (towardY * push + cursor.vy * carry) - pose.forceY) * follow
          spring(pose.x, pose.forceX, dt, translationFrequency, .56)
          spring(pose.y, pose.forceY, dt, translationFrequency, .56)

          const sheetSpeed = Math.hypot(pose.x.velocity, pose.y.velocity)
          const movement = Math.hypot(sheetSpeed, .6 * translationFrequency * Math.hypot(pose.x.offset, pose.y.offset))
          const bend = free * easing(movement, 0, 520)
          pose.bend += (bend - pose.bend) * (1 - Math.exp(-dt * (bend > pose.bend ? 6 : 2.5)))
          if (sheetSpeed > 70) {
            const angle = Math.atan2(pose.y.velocity, pose.x.velocity) - card.rotation
            const difference = angle - pose.direction
            pose.direction += .5 * Math.atan2(Math.sin(2 * difference), Math.cos(2 * difference)) * (1 - Math.exp(-dt * 3))
          }

          const torque = dx * pose.forceY - dy * pose.forceX
          const turn = free * .6 * rotationFrequency ** 2
          spring(pose.pitch, turn * Math.tanh(-(pose.y.velocity * .003 + pose.forceY * .0008) / .6), dt, rotationFrequency, .45)
          spring(pose.yaw, turn * Math.tanh(-(pose.x.velocity * .003 + pose.forceX * .0008) / .6), dt, rotationFrequency, .45)
          spring(pose.roll, turn * Math.tanh(torque * .000015), dt, rotationFrequency, .45)
        }

        card.x += pose.x.offset
        card.y += pose.y.offset
        card.rotation += pose.roll.offset
        card.tilt += pose.yaw.offset
        card.pitch = pose.pitch.offset
        card.bend = 1.5 * pose.bend
        card.bendDirection = pose.direction
        card.pushX = pose.x.offset
        card.pushY = pose.y.offset
      }
      sheets = active
      return cursor
    },
  }
}
