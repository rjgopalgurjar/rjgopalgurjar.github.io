'use strict';
(() => {
  const stage = document.querySelector('.infinity-stage'), canvas = document.getElementById('infinity-canvas');
  if (!stage || !canvas) return;
  const gl = canvas.getContext('webgl', {alpha:true,antialias:true,powerPreference:'low-power'});
  const captions = {digital:'Digital: ideas into interfaces, code into useful solutions.',operations:'Operations: purchase, documentation and dispatch—connected.',marketing:'Marketing: clear communication and practical follow-through.'};
  stage.querySelectorAll('[data-scene-mode]').forEach(button => button.addEventListener('click', () => {
    stage.dataset.scene = button.dataset.sceneMode;
    stage.querySelectorAll('[data-scene-mode]').forEach(item => item.setAttribute('aria-pressed',String(item === button)));
    stage.querySelector('.infinity-caption').textContent = captions[button.dataset.sceneMode];
  }));
  if (!gl) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 600 320'); svg.setAttribute('aria-hidden','true'); svg.classList.add('infinity-fallback');
    svg.innerHTML = '<defs><linearGradient id="infinity-blue" x2="0" y2="1"><stop stop-color="#70d7ff"/><stop offset=".4" stop-color="#0873ec"/><stop offset="1" stop-color="#073ec1"/></linearGradient></defs><path d="M300 160C228 63 151 57 106 100C64 140 64 207 106 235C160 270 222 251 300 160C378 69 440 50 494 85C536 113 536 180 494 220C449 263 372 257 300 160Z" fill="none" stroke="url(#infinity-blue)" stroke-width="31" stroke-linecap="round"/>';
    canvas.replaceWith(svg); stage.querySelector('.infinity-controls').hidden = true; return;
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)'), pause = stage.querySelector('.infinity-pause');
  let width=0,height=0,ratio=1,frame=0,lastFrame=0,clock=0,enabled=!reduced.matches,paused=false,visible=true,dragging=false;
  let dragYaw=0,dragPitch=0,hoverYaw=0,hoverPitch=0,yaw=0,pitch=.035,lastX=0,lastY=0;
  const tau=Math.PI*2,segments=256,sides=32,radius=.12,clamp=(v,m)=>Math.max(-m,Math.min(m,v));
  // Bernoulli's lemniscate gives the infinity two balanced, open loops.
  // Depth separates the crossing strands without warping the silhouette.
  function path(t){const s=Math.sin(t),c=Math.cos(t),d=1+s*s;return [1.43*c/d,1.7*s*c/d,.185*s];}
  function basis(t){
    const a=path(t-.0001),b=path(t+.0001);let x=b[0]-a[0],y=b[1]-a[1],z=b[2]-a[2],l=Math.hypot(x,y,z);
    x/=l;y/=l;z/=l;l=Math.hypot(x,y);const n=[-y/l,x/l,0];return {n,b:[-z*n[1],z*n[0],x*n[1]-y*n[0]]};
  }
  const positions=[],normals=[],indices=[];
  for(let i=0;i<=segments;i++){
    const t=i/segments*tau,p=path(t),axes=basis(t);
    for(let j=0;j<=sides;j++){
      const angle=j/sides*tau,n=axes.n.map((v,k)=>v*Math.cos(angle)+axes.b[k]*Math.sin(angle));
      positions.push(...p.map((v,k)=>v+n[k]*radius));normals.push(...n);
      if(i<segments&&j<sides){const a=i*(sides+1)+j,b=a+sides+1;indices.push(a,b,a+1,a+1,b,b+1);}
    }
  }
  const base=`precision highp float;
    attribute vec3 aPosition;uniform vec2 uRotation;uniform vec2 uViewport;uniform float uScale;
    vec3 rotatePoint(vec3 p){float sy=sin(uRotation.x),cy=cos(uRotation.x),sx=sin(uRotation.y),cx=cos(uRotation.y);vec3 q=vec3(p.x*cy+p.z*sy,p.y,-p.x*sy+p.z*cy);return vec3(q.x,q.y*cx-q.z*sx,q.y*sx+q.z*cx);}
    vec4 projectPoint(vec3 p){float d=5.0-p.z;return vec4(p.x*uScale*10.0/uViewport.x,-p.y*uScale*10.0/uViewport.y,-p.z*.3*d,d);}`;
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('Infinity shader compilation failed');return s;}
  function program(vertex,fragment){const p=gl.createProgram();gl.attachShader(p,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(p,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error('Infinity scene setup failed');return p;}
  const material=program(base+`attribute vec3 aNormal;varying vec3 vNormal;varying vec3 vPosition;
    void main(){vNormal=rotatePoint(aNormal);vPosition=rotatePoint(aPosition);gl_Position=projectPoint(vPosition);}`,
    `precision highp float;varying vec3 vNormal;varying vec3 vPosition;
    void main(){vec3 n=normalize(vNormal),light=normalize(vec3(-.35,-.7,1.0)),view=normalize(vec3(0.0,0.0,5.0)-vPosition);
    float diffuse=max(dot(n,light),0.0),spec=pow(max(dot(n,normalize(light+view)),0.0),70.0),soft=pow(max(dot(n,normalize(vec3(.35,-.8,1.0)+view)),0.0),12.0),rim=pow(1.0-max(dot(n,view),0.0),2.5);
    vec3 blue=mix(vec3(.012,.11,.53),vec3(.015,.48,.92),diffuse);
    gl_FragColor=vec4(blue*(.68+.38*diffuse)+vec3(.62,.86,1.0)*spec*.8+vec3(.14,.38,.5)*soft*.28+vec3(.08,.36,.58)*rim*.2,1.0);}`);
  const particles=program(base+`attribute float aSize;attribute float aAlpha;uniform float uPixelRatio;varying float vAlpha;
    void main(){vec3 p=rotatePoint(aPosition);gl_Position=projectPoint(p);gl_PointSize=aSize*uPixelRatio*5.0/(5.0-p.z);vAlpha=aAlpha;}`,
    `precision mediump float;varying float vAlpha;void main(){float d=length(gl_PointCoord-.5)*2.0;gl_FragColor=vec4(.42,.78,1.0,(1.0-smoothstep(.15,1.0,d))*vAlpha);}`);
  function buffer(data,target=gl.ARRAY_BUFFER,usage=gl.STATIC_DRAW){const b=gl.createBuffer();gl.bindBuffer(target,b);gl.bufferData(target,data,usage);return b;}
  const positionBuffer=buffer(new Float32Array(positions)),normalBuffer=buffer(new Float32Array(normals)),indexBuffer=buffer(new Uint16Array(indices),gl.ELEMENT_ARRAY_BUFFER);
  const count=108,trails=4,particlePositions=new Float32Array(count*trails*3),sizes=[],alphas=[];
  for(let i=0;i<count;i++)for(let j=0;j<trails;j++){sizes.push((i%8===0?4.2:2.4)-j*.32);alphas.push((1-j/trails)*(i%8===0?.95:.68));}
  const particleBuffer=buffer(particlePositions,gl.ARRAY_BUFFER,gl.DYNAMIC_DRAW),sizeBuffer=buffer(new Float32Array(sizes)),alphaBuffer=buffer(new Float32Array(alphas));
  function attribute(p,name,source,size){const a=gl.getAttribLocation(p,name);gl.bindBuffer(gl.ARRAY_BUFFER,source);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,size,gl.FLOAT,false,0,0);}
  function uniforms(p){gl.useProgram(p);for(let i=0;i<3;i++)gl.disableVertexAttribArray(i);gl.uniform2f(gl.getUniformLocation(p,'uRotation'),yaw,pitch);gl.uniform2f(gl.getUniformLocation(p,'uViewport'),width,height);gl.uniform1f(gl.getUniformLocation(p,'uScale'),Math.min(width/3.45,height/2.25));}
  function draw(time){
    if(!width||!height)return;const moving=enabled&&!paused&&!reduced.matches;if(moving)clock=time;
    const ty=dragYaw+hoverYaw+(moving?Math.sin(clock*.00018)*.035:0),tp=.035+dragPitch+hoverPitch+(moving?Math.cos(clock*.00014)*.025:0);
    yaw+=(ty-yaw)*(moving?.15:1);pitch+=(tp-pitch)*(moving?.15:1);
    gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.disable(gl.BLEND);
    uniforms(material);attribute(material,'aPosition',positionBuffer,3);attribute(material,'aNormal',normalBuffer,3);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);
    for(let i=0;i<count;i++)for(let j=0;j<trails;j++){
      const t=i/count*tau+clock*.0003-j*.012,p=path(t),axes=basis(t),angle=i*2.39996+clock*.00006,d=radius+.025+(i%7)*.005;
      for(let k=0;k<3;k++)particlePositions[(i*trails+j)*3+k]=p[k]+(axes.n[k]*Math.cos(angle)+axes.b[k]*Math.sin(angle))*d;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER,particleBuffer);gl.bufferSubData(gl.ARRAY_BUFFER,0,particlePositions);uniforms(particles);gl.uniform1f(gl.getUniformLocation(particles,'uPixelRatio'),ratio);
    attribute(particles,'aPosition',particleBuffer,3);attribute(particles,'aSize',sizeBuffer,1);attribute(particles,'aAlpha',alphaBuffer,1);
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.drawArrays(gl.POINTS,0,count*trails);gl.depthMask(true);
    stage.style.setProperty('--view-x',(yaw*14).toFixed(2)+'deg');stage.style.setProperty('--view-y',(pitch*14).toFixed(2)+'deg');
  }
  function loop(time){frame=0;if(!enabled||paused||reduced.matches||!visible||document.hidden||document.querySelector('dialog[open]'))return;if(time-lastFrame>30){lastFrame=time;draw(time);}frame=requestAnimationFrame(loop);}
  function sync(){
    cancelAnimationFrame(frame);frame=0;const stopped=paused||!enabled||reduced.matches;
    pause.setAttribute('aria-pressed',String(stopped));pause.setAttribute('aria-label',stopped?'Play infinity animation':'Pause infinity animation');pause.querySelector('use').setAttribute('href','./icons-v2.svg#'+(stopped?'play':'pause'));pause.disabled=!enabled||reduced.matches;draw(clock);
    if(!stopped&&visible&&!document.hidden&&!document.querySelector('dialog[open]'))frame=requestAnimationFrame(loop);
  }
  function size(){const r=stage.getBoundingClientRect();width=r.width;height=r.height;ratio=Math.min(devicePixelRatio||1,1.75);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);sync();}
  stage.addEventListener('pointerdown',event=>{if(event.target.closest('button'))return;dragging=true;lastX=event.clientX;lastY=event.clientY;stage.classList.add('dragging');stage.setPointerCapture(event.pointerId);if(event.pointerType==='mouse')event.preventDefault();});
  stage.addEventListener('pointermove',event=>{
    if(event.target.closest('button')&&!dragging)return;
    if(dragging){dragYaw=clamp(dragYaw+(event.clientX-lastX)*.0045,.48);dragPitch=clamp(dragPitch+(event.clientY-lastY)*.004,.28);lastX=event.clientX;lastY=event.clientY;}
    else if(event.pointerType==='mouse'){const r=stage.getBoundingClientRect();hoverYaw=((event.clientX-r.left)/r.width-.5)*.22;hoverPitch=((event.clientY-r.top)/r.height-.5)*.13;}
    if(!enabled||paused||reduced.matches)draw(clock);
  },{passive:true});
  function release(event){dragging=false;stage.classList.remove('dragging');if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);}
  stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('pointerleave',()=>{if(!dragging){hoverYaw=0;hoverPitch=0;}});
  function reset(){dragYaw=0;dragPitch=0;hoverYaw=0;hoverPitch=0;sync();}
  stage.querySelector('.infinity-reset').addEventListener('click',reset);pause.addEventListener('click',()=>{paused=!paused;sync();});
  stage.addEventListener('keydown',event=>{
    if(event.target.closest('button'))return;
    if(event.key==='ArrowLeft')dragYaw=clamp(dragYaw-.12,.48);else if(event.key==='ArrowRight')dragYaw=clamp(dragYaw+.12,.48);
    else if(event.key==='ArrowUp')dragPitch=clamp(dragPitch-.09,.28);else if(event.key==='ArrowDown')dragPitch=clamp(dragPitch+.09,.28);
    else if(event.key.toLowerCase()==='r'||event.key==='Home'){event.preventDefault();reset();return;}else return;event.preventDefault();sync();
  });
  document.addEventListener('gopal:motion',event=>{enabled=event.detail.enabled;sync();});document.addEventListener('visibilitychange',sync);
  new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','class']});
  new ResizeObserver(size).observe(stage);new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.02}).observe(stage);reduced.addEventListener('change',sync);
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(frame);});canvas.addEventListener('webglcontextrestored',()=>location.reload());size();
})();
