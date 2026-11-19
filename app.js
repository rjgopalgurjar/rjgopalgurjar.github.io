'use strict';
(() => {
  document.documentElement.classList.add('js');
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reducedMotion.matches;
  let focus = 'business';
  let stage = 0;
  const modes = {
    business: {color:'#397e83', rgb:[28,116,204], summary:'Customer coordination · Sales · Meta campaigns', steps:[['Start with the requirement.','Understand the customer’s requirements and keep communication clear.'],['Keep the conversation moving.','Coordinate customer communication, sales conversations and everyday email workflows.'],['Connect the next steps.','Support daily operations and stay in touch as requirements move forward.']]},
    operations: {color:'#648c59', rgb:[36,127,168], summary:'Tally Expert · Accounts · SAP portals · Dispatch', steps:[['Check the details.','Review purchase requirements and the supporting import and domestic documentation.'],['Connect the moving parts.','Work across Tally, accounts, SAP portals, inventory and dispatch coordination.'],['Follow the paperwork through.','Check Bills of Entry and taxation details as part of import and customs document review.']]},
    digital: {color:'#8874a8', rgb:[99,99,185], summary:'Web development · Coding · CMD & PowerShell', steps:[['Find the useful solution.','Understand what a website, digital workflow or technical issue needs to achieve.'],['Build and troubleshoot.','Bring together web development, coding and practical computer troubleshooting.'],['Keep it working.','Support websites and email workflows, and troubleshoot using CMD and PowerShell.']]}
  };
  function showStage(index) {
    stage = index;
    const current = modes[focus].steps[stage];
    $('#step-title').textContent = current[0];
    $('#step-description').textContent = current[1];
    $('.workflow').dataset.stage = String(stage);
    $$('[data-step]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.step) === stage)));
  }
  function setFocus(mode) {
    if (!modes[mode]) return;
    focus = mode;
    document.documentElement.style.setProperty('--accent', modes[mode].color);
    $('#hero-focus').textContent = modes[mode].summary;
    $$('[data-focus]').forEach(button => {
      const active = button.dataset.focus === mode;
      if (button.getAttribute('role') === 'tab') {
        button.setAttribute('aria-selected', String(active));
        button.tabIndex = active ? 0 : -1;
      } else button.setAttribute('aria-pressed', String(active));
    });
    $$('.work-panel').forEach(panel => {
      panel.hidden = panel.id !== `panel-${mode}`;
      if(!panel.hidden&&!paused) panel.animate([{opacity:.25,transform:'translateY(7px)'},{opacity:1,transform:'none'}],{duration:260,easing:'cubic-bezier(.2,.7,.2,1)'});
    });
    showStage(0);
    particleScene?.draw();
  }
  let particleScene = null;
  $$('[data-focus]').forEach(button => button.addEventListener('click', () => setFocus(button.dataset.focus)));
  const tabs = $$('.work-tabs [role=tab]');
  tabs.forEach((button,index) => button.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    setFocus(tabs[next].dataset.focus);
    tabs[next].focus();
  }));
  $$('[data-step]').forEach(button => button.addEventListener('click', () => showStage(Number(button.dataset.step))));
  setFocus('business');

  const menu = $('#mobile-menu');
  const menuButton = $('.menu-toggle');
  function closeMenu() { menu.hidden = true; menuButton.setAttribute('aria-expanded','false'); menuButton.setAttribute('aria-label','Open menu'); }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  $$('#mobile-menu a').forEach(link => link.addEventListener('click',closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.hidden) { closeMenu(); menuButton.focus(); } });
  matchMedia('(min-width: 601px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in-view'); revealObserver.unobserve(entry.target); } }), {threshold:.06});
    reveals.forEach(element => revealObserver.observe(element));
      const contactVisibility = new Map();
      const contactObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => contactVisibility.set(entry.target,entry.isIntersecting));
        document.documentElement.classList.toggle('contact-in-view',[...contactVisibility.values()].some(Boolean));
      });
      contactObserver.observe($('#contact'));contactObserver.observe($('.footer'));
      const navigationObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) $$('.desktop-nav a').forEach(link => link.classList.toggle('active',link.hash === `#${entry.target.id}`));
    }), {rootMargin:'-20% 0px -55% 0px'});
    $$('section[id]').forEach(section => navigationObserver.observe(section));
  } else reveals.forEach(element => element.classList.add('in-view'));
  let scrollPending = false;
  function updateProgress() {
    const total = document.documentElement.scrollHeight - innerHeight;
    $('.reading-progress').style.transform = `scaleX(${total > 0 ? scrollY / total : 0})`;
    scrollPending = false;
  }
  addEventListener('scroll', () => { if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateProgress); } }, {passive:true});
  updateProgress();

  let toastTimer;
  function toast(message) {
    $('#toast').textContent = message;
    $('#toast').classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('#toast').classList.remove('visible'),3200);
  }
  $('.copy-email').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText('Gopal1gurjar@gmail.com'); toast('Email address copied'); }
    catch { toast('Email: Gopal1gurjar@gmail.com'); }
  });
  const dialog = $('#project-dialog');
  let dialogTrigger;
  function updateDraft() {
    const selected = $('#project-service').value;
    const note = $('#project-note').value.trim();
    const topic = selected === 'Meta campaign support' ? 'Meta campaign support' : 'a web development project';
    const message = `Hi Gopal, I’d like to discuss ${topic}.${note ? `\n\n${note}` : ' Let’s connect about the details.'}`;
    $('#draft-text').textContent = message;
    $('#project-whatsapp').href = `https://wa.me/918690062046?text=${encodeURIComponent(message)}`;
    $('#project-email').href = `mailto:Gopal1gurjar@gmail.com?subject=${encodeURIComponent(selected)}&body=${encodeURIComponent(message)}`;
  }
  $$('[data-project-service]').forEach(button => button.addEventListener('click', () => {
    dialogTrigger = button;
    $('#project-service').value = button.dataset.projectService;
    updateDraft();
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }));
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => { document.body.classList.remove('dialog-open'); dialogTrigger?.focus({preventScroll:true}); });
  $('#project-form').addEventListener('submit', event => event.preventDefault());
  $('#project-service').addEventListener('change',updateDraft);
  $('#project-note').addEventListener('input',updateDraft);
  updateDraft();

  function createParticleScene() {
    const canvas=$('#particle-field'),ctx=canvas.getContext('2d',{alpha:true});
    if(!ctx)return null;
    const holder=$('.particle-stage');
    let width=0,height=0,small=false,time=0,previous=0,frame=0,visible=true;
    let pointerX=0,pointerY=0,mouseX=0,mouseY=0;
    let yaw=0,pitch=0,targetYaw=0,targetPitch=0,drag=null,hover=false;
    let cursorX=-1000,cursorY=-1000,energy=0;
    let seed=37;
    const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
    const points=Array.from({length:2200},()=>({lat:random()*Math.PI*2,phi:random()*Math.PI*2,spread:random()*.14,size:.3+Math.pow(random(),4)*1.45,alpha:.35+random()*.5}));
    const dust=Array.from({length:44},()=>({x:random(),y:random(),r:random()*.55+.2,a:random()*.15+.05}));
    function draw(){
      if(!width||!height)return;
      ctx.clearRect(0,0,width,height);
      const rgb=modes[focus].rgb;
      const centerX=width*.5,centerY=height*(small?.64:.47);
      const scale=Math.min(height*(small?.18:.255),width*.205);
      const spin=Math.sin(time*.15)*.17+pointerX*1.2+yaw,tilt=.1+Math.sin(time*.11)*.05+pointerY*.9+pitch;
      const cosR=Math.cos(spin),sinR=Math.sin(spin),cosT=Math.cos(tilt),sinT=Math.sin(tilt);
      function project(lat,phi,spread=0){
        const dx=1.7*Math.cos(phi),dy=1.9*Math.cos(2*phi),length=Math.hypot(dx,dy);
        const radius=.115+spread*.34;
        const pulse=1+.018*Math.sin(time*.3+phi*2);
        const px=1.7*Math.sin(phi)*pulse-dy/length*Math.cos(lat)*radius;
        const py=.95*Math.sin(2*phi)*pulse+dx/length*Math.cos(lat)*radius;
        const pz=.42*Math.cos(phi)+Math.sin(lat)*radius;
        const x=px*cosR+pz*sinR,z=-px*sinR+pz*cosR;
        const y=py*cosT-z*sinT,depth=py*sinT+z*cosT;
        const angle=-.06+Math.sin(time*.1)*.025;
        const xx=x*Math.cos(angle)-y*Math.sin(angle),yy=x*Math.sin(angle)+y*Math.cos(angle);
        const perspective=6/(6+depth);
        return{x:centerX+xx*scale*perspective,y:centerY+yy*scale*perspective,z:depth,p:perspective};
      }
      const glow=ctx.createRadialGradient(centerX-scale*.3,centerY-scale*.2,0,centerX,centerY,scale*1.9);
      glow.addColorStop(0,'rgba('+rgb.join(',')+',.085)');glow.addColorStop(.65,'rgba('+rgb.join(',')+',.035)');glow.addColorStop(1,'transparent');
      ctx.fillStyle=glow;ctx.fillRect(centerX-scale*2,centerY-scale*2,scale*4,scale*4);
      dust.forEach(p=>{ctx.beginPath();ctx.fillStyle='rgba(91,128,104,'+p.a+')';ctx.arc(p.x*width,p.y*height,p.r,0,Math.PI*2);ctx.fill();});
      const bands=small?3:4,divisions=small?60:80,segments=[];
      for(let band=0;band<bands;band++){
        const lat=band/bands*Math.PI*2;
        for(let i=0;i<divisions;i++){
          const a=project(lat,i/divisions*Math.PI*2),b=project(lat,(i+1)/divisions*Math.PI*2);
          segments.push({a,b,z:(a.z+b.z)/2,band});
        }
      }
      segments.sort((a,b)=>b.z-a.z);
      segments.forEach(({a,b,z,band})=>{
        const front=Math.max(0,Math.min(1,(1.5-z)/3));
        const alpha=.035+Math.pow(front,1.7)*.13;
        const shade=band%4===0?rgb.map(v=>Math.min(235,v+24)):rgb;
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineCap='round';
        ctx.lineWidth=.6+front*.5;
        ctx.strokeStyle='rgba('+shade.join(',')+','+alpha+')';ctx.stroke();
      });
      const count=small?1050:points.length;
      for(let i=0;i<count;i++){
        const p=points[i],position=project(p.lat,p.phi,p.spread);
        let px=position.x,py=position.y;
        if(hover&&!paused){
          const dx=px-cursorX,dy=py-cursorY,distance=Math.hypot(dx,dy),radius=Math.min(125,width*.22);
          if(distance<radius){const force=Math.pow(1-distance/radius,2)*(22+energy*34);px+=dx/(distance||1)*force;py+=dy/(distance||1)*force;}
        }
        const alpha=Math.min(.95,p.alpha*(.7+Math.max(0,(1.7-position.z)/3.2)*.65));
        ctx.beginPath();ctx.fillStyle='rgba('+rgb.join(',')+','+alpha+')';ctx.arc(px,py,p.size*position.p,0,Math.PI*2);ctx.fill();
      }
      canvas.dataset.motion=paused?'paused':'running';
      canvas.dataset.rotation=yaw.toFixed(2);
      canvas.dataset.interaction=drag?'dragging':hover?'hover':'idle';
    }
    function tick(stamp){
      frame=0;
      if(paused||!visible||document.hidden)return;
      if(stamp-previous>=(small?42:32)){
        time+=Math.min((stamp-previous)/1000,.06);pointerX+=(mouseX-pointerX)*.12;pointerY+=(mouseY-pointerY)*.12;
        yaw+=(targetYaw-yaw)*.13;pitch+=(targetPitch-pitch)*.13;energy*=.92;
        previous=stamp;draw();
      }
      frame=requestAnimationFrame(tick);
    }
    function resume(){cancelAnimationFrame(frame);frame=0;previous=performance.now();draw();if(!paused&&visible&&!document.hidden)frame=requestAnimationFrame(tick);}
    function resize(){
      const rect=holder.getBoundingClientRect();width=rect.width;height=rect.height;small=width<=600;
      const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);resume();
    }
    function locate(event){const rect=holder.getBoundingClientRect();cursorX=event.clientX-rect.left;cursorY=event.clientY-rect.top;hover=cursorX>=0&&cursorX<=width&&cursorY>=0&&cursorY<=height;}
    $('.hero').addEventListener('pointermove',event=>{
      if(drag||event.pointerType!=='mouse'||paused)return;
      locate(event);mouseX=Math.max(-.65,Math.min(.65,(cursorX/width-.5)*2));mouseY=Math.max(-.6,Math.min(.6,(cursorY/height-.5)*1.5));
    },{passive:true});
    $('.hero').addEventListener('pointerleave',()=>{if(drag)return;mouseX=0;mouseY=0;hover=false;});
    holder.addEventListener('pointerdown',event=>{
      if(event.target.closest('button,a')||event.button>0)return;
      locate(event);drag={id:event.pointerId,x:event.clientX,y:event.clientY,yaw:targetYaw,pitch:targetPitch,moved:false};
      holder.setPointerCapture(event.pointerId);holder.classList.add('is-dragging');
      canvas.dataset.interaction='dragging';
    });
    holder.addEventListener('pointermove',event=>{
      if(!drag||event.pointerId!==drag.id)return;
      locate(event);const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
      targetYaw=drag.yaw+dx*.012;targetPitch=Math.max(-1.1,Math.min(1.1,drag.pitch+dy*.007));
      drag.moved=drag.moved||Math.hypot(dx,dy)>5;mouseX=0;mouseY=0;
      if(paused){yaw=targetYaw;pitch=targetPitch;draw();}
    },{passive:true});
    function endDrag(event){
      if(!drag||event.pointerId!==drag.id)return;
      if(!drag.moved&&event.type==='pointerup'){targetYaw+=Math.PI/5;energy=1;}
      if(holder.hasPointerCapture(event.pointerId))holder.releasePointerCapture(event.pointerId);
      drag=null;holder.classList.remove('is-dragging');
      if(paused){yaw=targetYaw;pitch=targetPitch;draw();}else resume();
    }
    holder.addEventListener('pointerup',endDrag);holder.addEventListener('pointercancel',endDrag);
    function rotate(){targetYaw+=Math.PI/4;if(paused){yaw=targetYaw;draw();}else resume();}
    function reset(){targetYaw=0;targetPitch=0;mouseX=0;mouseY=0;hover=false;if(paused){yaw=0;pitch=0;pointerX=0;pointerY=0;draw();}else resume();}
    $('.scene-rotate').addEventListener('click',rotate);$('.scene-reset').addEventListener('click',reset);
    new ResizeObserver(resize).observe(holder);
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;resume();}).observe(holder);
    document.addEventListener('visibilitychange',resume);resize();
    return{draw,resume};
  }
  particleScene=createParticleScene();
  const motionButton=$('.motion-toggle');
  function updateMotion() {
    motionButton.setAttribute('aria-pressed',String(paused));
    motionButton.setAttribute('aria-label',paused?'Play animation':'Pause animation');
    motionButton.title=paused?'Play animation':'Pause animation';
    motionButton.innerHTML=paused?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m9 6 9 6-9 6Z"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M9 6v12M15 6v12"/></svg>';
    document.documentElement.classList.toggle('motion-paused',paused);
    particleScene?.resume();
  }
  motionButton.addEventListener('click',()=>{paused=!paused;updateMotion();});
  reducedMotion.addEventListener('change',event=>{paused=event.matches;updateMotion();});
  updateMotion();

  // Pointer polish stays local to the element and leaves normal touch scrolling intact.
  const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
  $$('.workbench,.contact-method,.about-portrait,.career-entry').forEach(element=>{
    let frame=0,lastEvent;
    element.addEventListener('pointermove',event=>{
      if(!finePointer.matches||paused||event.pointerType!=='mouse')return;
      lastEvent=event;if(frame)return;
      frame=requestAnimationFrame(()=>{
        frame=0;const rect=element.getBoundingClientRect(),x=lastEvent.clientX-rect.left,y=lastEvent.clientY-rect.top;
        element.style.setProperty('--pointer-x',x+'px');element.style.setProperty('--pointer-y',y+'px');
        element.style.setProperty('--tilt-x',((.5-y/rect.height)*5).toFixed(2)+'deg');element.style.setProperty('--tilt-y',((x/rect.width-.5)*6).toFixed(2)+'deg');
        element.classList.add('pointer-active');
      });
    },{passive:true});
    element.addEventListener('pointerleave',()=>{cancelAnimationFrame(frame);frame=0;element.classList.remove('pointer-active');element.style.setProperty('--tilt-x','0deg');element.style.setProperty('--tilt-y','0deg');});
  });
  $$('.career-entry').forEach(entry=>entry.addEventListener('toggle',()=>{
    if(entry.open&&!paused)entry.querySelector('.career-body').animate([{opacity:0,transform:'translateY(-5px)'},{opacity:1,transform:'none'}],{duration:240,easing:'ease-out'});
  }));
})();
