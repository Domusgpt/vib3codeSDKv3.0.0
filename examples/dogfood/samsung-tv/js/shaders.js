// VIB3+ TV Shaders
// Optimized for Tizen WebGL (Mali-G52 target)

const SHARED_GLSL = `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_geometry;
uniform float u_rot4dXY, u_rot4dXZ, u_rot4dYZ, u_rot4dXW, u_rot4dYW, u_rot4dZW;
uniform float u_dimension, u_gridDensity, u_morphFactor, u_chaos, u_speed;
uniform float u_hue, u_intensity, u_saturation;
uniform float u_bass, u_mid, u_high;

// 6D rotation matrices
mat4 rotXY(float t){float c=cos(t),s=sin(t);return mat4(c,-s,0,0,s,c,0,0,0,0,1,0,0,0,0,1);}
mat4 rotXZ(float t){float c=cos(t),s=sin(t);return mat4(c,0,s,0,0,1,0,0,-s,0,c,0,0,0,0,1);}
mat4 rotYZ(float t){float c=cos(t),s=sin(t);return mat4(1,0,0,0,0,c,-s,0,0,s,c,0,0,0,0,1);}
mat4 rotXW(float t){float c=cos(t),s=sin(t);return mat4(c,0,0,-s,0,1,0,0,0,0,1,0,s,0,0,c);}
mat4 rotYW(float t){float c=cos(t),s=sin(t);return mat4(1,0,0,0,0,c,0,-s,0,0,1,0,0,s,0,c);}
mat4 rotZW(float t){float c=cos(t),s=sin(t);return mat4(1,0,0,0,0,1,0,0,0,0,c,-s,0,0,s,c);}

vec4 rot6D(vec4 p){
  p=rotXY(u_rot4dXY)*p; p=rotXZ(u_rot4dXZ)*p; p=rotYZ(u_rot4dYZ)*p;
  p=rotXW(u_rot4dXW)*p; p=rotYW(u_rot4dYW)*p; p=rotZW(u_rot4dZW)*p;
  return p;
}

vec3 proj4D(vec4 p){float w=u_dimension/(u_dimension+p.w);return p.xyz*w;}

// Geometry Functions
float hypercubeLattice(vec3 p,float gs){
  vec3 g=fract(p*gs),ed=min(g,1.0-g);
  float me=min(min(ed.x,ed.y),ed.z);
  return 1.0-smoothstep(0.0,0.03,me);
}
float sphereLattice(vec3 p,float gs){
  vec3 c=fract(p*gs)-0.5;
  return 1.0-smoothstep(0.15,0.25,length(c));
}
float fractalLattice(vec3 p,float gs){
  vec3 c=fract(p*gs);c=abs(c*2.0-1.0);
  float d=length(max(abs(c)-0.3,0.0));
  for(int i=0;i<3;i++){c=abs(c*2.0-1.0);d=min(d,length(max(abs(c)-0.3,0.0))/pow(2.0,float(i+1)));}
  return 1.0-smoothstep(0.0,0.05,d);
}

float geoFunc(vec4 p4){
    vec3 p3 = proj4D(p4);
    float gs = u_gridDensity * 0.08;
    int gt = int(mod(u_geometry, 3.0));

    float val = 0.0;
    if(gt==0) val = hypercubeLattice(p3, gs);
    else if(gt==1) val = sphereLattice(p3, gs);
    else val = fractalLattice(p3, gs);

    return val * u_morphFactor;
}

vec3 hsl2rgb(float h,float s,float l){
  float c2=(1.0-abs(2.0*l-1.0))*s,hp=h*6.0,x=c2*(1.0-abs(mod(hp,2.0)-1.0)),m=l-c2*0.5;
  vec3 rgb;
  if(hp<1.0) rgb=vec3(c2,x,0); else if(hp<2.0) rgb=vec3(x,c2,0);
  else if(hp<3.0) rgb=vec3(0,c2,x); else if(hp<4.0) rgb=vec3(0,x,c2);
  else if(hp<5.0) rgb=vec3(x,0,c2); else rgb=vec3(c2,0,x);
  return rgb+m;
}
`;

const FRAG_FACETED = SHARED_GLSL + `
void main(){
  vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/min(u_resolution.x,u_resolution.y);
  float ts=u_time*0.0001*u_speed;
  vec4 pos=vec4(uv*3.0,sin(ts*3.0),cos(ts*2.0));
  pos=rot6D(pos);
  float val=geoFunc(pos);
  float gi=1.0-clamp(abs(val),0.0,1.0);
  vec3 col=hsl2rgb(fract(u_hue+val*0.1+u_high*0.2),u_saturation,gi*u_intensity*0.5);
  col += hsl2rgb(fract(u_hue+0.5), 1.0, 0.8) * u_bass * 0.2;
  gl_FragColor=vec4(col,1.0);
}`;

const FRAG_QUANTUM = SHARED_GLSL + `
void main(){
  vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/min(u_resolution.x,u_resolution.y);
  float ts=u_time*0.0001*u_speed;
  vec4 pos=vec4(uv*3.0,sin(ts*3.0),cos(ts*2.0));
  pos=rot6D(pos);
  float val=geoFunc(pos);
  val+=sin(pos.x*10.0)*u_chaos;
  float gi=1.0-clamp(abs(val),0.0,1.0);
  gi=pow(gi,2.0 - u_mid);
  vec3 col=hsl2rgb(fract(u_hue+val*0.2+u_mid*0.1),u_saturation,gi*u_intensity);
  gl_FragColor=vec4(col,1.0);
}`;

const FRAG_HOLOGRAPHIC = SHARED_GLSL + `
void main(){
  vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/min(u_resolution.x,u_resolution.y);
  float ts=u_time*0.0001*u_speed;
  vec4 pos=vec4(uv*3.0,sin(ts*3.0),cos(ts*2.0));
  pos=rot6D(pos);
  float val=geoFunc(pos);
  float gi=1.0-clamp(abs(val),0.0,1.0);
  gi=pow(gi,1.5);
  vec3 bg=hsl2rgb(fract(u_hue),u_saturation,0.1 + u_bass*0.1);
  vec3 fg=hsl2rgb(fract(u_hue+0.5),u_saturation,gi*u_intensity);
  vec3 col=bg+fg;
  gl_FragColor=vec4(col,1.0);
}`;

const VERT = `attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.0,1.0);}`;
