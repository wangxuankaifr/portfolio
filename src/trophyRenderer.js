// Volumetric hand/trophy built from implicit 3D surfaces. Camera rays intersect
// the hollow bowl, handle tubes, fingers and cuff; no image plane is rotated.
const vertexSource = `
attribute vec2 aPosition;
varying vec2 vUv;
void main(){vUv=aPosition;gl_Position=vec4(aPosition,0.,1.);}
`
const fragmentSource = `
precision highp float;
varying vec2 vUv;
uniform float uAngle;
const float PI=3.14159265359;
mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
mat3 rz(float a){float c=cos(a),s=sin(a);return mat3(c,s,0.,-s,c,0.,0.,0.,1.);}
float ellipsoid(vec3 p,vec3 r){float a=length(p/r),b=length(p/(r*r));return a*(a-1.)/max(b,.0001);}
float capsule(vec3 p,vec3 a,vec3 b,float r){vec3 q=p-a,e=b-a;return length(q-e*clamp(dot(q,e)/dot(e,e),0.,1.))-r;}
float cylinder(vec3 p,float r,float h){vec2 d=abs(vec2(length(p.xz),p.y))-vec2(r,h);return min(max(d.x,d.y),0.)+length(max(d,0.));}
float torus(vec3 p,float r,float tube){return length(vec2(length(p.xz)-r,p.y))-tube;}
float softUnion(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
vec2 nearest(vec2 a,vec2 b){return a.x<b.x?a:b;}
vec3 localPoint(vec3 p){p=rz(PI*.25)*ry(-uAngle)*p;p.y+=.15;return p;}
vec2 model(vec3 p){
  // Cup walls are hollow, including the concave underside of the rolled lip.
  float outer=ellipsoid(p-vec3(0.,1.55,0.),vec3(.68,1.35,.68));
  float inner=ellipsoid(p-vec3(0.,1.61,0.),vec3(.622,1.30,.622));
  float bowl=max(max(outer,-inner),p.y-1.51);
  bowl=min(bowl,torus(p-vec3(0.,1.50,0.),.68,.035));
  float stem=capsule(p,vec3(0.,-.88,0.),vec3(0.,.21,0.),.09);
  stem=softUnion(stem,ellipsoid(p-vec3(0.,.14,0.),vec3(.23,.13,.23)),.05);
  stem=min(stem,torus(p-vec3(0.,.16,0.),.13,.035));
  stem=min(stem,cylinder(p-vec3(0.,-.86,0.),.32,.055)-.025);
  stem=min(stem,torus(p-vec3(0.,-.80,0.),.24,.045));
  // Elliptical tubular handles have real back surfaces and an open centre.
  vec3 hp=vec3(abs(p.x)-.66,p.y-.95,p.z);
  float handle=(length(hp.xy/vec2(.40,.53))-1.)*.40;
  handle=length(vec2(handle,hp.z))-.066;
  float gold=min(min(bowl,stem),handle);
  vec2 result=vec2(gold,1.);
  float base=cylinder(p-vec3(0.,-1.07,0.),.40,.16)-.025;
  base=min(base,cylinder(p-vec3(0.,-1.25,0.),.48,.045)-.024);
  base=min(base,torus(p-vec3(0.,-.94,0.),.40,.035));
  result=nearest(result,vec2(base,5.));
  // Palm and wrist are rounded masses; curled fingers wrap around the stem.
  float hand=ellipsoid(p-vec3(-.285,-.31,-.015),vec3(.31,.35,.235));
  hand=softUnion(hand,capsule(p,vec3(-.88,-.69,-.015),vec3(-.33,-.36,-.015),.19),.12);
  for(int i=0;i<4;i++){
    float y=.005-float(i)*.181;
    float radius=.101-float(i)*.005;
    float finger=capsule(p,vec3(-.26,y,.15),vec3(.105,y-.012,.225),radius);
    finger=softUnion(finger,capsule(p,vec3(.105,y-.012,.225),vec3(.19,y-.025,.03),radius*.94),.055);
    finger=softUnion(finger,capsule(p,vec3(.19,y-.025,.03),vec3(.07,y-.02,-.135),radius*.86),.04);
    hand=softUnion(hand,finger,.035);
  }
  // Opposing thumb crosses the upper fingers rather than becoming a fifth row.
  float thumb=capsule(p,vec3(-.44,-.16,.17),vec3(-.11,.12,.255),.125);
  thumb=softUnion(thumb,ellipsoid(p-vec3(-.07,.13,.26),vec3(.145,.108,.11)),.05);
  hand=softUnion(hand,thumb,.065);
  result=nearest(result,vec2(hand,2.));
  // Cuff and sleeve have volume from every viewing angle.
  vec3 wrist=p-vec3(-.68,-.57,-.015);
  wrist=rz(-.54)*wrist;
  float cuff=cylinder(wrist.yxz,.235,.065)-.025;
  result=nearest(result,vec2(cuff,4.));
  vec3 sleeve=p-vec3(-.91,-.705,-.015);
  sleeve=rz(-.54)*sleeve;
  float suit=cylinder(sleeve.yxz,.26,.22)-.045;
  result=nearest(result,vec2(suit,3.));
  // Small curved nail on the thumb catches a soft, separate highlight.
  float nail=ellipsoid(p-vec3(-.065,.145,.352),vec3(.085,.066,.016));
  result=nearest(result,vec2(nail,6.));
  return result;
}
vec2 scene(vec3 p){return model(localPoint(p));}
vec3 normalAt(vec3 p){vec2 e=vec2(.002,0.);return normalize(vec3(scene(p+e.xyy).x-scene(p-e.xyy).x,scene(p+e.yxy).x-scene(p-e.yxy).x,scene(p+e.yyx).x-scene(p-e.yyx).x));}
vec3 studio(vec3 d){
  vec3 c=vec3(.40,.43,.49)+vec3(.28)*smoothstep(-.8,.8,d.y);
  float key=exp(-pow((d.x+.48)/.25,2.))*smoothstep(-.6,.4,d.y);
  float strip=exp(-pow((d.x-.55)/.07,2.));
  float dark=exp(-pow((d.x-.05)/.19,2.))*(1.-smoothstep(.2,.9,d.y));
  c=mix(c,vec3(.025,.018,.012),dark*.91);
  c+=vec3(2.9,2.6,2.1)*key+vec3(1.5,1.9,2.6)*strip;
  c+=vec3(1.2,.6,.16)*pow(max(0.,dot(d,normalize(vec3(-.5,-.1,-1.)))),8.);
  return c;
}
float occlusion(vec3 p,vec3 n){float ao=0.,weight=1.;for(int i=1;i<=4;i++){float h=.045*float(i);ao+=(h-scene(p+n*h).x)*weight;weight*=.55;}return clamp(1.-ao*2.0,.38,1.);}
void main(){
  vec3 origin=vec3(0.,1.05,6.);
  vec3 forward=normalize(-origin),up=normalize(vec3(0.,6.,-1.05));
  vec3 ray=normalize(forward*6.+vec3(1.,0.,0.)*vUv.x*2.03+up*vUv.y*2.03);
  float t=3.9;vec2 hit=vec2(1.,0.);bool found=false;
  for(int i=0;i<116;i++){
    hit=scene(origin+ray*t);
    if(hit.x<.0015){found=true;break;}
    t+=max(hit.x*.68,.0007);
    if(t>8.2)break;
  }
  if(!found){gl_FragColor=vec4(0.);return;}
  vec3 p=origin+ray*t,n=normalAt(p),view=-ray;
  vec3 light=normalize(vec3(-.8,1.5,2.)),halfway=normalize(light+view);
  float diffuse=max(dot(n,light),0.);
  float ao=occlusion(p,n);
  vec3 color;
  if(hit.y<1.5){
    vec3 gold=vec3(1.,.45,.065);
    color=studio(reflect(ray,n))*gold;
    color+=vec3(1.,.75,.26)*pow(max(dot(n,halfway),0.),80.)*1.6;
    color+=gold*.13*(.4+diffuse);
    color*=mix(.64,1.,ao);
  }else{
    vec3 base=vec3(1.,.43,.23);float specular=.22,shine=38.;
    if(hit.y>2.5&&hit.y<3.5){base=vec3(.018,.08,.54);specular=.18;shine=48.;}
    if(hit.y>3.5&&hit.y<4.5){base=vec3(.92,.93,.96);specular=.10;}
    if(hit.y>4.5&&hit.y<5.5){
      vec3 q=localPoint(p);float grain=sin(atan(q.z,q.x)*36.+q.y*90.+sin(q.y*45.)*.5);
      base=vec3(.15,.043,.016)*(.85+grain*.13);specular=.35;shine=64.;
    }
    if(hit.y>5.5){base=vec3(1.,.67,.48);specular=.5;shine=90.;}
    float fill=max(dot(n,normalize(vec3(1.,.2,-1.))),0.);
    color=base*(.38+.68*diffuse+.13*fill)*ao;
    color+=vec3(1.,.91,.81)*pow(max(dot(n,halfway),0.),shine)*specular;
    color+=vec3(.20,.31,.52)*pow(1.-max(dot(n,view),0.),3.)*.13;
  }
  // Filmic shoulder keeps the white softbox visible without clipping gold.
  color=(color*(2.51*color+.03))/(color*(2.43*color+.59)+.14);
  color=pow(clamp(color,0.,1.),vec3(.4545));
  gl_FragColor=vec4(color,1.);
}
`

