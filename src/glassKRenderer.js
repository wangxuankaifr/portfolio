// A real extruded solid, ray traced at icon resolution. No external model,
// environment image, rendering library or copied reference-site code is used.
const vertexSource = `
attribute vec2 aPosition;
varying vec2 vUv;
void main(){vUv=aPosition;gl_Position=vec4(aPosition,0.,1.);}
`

const fragmentSource = `
precision highp float;
varying vec2 vUv;
uniform float uAngle;

mat3 rotation(float a){
  float c=cos(a),s=sin(a),b=-.13,cb=cos(b),sb=sin(b);
  return mat3(c,0.,-s, 0.,1.,0., s,0.,c)*mat3(1.,0.,0., 0.,cb,sb, 0.,-sb,cb);
}
vec2 point(int i){
  if(i==0)return vec2(-.61,-.8);
  if(i==1)return vec2(-.61,.8);
  if(i==2)return vec2(-.29,.8);
  if(i==3)return vec2(-.29,.15);
  if(i==4)return vec2(.23,.8);
  if(i==5)return vec2(.65,.8);
  if(i==6)return vec2(.01,.025);
  if(i==7)return vec2(.69,-.8);
  if(i==8)return vec2(.25,-.8);
  if(i==9)return vec2(-.29,-.14);
  return vec2(-.29,-.8);
}
float outline(vec2 p){
  float distance2=100.,signValue=1.;
  vec2 a=point(10);
  for(int i=0;i<11;i++){
    vec2 b=point(i),edge=b-a,relative=p-a;
    vec2 nearest=relative-edge*clamp(dot(relative,edge)/dot(edge,edge),0.,1.);
    distance2=min(distance2,dot(nearest,nearest));
    if((a.y>p.y)!=(b.y>p.y)){
      float crossX=a.x+(p.y-a.y)*(b.x-a.x)/(b.y-a.y);
      if(p.x<crossX)signValue=-signValue;
    }
    a=b;
  }
  return sqrt(distance2)*signValue;
}
float scene(vec3 world){
  vec3 p=rotation(uAngle)*world;
  vec2 q=vec2(outline(p.xy),abs(p.z)-.18);
  return max(max(q.x,q.y),(q.x+q.y+.075)*.707106)-.012;
}
vec3 normalAt(vec3 p){
  vec2 e=vec2(.0015,0.);
  return normalize(vec3(scene(p+e.xyy)-scene(p-e.xyy),scene(p+e.yxy)-scene(p-e.yxy),scene(p+e.yyx)-scene(p-e.yyx)));
}
vec3 spectrum(float t){return .55+.45*cos(6.28318*(vec3(0.,.33,.67)+t));}
vec3 studio(vec3 d){
  d=normalize(d);
  vec3 color=mix(vec3(.006,.015,.035),vec3(.35,.48,.64),smoothstep(-.45,.8,d.y));
  float whitePanel=pow(max(0.,dot(d,normalize(vec3(-1.4,1.8,1.2)))),28.);
  float strip=exp(-pow((d.x+.37)/.045,2.))*smoothstep(-.7,.6,d.y);
  float darkPanel=exp(-pow((d.x-.32)/.26,2.))*exp(-pow((d.y+.1)/.8,2.));
  color=mix(color,vec3(.016,.026,.05),darkPanel*.93);
  color+=vec3(6.,6.2,6.5)*whitePanel+vec3(2.,3.,5.)*strip;
  float prism=exp(-pow((d.x+d.y*.6-.28)/.085,2.));
  color+=spectrum(d.x*.9+d.y*.8)*prism*2.5;
  color+=vec3(.04,.6,2.6)*pow(max(0.,dot(d,normalize(vec3(-.8,-.2,-1.)))),18.);
  float warm=pow(max(0.,dot(d,normalize(vec3(1.,.25,-.8)))),28.);
  color+=vec3(3.8,2.,.2)*warm;
  return color;
}
vec3 transmission(vec3 p,vec3 ray,vec3 normal,float ior){
  vec3 insideRay=refract(ray,normal,1./ior);
  vec3 inner=p+insideRay*.006;
  float path=0.;
  for(int i=0;i<28;i++){
    float d=scene(inner);
    if(d>-.0007&&i>1)break;
    float stepSize=clamp(abs(d)*.8,.002,.1);
    inner+=insideRay*stepSize;
    path+=stepSize;
  }
  vec3 exitNormal=normalAt(inner);
  vec3 exitRay=refract(insideRay,-exitNormal,ior);
  if(dot(exitRay,exitRay)<.01)exitRay=reflect(insideRay,-exitNormal);
  vec3 environment=studio(exitRay);
  // Coloured light cards and dark studio flags are seen through the bevels.
  return mix(vec3(.93,.96,1.),environment,.84)*exp(-path*vec3(.18,.075,.035));
}
void main(){
  vec3 origin=vec3(0.,0.,3.6);
  vec3 ray=normalize(vec3(vUv*1.16,-3.6));
  float travel=0.;
  for(int i=0;i<78;i++){
    float d=scene(origin+ray*travel);
    if(d<.0008||travel>6.)break;
    travel+=d*.85;
  }
  if(travel>6.){gl_FragColor=vec4(0.);return;}
  vec3 p=origin+ray*travel,n=normalAt(p);
  float fresnel=.045+.955*pow(1.-max(0.,dot(-ray,n)),5.);
  vec3 reflected=studio(reflect(ray,n));
  vec3 red=transmission(p,ray,n,1.44);
  vec3 green=transmission(p,ray,n,1.50);
  vec3 blue=transmission(p,ray,n,1.58);
  vec3 color=mix(vec3(red.r,green.g,blue.b),reflected,clamp(fresnel+.13,0.,1.));
  vec3 light=normalize(vec3(-1.,1.5,2.));
  float sparkle=pow(max(0.,dot(reflect(ray,n),light)),150.);
  color+=vec3(3.)*sparkle;
  // Two narrow grazing highlights separate a transparent face from its bevel.
  vec3 local=rotation(uAngle)*p;
  float bevel=1.-smoothstep(.005,.055,abs(outline(local.xy)));
  color+=spectrum(local.y*.65+local.x*.5+uAngle*.1)*bevel*.5;
  color=color/(color+vec3(.7));
  color=pow(color,vec3(.4545));
  // The broad, parallel front/back faces transmit the white sheet. Keep the
  // refracted studio and spectrum visible in the angled cut surfaces.
  vec3 localNormal=rotation(uAngle)*n;
  float clearFace=smoothstep(.94,.995,abs(localNormal.z));
  color=mix(color,vec3(.96,.98,1.),clearFace*.76*(1.-fresnel));
  gl_FragColor=vec4(color,1.);
}
`

