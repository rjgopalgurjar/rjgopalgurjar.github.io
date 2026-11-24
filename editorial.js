'use strict';
(() => {
  const $=(selector,parent=document)=>parent.querySelector(selector);
  const $$=(selector,parent=document)=>Array.from(parent.querySelectorAll(selector));
  const root=document.documentElement;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
  const state={theme:root.dataset.theme||'light',motion:true,track:'hiring',note:'',webKind:'business',focus:'',platform:'meta',inspector:'profile'};
  let motionPreference=true;
  try{motionPreference=localStorage.getItem('gopal-motion')!=='paused';}catch{}
  const canMove=()=>state.motion&&!reduced.matches;
  let toastTimer=0;
  function toast(message){const target=$('#toast');target.textContent=message;target.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>target.classList.remove('show'),3000);}
  async function copy(text,message){
    try{await navigator.clipboard.writeText(text);toast(message);}
    catch{
      const previous=document.activeElement,field=document.createElement('textarea');field.value=text;field.style.cssText='position:fixed;left:-9999px;top:0';($('dialog[open]')||document.body).append(field);field.select();
      const success=document.execCommand('copy');field.remove();previous?.focus({preventScroll:true});toast(success?message:'Copy is unavailable. Please use the email or WhatsApp link.');
    }
  }
  function contact(){return {email:['Gopal1','gurjar'].join('')+'@'+['gmail','com'].join('.'),phone:['91','86900','62046'].join('')};}
  function setIcon(element,name){$('use',element).setAttribute('href','./icons-v2.svg#'+name);}
  function theme(value){state.theme=value;root.dataset.theme=value;const dark=value==='dark',button=$('.theme-toggle');button.setAttribute('aria-pressed',String(dark));button.setAttribute('aria-label',dark?'Switch to light theme':'Switch to dark theme');setIcon(button,dark?'sun':'moon');$('meta[name="theme-color"]').content=dark?'#0e1725':'#f8fafc';try{localStorage.setItem('gopal-theme',value);}catch{}}
  $('.theme-toggle').addEventListener('click',()=>theme(state.theme==='light'?'dark':'light'));

  const menu=$('#mobile-menu'),menuButton=$('.menu-toggle');
  function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open navigation');setIcon(menuButton,'menu');}
  menuButton.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close navigation':'Open navigation');setIcon(menuButton,open?'x':'menu');});
  $$('#mobile-menu a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('pointerdown',event=>{if(!menu.hidden&&!$('.site-header').contains(event.target))closeMenu();});
  matchMedia('(min-width: 960px)').addEventListener('change',event=>{if(event.matches)closeMenu();});

  const filterNames={all:'all skill groups',digital:'web and technology',operations:'accounts and operations',marketing:'marketing and coordination'};
  function filterSkills(value){
    if(!Object.hasOwn(filterNames,value))return;
    $$('[data-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===value)));
    $$('[data-category]').forEach(row=>{row.hidden=value!=='all'&&row.dataset.category!==value;if(!row.hidden){row.classList.remove('will-reveal');row.classList.add('is-revealed');}});
    $('#filter-status').textContent='Showing '+filterNames[value];updateScroll();
  }
  $$('[data-filter]').forEach(button=>button.addEventListener('click',()=>filterSkills(button.dataset.filter)));

  const tracks={
    hiring:{subject:'Professional opportunity',text:'Hi Gopal, I’d like to discuss a professional opportunity in marketing, accounts or operations.'},
    web:{subject:'Web development enquiry',text:'Hi Gopal, I’d like to discuss a web development project.'},
    campaign:{subject:'Digital campaign support',text:'Hi Gopal, I’d like to discuss Google Ads or Meta campaign support and digital communication workflows.'}
  };
  const websiteKinds={
    business:{name:'a business website',description:'A clear home for your business, services and contact details.'},
    landing:{name:'a landing page',description:'A focused page that introduces an offer and guides visitors to a conversation.'},
    portfolio:{name:'a personal portfolio website',description:'A personal website that brings your experience, work and public profile together.'}
  };
  function draft(){
    let text=tracks[state.track].text;
    if(state.track==='web')text='Hi Gopal, I’d like to discuss '+(state.focus==='Shopify'?'a Shopify storefront':websiteKinds[state.webKind].name)+'.';
    if(state.track==='campaign'&&state.focus)text='Hi Gopal, I’d like to discuss '+state.focus+' campaign support.';
    return text+(state.note.trim()?'\n\n'+state.note.trim():'\n\nLet’s connect about the details.');
  }
  ['inline','dialog'].forEach(prefix=>{
    const content=$('#composer-template').content.cloneNode(true),field=$('[data-note]',content);field.id=prefix+'-note';$('[data-note-label]',content).setAttribute('for',field.id);$('#'+prefix+'-composer').append(content);
  });
  function renderComposer(){
    $$('[data-track]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.track===state.track)));
    $$('[data-note]').forEach(field=>{if(field.value!==state.note)field.value=state.note;});
    $$('[data-note-count]').forEach(counter=>counter.textContent=state.note.length+' / 700');
    $$('[data-draft]').forEach(element=>element.textContent=draft());
    const details=contact();
    $$('[data-channel]').forEach(link=>{link.href=link.dataset.channel==='whatsapp'?'https://wa.me/'+details.phone+'?text='+encodeURIComponent(draft()):'mailto:'+details.email+'?subject='+encodeURIComponent(tracks[state.track].subject)+'&body='+encodeURIComponent(draft());});
  }
  $$('[data-track]').forEach(button=>button.addEventListener('click',()=>{state.track=button.dataset.track;state.focus='';renderComposer();}));
  $$('[data-note]').forEach(field=>field.addEventListener('input',()=>{state.note=field.value.slice(0,700);renderComposer();}));
  $$('.composer-form').forEach(form=>form.addEventListener('submit',event=>event.preventDefault()));
  $$('.copy-draft').forEach(button=>button.addEventListener('click',()=>copy(draft(),'Enquiry draft copied')));
  $$('[data-web-kind]').forEach(button=>button.addEventListener('click',()=>{state.webKind=button.dataset.webKind;state.focus='';$$('[data-web-kind]').forEach(control=>control.setAttribute('aria-pressed',String(control===button)));$('#web-kind-detail').textContent=websiteKinds[state.webKind].description;renderComposer();}));
  const details=contact();
  $$('[data-email-label]').forEach(span=>span.textContent=details.email);
  $$('[data-phone-label]').forEach(span=>span.textContent='+91 86900 62046');
  $$('[data-direct="email"]').forEach(link=>link.href='mailto:'+details.email);
  $$('[data-direct="whatsapp"]').forEach(link=>link.href='https://wa.me/'+details.phone);

  function openDialog(dialog){$$('dialog[open]').forEach(item=>item.close());closeMenu();dialog.showModal();root.classList.add('modal-open');}
  function openInquiry(track,focus=''){if(Object.hasOwn(tracks,track))state.track=track;state.focus=focus;renderComposer();openDialog($('#inquiry-dialog'));}
  $$('[data-inquiry]').forEach(button=>button.addEventListener('click',()=>openInquiry(button.dataset.inquiry,button.dataset.focus||'')));
  $$('[data-close]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.close).close()));
  $$('dialog').forEach(dialog=>{
    dialog.addEventListener('close',()=>{if(!$('dialog[open]'))root.classList.remove('modal-open');});
    dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
  });

  const platforms={
    meta:{title:'Meta campaign support',description:'Campaign support, customer communication and connected email workflows.',track:'campaign',focus:'Meta'},
    shopify:{title:'Shopify & storefront experiences',description:'Web development and storefront experiences shaped around what a business needs to communicate.',track:'web',focus:'Shopify'},
    google:{title:'Google Ads',description:'Digital campaign support connected with customer communication and the B2C journey.',track:'campaign',focus:'Google Ads'}
  };
  const art=$('#platform-art'),visualMotion=$('#visual-motion');let playing=false,artX=0,artY=0,dragging=false,lastX=0,lastY=0,pointerFrame=0;
  function paintArt(){pointerFrame=0;art.style.setProperty('--art-rx',artX.toFixed(2)+'deg');art.style.setProperty('--art-ry',artY.toFixed(2)+'deg');}
  function resetArt(){artX=0;artY=0;paintArt();}
  function selectPlatform(value){
    const platform=platforms[value];if(!platform)return;state.platform=value;
    $$('[data-platform]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.platform===value)));
    $$('[data-art]').forEach(item=>item.hidden=item.dataset.art!==value);
    $('#platform-title').textContent=platform.title;$('#platform-description').textContent=platform.description;
    const button=$('#platform-enquiry');button.dataset.inquiry=platform.track;button.dataset.focus=platform.focus;resetArt();
  }
  $$('[data-platform]').forEach(button=>button.addEventListener('click',()=>selectPlatform(button.dataset.platform)));
  function syncVisual(){if(!canMove())playing=false;art.classList.toggle('is-playing',playing&&canMove());visualMotion.disabled=!canMove();visualMotion.setAttribute('aria-pressed',String(playing));visualMotion.setAttribute('aria-label',playing?'Pause platform animation':'Animate platform visual');setIcon(visualMotion,playing?'pause':'play');}
  visualMotion.addEventListener('click',()=>{playing=!playing;syncVisual();});$('#visual-reset').addEventListener('click',()=>{playing=false;syncVisual();resetArt();});
  const clamp=(value,limit)=>Math.max(-limit,Math.min(limit,value));
  art.addEventListener('pointerdown',event=>{if(!canMove())return;dragging=true;lastX=event.clientX;lastY=event.clientY;art.classList.add('dragging');art.setPointerCapture(event.pointerId);if(event.pointerType==='mouse')event.preventDefault();});
  art.addEventListener('pointermove',event=>{
    if(!canMove())return;
    if(dragging){artY=clamp(artY+(event.clientX-lastX)*.13,17);artX=clamp(artX-(event.clientY-lastY)*.1,10);lastX=event.clientX;lastY=event.clientY;}
    else if(event.pointerType==='mouse'&&finePointer.matches){const r=art.getBoundingClientRect();artY=((event.clientX-r.left)/r.width-.5)*12;artX=-((event.clientY-r.top)/r.height-.5)*8;}
    else return;
    if(!pointerFrame)pointerFrame=requestAnimationFrame(paintArt);
  },{passive:true});
  function release(event){dragging=false;art.classList.remove('dragging');if(art.hasPointerCapture(event.pointerId))art.releasePointerCapture(event.pointerId);}
  art.addEventListener('pointerup',release);art.addEventListener('pointercancel',release);art.addEventListener('pointerleave',()=>{if(!dragging)resetArt();});
  art.addEventListener('keydown',event=>{if(!canMove())return;if(event.key==='ArrowLeft')artY=clamp(artY-4,17);else if(event.key==='ArrowRight')artY=clamp(artY+4,17);else if(event.key==='ArrowUp')artX=clamp(artX+3,10);else if(event.key==='ArrowDown')artX=clamp(artX-3,10);else if(event.key.toLowerCase()==='r'||event.key==='Home'){event.preventDefault();resetArt();return;}else return;event.preventDefault();paintArt();});
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{if(!entries[0].isIntersecting&&playing){playing=false;syncVisual();}},{threshold:0}).observe(art);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing){playing=false;syncVisual();}});

  const snippets={
    profile:{caption:'A professional background with a digital direction.',code:'const gopal = {\n  role: "Marketing Executive",\n  base: "Bengaluru, Karnataka",\n  digital: ["Web development", "Practical troubleshooting"],\n  business: ["Marketing", "Accounts", "Operations"],\n  languages: ["Hindi", "English"]\n};'},
    operations:{caption:'Areas of work, illustrated without live business data.',code:'# An operations checklist\nSAP         / portal management\nACCOUNTS    / Tally and purchase review\nDOCUMENTS   / Bills of Entry and taxation details\nINVENTORY   / keeping track\nDISPATCH    / clear coordination\nCUSTOMERS   / the next conversation'},
    powershell:{caption:'An illustrative read-only diagnostic snippet.',code:'# Inspect before choosing a next step.\n$network = Get-NetIPConfiguration\n$dns = Resolve-DnsName "example.com"\n$connection = Test-Connection "example.com" -Count 2\n\n$network | Format-List\n$dns | Select-Object Name, IPAddress\n$connection | Format-Table'}
  };
  const inspectorTabs=$$('[data-inspect]');
  function setInspector(value){if(!Object.hasOwn(snippets,value))return;state.inspector=value;inspectorTabs.forEach(tab=>{const active=tab.dataset.inspect===value;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});$('#inspector-panel').setAttribute('aria-labelledby','tab-'+value);$('#inspector-code').textContent=snippets[value].code;$('#inspector-caption').textContent=snippets[value].caption;}
  inspectorTabs.forEach(tab=>{tab.addEventListener('click',()=>setInspector(tab.dataset.inspect));tab.addEventListener('keydown',event=>{const keys=['ArrowLeft','ArrowRight','Home','End'];if(!keys.includes(event.key))return;event.preventDefault();let i=inspectorTabs.indexOf(tab);i=event.key==='Home'?0:event.key==='End'?inspectorTabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+inspectorTabs.length)%inspectorTabs.length;setInspector(inspectorTabs[i].dataset.inspect);inspectorTabs[i].focus();});});
  $('#copy-code').addEventListener('click',()=>copy(snippets[state.inspector].code,'Snippet copied'));

  function motionChanged(){state.motion=motionPreference&&!reduced.matches;root.classList.toggle('motion-off',!canMove());const button=$('#motion-toggle');button.setAttribute('aria-pressed',String(!canMove()));button.textContent=reduced.matches?'Reduced motion on':canMove()?'Pause motion':'Enable motion';button.disabled=reduced.matches;syncVisual();if(!canMove()){$$('.will-reveal').forEach(item=>{item.classList.remove('will-reveal');item.classList.add('is-revealed');});resetArt();}}
  $('#motion-toggle').addEventListener('click',()=>{motionPreference=!motionPreference;try{localStorage.setItem('gopal-motion',motionPreference?'enabled':'paused');}catch{}motionChanged();});
  reduced.addEventListener('change',motionChanged);

  const commandDialog=$('#command-dialog'),search=$('#command-search');let matching=[],commandIndex=0;
  function jump(id){location.hash=id;const heading=$('h2',document.getElementById(id));if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}
  const commands=[
    {name:'About Gopal',group:'Explore',terms:'person background languages location',action:()=>jump('about')},
    {name:'Explore expertise',group:'Explore',terms:'skills accounts technology marketing',action:()=>jump('expertise')},
    {name:'Digital work',group:'Explore',terms:'website coding shopify google meta',action:()=>jump('projects')},
    {name:'Professional experience',group:'Explore',terms:'career bhansali sanjay rajat',action:()=>jump('experience')},
    {name:'Contact Gopal',group:'Explore',terms:'email whatsapp linkedin',action:()=>jump('contact')},
    {name:'Discuss a professional opportunity',group:'Enquiry',terms:'role hiring job',action:()=>openInquiry('hiring')},
    {name:'Discuss a website',group:'Enquiry',terms:'project freelance development',action:()=>openInquiry('web')},
    {name:'Discuss campaign support',group:'Enquiry',terms:'digital google ads meta',action:()=>openInquiry('campaign')},
    {name:'Copy email address',group:'Action',terms:'contact',action:()=>copy(contact().email,'Email address copied')},
    {name:'Copy WhatsApp number',group:'Action',terms:'phone contact',action:()=>copy('+'+contact().phone,'WhatsApp number copied')},
    {name:'Switch theme',group:'Appearance',terms:'light dark',action:()=>theme(state.theme==='light'?'dark':'light')},
    {name:'Toggle motion',group:'Appearance',terms:'pause animation reduced',action:()=>{if(!reduced.matches){motionPreference=!motionPreference;motionChanged();}}}
  ];
  function selectCommand(index){const options=$$('.command-option');if(!options.length){search.removeAttribute('aria-activedescendant');return;}commandIndex=(index+options.length)%options.length;options.forEach((option,i)=>option.setAttribute('aria-selected',String(i===commandIndex)));const option=options[commandIndex];search.setAttribute('aria-activedescendant',option.id);const list=$('#command-results'),top=option.offsetTop-list.offsetTop;if(top<list.scrollTop)list.scrollTop=top;else if(top+option.offsetHeight>list.scrollTop+list.clientHeight)list.scrollTop=top+option.offsetHeight-list.clientHeight;}
  function runCommand(index){const command=matching[index];if(!command)return;commandDialog.close();command.action();}
  function renderCommands(){const query=search.value.trim().toLowerCase();matching=commands.filter(command=>(command.name+' '+command.terms+' '+command.group).toLowerCase().includes(query));const list=$('#command-results');list.replaceChildren();matching.forEach((command,i)=>{const button=document.createElement('button');button.type='button';button.className='command-option';button.id='command-option-'+i;button.setAttribute('role','option');button.setAttribute('tabindex','-1');const name=document.createElement('span'),group=document.createElement('small');name.textContent=command.name;group.textContent=command.group;button.append(name,group);button.addEventListener('click',()=>runCommand(i));button.addEventListener('pointermove',()=>selectCommand(i));list.append(button);});if(!matching.length){const empty=document.createElement('p');empty.className='command-empty';empty.textContent='No matching action. Try a section name.';list.append(empty);}selectCommand(0);}
  function openCommands(){search.value='';renderCommands();openDialog(commandDialog);search.focus();}
  $('.command-trigger').addEventListener('click',openCommands);search.addEventListener('input',renderCommands);
  search.addEventListener('keydown',event=>{if(event.key==='ArrowDown'){event.preventDefault();selectCommand(commandIndex+1);}else if(event.key==='ArrowUp'){event.preventDefault();selectCommand(commandIndex-1);}else if(event.key==='Enter'){event.preventDefault();runCommand(commandIndex);}});
  document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();if(commandDialog.open)commandDialog.close();else openCommands();}if(event.key==='Escape')closeMenu();});

  let scrollFrame=0;
  function updateScroll(){scrollFrame=0;const range=root.scrollHeight-innerHeight;$('.reading-progress').style.transform='scaleX('+(range>0?Math.min(1,scrollY/range):0)+')';let active='';$$('main>section[id]').forEach(section=>{if(section.getBoundingClientRect().top<Math.max(170,innerHeight*.28))active=section.id;});$$('.desktop-nav a,#mobile-menu a').forEach(link=>{if(link.hash==='#'+active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}
  addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScroll);},{passive:true});addEventListener('resize',updateScroll,{passive:true});
  $$('.career-entry').forEach(entry=>entry.addEventListener('toggle',updateScroll));
  if('ResizeObserver' in window)new ResizeObserver(updateScroll).observe(document.body);

  theme(state.theme);motionChanged();renderComposer();setInspector('profile');selectPlatform('meta');updateScroll();
  if(canMove()&&'IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('will-reveal');entry.target.classList.add('is-revealed');observer.unobserve(entry.target);}});},{threshold:.06});$$('.reveal').forEach(element=>{if(element.getBoundingClientRect().top>innerHeight*.95){element.classList.add('will-reveal');observer.observe(element);}});}
})();
