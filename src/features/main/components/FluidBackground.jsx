import { useEffect, useRef } from 'react';

/* ───────────────────────────────────────────────────
   WebGL Fluid Simulation – black bg + green fluid
   ─────────────────────────────────────────────────── */

const CFG = {
  SIM_RES: 128,
  DYE_RES: 1024,
  DENSITY_DISSIPATION: 1.5,
  VELOCITY_DISSIPATION: 0.4,
  PRESSURE: 0.8,
  PRESSURE_ITERS: 20,
  CURL: 20,
  SPLAT_RADIUS: 0.35,
  SPLAT_FORCE: 3000,
  COLOR_INTENSITY: 0.08,
  AUTO_INTERVAL: 2.5,
};

const GREENS = [
  [0.78, 0.90, 0.00],
  [0.20, 0.55, 0.10],
  [0.40, 0.72, 0.00],
  [0.10, 0.35, 0.08],
  [0.55, 0.80, 0.05],
  [0.05, 0.25, 0.05],
  [0.30, 0.65, 0.00],
  [0.62, 0.85, 0.00],
];

function randGreen() {
  const b = GREENS[Math.floor(Math.random() * GREENS.length)];
  return {
    r: Math.max(0, Math.min(1, b[0] + (Math.random() - 0.5) * 0.1)),
    g: Math.max(0, Math.min(1, b[1] + (Math.random() - 0.5) * 0.1)),
    b: Math.max(0, Math.min(1, b[2] + (Math.random() - 0.5) * 0.05)),
  };
}

// ── shaders ─────────────────────────────────────────

const VS = `
precision highp float;
attribute vec2 aPosition;
varying vec2 vUv, vL, vR, vT, vB;
uniform vec2 texelSize;
void main(){
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FS_COPY = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
uniform sampler2D uTexture;
void main(){ gl_FragColor = texture2D(uTexture, vUv); }`;

const FS_CLEAR = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
uniform sampler2D uTexture;
uniform float value;
void main(){ gl_FragColor = value * texture2D(uTexture, vUv); }`;

const FS_SPLAT = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
void main(){
  vec2 p = vUv - point.xy;
  p.x *= aspectRatio;
  vec3 splat = exp(-dot(p,p) / radius) * color;
  vec3 base = texture2D(uTarget, vUv).xyz;
  gl_FragColor = vec4(base + splat, 1.0);
}`;

const FS_ADVECTION = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uVelocity, uSource;
uniform vec2 texelSize, dyeTexelSize;
uniform float dt, dissipation;
vec4 bilerp(sampler2D sam, vec2 uv, vec2 ts){
  vec2 st = uv / ts - 0.5;
  vec2 i = floor(st), f = fract(st);
  vec4 a = texture2D(sam, (i+vec2(0.5,0.5))*ts);
  vec4 b = texture2D(sam, (i+vec2(1.5,0.5))*ts);
  vec4 c = texture2D(sam, (i+vec2(0.5,1.5))*ts);
  vec4 d = texture2D(sam, (i+vec2(1.5,1.5))*ts);
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
}
void main(){
#ifdef MANUAL_FILTERING
  vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
  vec4 result = bilerp(uSource, coord, dyeTexelSize);
#else
  vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
  vec4 result = texture2D(uSource, coord);
#endif
  float decay = 1.0 + dissipation * dt;
  gl_FragColor = result / decay;
}`;

const FS_DIVERGENCE = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv, vL, vR, vT, vB;
uniform sampler2D uVelocity;
void main(){
  float L = texture2D(uVelocity, vL).x;
  float R = texture2D(uVelocity, vR).x;
  float T = texture2D(uVelocity, vT).y;
  float B = texture2D(uVelocity, vB).y;
  vec2 C = texture2D(uVelocity, vUv).xy;
  if(vL.x < 0.0) L = -C.x;
  if(vR.x > 1.0) R = -C.x;
  if(vT.y > 1.0) T = -C.y;
  if(vB.y < 0.0) B = -C.y;
  gl_FragColor = vec4(0.5*(R-L+T-B), 0.0, 0.0, 1.0);
}`;