export function createGlassKRenderer(canvas) {
  const gl = canvas.getContext('webgl', { alpha:true, antialias:true, premultipliedAlpha:false, powerPreference:'low-power' })
  if (!gl) return null
  const shaders = []
  let program, buffer
  try {
    for (const [type, source] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]]) {
      const shader = gl.createShader(type)
      shaders.push(shader)
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader))
    }
    program = gl.createProgram()
    shaders.forEach(shader => gl.attachShader(program, shader))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program))
    gl.useProgram(program)
    buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'aPosition')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    const angle = gl.getUniformLocation(program, 'uAngle')
    return {
      render(elapsed) {
        const size = Math.min(180, Math.round((canvas.clientWidth || 76) * Math.min(devicePixelRatio || 1, 2)))
        if (canvas.width !== size) { canvas.width = canvas.height = size; gl.viewport(0, 0, size, size) }
        gl.uniform1f(angle, -.38 + elapsed * Math.PI * 2 / 18)
        gl.drawArrays(gl.TRIANGLES, 0, 6)
      },
      dispose() {
        gl.deleteBuffer(buffer)
        gl.deleteProgram(program)
        shaders.forEach(shader => gl.deleteShader(shader))
      },
    }
  } catch (error) {
    if (buffer) gl.deleteBuffer(buffer)
    if (program) gl.deleteProgram(program)
    shaders.forEach(shader => gl.deleteShader(shader))
    console.warn('Glass K uses its static fallback:', error.message)
    return null
  }
}
