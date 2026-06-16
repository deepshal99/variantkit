'use client'
// Interactive wireframe mesh — rotating platonic solids with a mouse-blur. Click anywhere
// (outside UI) to morph to the next shape. Ported from the V3 landing to a Next client component.
import { useEffect, useRef } from 'react'

const frag = `
#ifdef GL_ES
precision highp float;
#endif
uniform vec2 u_mouse; uniform vec2 u_resolution; uniform float u_pixelRatio; uniform float u_time; uniform int u_shape;
#define PI 3.1415926535897932384626433832795
#define TWO_PI 6.2831853071795864769252867665590
mat3 rotateX(float a){float s=sin(a),c=cos(a);return mat3(1.,0.,0., 0.,c,-s, 0.,s,c);}
mat3 rotateY(float a){float s=sin(a),c=cos(a);return mat3(c,0.,s, 0.,1.,0., -s,0.,c);}
mat3 rotateZ(float a){float s=sin(a),c=cos(a);return mat3(c,-s,0., s,c,0., 0.,0.,1.);}
vec2 coord(in vec2 p){p=p/u_resolution.xy; if(u_resolution.x>u_resolution.y){p.x*=u_resolution.x/u_resolution.y;p.x+=(u_resolution.y-u_resolution.x)/u_resolution.y/2.;}else{p.y*=u_resolution.y/u_resolution.x;p.y+=(u_resolution.x-u_resolution.y)/u_resolution.x/2.;} p-=.5;return p;}
vec2 project(vec3 p){float pe=2./(2.-p.z);return p.xy*pe;}
float distToSegment(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h);}
float drawLine(vec2 p,vec2 a,vec2 b,float t,float bl){float d=distToSegment(p,a,b);return smoothstep(t+bl,t-bl,d);}
void getCubeVertices(out vec3 v[8]){float s=0.7;v[0]=vec3(-s,-s,-s);v[1]=vec3(s,-s,-s);v[2]=vec3(s,s,-s);v[3]=vec3(-s,s,-s);v[4]=vec3(-s,-s,s);v[5]=vec3(s,-s,s);v[6]=vec3(s,s,s);v[7]=vec3(-s,s,s);}
void getTetrahedronVertices(out vec3 v[4]){float a=1./sqrt(3.);v[0]=vec3(a,a,a);v[1]=vec3(a,-a,-a);v[2]=vec3(-a,a,-a);v[3]=vec3(-a,-a,a);}
void getOctahedronVertices(out vec3 v[6]){v[0]=vec3(1.,0.,0.);v[1]=vec3(-1.,0.,0.);v[2]=vec3(0.,1.,0.);v[3]=vec3(0.,-1.,0.);v[4]=vec3(0.,0.,1.);v[5]=vec3(0.,0.,-1.);}
void getIcosahedronVertices(out vec3 v[12]){float t=(1.+sqrt(5.))/2.;float s=1./sqrt(1.+t*t);v[0]=vec3(-s,t*s,0.);v[1]=vec3(s,t*s,0.);v[2]=vec3(-s,-t*s,0.);v[3]=vec3(s,-t*s,0.);v[4]=vec3(0.,-s,t*s);v[5]=vec3(0.,s,t*s);v[6]=vec3(0.,-s,-t*s);v[7]=vec3(0.,s,-t*s);v[8]=vec3(t*s,0.,-s);v[9]=vec3(t*s,0.,s);v[10]=vec3(-t*s,0.,-s);v[11]=vec3(-t*s,0.,s);}
float drawWireframe(vec2 p,int shape,mat3 rot,float scale,float th,float bl){
  float r=0.;
  if(shape==0){vec3 v[8];getCubeVertices(v);for(int i=0;i<8;i++){v[i]=rot*(v[i]*scale);}
    r+=drawLine(p,project(v[0]),project(v[1]),th,bl);r+=drawLine(p,project(v[1]),project(v[2]),th,bl);r+=drawLine(p,project(v[2]),project(v[3]),th,bl);r+=drawLine(p,project(v[3]),project(v[0]),th,bl);
    r+=drawLine(p,project(v[4]),project(v[5]),th,bl);r+=drawLine(p,project(v[5]),project(v[6]),th,bl);r+=drawLine(p,project(v[6]),project(v[7]),th,bl);r+=drawLine(p,project(v[7]),project(v[4]),th,bl);
    r+=drawLine(p,project(v[0]),project(v[4]),th,bl);r+=drawLine(p,project(v[1]),project(v[5]),th,bl);r+=drawLine(p,project(v[2]),project(v[6]),th,bl);r+=drawLine(p,project(v[3]),project(v[7]),th,bl);
  }else if(shape==1){vec3 v[4];getTetrahedronVertices(v);for(int i=0;i<4;i++){v[i]=rot*(v[i]*scale);}
    r+=drawLine(p,project(v[0]),project(v[1]),th,bl);r+=drawLine(p,project(v[0]),project(v[2]),th,bl);r+=drawLine(p,project(v[0]),project(v[3]),th,bl);r+=drawLine(p,project(v[1]),project(v[2]),th,bl);r+=drawLine(p,project(v[1]),project(v[3]),th,bl);r+=drawLine(p,project(v[2]),project(v[3]),th,bl);
  }else if(shape==2){vec3 v[6];getOctahedronVertices(v);for(int i=0;i<6;i++){v[i]=rot*(v[i]*scale);}
    r+=drawLine(p,project(v[2]),project(v[0]),th,bl);r+=drawLine(p,project(v[2]),project(v[1]),th,bl);r+=drawLine(p,project(v[2]),project(v[4]),th,bl);r+=drawLine(p,project(v[2]),project(v[5]),th,bl);
    r+=drawLine(p,project(v[3]),project(v[0]),th,bl);r+=drawLine(p,project(v[3]),project(v[1]),th,bl);r+=drawLine(p,project(v[3]),project(v[4]),th,bl);r+=drawLine(p,project(v[3]),project(v[5]),th,bl);
    r+=drawLine(p,project(v[0]),project(v[4]),th,bl);r+=drawLine(p,project(v[4]),project(v[1]),th,bl);r+=drawLine(p,project(v[1]),project(v[5]),th,bl);r+=drawLine(p,project(v[5]),project(v[0]),th,bl);
  }else if(shape==3){vec3 v[12];getIcosahedronVertices(v);for(int i=0;i<12;i++){v[i]=rot*(v[i]*scale);}
    r+=drawLine(p,project(v[0]),project(v[1]),th,bl);r+=drawLine(p,project(v[0]),project(v[5]),th,bl);r+=drawLine(p,project(v[0]),project(v[7]),th,bl);r+=drawLine(p,project(v[0]),project(v[10]),th,bl);r+=drawLine(p,project(v[0]),project(v[11]),th,bl);
    r+=drawLine(p,project(v[1]),project(v[5]),th,bl);r+=drawLine(p,project(v[1]),project(v[7]),th,bl);r+=drawLine(p,project(v[1]),project(v[8]),th,bl);r+=drawLine(p,project(v[1]),project(v[9]),th,bl);
    r+=drawLine(p,project(v[2]),project(v[3]),th,bl);r+=drawLine(p,project(v[2]),project(v[4]),th,bl);r+=drawLine(p,project(v[2]),project(v[6]),th,bl);r+=drawLine(p,project(v[2]),project(v[10]),th,bl);r+=drawLine(p,project(v[2]),project(v[11]),th,bl);
    r+=drawLine(p,project(v[3]),project(v[4]),th,bl);r+=drawLine(p,project(v[3]),project(v[6]),th,bl);r+=drawLine(p,project(v[3]),project(v[8]),th,bl);r+=drawLine(p,project(v[3]),project(v[9]),th,bl);
    r+=drawLine(p,project(v[4]),project(v[5]),th,bl);r+=drawLine(p,project(v[4]),project(v[11]),th,bl);r+=drawLine(p,project(v[5]),project(v[11]),th,bl);
    r+=drawLine(p,project(v[6]),project(v[7]),th,bl);r+=drawLine(p,project(v[6]),project(v[8]),th,bl);r+=drawLine(p,project(v[6]),project(v[10]),th,bl);r+=drawLine(p,project(v[7]),project(v[10]),th,bl);
    r+=drawLine(p,project(v[8]),project(v[9]),th,bl);r+=drawLine(p,project(v[9]),project(v[11]),th,bl);r+=drawLine(p,project(v[10]),project(v[11]),th,bl);
  }else if(shape==4){vec3 v[5];float s=0.7;v[0]=vec3(-s,0.,-s);v[1]=vec3(s,0.,-s);v[2]=vec3(s,0.,s);v[3]=vec3(-s,0.,s);v[4]=vec3(0.,1.,0.);for(int i=0;i<5;i++){v[i]=rot*(v[i]*scale);}
    r+=drawLine(p,project(v[0]),project(v[1]),th,bl);r+=drawLine(p,project(v[1]),project(v[2]),th,bl);r+=drawLine(p,project(v[2]),project(v[3]),th,bl);r+=drawLine(p,project(v[3]),project(v[0]),th,bl);
    r+=drawLine(p,project(v[0]),project(v[4]),th,bl);r+=drawLine(p,project(v[1]),project(v[4]),th,bl);r+=drawLine(p,project(v[2]),project(v[4]),th,bl);r+=drawLine(p,project(v[3]),project(v[4]),th,bl);
  }else if(shape==5){vec3 v[6];float s=0.6;v[0]=vec3(-s,0.,-s);v[1]=vec3(s,0.,-s);v[2]=vec3(s,0.,s);v[3]=vec3(-s,0.,s);v[4]=vec3(0.,1.,0.);v[5]=vec3(0.,-1.,0.);for(int i=0;i<6;i++){v[i]=rot*(v[i]*scale);}
    r+=drawLine(p,project(v[0]),project(v[1]),th,bl);r+=drawLine(p,project(v[1]),project(v[2]),th,bl);r+=drawLine(p,project(v[2]),project(v[3]),th,bl);r+=drawLine(p,project(v[3]),project(v[0]),th,bl);
    r+=drawLine(p,project(v[0]),project(v[4]),th,bl);r+=drawLine(p,project(v[1]),project(v[4]),th,bl);r+=drawLine(p,project(v[2]),project(v[4]),th,bl);r+=drawLine(p,project(v[3]),project(v[4]),th,bl);
    r+=drawLine(p,project(v[0]),project(v[5]),th,bl);r+=drawLine(p,project(v[1]),project(v[5]),th,bl);r+=drawLine(p,project(v[2]),project(v[5]),th,bl);r+=drawLine(p,project(v[3]),project(v[5]),th,bl);
  }else if(shape==6){vec3 v[12];float a=TWO_PI/6.;
    v[0]=vec3(cos(0.*a),-1.,sin(0.*a));v[1]=vec3(cos(1.*a),-1.,sin(1.*a));v[2]=vec3(cos(2.*a),-1.,sin(2.*a));v[3]=vec3(cos(3.*a),-1.,sin(3.*a));v[4]=vec3(cos(4.*a),-1.,sin(4.*a));v[5]=vec3(cos(5.*a),-1.,sin(5.*a));
    v[6]=vec3(cos(0.*a),1.,sin(0.*a));v[7]=vec3(cos(1.*a),1.,sin(1.*a));v[8]=vec3(cos(2.*a),1.,sin(2.*a));v[9]=vec3(cos(3.*a),1.,sin(3.*a));v[10]=vec3(cos(4.*a),1.,sin(4.*a));v[11]=vec3(cos(5.*a),1.,sin(5.*a));
    for(int i=0;i<12;i++){v[i]=rot*(v[i]*scale);}
    r+=drawLine(p,project(v[0]),project(v[1]),th,bl);r+=drawLine(p,project(v[1]),project(v[2]),th,bl);r+=drawLine(p,project(v[2]),project(v[3]),th,bl);r+=drawLine(p,project(v[3]),project(v[4]),th,bl);r+=drawLine(p,project(v[4]),project(v[5]),th,bl);r+=drawLine(p,project(v[5]),project(v[0]),th,bl);
    r+=drawLine(p,project(v[6]),project(v[7]),th,bl);r+=drawLine(p,project(v[7]),project(v[8]),th,bl);r+=drawLine(p,project(v[8]),project(v[9]),th,bl);r+=drawLine(p,project(v[9]),project(v[10]),th,bl);r+=drawLine(p,project(v[10]),project(v[11]),th,bl);r+=drawLine(p,project(v[11]),project(v[6]),th,bl);
    r+=drawLine(p,project(v[0]),project(v[6]),th,bl);r+=drawLine(p,project(v[1]),project(v[7]),th,bl);r+=drawLine(p,project(v[2]),project(v[8]),th,bl);r+=drawLine(p,project(v[3]),project(v[9]),th,bl);r+=drawLine(p,project(v[4]),project(v[10]),th,bl);r+=drawLine(p,project(v[5]),project(v[11]),th,bl);
  }else{
    float t=u_time*0.5;float morph=sin(t)*0.5+0.5;
    vec3 cube[8];getCubeVertices(cube);vec3 octa[6];getOctahedronVertices(octa);
    vec3 v[8];for(int i=0;i<8;i++){if(i<6){v[i]=mix(cube[i],octa[i]*1.5,morph);}else{v[i]=cube[i]*(1.0-morph*0.3);}v[i]=rot*(v[i]*scale);}
    float al=1.0-morph*0.5;
    r+=drawLine(p,project(v[0]),project(v[1]),th,bl)*al;r+=drawLine(p,project(v[1]),project(v[2]),th,bl)*al;r+=drawLine(p,project(v[2]),project(v[3]),th,bl)*al;r+=drawLine(p,project(v[3]),project(v[0]),th,bl)*al;
    r+=drawLine(p,project(v[4]),project(v[5]),th,bl)*al;r+=drawLine(p,project(v[5]),project(v[6]),th,bl)*al;r+=drawLine(p,project(v[6]),project(v[7]),th,bl)*al;r+=drawLine(p,project(v[7]),project(v[4]),th,bl)*al;
    r+=drawLine(p,project(v[0]),project(v[6]),th,bl)*morph;r+=drawLine(p,project(v[1]),project(v[7]),th,bl)*morph;r+=drawLine(p,project(v[2]),project(v[4]),th,bl)*morph;r+=drawLine(p,project(v[3]),project(v[5]),th,bl)*morph;
  }
  return clamp(r,0.0,1.0);
}
vec3 render(vec2 st,vec2 mouse){
  float md=length(st-mouse);float mi=1.0-smoothstep(0.0,0.5,md);
  float time=u_time*0.2;
  mat3 rot=rotateY(time+(mouse.x-0.5)*mi*1.0)*rotateX(time*0.7+(mouse.y-0.5)*mi*1.0)*rotateZ(time*0.1);
  float scale=0.32;
  float blur=mix(0.0001,0.05,mi);
  float th=mix(0.0018,0.0028,mi);
  float shape=drawWireframe(st-vec2(0.22,0.0),u_shape,rot,scale,th,blur);
  vec3 color=vec3(0.95,0.96,0.99);
  float dimming=1.0-mi*0.3;
  color*=shape*dimming;
  float vig=1.0-length(st)*0.2;color*=vig;
  color=pow(color,vec3(0.9));
  return color;
}
void main(){vec2 st=coord(gl_FragCoord.xy);vec2 mouse=coord(u_mouse*u_pixelRatio)*vec2(1.,-1.);vec3 color=render(st,mouse);gl_FragColor=vec4(color,1.0);}
`
const vert = `attribute vec3 a_position;attribute vec2 a_uv;varying vec2 v;void main(){gl_Position=vec4(a_position,1.0);v=a_uv;}`
const N = 8

