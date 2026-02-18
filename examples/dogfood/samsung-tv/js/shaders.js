/* ==========================================================================
   VIB3+ Samsung TV — Shader Module
   3 visualization systems: Faceted, Quantum, Holographic
   Extracted from synesthesia.html reference implementation
   Target: WebGL 1.0, ARM Mali GPUs (mediump, reduced iterations)
   ========================================================================== */

window.VIB3Shaders = (function () {
  'use strict';

  var gl = null;
  var programs = [];
  var currentProgram = null;
  var uniforms = {};
  var posBuffer = null;

  // ── Vertex Shader ──
  var VERT = 'attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.0,1.0);}';

  // ── Shared GLSL (6D rotation, projection, 24 geometries) ──
  // precision mediump for Mali GPU compatibility
  var SHARED = [
    'precision mediump float;',
    'uniform float u_time;',
    'uniform vec2 u_resolution;',
    'uniform float u_geometry;',
    'uniform float u_rot4dXY,u_rot4dXZ,u_rot4dYZ,u_rot4dXW,u_rot4dYW,u_rot4dZW;',
    'uniform float u_dimension,u_gridDensity,u_morphFactor,u_chaos,u_speed;',
    'uniform float u_hue,u_intensity,u_saturation;',
    'uniform float u_bass,u_mid,u_high;',
    'uniform float u_onset;',

    // 6D rotation matrices (order: XY→XZ→YZ→XW→YW→ZW)
    'mat4 rotXY(float t){float c=cos(t),s=sin(t);return mat4(c,-s,0,0,s,c,0,0,0,0,1,0,0,0,0,1);}',
    'mat4 rotXZ(float t){float c=cos(t),s=sin(t);return mat4(c,0,s,0,0,1,0,0,-s,0,c,0,0,0,0,1);}',
    'mat4 rotYZ(float t){float c=cos(t),s=sin(t);return mat4(1,0,0,0,0,c,-s,0,0,s,c,0,0,0,0,1);}',
    'mat4 rotXW(float t){float c=cos(t),s=sin(t);return mat4(c,0,0,-s,0,1,0,0,0,0,1,0,s,0,0,c);}',
    'mat4 rotYW(float t){float c=cos(t),s=sin(t);return mat4(1,0,0,0,0,c,0,-s,0,0,1,0,0,s,0,c);}',
    'mat4 rotZW(float t){float c=cos(t),s=sin(t);return mat4(1,0,0,0,0,1,0,0,0,0,c,-s,0,0,s,c);}',

    'vec4 rot6D(vec4 p){',
    '  p=rotXY(u_rot4dXY)*p;p=rotXZ(u_rot4dXZ)*p;p=rotYZ(u_rot4dYZ)*p;',
    '  p=rotXW(u_rot4dXW)*p;p=rotYW(u_rot4dYW)*p;p=rotZW(u_rot4dZW)*p;',
    '  return p;',
    '}',

    // 4D perspective projection
    'vec3 proj4D(vec4 p){float w=u_dimension/(u_dimension+p.w);return p.xyz*w;}',

    // HSL → RGB
    'vec3 hsl2rgb(float h,float s,float l){',
    '  float c2=(1.0-abs(2.0*l-1.0))*s,hp=h*6.0,x=c2*(1.0-abs(mod(hp,2.0)-1.0)),m=l-c2*0.5;',
    '  vec3 rgb;',
    '  if(hp<1.0)rgb=vec3(c2,x,0);else if(hp<2.0)rgb=vec3(x,c2,0);',
    '  else if(hp<3.0)rgb=vec3(0,c2,x);else if(hp<4.0)rgb=vec3(0,x,c2);',
    '  else if(hp<5.0)rgb=vec3(x,0,c2);else rgb=vec3(c2,0,x);',
    '  return rgb+m;',
    '}',

    // Warp: Hypersphere (geometries 8-15)
    'vec3 warpHypersphere(vec3 p,int gi){',
    '  float r=length(p);',
    '  float mb=clamp(u_morphFactor*0.6+(u_dimension-3.0)*0.25,0.0,2.0);',
    '  float w=sin(r*(1.3+float(gi)*0.12)+u_time*0.0008*u_speed)*(0.4+mb*0.45);',
    '  vec4 p4=vec4(p*(1.0+mb*0.2),w);',
    '  p4=rot6D(p4);',
    '  vec3 pr=proj4D(p4);',
    '  return mix(p,pr,clamp(0.45+mb*0.35,0.0,1.0));',
    '}',

    // Warp: Hypertetrahedron (geometries 16-23)
    'vec3 warpHypertetra(vec3 p,int gi){',
    '  vec3 c1=normalize(vec3(1,1,1)),c2=normalize(vec3(-1,-1,1)),c3=normalize(vec3(-1,1,-1)),c4=normalize(vec3(1,-1,-1));',
    '  float mb=clamp(u_morphFactor*0.8+(u_dimension-3.0)*0.2,0.0,2.0);',
    '  float bm=dot(p,c1)*0.14+dot(p,c2)*0.1+dot(p,c3)*0.08;',
    '  float w=sin(bm*5.5+u_time*0.0009*u_speed)*cos(dot(p,c4)*4.2-u_time*0.0007*u_speed)*(0.5+mb*0.4);',
    '  vec3 off=vec3(dot(p,c1),dot(p,c2),dot(p,c3))*0.1*mb;',
    '  vec4 p4=vec4(p+off,w);',
    '  p4=rot6D(p4);',
    '  vec3 pr=proj4D(p4);',
    '  float pi2=min(min(abs(dot(p,c1)),abs(dot(p,c2))),min(abs(dot(p,c3)),abs(dot(p,c4))));',
    '  vec3 bl=mix(p,pr,clamp(0.45+mb*0.35,0.0,1.0));',
    '  return mix(bl,bl*(1.0-pi2*0.55),0.2+mb*0.2);',
    '}',

    'vec3 applyCoreWarp(vec3 p,float gt){',
    '  float cf=floor(gt/8.0);',
    '  int ci=int(clamp(cf,0.0,2.0));',
    '  int gi=int(clamp(floor(mod(gt,8.0)+0.5),0.0,7.0));',
    '  if(ci==1)return warpHypersphere(p,gi);',
    '  if(ci==2)return warpHypertetra(p,gi);',
    '  return p;',
    '}',

    // 8 geometry generators (reduced iteration for TV: 3 instead of 4 in fractal)
    'float tetraLattice(vec3 p,float gs){',
    '  vec3 q=fract(p*gs)-0.5;',
    '  float d1=length(q),d2=length(q-vec3(0.4,0,0)),d3=length(q-vec3(0,0.4,0)),d4=length(q-vec3(0,0,0.4));',
    '  float v=1.0-smoothstep(0.0,0.04,min(min(d1,d2),min(d3,d4)));',
    '  float e=max(max(1.0-smoothstep(0.0,0.02,abs(length(q.xy)-0.2)),1.0-smoothstep(0.0,0.02,abs(length(q.yz)-0.2))),',
    '    1.0-smoothstep(0.0,0.02,abs(length(q.xz)-0.2)));',
    '  return max(v,e*0.5);',
    '}',

    'float hypercubeLattice(vec3 p,float gs){',
    '  vec3 g=fract(p*gs),ed=min(g,1.0-g);',
    '  float me=min(min(ed.x,ed.y),ed.z);',
    '  float l=1.0-smoothstep(0.0,0.03,me);',
    '  vec3 cn=abs(g-0.5);float mc=max(max(cn.x,cn.y),cn.z);',
    '  return max(l*0.7,1.0-smoothstep(0.45,0.5,mc));',
    '}',

    'float sphereLattice(vec3 p,float gs){',
    '  vec3 c=fract(p*gs)-0.5;float s=1.0-smoothstep(0.15,0.25,length(c));',
    '  float rr=length(c.xy);',
    '  float r=max(1.0-smoothstep(0.0,0.02,abs(rr-0.3)),1.0-smoothstep(0.0,0.02,abs(rr-0.2)));',
    '  return max(s,r*0.6);',
    '}',

    'float torusLattice(vec3 p,float gs){',
    '  vec3 c=fract(p*gs)-0.5;',
    '  float td=length(vec2(length(c.xy)-0.3,c.z));',
    '  float t=1.0-smoothstep(0.08,0.12,td);',
    '  float a=atan(c.y,c.x);',
    '  return max(t,0.0)+sin(a*8.0)*0.02;',
    '}',

    'float kleinLattice(vec3 p,float gs){',
    '  vec3 c=fract(p*gs)-0.5;',
    '  float u2=atan(c.y,c.x)/3.14159+1.0,v2=c.z+0.5;',
    '  float x2=(2.0+cos(u2*0.5))*cos(u2),y2=(2.0+cos(u2*0.5))*sin(u2),z2=sin(u2*0.5)+v2;',
    '  return 1.0-smoothstep(0.1,0.15,length(c-vec3(x2,y2,z2)*0.1));',
    '}',

    'float fractalLattice(vec3 p,float gs){',
    '  vec3 c=fract(p*gs);c=abs(c*2.0-1.0);',
    '  float d=length(max(abs(c)-0.3,0.0));',
    '  for(int i=0;i<3;i++){c=abs(c*2.0-1.0);d=min(d,length(max(abs(c)-0.3,0.0))/pow(2.0,float(i+1)));}',
    '  return 1.0-smoothstep(0.0,0.05,d);',
    '}',

    'float waveLattice(vec3 p,float gs){',
    '  float t2=u_time*0.001*u_speed;vec3 c=fract(p*gs)-0.5;',
    '  float w1=sin(p.x*gs*2.0+t2*2.0),w2=sin(p.y*gs*1.8+t2*1.5),w3=sin(p.z*gs*2.2+t2*1.8);',
    '  return max(0.0,(w1+w2+w3)/3.0*(1.0-length(c)*2.0));',
    '}',

    'float crystalLattice(vec3 p,float gs){',
    '  vec3 c=fract(p*gs)-0.5;',
    '  float cr=max(max(abs(c.x)+abs(c.y),abs(c.y)+abs(c.z)),abs(c.x)+abs(c.z));',
    '  cr=1.0-smoothstep(0.3,0.4,cr);',
    '  float f=max(max(1.0-smoothstep(0.0,0.02,abs(abs(c.x)-0.35)),1.0-smoothstep(0.0,0.02,abs(abs(c.y)-0.35))),',
    '    1.0-smoothstep(0.0,0.02,abs(abs(c.z)-0.35)));',
    '  return max(cr,f*0.5);',
    '}',

    // Geometry dispatch
    'float geoFunc(vec4 p4){',
    '  int gt=int(clamp(floor(mod(u_geometry,8.0)+0.5),0.0,7.0));',
    '  vec3 p3=proj4D(p4);',
    '  vec3 w=applyCoreWarp(p3,u_geometry);',
    '  float gs=u_gridDensity*0.08;',
    '  if(gt==0)return tetraLattice(w,gs)*u_morphFactor;',
    '  if(gt==1)return hypercubeLattice(w,gs)*u_morphFactor;',
    '  if(gt==2)return sphereLattice(w,gs)*u_morphFactor;',
    '  if(gt==3)return torusLattice(w,gs)*u_morphFactor;',
    '  if(gt==4)return kleinLattice(w,gs)*u_morphFactor;',
    '  if(gt==5)return fractalLattice(w,gs)*u_morphFactor;',
    '  if(gt==6)return waveLattice(w,gs)*u_morphFactor;',
    '  if(gt==7)return crystalLattice(w,gs)*u_morphFactor;',
    '  return hypercubeLattice(w,gs)*u_morphFactor;',
    '}',
    ''
  ].join('\n');

  // ── Faceted Fragment Shader ──
  // Clean geometric patterns, HSL color with degree-based hue, sacred geometry
  var FRAG_FACETED = SHARED +
    'void main(){\n' +
    '  vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/min(u_resolution.x,u_resolution.y);\n' +
    '  float ts=u_time*0.0001*u_speed;\n' +
    '  vec4 pos=vec4(uv*3.0,sin(ts*3.0),cos(ts*2.0));\n' +
    '  pos=rot6D(pos);\n' +
    '  float val=geoFunc(pos);\n' +
    '  float noise=sin(pos.x*7.0)*cos(pos.y*11.0)*sin(pos.z*13.0);\n' +
    '  val+=noise*u_chaos;\n' +
    '  float gi=1.0-clamp(abs(val),0.0,1.0);\n' +
    '  gi+=u_onset*0.3;\n' +
    '  float fi=gi*u_intensity;\n' +
    '  float hue=u_hue+val*0.1+u_high*0.08;\n' +
    '  vec3 bc=vec3(sin(hue*6.28318),sin(hue*6.28318+2.0943),sin(hue*6.28318+4.1887))*0.5+0.5;\n' +
    '  float gray=(bc.r+bc.g+bc.b)/3.0;\n' +
    '  vec3 col=mix(vec3(gray),bc,u_saturation)*fi;\n' +
    '  gl_FragColor=vec4(col,1.0);\n' +
    '}';

  // ── Quantum Fragment Shader ──
  // Dense lattice, particle grids, crystalline interference, iridescent edges
  var FRAG_QUANTUM = SHARED +
    'void main(){\n' +
    '  vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/min(u_resolution.x,u_resolution.y);\n' +
    '  float ts=u_time*0.0001*u_speed;\n' +
    '  vec4 pos=vec4(uv*3.0,sin(ts*3.0),cos(ts*2.0));\n' +
    '  pos=rot6D(pos);\n' +
    '  float val=geoFunc(pos);\n' +
    '  float noise=sin(pos.x*7.0)*cos(pos.y*11.0)*sin(pos.z*13.0);\n' +
    '  val+=noise*u_chaos;\n' +
    '  float gi=1.0-clamp(abs(val*0.8),0.0,1.0);\n' +
    '  gi=pow(gi,1.5);\n' +
    '  gi+=u_onset*0.3;\n' +
    '  float fi=gi*u_intensity;\n' +
    '  float h=fract(u_hue+val*0.15+u_high*0.1+ts*0.05);\n' +
    '  float s=u_saturation;\n' +
    '  float l=0.1+fi*0.55;\n' +
    '  vec3 col=hsl2rgb(h,s,l);\n' +
    '  float edge=1.0-smoothstep(0.0,0.3,abs(gi-0.5)*2.0);\n' +
    '  col+=hsl2rgb(fract(h+0.33),s*0.8,0.6)*edge*fi*0.4;\n' +
    '  gl_FragColor=vec4(col,1.0);\n' +
    '}';

  // ── Holographic Fragment Shader ──
  // 5-layer composite in single pass, shimmer, RGB channel separation
  var FRAG_HOLOGRAPHIC = SHARED +
    'void main(){\n' +
    '  vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/min(u_resolution.x,u_resolution.y);\n' +
    '  float ts=u_time*0.0001*u_speed;\n' +
    '  vec4 pos=vec4(uv*3.0,sin(ts*3.0),cos(ts*2.0));\n' +
    '  pos=rot6D(pos);\n' +
    '  float val=geoFunc(pos);\n' +
    '  float noise=sin(pos.x*7.0)*cos(pos.y*11.0)*sin(pos.z*13.0);\n' +
    '  val+=noise*u_chaos;\n' +
    '  float gi=1.0-clamp(abs(val*0.8),0.0,1.0);\n' +
    '  gi=pow(gi,1.5);\n' +
    '  float shimmer=sin(uv.x*20.0+ts*5.0)*cos(uv.y*15.0+ts*3.0)*0.1;\n' +
    '  gi+=shimmer*gi;\n' +
    '  gi+=u_onset*0.3;\n' +
    '  float fi=gi*u_intensity;\n' +
    '  float h0=u_hue;\n' +
    '  vec3 bg=hsl2rgb(fract(h0),u_saturation*0.7,0.15)*(0.3+gi*0.4);\n' +
    '  vec3 shadow=hsl2rgb(fract(h0+0.33),u_saturation*0.9,0.3)*pow(1.0-gi,2.0)*0.8;\n' +
    '  vec3 content=hsl2rgb(fract(h0),u_saturation,0.55)*gi*1.2;\n' +
    '  vec3 highlight=hsl2rgb(fract(h0+0.15),u_saturation,0.6)*pow(gi,3.0)*1.5;\n' +
    '  vec3 accent=hsl2rgb(fract(h0+0.67),u_saturation,0.5)*sin(val*50.0+ts*10.0)*0.5+0.5;\n' +
    '  accent*=gi*0.3;\n' +
    '  float dist=length(uv),angle=atan(uv.y,uv.x);\n' +
    '  content.r+=sin(dist*30.0+angle*10.0+u_time*0.004)*fi*0.12;\n' +
    '  content.b+=sin(dist*35.0+angle*12.0+u_time*0.0045)*fi*0.14;\n' +
    '  highlight.r+=sin(uv.x*80.0+u_time*0.008)*cos(uv.y*60.0+u_time*0.006)*fi*0.15;\n' +
    '  vec3 col=bg*0.6+shadow*0.4+content+highlight*0.8+accent;\n' +
    '  col*=fi;\n' +
    '  gl_FragColor=vec4(col,1.0);\n' +
    '}';

  // ── Uniform names ──
  var UNIFORM_NAMES = [
    'u_time', 'u_resolution', 'u_geometry',
    'u_rot4dXY', 'u_rot4dXZ', 'u_rot4dYZ', 'u_rot4dXW', 'u_rot4dYW', 'u_rot4dZW',
    'u_dimension', 'u_gridDensity', 'u_morphFactor', 'u_chaos', 'u_speed',
    'u_hue', 'u_intensity', 'u_saturation',
    'u_bass', 'u_mid', 'u_high', 'u_onset'
  ];

  function compileShader(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  function createProgram(fragSrc) {
    var vs = compileShader(gl.VERTEX_SHADER, VERT);
    var fs = compileShader(gl.FRAGMENT_SHADER, fragSrc);
    if (!vs || !fs) return null;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(prog));
      return null;
    }
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return prog;
  }

  function getUniforms(prog) {
    var u = {};
    for (var i = 0; i < UNIFORM_NAMES.length; i++) {
      u[UNIFORM_NAMES[i]] = gl.getUniformLocation(prog, UNIFORM_NAMES[i]);
    }
    return u;
  }

  /** Initialize shaders. Returns true on success. */
  function init(glCtx) {
    gl = glCtx;

    // Compile all 3 programs
    programs = [
      createProgram(FRAG_FACETED),
      createProgram(FRAG_QUANTUM),
      createProgram(FRAG_HOLOGRAPHIC)
    ];

    if (!programs[0] || !programs[1] || !programs[2]) {
      console.error('VIB3Shaders: Failed to compile one or more shader programs');
      return false;
    }

    // Fullscreen quad buffer
    posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1
    ]), gl.STATIC_DRAW);

    return true;
  }

  /** Switch active shader program by system index (0=Faceted, 1=Quantum, 2=Holographic) */
  function switchSystem(idx) {
    idx = Math.max(0, Math.min(2, idx));
    currentProgram = programs[idx];
    gl.useProgram(currentProgram);
    uniforms = getUniforms(currentProgram);

    var aPos = gl.getAttribLocation(currentProgram, 'a_position');
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  }

  /** Set all shader uniforms from state object */
  function setUniforms(state) {
    if (!currentProgram) return;
    gl.uniform1f(uniforms.u_time, state.time);
    gl.uniform2f(uniforms.u_resolution, state.width, state.height);
    gl.uniform1f(uniforms.u_geometry, state.geometry);
    gl.uniform1f(uniforms.u_rot4dXY, state.rot[0]);
    gl.uniform1f(uniforms.u_rot4dXZ, state.rot[1]);
    gl.uniform1f(uniforms.u_rot4dYZ, state.rot[2]);
    gl.uniform1f(uniforms.u_rot4dXW, state.rot[3]);
    gl.uniform1f(uniforms.u_rot4dYW, state.rot[4]);
    gl.uniform1f(uniforms.u_rot4dZW, state.rot[5]);
    gl.uniform1f(uniforms.u_dimension, state.dimension);
    gl.uniform1f(uniforms.u_gridDensity, state.gridDensity);
    gl.uniform1f(uniforms.u_morphFactor, state.morphFactor);
    gl.uniform1f(uniforms.u_chaos, state.chaos);
    gl.uniform1f(uniforms.u_speed, state.speed);
    gl.uniform1f(uniforms.u_hue, state.hue);
    gl.uniform1f(uniforms.u_intensity, state.intensity);
    gl.uniform1f(uniforms.u_saturation, state.saturation);
    gl.uniform1f(uniforms.u_bass, state.bass);
    gl.uniform1f(uniforms.u_mid, state.mid);
    gl.uniform1f(uniforms.u_high, state.high);
    gl.uniform1f(uniforms.u_onset, state.onset);
  }

  /** Draw the fullscreen quad */
  function draw() {
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  return {
    init: init,
    switchSystem: switchSystem,
    setUniforms: setUniforms,
    draw: draw
  };
})();
