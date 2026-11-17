const vertexSource = `
  attribute vec2 position;
  varying mediump vec2 uv;
  void main() {
    uv = position * vec2(0.5, -0.5) + 0.5;
    gl_Position = vec4(position, 0., 1.);
  }
`

const fragmentSource = `
  precision mediump float;
  varying mediump vec2 uv;
  uniform sampler2D logo;
  uniform float progress;
  uniform float strength;

  float ink(vec2 p) {
    if (p.x < 0. || p.x > 1. || p.y < 0. || p.y > 1.) return 0.;
    vec4 pixel = texture2D(logo, p);
    return (1. - pixel.r) * pixel.a;
  }

  void main() {
    vec2 p = (uv - 0.5) * 1.84;
    float phase = progress * 6.2831853;
    float sweep = smoothstep(0., 1., progress);
    vec2 center = vec2(mix(0.36, -0.72, sweep), -0.06 + 0.15 * sin(phase + 0.4));
    vec2 delta = p - center;
    float turn = -0.40 + 0.65 * sin(phase * 0.75);
    float c = cos(turn), s = sin(turn);
    vec2 local = mat2(c, s, -s, c) * delta;
    vec2 elliptical = local / vec2(0.49, 0.62);
    float angle = atan(elliptical.y, elliptical.x + 0.0001);
    float contour = 1. + 0.17 * sin(3. * angle + phase) + 0.08 * cos(5. * angle - phase);
    float radius = length(elliptical) / contour;
    float inside = 1. - smoothstep(0.57, 1.05, radius);
    vec2 outward = delta / max(length(delta), 0.001);

    // A localized lens magnifies the core and folds the outline at its rim.
    vec2 swell = -delta * 0.88 * exp(-radius * radius * 2.5);
    vec2 waves = vec2(sin(local.y * 21. + phase * 2.) * 0.17,
                     cos(local.x * 17. - phase * 1.4) * 0.12);
    vec2 rim = outward * sin(radius * 12. - phase * 1.4) * 0.085;
    vec2 shift = (swell + waves + rim) * inside * strength;
    vec2 split = shift * 0.069 + outward * inside * strength * 0.004;
    vec2 source = p + shift + 0.5;
    vec3 color = 1. - vec3(ink(source + split), ink(source), ink(source - split));

    float edge = smoothstep(0.61, 0.83, radius) * (1. - smoothstep(0.83, 1.06, radius));
    float shade = edge * smoothstep(-0.28, 0.4, elliptical.y + elliptical.x * 0.36);
    color *= 1. - shade * strength * 0.092;
    // Composite the refracted mark over the page without blurring a white rectangle.
    float white = min(color.r, min(color.g, color.b));
    gl_FragColor = vec4(color - white, 1. - white);
  }
`

export function createOpeningRipple(canvas, image) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'low-power' })
  if (!gl) return null

  const shaders = []
  const program = gl.createProgram()
  const texture = gl.createTexture()
  const vertices = gl.createBuffer()
  const dispose = () => {
    for (const shader of shaders) gl.deleteShader(shader)
    gl.deleteTexture(texture)
    gl.deleteBuffer(vertices)
    gl.deleteProgram(program)
  }

  try {
    for (const [type, source] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]]) {
      const shader = gl.createShader(type)
      if (!shader) throw new Error('Opening shader unavailable')
      shaders.push(shader)
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader))
      gl.attachShader(program, shader)
    }
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program))

    // Rasterize the existing mark at a fixed size for consistent SVG uploads.
    const source = document.createElement('canvas')
    source.width = source.height = 448
    source.getContext('2d').drawImage(image, 0, 0, source.width, source.height)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)

    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, vertices)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    gl.uniform1i(gl.getUniformLocation(program, 'logo'), 0)
    const progressUniform = gl.getUniformLocation(program, 'progress')
    const strengthUniform = gl.getUniformLocation(program, 'strength')
    gl.viewport(0, 0, canvas.width, canvas.height)

    return {
      draw(progress, strength) {
        if (gl.isContextLost()) return false
        gl.uniform1f(progressUniform, progress)
        gl.uniform1f(strengthUniform, strength)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        return true
      },
      dispose,
    }
  } catch {
    dispose()
    return null
  }
}
