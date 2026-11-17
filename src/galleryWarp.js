import { scrollCurve } from './galleryMotion.js'

const vertexSource=`
attribute vec2 a_uv;
uniform vec4 u_rect;
uniform vec2 u_size;
uniform vec2 u_center;
uniform float u_halfHeight;
uniform float u_distance;
uniform float u_curve;
varying vec2 v_uv;
void main(){
  vec2 point=u_rect.xy+a_uv*u_rect.zw;
  float y=clamp((u_center.y-point.y)/u_halfHeight,-1.0,1.0);
  float depth=u_curve*u_halfHeight*(1.0-y*y);
  float perspective=1.0-depth/u_distance;
  vec2 projected=u_center+(point-u_center)/perspective;
  vec2 clip=(projected/u_size*2.0-1.0)*vec2(1.0,-1.0);
  gl_Position=vec4(clip*perspective,0.0,perspective);
  v_uv=a_uv;
}`
const fragmentSource=`
precision mediump float;
uniform sampler2D u_image;
varying vec2 v_uv;
void main(){gl_FragColor=texture2D(u_image,v_uv);}
`

export function createGalleryWarp(canvas,scroller) {
  let gl
  try{gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:true,powerPreference:'low-power'})}
  catch{return null}
  if(!gl)return null
  const doc=scroller.ownerDocument,win=doc.defaultView
  const resources={shaders:[],buffers:[],textures:new Map(),program:null}
  const hidden=new Map(),moved=new Map()
  let entries=[],labels=[],layout=null,clock=0,failed=false,disposed=false
  const restore=()=>{
    for(const [image,opacity] of hidden)image.style.opacity=opacity
    hidden.clear()
    for(const [label,transform] of moved)label.style.transform=transform
    moved.clear();canvas.style.visibility='hidden'
  }
  const clear=()=>{
    restore()
    if(!gl.isContextLost()){gl.disable(gl.SCISSOR_TEST);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT)}
  }
  const dispose=()=>{
    if(disposed)return
    clear();disposed=true
    for(const {texture} of resources.textures.values())gl.deleteTexture(texture)
    for(const buffer of resources.buffers)gl.deleteBuffer(buffer)
    for(const shader of resources.shaders)gl.deleteShader(shader)
    if(resources.program)gl.deleteProgram(resources.program)
    resources.textures.clear()
  }
  try {
    const compile=(type,source)=>{
      const shader=gl.createShader(type)
      if(!shader)throw new Error('Shader unavailable')
      resources.shaders.push(shader);gl.shaderSource(shader,source);gl.compileShader(shader)
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader))
      return shader
    }
    const program=gl.createProgram()
    if(!program)throw new Error('Program unavailable')
    resources.program=program
    gl.attachShader(program,compile(gl.VERTEX_SHADER,vertexSource))
    gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragmentSource));gl.linkProgram(program)
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program))
    const columns=8,rows=64,vertices=[],indices=[]
    for(let y=0;y<=rows;y++)for(let x=0;x<=columns;x++)vertices.push(x/columns,y/rows)
    for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
      const a=y*(columns+1)+x,b=a+columns+1
      indices.push(a,b,a+1,a+1,b,b+1)
    }
    const positions=gl.createBuffer(),triangles=gl.createBuffer()
    if(!positions||!triangles)throw new Error('Buffer unavailable')
    resources.buffers.push(positions,triangles)
    gl.bindBuffer(gl.ARRAY_BUFFER,positions);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangles);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW)
    const attribute=gl.getAttribLocation(program,'a_uv')
    const uniform=Object.fromEntries(['rect','size','center','halfHeight','distance','curve','image'].map(name=>[name,gl.getUniformLocation(program,`u_${name}`)]))

    const refresh=()=>{
      if(disposed)return
      restore()
      const base=canvas.parentElement,rect=base.getBoundingClientRect(),view=scroller.getBoundingClientRect()
      const width=base.clientWidth,height=base.clientHeight
      if(!width||!height||!rect.width||!rect.height){layout=null;return}
      const sx=width/rect.width,sy=height/rect.height
      const relative=node=>{
        const box=node.getBoundingClientRect()
        return {node,x:(box.left-rect.left)*sx,top:(box.top-view.top)*sy+scroller.scrollTop,width:box.width*sx,height:box.height*sy}
      }
      const dpr=Math.min(2,win.devicePixelRatio||1)
      canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr)
      layout={width,height,dpr,top:(view.top-rect.top)*sy,bottom:(view.bottom-rect.top)*sy,
        centerX:(win.innerWidth/2-rect.left)*sx,centerY:(win.innerHeight/2-rect.top)*sy,
        halfHeight:win.innerHeight*sy/2,small:win.innerWidth<=760}
      entries=[...scroller.querySelectorAll('[data-image] img')].map(relative)
      labels=[...scroller.querySelectorAll('.project-gallery-group-title')].map(relative)
    }
    const textureFor=image=>{
      const key=image.currentSrc||image.src
      const cached=resources.textures.get(key)
      if(cached){cached.used=clock;return cached.texture}
      if(!image.complete||!image.naturalWidth)return null
      const texture=gl.createTexture()
      if(!texture)return null
      gl.bindTexture(gl.TEXTURE_2D,texture)
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false)
      try{gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image)}
      catch{gl.deleteTexture(texture);return null}
      resources.textures.set(key,{texture,used:clock})
      if(resources.textures.size>12){
        const [oldKey,old]=[...resources.textures].sort((a,b)=>a[1].used-b[1].used)[0]
        gl.deleteTexture(old.texture);resources.textures.delete(oldKey)
      }
      return texture
    }
    const render=lag=>{
      if(disposed||failed)return
      if(!layout||Math.abs(lag)<.1||gl.isContextLost()){clear();return}
      const {width,height,dpr,top,bottom,centerX,centerY,halfHeight,small}=layout
      const curve=scrollCurve(lag,small),distance=halfHeight/Math.tan(53.4*Math.PI/360)
      const scroll=scroller.scrollTop,shown=new Set(),shifted=new Set()
      clock++
      try{
        gl.viewport(0,0,canvas.width,canvas.height)
        gl.disable(gl.SCISSOR_TEST);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT)
        gl.enable(gl.SCISSOR_TEST)
        gl.scissor(0,Math.max(0,Math.floor((height-bottom)*dpr)),canvas.width,Math.ceil((bottom-top)*dpr))
        gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA)
        gl.useProgram(program)
        gl.bindBuffer(gl.ARRAY_BUFFER,positions);gl.enableVertexAttribArray(attribute)
        gl.vertexAttribPointer(attribute,2,gl.FLOAT,false,0,0)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangles)
        gl.uniform2f(uniform.size,width,height);gl.uniform2f(uniform.center,centerX,centerY)
        gl.uniform1f(uniform.halfHeight,halfHeight);gl.uniform1f(uniform.distance,distance);gl.uniform1f(uniform.curve,curve)
        gl.activeTexture(gl.TEXTURE0);gl.uniform1i(uniform.image,0)
        const overscan=(bottom-top)*.3
        for(const entry of entries){
          const y=top+entry.top-scroll
          if(y+entry.height<top-overscan||y>bottom+overscan)continue
          const texture=textureFor(entry.node)
          if(!texture)continue
          gl.bindTexture(gl.TEXTURE_2D,texture)
          gl.uniform4f(uniform.rect,entry.x,y,entry.width,entry.height)
          gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0)
          shown.add(entry.node)
        }
        if(gl.getError()!==gl.NO_ERROR)throw new Error('Image drawing unavailable')
        for(const image of shown){
          if(!hidden.has(image))hidden.set(image,image.style.opacity)
          image.style.opacity='0'
        }
        for(const [image,opacity] of hidden)if(!shown.has(image)){image.style.opacity=opacity;hidden.delete(image)}
        for(const entry of labels){
          const y=top+entry.top-scroll+entry.height/2,x=entry.x+entry.width/2
          if(y<top-overscan||y>bottom+overscan)continue
          const normalized=Math.max(-1,Math.min(1,(centerY-y)/halfHeight))
          const scale=distance/(distance-curve*halfHeight*(1-normalized*normalized))
          if(!moved.has(entry.node))moved.set(entry.node,entry.node.style.transform)
          entry.node.style.transform=`translate3d(${(x-centerX)*(scale-1)}px,${(y-centerY)*(scale-1)}px,0) scale(${scale})`
          shifted.add(entry.node)
        }
        for(const [label,transform] of moved)if(!shifted.has(label)){label.style.transform=transform;moved.delete(label)}
        canvas.style.visibility=shown.size?'visible':'hidden'
      }catch{failed=true;clear()}
    }
    refresh()
    return {render,refresh,dispose}
  }catch{dispose();return null}
}