const FS_CURL = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv, vL, vR, vT, vB;
uniform sampler2D uVelocity;
void main(){
  float L = texture2D(uVelocity, vL).y;
  float R = texture2D(uVelocity, vR).y;
  float T = texture2D(uVelocity, vT).x;
  float B = texture2D(uVelocity, vB).x;
  gl_FragColor = vec4(0.5*(R-L-T+B), 0.0, 0.0, 1.0);
}`;

const FS_VORTICITY = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv, vL, vR, vT, vB;
uniform sampler2D uVelocity, uCurl;
uniform float curl, dt;
void main(){
  float L = texture2D(uCurl, vL).x;
  float R = texture2D(uCurl, vR).x;
  float T = texture2D(uCurl, vT).x;
  float B = texture2D(uCurl, vB).x;
  float C = texture2D(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T)-abs(B), abs(R)-abs(L));
  force /= length(force)+0.0001;
  force *= curl * C;
  force.y *= -1.0;
  vec2 vel = texture2D(uVelocity, vUv).xy;
  vel += force * dt;
  vel = clamp(vel, -1000.0, 1000.0);
  gl_FragColor = vec4(vel, 0.0, 1.0);
}`;

const FS_PRESSURE = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv, vL, vR, vT, vB;
uniform sampler2D uPressure, uDivergence;
void main(){
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  float d = texture2D(uDivergence, vUv).x;
  gl_FragColor = vec4((L+R+B+T-d)*0.25, 0.0, 0.0, 1.0);
}`;

const FS_GRAD_SUB = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv, vL, vR, vT, vB;
uniform sampler2D uPressure, uVelocity;
void main(){
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  vec2 vel = texture2D(uVelocity, vUv).xy;
  vel -= vec2(R-L, T-B);
  gl_FragColor = vec4(vel, 0.0, 1.0);
}`;

