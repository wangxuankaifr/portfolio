const fieldSize = 160
const fadeTime = .35
const lastVisible = fadeTime * 7
const maximumImpulse = 1700

// Storing each component in two channels keeps the field precise even on
// WebGL implementations that cannot render to a floating-point texture.
export const readWake = `
  vec2 velocityAt(sampler2D field, vec2 uv) {
    vec4 bytes = texture2D(field, uv);
    vec2 values = bytes.rb * 65280.0 + bytes.ga * 255.0;
    return (values - 32768.0) * (2048.0 / 32767.0);
  }
`

const wakeFragment = `
  precision highp float;
  uniform sampler2D u_previous;
  uniform vec2 u_gridStep;
  uniform vec2 u_view;
  uniform vec2 u_start;
  uniform vec2 u_tip;
  uniform vec2 u_impulse;
  uniform float u_step;
  uniform float u_decay;
  uniform float u_radius;
  uniform float u_gain;
  varying vec2 v_uv;
  ${readWake}

  void main() {
    vec2 uv = v_uv - velocityAt(u_previous, v_uv) * u_step / u_view;
    vec2 horizontal = vec2(u_gridStep.x, 0.0);
    vec2 vertical = vec2(0.0, u_gridStep.y);
    vec2 velocity = velocityAt(u_previous, uv);
    vec2 left = velocityAt(u_previous, uv - horizontal);
    vec2 right = velocityAt(u_previous, uv + horizontal);
    vec2 down = velocityAt(u_previous, uv - vertical);
    vec2 up = velocityAt(u_previous, uv + vertical);
    vec2 crossed = velocityAt(u_previous, uv + horizontal + vertical) + velocityAt(u_previous, uv - horizontal - vertical)
      - velocityAt(u_previous, uv + horizontal - vertical) - velocityAt(u_previous, uv - horizontal + vertical);
    vec2 spread = vec2(left.x + right.x, down.y + up.y) - 2.0 * velocity + crossed.yx * 0.25;
    velocity = (velocity + 0.2 * spread) * u_decay;

    vec2 segment = u_tip - u_start;
    vec2 point = v_uv * u_view - u_start;
    float projection = clamp(dot(point, segment) / max(dot(segment, segment), 0.001), 0.0, 1.0);
    vec2 difference = point - segment * projection;
    float strength = u_gain * exp(-dot(difference, difference) / (u_radius * u_radius));
    velocity = mix(velocity, u_impulse, strength);

    vec2 values = floor(clamp(velocity / 2048.0, -1.0, 1.0) * 32767.0 + 32768.5);
    vec2 high = floor(values / 256.0);
    vec2 low = values - high * 256.0;
    gl_FragColor = vec4(high.x, low.x, high.y, low.y) / 255.0;
  }
`

export function createArtworkWake(gl, compilePass, quad) {
  const program = compilePass(wakeFragment)
  const attribute = gl.getAttribLocation(program, 'a_uv')
  const uniforms = Object.fromEntries(['previous', 'gridStep', 'view', 'start', 'tip', 'impulse', 'step', 'decay', 'radius', 'gain']
    .map(name => [name, gl.getUniformLocation(program, `u_${name}`)]))
  let targets = []
  let width = 0, height = 0, read = 0, age = Infinity, previous = null

  function resetTargets() {
    gl.clearColor(128 / 255, 0, 128 / 255, 0)
    for (const target of targets) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.buffer)
      gl.clear(gl.COLOR_BUFFER_BIT)
    }
    gl.clearColor(0, 0, 0, 0)
  }

  function removeTargets() {
    for (const target of targets) {
      gl.deleteTexture(target.texture)
      gl.deleteFramebuffer(target.buffer)
    }
    targets = []
  }

  function size(viewWidth, viewHeight, clear) {
    const ratio = fieldSize / Math.max(viewWidth, viewHeight)
    const w = Math.max(1, Math.round(viewWidth * ratio))
    const h = Math.max(1, Math.round(viewHeight * ratio))
    if (w === width && h === height && targets.length) {
      if (clear) resetTargets()
      return true
    }
    removeTargets()
    width = w
    height = h
    for (let index = 0; index < 2; index++) {
      const texture = gl.createTexture()
      const buffer = gl.createFramebuffer()
      targets.push({ texture, buffer })
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.bindFramebuffer(gl.FRAMEBUFFER, buffer)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        removeTargets()
        return false
      }
    }
    resetTargets()
    return true
  }

  return {
    step(pointer, dt, viewWidth, viewHeight) {
      if (!pointer) {
        age = Infinity
        previous = null
        return null
      }
      const point = [pointer.x, viewHeight - pointer.y]
      const start = previous ?? point
      previous = pointer.active ? point : null
      const speed = Math.hypot(pointer.vx, pointer.vy)
      const mixing = pointer.active && speed > 12 ? 1 - Math.exp(-dt * 22) : 0
      const dormant = age >= lastVisible
      age = mixing > 0 ? 0 : age + dt
      if (age >= lastVisible) return null

      gl.activeTexture(gl.TEXTURE0)
      gl.disable(gl.DITHER)
      if (!size(viewWidth, viewHeight, dormant)) {
        gl.enable(gl.DITHER)
        return null
      }
      const write = 1 - read
      gl.bindFramebuffer(gl.FRAMEBUFFER, targets[write].buffer)
      gl.viewport(0, 0, width, height)
      gl.disable(gl.BLEND)
      gl.useProgram(program)
      gl.bindBuffer(gl.ARRAY_BUFFER, quad)
      gl.enableVertexAttribArray(attribute)
      gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0)
      gl.bindTexture(gl.TEXTURE_2D, targets[read].texture)
      gl.uniform1i(uniforms.previous, 0)
      gl.uniform2f(uniforms.gridStep, 1 / width, 1 / height)
      gl.uniform2f(uniforms.view, viewWidth, viewHeight)
      gl.uniform2f(uniforms.start, ...start)
      gl.uniform2f(uniforms.tip, ...point)
      const gain = Math.min(1, maximumImpulse / Math.max(speed, 1))
      gl.uniform2f(uniforms.impulse, pointer.vx * gain, -pointer.vy * gain)
      gl.uniform1f(uniforms.gain, mixing)
      gl.uniform1f(uniforms.step, dt)
      gl.uniform1f(uniforms.decay, Math.exp(-dt / fadeTime))
      gl.uniform1f(uniforms.radius, .05 * Math.min(viewWidth, viewHeight))
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      gl.enable(gl.DITHER)
      read = write
      return { texture: targets[read].texture, width, height, x: point[0], y: point[1] }
    },
    dispose() {
      removeTargets()
      gl.deleteProgram(program)
    },
  }
}