export function createTrophyRenderer(canvas, { resolutionLimit = 160 } = {}) {
  const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,powerPreference:'low-power'})
  if(!gl) return null
  const shaders=[]
  let program,buffer
  try {
    for(const [type,source] of [[gl.VERTEX_SHADER,vertexSource],[gl.FRAGMENT_SHADER,fragmentSource]]){
      const shader=gl.createShader(type);shaders.push(shader);gl.shaderSource(shader,source);gl.compileShader(shader)
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader))
    }
    program=gl.createProgram();shaders.forEach(shader=>gl.attachShader(program,shader));gl.linkProgram(program)
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program))
    gl.useProgram(program);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer)
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW)
    const position=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0)
    const angle=gl.getUniformLocation(program,'uAngle')
    return {
      render(elapsed){
        const size=Math.min(resolutionLimit,Math.max(84,Math.round((canvas.clientWidth||28)*Math.min(devicePixelRatio||1,2)*1.5)))
        if(canvas.width!==size){canvas.width=canvas.height=size;gl.viewport(0,0,size,size)}
        const rotation=-.3+elapsed*Math.PI*2/18
        gl.uniform1f(angle,rotation);gl.drawArrays(gl.TRIANGLES,0,6)
        canvas.dataset.angle=rotation.toFixed(3)
      },
      dispose(){gl.deleteBuffer(buffer);gl.deleteProgram(program);shaders.forEach(shader=>gl.deleteShader(shader))},
    }
  }catch(error){
    if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);shaders.forEach(shader=>gl.deleteShader(shader))
    console.warn('Trophy uses its static fallback:',error.message)
    return null
  }
}