export default function WireframeMesh() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current!
    const gl = canvas.getContext('webgl', { antialias: true, alpha: false })
    if (!gl) return
    const mouse = { x: 0, y: 0 }, damp = { x: 0, y: 0 }
    let shape = 0, raf = 0
    const start = Date.now()
    const compile = (t: number, s: string) => { const sh = gl.createShader(t)!; gl.shaderSource(sh, s); gl.compileShader(sh); return sh }
    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert)); gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag))
    gl.linkProgram(prog); gl.useProgram(prog)
    const U = {
      m: gl.getUniformLocation(prog, 'u_mouse'), r: gl.getUniformLocation(prog, 'u_resolution'),
      p: gl.getUniformLocation(prog, 'u_pixelRatio'), t: gl.getUniformLocation(prog, 'u_time'), s: gl.getUniformLocation(prog, 'u_shape'),
    }
    const buf = (data: Float32Array, attr: string, size: number) => {
      const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
      const l = gl.getAttribLocation(prog, attr); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, size, gl.FLOAT, false, 0, 0)
    }
    buf(new Float32Array([-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0]), 'a_position', 3)
    buf(new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), 'a_uv', 2)
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr
      canvas.style.width = innerWidth + 'px'; canvas.style.height = innerHeight + 'px'
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    let last = performance.now()
    const loop = (now: number) => {
      const dt = (now - last) / 1000; last = now
      damp.x += (mouse.x - damp.x) * 8 * dt; damp.y += (mouse.y - damp.y) * 8 * dt
      gl.clear(gl.COLOR_BUFFER_BIT)
      const dpr = Math.min(window.devicePixelRatio, 2)
      gl.uniform2f(U.m, damp.x, damp.y); gl.uniform2f(U.r, canvas.width, canvas.height)
      gl.uniform1f(U.p, dpr); gl.uniform1f(U.t, (Date.now() - start) / 1000); gl.uniform1i(U.s, shape)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      raf = requestAnimationFrame(loop)
    }
    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY }
    const onClick = (e: MouseEvent) => { if (document.querySelector('.ov') || (e.target as HTMLElement).closest('a,button,input,.dialkit-root')) return; shape = (shape + 1) % N }
    window.addEventListener('mousemove', onMove); window.addEventListener('resize', resize); window.addEventListener('click', onClick)
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMove); window.removeEventListener('resize', resize); window.removeEventListener('click', onClick) }
  }, [])
  return <canvas ref={ref} aria-hidden style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, display: 'block' }} />
}
