import { createArtworkWake, readWake } from './artworkWake.js'
import { publicAsset } from './publicAsset.js'

/**
 * Draws the portfolio's local images as slightly curved, refractive paper cards.
 * Motion and ordering belong to the caller; all coordinates here are CSS pixels.
 */
export function createArtworkFlow(canvas, assets, { onReady, onError } = {}) {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: true,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power',
  })
  if (!gl) {
    onError?.(new Error('WebGL is unavailable'))
    return null
  }

  let disposed = false
  let lost = false
  let errorReported = false
  let width = 1
  let height = 1
  let program
  let postProgram
  let vertices
  let indices
  let postVertices
  let framebuffer
  let sceneTexture
  let pixelWidth = 1
  let pixelHeight = 1
  const textures = new Array(assets.length)
  const pending = new Set()
  const reportError = error => {
    if (!disposed && !errorReported) {
      errorReported = true
      onError?.(error)
    }
  }

  const vertexSource = `
    precision highp float;
    attribute vec2 a_uv;
    uniform vec2 u_viewport;
    uniform vec2 u_center;
    uniform vec2 u_size;
    uniform float u_rotation;
    uniform float u_tilt;
    uniform float u_pitch;
    uniform float u_curve;
    uniform vec2 u_bend;
    uniform vec2 u_push;
    uniform float u_time;
    uniform float u_seed;
    uniform float u_wrapped;
    uniform vec4 u_tube;
    varying vec2 v_uv;
    varying highp float v_tubeAlong;
    varying lowp float v_tubeMask;

    void main() {
      v_uv = a_uv;
      vec2 rawLocal = (a_uv - 0.5) * u_size;
      vec2 local = rawLocal;
      float tubeBlend = u_tube.x > 0.0 ? clamp(u_wrapped, 0.0, 1.0) : 0.0;
      float legacyWrap = u_tube.x > 0.0 ? 0.0 : u_wrapped;
      float arch = sin(a_uv.x * 3.14159265);
      float flutter = sin(a_uv.y * 3.14159265 + u_time * 0.45 + u_seed);
      float z = (arch - 0.5) * u_size.x * u_curve * 0.28;
      z += flutter * pow(abs(a_uv.x - 0.5) * 2.0, 2.0) * u_size.x * u_curve * 0.055;
      if (u_bend.x > 0.001) {
        vec2 drift = vec2(cos(u_bend.y), sin(u_bend.y));
        float span = dot(rawLocal, drift);
        float radius = u_size.x / u_bend.x;
        float angle = span / radius;
        local += drift * (radius * sin(angle) - span);
        z += radius * (1.0 - cos(angle));
      }
      // A newly born sheet briefly curls around the aperture before opening.
      z += sin((a_uv.x - 0.5) * 3.14159265) * u_size.x * legacyWrap * 0.2;
      local.x *= 1.0 - legacyWrap * 0.16;
      local.y += arch * sin(u_time * 0.35 + u_seed) * u_size.y * u_curve * 0.045;

      float ct = cos(u_tilt);
      float st = sin(u_tilt);
      float tiltedX = local.x * ct + z * st;
      float tiltedZ = -local.x * st + z * ct;
      float cp = cos(u_pitch);
      float sp = sin(u_pitch);
      float tiltedY = local.y * cp - tiltedZ * sp;
      float depth = local.y * sp + tiltedZ * cp;
      float perspective = 1100.0 / (1100.0 - depth);
      vec2 tilted = vec2(tiltedX, tiltedY) * perspective;
      float cr = cos(u_rotation);
      float sr = sin(u_rotation);
      vec2 point = u_center + vec2(tilted.x * cr - tilted.y * sr, tilted.x * sr + tilted.y * cr);

      float radialAlong = u_tube.z + rawLocal.y;
      v_tubeAlong = radialAlong;
      v_tubeMask = tubeBlend;
      if (tubeBlend > 0.0) {
        // Unroll each row of the image from the inner wall of a circular tube,
        // over its crest, then continue along the 50-degree exit tangent.
        float minorRadius = max(u_tube.y, 0.001);
        float exitAngle = 0.872664626;
        float phi = clamp(3.141592654 - max(0.0, radialAlong) / minorRadius, exitAngle, 3.141592654);
        float tangentLength = max(0.0, radialAlong - minorRadius * (3.141592654 - exitAngle));
        float rho = u_tube.x + minorRadius * cos(phi) + tangentLength * sin(exitAngle);
        float tubeZ = minorRadius * sin(phi) - minorRadius - tangentLength * cos(exitAngle);
        vec2 radial = vec2(cos(u_tube.w), sin(u_tube.w));
        // This tangent gives the same handedness as rotation = angle - PI/2.
        // The card's printed face therefore stays readable while it unwraps.
        vec2 tangent = vec2(radial.y, -radial.x);
        float tubePerspective = 1100.0 / (1100.0 - tubeZ);
        vec2 tubePoint = u_viewport * 0.5 + (rho * radial + rawLocal.x * tangent) * tubePerspective + u_push;
        point = mix(point, tubePoint, tubeBlend);
      }
      vec2 clip = point / u_viewport * 2.0 - 1.0;
      gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    }
  `

  const fragmentSource = `
    precision mediump float;
    uniform sampler2D u_image;
    uniform float u_opacity;
    uniform float u_chroma;
    uniform float u_blur;
    uniform float u_reveal;
    uniform float u_birthLight;
    varying vec2 v_uv;
    varying highp float v_tubeAlong;
    varying lowp float v_tubeMask;

    // Texture pixels are uploaded premultiplied. Transparent samples therefore
    // stay correctly coloured under interpolation, including transparent art.
    vec4 picture(vec2 uv) {
      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return vec4(0.0);
      return texture2D(u_image, uv);
    }

    vec4 splitSample(vec2 uv, float separation) {
      vec4 r = picture(uv + vec2(separation, 0.0));
      vec4 g = picture(uv);
      vec4 b = picture(uv - vec2(separation, 0.0));
      return vec4(r.r, g.g, b.b, max(g.a, max(r.a, b.a)));
    }

    void main() {
      // Keep one side in focus. Refraction and motion stretch gather gradually
      // toward the trailing edge instead of obscuring the complete image.
      float edge = smoothstep(0.16, 0.98, v_uv.x);
      float split = u_chroma * (0.0015 + edge * edge * 0.04);
      vec4 crisp = picture(v_uv);
      if (u_chroma > 0.001) crisp = splitSample(v_uv, split);
      float stretch = u_blur * edge * edge * 0.25;
      vec4 trail = vec4(0.0);
      float weightSum = 0.0;
      if (u_blur > 0.001) {
        for (int i = 0; i < 7; i++) {
          float t = float(i) / 6.0;
          float weight = 1.0 - t * 0.72;
          trail += splitSample(v_uv - vec2(t * stretch, 0.0), split * (1.0 + t * 0.45)) * weight;
          weightSum += weight;
        }
        crisp = mix(crisp, trail / weightSum, min(0.92, u_blur * edge));
      }
      vec4 colour = crisp;
      float emerging = mix(1.0, smoothstep(0.0, 8.0, v_tubeAlong), v_tubeMask);
      float alpha = colour.a * u_opacity * emerging;
      if (alpha < 0.003) discard;
      // Straight-alpha output combines with blendFuncSeparate below. The
      // framebuffer remains premultiplied for transparent canvas compositing.
      vec3 straight = colour.rgb / max(colour.a, 0.0001);
      straight = mix(vec3(1.0), straight, smoothstep(0.0, 1.0, u_reveal));
      straight = mix(straight, vec3(1.0), clamp(u_birthLight * 0.88, 0.0, 0.92));
      gl_FragColor = vec4(clamp(straight, 0.0, 1.0), alpha);
    }
  `

  const postVertexSource = `
    attribute vec2 a_uv;
    varying vec2 v_uv;
    void main() {
      v_uv = a_uv;
      gl_Position = vec4(a_uv * 2.0 - 1.0, 0.0, 1.0);
    }
  `

  const postFragmentSource = `
    precision highp float;
    uniform sampler2D u_scene;
    uniform vec2 u_viewport;
    uniform float u_radius;
    uniform float u_aperture;
    uniform sampler2D u_wake;
    uniform float u_wakeActive;
    uniform vec2 u_wakeStep;
    uniform vec2 u_pointer;
    varying vec2 v_uv;
    ${readWake}

    // The offscreen scene contains premultiplied colour. The pointer wake
    // reflects across the moving sheets and the paper underneath them.
    vec4 scene(vec2 uv) {
      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return vec4(0.0);
      return texture2D(u_scene, uv);
    }

    void main() {
      vec2 motion = vec2(0.0);
      if (u_wakeActive > 0.5) motion = velocityAt(u_wake, v_uv);
      float speed = length(motion);
      vec2 shiftedUV = v_uv - motion * 0.011 / u_viewport;
      vec2 pixel = shiftedUV * u_viewport;
      vec2 delta = pixel - u_viewport * 0.5;
      float distance = length(delta);
      vec2 radial = delta / max(distance, 0.001);
      float inner = u_radius - u_aperture;
      float ringPosition = ((distance - u_radius) / u_aperture + 1.0) / 0.6;
      float nearRing = exp(-ringPosition * ringPosition);
      float edgeDistance = min(
        (u_viewport.x * 0.5) / max(abs(radial.x), 0.001),
        (u_viewport.y * 0.5) / max(abs(radial.y), 0.001)
      );
      float outer = smoothstep(edgeDistance * 0.8, edgeDistance, distance);
      float shortSide = min(u_viewport.x, u_viewport.y);
      vec2 stretch = radial * (u_aperture * nearRing * 0.46 + shortSide * 0.058 * outer);
      vec2 withMotion = motion / max(speed, 1.0);
      if (speed > 1.0) {
        float orientation = dot(withMotion, radial) < 0.0 ? -1.0 : 1.0;
        stretch += withMotion * orientation * min(speed * 0.03, shortSide * 0.035);
      }
      vec4 colour = scene(shiftedUV);

      if (length(stretch) > 0.2) {
        vec3 spectrum = vec3(0.0);
        vec3 coverage = vec3(0.0);
        vec3 weights = vec3(0.0);
        // Offset the source along the screen-space radial direction. Distinct
        // overlapping wavelength weights produce one continuous prism streak,
        // not three separate ghost copies of a card.
        for (int i = 0; i < 16; i++) {
          float t = float(i) / 15.0;
          vec3 wavelengthPosition = (vec3(t) - vec3(0.8, 0.5, 0.2)) / 0.31;
          vec3 wavelength = exp(-wavelengthPosition * wavelengthPosition);
          vec4 sampleColour = scene(shiftedUV - stretch * (t - 0.18) / u_viewport);
          spectrum += sampleColour.rgb * wavelength;
          coverage += vec3(sampleColour.a) * wavelength;
          weights += wavelength;
        }
        vec3 rgb = spectrum / weights;
        vec3 alpha = coverage / weights;
        colour = vec4(rgb, max(alpha.r, max(alpha.g, alpha.b)));
      }

      // Inside the aperture there is empty page, rather than a visible lens
      // disc. White emergence remains clipped to the sampled paper's alpha.
      float apertureMask = smoothstep(inner * 0.95, inner * 1.015, distance);
      float emergence = exp(-pow(distance / max(1.0, inner * 0.8), 2.0));
      colour.rgb = mix(colour.rgb, vec3(colour.a), emergence * 0.92);
      colour *= apertureMask;
      if (speed > 1.0) {
        vec2 stepX = vec2(u_wakeStep.x, 0.0);
        vec2 stepY = vec2(0.0, u_wakeStep.y);
        float curl = velocityAt(u_wake, v_uv + stepX).y - velocityAt(u_wake, v_uv - stepX).y
          - velocityAt(u_wake, v_uv + stepY).x + velocityAt(u_wake, v_uv - stepY).x;
        vec2 ahead = withMotion * 20.0 / u_viewport;
        vec3 spectrum = vec3(length(velocityAt(u_wake, v_uv + ahead)), speed, length(velocityAt(u_wake, v_uv - ahead)));
        vec2 fromPointer = (v_uv * u_viewport - u_pointer) / (shortSide * 0.08);
        float shine = 0.25 * exp(-dot(fromPointer, fromPointer)) / 1700.0;
        vec3 paper = vec3(244.0, 244.0, 246.0) / 255.0;
        vec3 reflected = (colour.rgb + paper * (1.0 - colour.a)) * (1.0 + 0.035 * clamp(curl / 500.0, -1.0, 1.0));
        reflected += (spectrum - vec3(dot(spectrum, vec3(1.0 / 3.0)))) * shine;
        colour = vec4(clamp(reflected, 0.0, 1.0), 1.0);
      }
      gl_FragColor = colour;
    }
  `

  function compile(type, source) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader)
      gl.deleteShader(shader)
      throw new Error(`Artwork shader could not compile: ${message}`)
    }
    return shader
  }

  function link(vertex, fragment) {
    let vertexShader, fragmentShader, linked
    try {
      vertexShader = compile(gl.VERTEX_SHADER, vertex)
      fragmentShader = compile(gl.FRAGMENT_SHADER, fragment)
      linked = gl.createProgram()
      gl.attachShader(linked, vertexShader)
      gl.attachShader(linked, fragmentShader)
      gl.linkProgram(linked)
      if (!gl.getProgramParameter(linked, gl.LINK_STATUS)) {
        throw new Error(`Artwork program could not link: ${gl.getProgramInfoLog(linked)}`)
      }
      return linked
    } catch (error) {
      if (linked) gl.deleteProgram(linked)
      throw error
    } finally {
      if (vertexShader) gl.deleteShader(vertexShader)
      if (fragmentShader) gl.deleteShader(fragmentShader)
    }
  }
  try {
    program = link(vertexSource, fragmentSource)
    postProgram = link(postVertexSource, postFragmentSource)
  } catch (error) {
    if (program) gl.deleteProgram(program)
    reportError(error)
    return null
  }

  // UV coordinates double as a 16 × 12 subdivided plane, with v=0 at its top.
  // Leaving UNPACK_FLIP_Y_WEBGL off maps the first HTML image row to that top.
  const columns = 16
  const rows = 12
  const points = new Float32Array((columns + 1) * (rows + 1) * 2)
  const triangles = new Uint16Array(columns * rows * 6)
  let cursor = 0
  for (let y = 0; y <= rows; y++) {
    for (let x = 0; x <= columns; x++) {
      points[cursor++] = x / columns
      points[cursor++] = y / rows
    }
  }
  cursor = 0
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const a = y * (columns + 1) + x
      const b = a + columns + 1
      triangles.set([a, b, a + 1, a + 1, b, b + 1], cursor)
      cursor += 6
    }
  }
  vertices = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertices)
  gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW)
  indices = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangles, gl.STATIC_DRAW)
  postVertices = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, postVertices)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW)

  const attribute = gl.getAttribLocation(program, 'a_uv')
  const uniforms = Object.fromEntries([
    'viewport', 'center', 'size', 'rotation', 'tilt', 'pitch', 'curve', 'bend', 'push', 'time', 'seed',
    'image', 'opacity', 'chroma', 'blur', 'reveal', 'birthLight', 'wrapped', 'tube',
  ].map(name => [name, gl.getUniformLocation(program, `u_${name}`)]))
  const postAttribute = gl.getAttribLocation(postProgram, 'a_uv')
  const postUniforms = Object.fromEntries(['scene', 'viewport', 'radius', 'aperture', 'wake', 'wakeActive', 'wakeStep', 'pointer']
    .map(name => [name, gl.getUniformLocation(postProgram, `u_${name}`)]))
  framebuffer = gl.createFramebuffer()
  sceneTexture = gl.createTexture()
  function allocateScene() {
    gl.bindTexture(gl.TEXTURE_2D, sceneTexture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, pixelWidth, pixelHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sceneTexture, 0)
    const complete = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    if (!complete) {
      reportError(new Error('The artwork postprocessing target is unavailable'))
      return false
    }
    return true
  }
  if (!allocateScene()) {
    gl.deleteTexture(sceneTexture)
    gl.deleteFramebuffer(framebuffer)
    gl.deleteBuffer(vertices)
    gl.deleteBuffer(indices)
    gl.deleteBuffer(postVertices)
    gl.deleteProgram(program)
    gl.deleteProgram(postProgram)
    return null
  }

  let wake
  try {
    wake = createArtworkWake(gl, source => link(postVertexSource, source), postVertices)
  } catch {
    // A renderer without the fluid pass can still move the artwork itself.
  }

  gl.disable(gl.DEPTH_TEST)
  gl.disable(gl.CULL_FACE)
  gl.enable(gl.BLEND)
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  gl.clearColor(0, 0, 0, 0)

  const contextLost = event => {
    event.preventDefault()
    lost = true
    reportError(new Error('The artwork WebGL context was lost'))
  }
  canvas.addEventListener('webglcontextlost', contextLost, false)

  const maxTexture = gl.getParameter(gl.MAX_TEXTURE_SIZE)
  const loads = assets.map((asset, index) => new Promise(resolve => {
    const image = new Image()
    const loading = { image, cancel: () => finish(false) }
    pending.add(loading)
    function finish(ok) {
      image.onload = null
      image.onerror = null
      pending.delete(loading)
      resolve(ok)
    }
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      if (disposed || lost) return finish(false)
      let source = image
      // Only unusually large source files need a texture-sized upload surface.
      if (Math.max(image.naturalWidth, image.naturalHeight) > maxTexture) {
        const scale = maxTexture / Math.max(image.naturalWidth, image.naturalHeight)
        const upload = document.createElement('canvas')
        upload.width = Math.max(1, Math.round(image.naturalWidth * scale))
        upload.height = Math.max(1, Math.round(image.naturalHeight * scale))
        const context = upload.getContext('2d')
        if (!context) return finish(false)
        context.drawImage(image, 0, 0, upload.width, upload.height)
        source = upload
      }
      const texture = gl.createTexture()
      try {
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        textures[index] = texture
        finish(true)
      } catch {
        gl.deleteTexture(texture)
        finish(false)
      }
    }
    image.onerror = () => finish(false)
    image.src = publicAsset(asset.image)
  }))
  Promise.all(loads).then(results => {
    if (disposed || lost) return
    if (results.some(Boolean)) onReady?.()
    else reportError(new Error('No artwork textures could be loaded'))
  })

  return {
    resize(nextWidth, nextHeight) {
      if (disposed || lost) return
      width = Math.max(1, nextWidth)
      height = Math.max(1, nextHeight)
      const dpr = Math.min(1.5, window.devicePixelRatio || 1, maxTexture / width, maxTexture / height)
      const nextPixelWidth = Math.max(1, Math.round(width * dpr))
      const nextPixelHeight = Math.max(1, Math.round(height * dpr))
      if (pixelWidth !== nextPixelWidth || pixelHeight !== nextPixelHeight || canvas.width !== nextPixelWidth || canvas.height !== nextPixelHeight) {
        pixelWidth = nextPixelWidth
        pixelHeight = nextPixelHeight
        canvas.width = pixelWidth
        canvas.height = pixelHeight
        if (!allocateScene()) lost = true
      }
      gl.viewport(0, 0, pixelWidth, pixelHeight)
    },

    render(frames, time = 0, pointer = null, dt = 0) {
      if (disposed || lost) return
      const field = wake?.step(pointer, dt, width, height)
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
      gl.viewport(0, 0, pixelWidth, pixelHeight)
      gl.enable(gl.BLEND)
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.useProgram(program)
      gl.bindBuffer(gl.ARRAY_BUFFER, vertices)
      gl.enableVertexAttribArray(attribute)
      gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices)
      gl.activeTexture(gl.TEXTURE0)
      gl.uniform1i(uniforms.image, 0)
      gl.uniform2f(uniforms.viewport, width, height)
      gl.uniform1f(uniforms.time, time)
      for (const frame of frames) {
        const texture = textures[frame.index]
        if (!texture || frame.opacity <= 0 || frame.width <= 0 || frame.height <= 0) continue
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.uniform2f(uniforms.center, frame.x, frame.y)
        gl.uniform2f(uniforms.size, frame.width, frame.height)
        gl.uniform1f(uniforms.rotation, frame.rotation || 0)
        gl.uniform1f(uniforms.tilt, frame.tilt || 0)
        gl.uniform1f(uniforms.pitch, frame.pitch || 0)
        gl.uniform1f(uniforms.curve, frame.curve || 0)
        gl.uniform2f(uniforms.bend, frame.bend || 0, frame.bendDirection || 0)
        gl.uniform2f(uniforms.push, frame.pushX || 0, frame.pushY || 0)
        gl.uniform1f(uniforms.seed, frame.index * 1.71)
        gl.uniform1f(uniforms.opacity, frame.opacity ?? 1)
        gl.uniform1f(uniforms.chroma, frame.chroma || 0)
        gl.uniform1f(uniforms.blur, frame.blur || 0)
        gl.uniform1f(uniforms.reveal, frame.reveal ?? 1)
        gl.uniform1f(uniforms.birthLight, frame.birthLight || 0)
        gl.uniform1f(uniforms.wrapped, frame.wrapped || 0)
        gl.uniform4f(uniforms.tube, frame.tube?.radius || 0, frame.tube?.minor || 0, frame.tube?.along || 0, frame.tube?.angle || 0)
        gl.drawElements(gl.TRIANGLES, triangles.length, gl.UNSIGNED_SHORT, 0)
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, pixelWidth, pixelHeight)
      gl.disable(gl.BLEND)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.useProgram(postProgram)
      gl.bindBuffer(gl.ARRAY_BUFFER, postVertices)
      gl.enableVertexAttribArray(postAttribute)
      gl.vertexAttribPointer(postAttribute, 2, gl.FLOAT, false, 0, 0)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, sceneTexture)
      gl.uniform1i(postUniforms.scene, 0)
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, field?.texture || sceneTexture)
      gl.uniform1i(postUniforms.wake, 1)
      gl.uniform1f(postUniforms.wakeActive, field ? 1 : 0)
      if (field) {
        gl.uniform2f(postUniforms.wakeStep, 1 / field.width, 1 / field.height)
        gl.uniform2f(postUniforms.pointer, field.x, field.y)
      }
      gl.uniform2f(postUniforms.viewport, width, height)
      const shortSide = Math.min(width, height)
      gl.uniform1f(postUniforms.radius, Math.min(350, Math.max(110, shortSide * .312)))
      gl.uniform1f(postUniforms.aperture, Math.min(125, Math.max(39, shortSide * .11)))
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      gl.activeTexture(gl.TEXTURE0)
    },

    dispose() {
      if (disposed) return
      disposed = true
      canvas.removeEventListener('webglcontextlost', contextLost, false)
      for (const loading of [...pending]) loading.cancel()
      for (const texture of textures) if (texture) gl.deleteTexture(texture)
      wake?.dispose()
      gl.deleteBuffer(vertices)
      gl.deleteBuffer(indices)
      gl.deleteBuffer(postVertices)
      gl.deleteProgram(program)
      gl.deleteProgram(postProgram)
      gl.deleteTexture(sceneTexture)
      gl.deleteFramebuffer(framebuffer)
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.clear(gl.COLOR_BUFFER_BIT)
    },
  }
}
