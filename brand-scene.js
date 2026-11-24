'use strict';
(() => {
  const scene=document.querySelector('.brand-scene');if(!scene)return;
  const root=document.documentElement,reduced=matchMedia('(prefers-reduced-motion: reduce)'),pause=scene.querySelector('.brand-pause');
  const track=document.getElementById('meta-flow-track'),group=document.getElementById('brand-particles'),length=track.getTotalLength();
  const samples=Array.from({length:513},(_,i)=>track.getPointAtLength(i/512*length));
  const dots=Array.from({length:72},(_,i)=>{const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');dot.setAttribute('r',i%6===0?'.085':'.038');dot.setAttribute('fill',i%6===0?'#effdff':'#83dfff');dot.setAttribute('opacity',i%6===0?'.9':'.65');group.append(dot);return dot;});
  const captions={meta:'Meta: campaigns, communication and customer connections.',shopify:'Shopify expertise: storefronts shaped around your business.',google:'Google Ads: campaigns connected to a clear B2C journey.'};
  let enabled=!reduced.matches,paused=false,visible=true,frame=0,last=0,phase=0,rx=0,ry=0,targetX=0,targetY=0,dragX=0,dragY=0,dragging=false,lastX=0,lastY=0;
  let timer=0,hovered=false,captureTarget=null;const order=['meta','shopify','google'];
  const clamp=(n,m)=>Math.max(-m,Math.min(m,n));
  function moving(){return enabled&&!paused&&!reduced.matches&&!document.hidden&&visible&&!document.querySelector('dialog[open]');}
  function select(value,manual){
    scene.dataset.platform=value;scene.querySelectorAll('[data-platform-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.platformChoice===value)));
    const caption=scene.querySelector('.brand-caption');caption.setAttribute('aria-live',manual?'polite':'off');caption.textContent=captions[value];schedule();
  }
  function schedule(){clearTimeout(timer);if(!moving()||hovered||scene.contains(document.activeElement))return;timer=setTimeout(()=>select(order[(order.indexOf(scene.dataset.platform)+1)%order.length],false),5000);}
  function draw(time){
    if(moving())phase=time;const animate=enabled&&!reduced.matches&&!paused;
    const x=dragX+targetX+(animate?Math.cos(phase*.0003)*1.1:0),y=dragY+targetY+(animate?Math.sin(phase*.00024)*1.4:0);
    rx+=(x-rx)*(animate?.13:1);ry+=(y-ry)*(animate?.13:1);
    scene.style.setProperty('--scene-rx',rx.toFixed(2)+'deg');scene.style.setProperty('--scene-ry',ry.toFixed(2)+'deg');
    scene.style.setProperty('--orb-x',(ry*-.35).toFixed(2)+'px');scene.style.setProperty('--orb-y',(rx*.3).toFixed(2)+'px');
    dots.forEach((dot,i)=>{const t=((i/dots.length+phase*.000045)%1)*512,index=Math.floor(t),fraction=t-index,a=samples[index],b=samples[index+1];dot.setAttribute('cx',(a.x+(b.x-a.x)*fraction).toFixed(3));dot.setAttribute('cy',(a.y+(b.y-a.y)*fraction).toFixed(3));});
  }
  function loop(time){frame=0;if(!moving())return;if(time-last>30){last=time;draw(time);}frame=requestAnimationFrame(loop);}
  function sync(){cancelAnimationFrame(frame);frame=0;const stopped=paused||!enabled||reduced.matches;scene.classList.toggle('brand-paused',stopped);pause.setAttribute('aria-pressed',String(stopped));pause.setAttribute('aria-label',stopped?'Play brand animation':'Pause brand animation');pause.disabled=!enabled||reduced.matches;pause.querySelector('use').setAttribute('href','./icons-v2.svg#'+(stopped?'play':'pause'));draw(phase);if(moving())frame=requestAnimationFrame(loop);schedule();}
  function reset(){dragX=0;dragY=0;targetX=0;targetY=0;sync();}
  scene.querySelectorAll('[data-platform-choice]').forEach(button=>button.addEventListener('click',()=>select(button.dataset.platformChoice,true)));
  pause.addEventListener('click',()=>{paused=!paused;sync();});scene.querySelector('.brand-reset').addEventListener('click',reset);
  scene.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'){hovered=true;schedule();}});
  scene.addEventListener('pointerleave',()=>{hovered=false;if(!dragging){targetX=0;targetY=0;}schedule();});
  scene.addEventListener('pointerdown',event=>{if(event.target.closest('.platform-orb,.brand-controls'))return;dragging=true;lastX=event.clientX;lastY=event.clientY;scene.classList.add('dragging');captureTarget=event.target.closest('.meta-button')||scene;captureTarget.setPointerCapture(event.pointerId);});
  scene.addEventListener('pointermove',event=>{
    if(dragging){dragX=clamp(dragX+(event.clientY-lastY)*-.08,10);dragY=clamp(dragY+(event.clientX-lastX)*.08,16);lastX=event.clientX;lastY=event.clientY;}
    else if(event.pointerType==='mouse'){const r=scene.getBoundingClientRect();targetX=-((event.clientY-r.top)/r.height-.5)*12;targetY=((event.clientX-r.left)/r.width-.5)*17;}
    if(!enabled||paused||reduced.matches)draw(phase);
  },{passive:true});
  function release(event){dragging=false;scene.classList.remove('dragging');if(captureTarget&&captureTarget.hasPointerCapture(event.pointerId))captureTarget.releasePointerCapture(event.pointerId);captureTarget=null;}
  scene.addEventListener('pointerup',release);scene.addEventListener('pointercancel',release);
  scene.addEventListener('keydown',event=>{if(event.target.closest('button'))return;if(event.key==='ArrowLeft')dragY=clamp(dragY-4,16);else if(event.key==='ArrowRight')dragY=clamp(dragY+4,16);else if(event.key==='ArrowUp')dragX=clamp(dragX+3,10);else if(event.key==='ArrowDown')dragX=clamp(dragX-3,10);else if(event.key.toLowerCase()==='r'||event.key==='Home'){event.preventDefault();reset();return;}else return;event.preventDefault();sync();});
  scene.addEventListener('focusin',schedule);scene.addEventListener('focusout',()=>setTimeout(schedule,0));
  document.addEventListener('gopal:motion',event=>{enabled=event.detail.enabled;sync();});document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
  new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['class','data-theme']});new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.02}).observe(scene);sync();
})();