// Display: renders dye on solid black background (alpha=1)
const FS_DISPLAY = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uTexture;
void main(){
  vec3 c = texture2D(uTexture, vUv).rgb;
  gl_FragColor = vec4(c, 1.0);
}`;

// ── GL helpers ──────────────────────────────────────

function compile(gl, type, src, defs) {
  const pre = defs ? defs.map(d => '#define ' + d + '\n').join('') : '';
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, pre + src);
  gl.compileShader(s);
  return s;
}

function link(gl, vs, fs, defs) {
  const p = gl.createProgram();
  const vShader = compile(gl, gl.VERTEX_SHADER, vs, defs);
  const fShader = compile(gl, gl.FRAGMENT_SHADER, fs, defs);
  if (!vShader || !fShader) return p;
  gl.attachShader(p, vShader);
  gl.attachShader(p, fShader);
  gl.linkProgram(p);
  return p;
}

class Prog {
  constructor(gl, vs, fs, defs) {
    this.gl = gl;
    this.program = link(gl, vs, fs, defs);
    this.uniforms = {};
    const n = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(this.program, i);
      this.uniforms[info.name] = gl.getUniformLocation(this.program, info.name);
    }
  }
  bind() { this.gl.useProgram(this.program); }
}

// ── simulation ──────────────────────────────────────

function startFluid(canvas) {
  // --- init GL ---
  const params = { alpha: false, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
  let gl = canvas.getContext('webgl2', params);
  const isGL2 = !!gl;
  if (!isGL2) gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);
  if (!gl) return () => {};

  let halfFloat, fmtRGBA, fmtRG, fmtR;

  if (isGL2) {
    gl.getExtension('EXT_color_buffer_float');
    halfFloat = gl.HALF_FLOAT;
    fmtRGBA = { i: gl.RGBA16F, f: gl.RGBA };
    fmtRG  = { i: gl.RG16F,   f: gl.RG };
    fmtR   = { i: gl.R16F,    f: gl.RED };
  } else {
    const ext = gl.getExtension('OES_texture_half_float');
    gl.getExtension('OES_texture_half_float_linear');
    halfFloat = ext ? ext.HALF_FLOAT_OES : gl.UNSIGNED_BYTE;
    fmtRGBA = { i: gl.RGBA, f: gl.RGBA };
    fmtRG  = { i: gl.RGBA, f: gl.RGBA };
    fmtR   = { i: gl.RGBA, f: gl.RGBA };
  }

  // test framebuffer support
  if (isGL2) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, 4, 4, 0, gl.RGBA, gl.HALF_FLOAT, null);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      fmtRGBA = { i: gl.RGBA, f: gl.RGBA };
      fmtRG  = { i: gl.RGBA, f: gl.RGBA };
      fmtR   = { i: gl.RGBA, f: gl.RGBA };
      halfFloat = gl.UNSIGNED_BYTE;
    }
    gl.deleteTexture(tex);
    gl.deleteFramebuffer(fb);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  gl.clearColor(0, 0, 0, 1);

  // full-screen quad
  const quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, -1,1, 1,1, 1,-1]), gl.STATIC_DRAW);
  const idxBuf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2, 0,2,3]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);

  function blit(target) {
    if (target == null) {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    } else {
      gl.viewport(0, 0, target.width, target.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }

  // manual filtering flag
  const defs = [];
  if (!isGL2 && !gl.getExtension('OES_texture_half_float_linear')) defs.push('MANUAL_FILTERING');

  // programs
  const copyProg  = new Prog(gl, VS, FS_COPY);
  const clearProg = new Prog(gl, VS, FS_CLEAR);
  const splatProg = new Prog(gl, VS, FS_SPLAT);
  const advProg   = new Prog(gl, VS, FS_ADVECTION, defs);
  const divProg   = new Prog(gl, VS, FS_DIVERGENCE);
  const curlProg  = new Prog(gl, VS, FS_CURL);
  const vortProg  = new Prog(gl, VS, FS_VORTICITY);
  const presProg  = new Prog(gl, VS, FS_PRESSURE);
  const gradProg  = new Prog(gl, VS, FS_GRAD_SUB);
  const dispProg  = new Prog(gl, VS, FS_DISPLAY);

  const texType = halfFloat;
  const linFilter = halfFloat === gl.UNSIGNED_BYTE ? gl.NEAREST : gl.LINEAR;

  function makeFBO(w, h, iFmt, fmt, type, filter) {
    gl.activeTexture(gl.TEXTURE0);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, iFmt, w, h, 0, fmt, type, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return {
      texture: tex, fbo, width: w, height: h,
      texelSizeX: 1 / w, texelSizeY: 1 / h,
      attach(id) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, tex); return id; },
    };
  }

  function makeDblFBO(w, h, iFmt, fmt, type, filter) {
    let a = makeFBO(w, h, iFmt, fmt, type, filter);
    let b = makeFBO(w, h, iFmt, fmt, type, filter);
    return {
      width: w, height: h, texelSizeX: a.texelSizeX, texelSizeY: a.texelSizeY,
      get read() { return a; }, set read(v) { a = v; },
      get write() { return b; }, set write(v) { b = v; },
      swap() { const t = a; a = b; b = t; },
    };
  }

  function resizeFBO(src, w, h, iFmt, fmt, type, filter) {
    const dst = makeFBO(w, h, iFmt, fmt, type, filter);
    copyProg.bind();
    gl.uniform1i(copyProg.uniforms.uTexture, src.attach(0));
    blit(dst);
    return dst;
  }

  function resizeDblFBO(t, w, h, iFmt, fmt, type, filter) {
    if (t.width === w && t.height === h) return t;
    t.read = resizeFBO(t.read, w, h, iFmt, fmt, type, filter);
    t.write = makeFBO(w, h, iFmt, fmt, type, filter);
    t.width = w; t.height = h;
    t.texelSizeX = 1 / w; t.texelSizeY = 1 / h;
    return t;
  }

  function getRes(res) {
    let ar = gl.drawingBufferWidth / gl.drawingBufferHeight;
    if (ar < 1) ar = 1 / ar;
    const lo = Math.round(res), hi = Math.round(res * ar);
    return gl.drawingBufferWidth > gl.drawingBufferHeight
      ? { width: hi, height: lo }
      : { width: lo, height: hi };
  }

  // init FBOs
  let simSz = getRes(CFG.SIM_RES);
  let dyeSz = getRes(CFG.DYE_RES);

  let dye      = makeDblFBO(dyeSz.width, dyeSz.height, fmtRGBA.i, fmtRGBA.f, texType, linFilter);
  let velocity = makeDblFBO(simSz.width, simSz.height, fmtRG.i, fmtRG.f, texType, linFilter);
  let divergence = makeFBO(simSz.width, simSz.height, fmtR.i, fmtR.f, texType, gl.NEAREST);
  let curl       = makeFBO(simSz.width, simSz.height, fmtR.i, fmtR.f, texType, gl.NEAREST);
  let pressure   = makeDblFBO(simSz.width, simSz.height, fmtR.i, fmtR.f, texType, gl.NEAREST);

  function correctRadius(r) {
    const ar = canvas.width / canvas.height;
    return ar > 1 ? r * ar : r;
  }

  function splat(x, y, dx, dy, color) {
    const k = CFG.COLOR_INTENSITY;
    splatProg.bind();
    gl.uniform1i(splatProg.uniforms.uTarget, velocity.read.attach(0));
    gl.uniform1f(splatProg.uniforms.aspectRatio, canvas.width / canvas.height);
    gl.uniform2f(splatProg.uniforms.point, x, y);
    gl.uniform3f(splatProg.uniforms.color, dx, dy, 0.0);
    gl.uniform1f(splatProg.uniforms.radius, correctRadius(CFG.SPLAT_RADIUS / 100));
    blit(velocity.write);
    velocity.swap();

    gl.uniform1i(splatProg.uniforms.uTarget, dye.read.attach(0));
    gl.uniform3f(splatProg.uniforms.color, color.r * k, color.g * k, color.b * k);
    blit(dye.write);
    dye.swap();
  }

  function splatRandom() {
    const c = randGreen();
    splat(
      Math.random(), Math.random(),
      (Math.random() - 0.5) * CFG.SPLAT_FORCE,
      (Math.random() - 0.5) * CFG.SPLAT_FORCE,
      c,
    );
  }

  // --- pointer tracking (on window so canvas can be pointer-events:none) ---
  let pointer = { x: 0, y: 0, px: 0, py: 0, dx: 0, dy: 0, moved: false, color: randGreen() };

  function pxToUV(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / rect.width,
      y: 1.0 - (clientY - rect.top) / rect.height,
    };
  }

  function onMouseMove(e) {
    const uv = pxToUV(e.clientX, e.clientY);
    pointer.px = pointer.x;
    pointer.py = pointer.y;
    pointer.x = uv.x;
    pointer.y = uv.y;
    pointer.dx = pointer.x - pointer.px;
    pointer.dy = pointer.y - pointer.py;
    pointer.moved = Math.abs(pointer.dx) > 0 || Math.abs(pointer.dy) > 0;
  }

  function onTouchMove(e) {
    const t = e.touches[0];
    if (!t) return;
    const uv = pxToUV(t.clientX, t.clientY);
    pointer.px = pointer.x;
    pointer.py = pointer.y;
    pointer.x = uv.x;
    pointer.y = uv.y;
    pointer.dx = pointer.x - pointer.px;
    pointer.dy = pointer.y - pointer.py;
    pointer.moved = Math.abs(pointer.dx) > 0 || Math.abs(pointer.dy) > 0;
  }

  // Color change on click
  function onMouseDown() { pointer.color = randGreen(); }
  function onTouchStart() { pointer.color = randGreen(); }

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mousedown', onMouseDown);
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  window.addEventListener('touchstart', onTouchStart, { passive: true });

  // gentle initial burst
  for (let i = 0; i < 3; i++) setTimeout(splatRandom, i * 300);

  // --- loop ---
  let lastTime = Date.now();
  let autoTimer = 0;
  let animId;

  function step() {
    const now = Date.now();
    const dt = Math.min((now - lastTime) / 1000, 0.016666);
    lastTime = now;

    // resize
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(canvas.clientWidth * dpr);
    const h = Math.floor(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      const ns = getRes(CFG.SIM_RES), nd = getRes(CFG.DYE_RES);
      velocity   = resizeDblFBO(velocity, ns.width, ns.height, fmtRG.i, fmtRG.f, texType, linFilter);
      dye        = resizeDblFBO(dye, nd.width, nd.height, fmtRGBA.i, fmtRGBA.f, texType, linFilter);
      divergence = makeFBO(ns.width, ns.height, fmtR.i, fmtR.f, texType, gl.NEAREST);
      curl       = makeFBO(ns.width, ns.height, fmtR.i, fmtR.f, texType, gl.NEAREST);
      pressure   = makeDblFBO(ns.width, ns.height, fmtR.i, fmtR.f, texType, gl.NEAREST);
    }

    // user input
    if (pointer.moved) {
      pointer.moved = false;
      const ar = canvas.width / canvas.height;
      const ddx = (ar < 1 ? pointer.dx * ar : pointer.dx) * CFG.SPLAT_FORCE;
      const ddy = (ar > 1 ? pointer.dy / ar : pointer.dy) * CFG.SPLAT_FORCE;
      splat(pointer.x, pointer.y, ddx, ddy, pointer.color);
    }

    // auto splats
    autoTimer += dt;
    if (autoTimer > CFG.AUTO_INTERVAL) {
      autoTimer = 0;
      splatRandom();
    }

    // --- sim ---
    // curl
    curlProg.bind();
    gl.uniform2f(curlProg.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(curlProg.uniforms.uVelocity, velocity.read.attach(0));
    blit(curl);

    // vorticity
    vortProg.bind();
    gl.uniform2f(vortProg.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(vortProg.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(vortProg.uniforms.uCurl, curl.attach(1));
    gl.uniform1f(vortProg.uniforms.curl, CFG.CURL);
    gl.uniform1f(vortProg.uniforms.dt, dt);
    blit(velocity.write);
    velocity.swap();

    // divergence
    divProg.bind();
    gl.uniform2f(divProg.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(divProg.uniforms.uVelocity, velocity.read.attach(0));
    blit(divergence);

    // clear pressure
    clearProg.bind();
    gl.uniform1i(clearProg.uniforms.uTexture, pressure.read.attach(0));
    gl.uniform1f(clearProg.uniforms.value, CFG.PRESSURE);
    blit(pressure.write);
    pressure.swap();

    // pressure solve
    presProg.bind();
    gl.uniform2f(presProg.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(presProg.uniforms.uDivergence, divergence.attach(0));
    for (let i = 0; i < CFG.PRESSURE_ITERS; i++) {
      gl.uniform1i(presProg.uniforms.uPressure, pressure.read.attach(1));
      blit(pressure.write);
      pressure.swap();
    }

    // gradient subtract
    gradProg.bind();
    gl.uniform2f(gradProg.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(gradProg.uniforms.uPressure, pressure.read.attach(0));
    gl.uniform1i(gradProg.uniforms.uVelocity, velocity.read.attach(1));
    blit(velocity.write);
    velocity.swap();

    // advect velocity
    advProg.bind();
    gl.uniform2f(advProg.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    if (advProg.uniforms.dyeTexelSize)
      gl.uniform2f(advProg.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(advProg.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(advProg.uniforms.uSource, velocity.read.attach(0));
    gl.uniform1f(advProg.uniforms.dt, dt);
    gl.uniform1f(advProg.uniforms.dissipation, CFG.VELOCITY_DISSIPATION);
    blit(velocity.write);
    velocity.swap();

    // advect dye
    if (advProg.uniforms.dyeTexelSize)
      gl.uniform2f(advProg.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
    gl.uniform1i(advProg.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(advProg.uniforms.uSource, dye.read.attach(1));
    gl.uniform1f(advProg.uniforms.dissipation, CFG.DENSITY_DISSIPATION);
    blit(dye.write);
    dye.swap();

    // --- display ---
    dispProg.bind();
    gl.uniform1i(dispProg.uniforms.uTexture, dye.read.attach(0));
    blit(null);

    animId = requestAnimationFrame(step);
  }

  animId = requestAnimationFrame(step);

  return function cleanup() {
    cancelAnimationFrame(animId);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchstart', onTouchStart);
  };
}

// ── Component ───────────────────────────────────────

export default function FluidBackground() {
  const ref = useRef(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.floor(c.clientWidth * dpr);
    c.height = Math.floor(c.clientHeight * dpr);
    return startFluid(c);
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
