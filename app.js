'use strict';
(() => {
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const state = { theme: root.dataset.theme || 'light', filter: 'all', inspector: 'profile', track: 'hiring', note: '', motion: !reduced.matches, webKind: 'business', campaignGoal: 'enquiries' };
  const canMove = () => state.motion && !reduced.matches;
  let toastTimer = 0;
  let refreshTimer = 0;

  function toast(message) {
    const element = $('#toast');
    element.textContent = message;
    element.classList.add('show');
    $$('[data-feedback]').forEach(item => { item.textContent = message; });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove('show'), 3200);
  }

  async function copy(text, message) {
    try {
      await navigator.clipboard.writeText(text);
      toast(message);
    } catch {
      const field = document.createElement('textarea');
      const previous = document.activeElement;
      field.value = text;
      field.style.cssText = 'position:fixed;left:-9999px;top:0';
      const host = $('dialog[open]') || document.body;
      host.append(field);
      field.select();
      const copied = document.execCommand('copy');
      field.remove();
      if (previous && previous.focus) previous.focus({ preventScroll: true });
      toast(copied ? message : 'Copy is unavailable. Please select the text or use a contact button.');
    }
  }

  function contact() {
    return {
      email: ['Gopal1', 'gurjar'].join('') + '@' + ['gmail', 'com'].join('.'),
      phone: ['91', '86900', '62046'].join('')
    };
  }

  function icon(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', './icons-v2.svg#' + name);
    svg.append(use);
    return svg;
  }

  function refreshScroll() {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      if (window.ScrollTrigger) ScrollTrigger.refresh();
      updateScroll();
    }, 120);
  }

  const menu = $('#mobile-menu');
  const menuButton = $('.menu-toggle');
  function closeMenu() {
    menu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    $('use', menuButton).setAttribute('href', './icons-v2.svg#menu');
  }
  menuButton.addEventListener('click', () => {
    const opening = menu.hidden;
    menu.hidden = !opening;
    menuButton.setAttribute('aria-expanded', String(opening));
    menuButton.setAttribute('aria-label', opening ? 'Close navigation' : 'Open navigation');
    $('use', menuButton).setAttribute('href', './icons-v2.svg#' + (opening ? 'x' : 'menu'));
  });
  $$('#mobile-menu a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('pointerdown', event => {
    if (!menu.hidden && !$('.site-header').contains(event.target)) closeMenu();
  });
  matchMedia('(min-width: 768px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  function theme(value) {
    state.theme = value;
    root.dataset.theme = value;
    const dark = value === 'dark';
    $('.theme-toggle').setAttribute('aria-pressed', String(dark));
    $('.theme-toggle').setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    $('.theme-toggle use').setAttribute('href', './icons-v2.svg#' + (dark ? 'sun' : 'moon'));
    $('meta[name="theme-color"]').content = dark ? '#090f1b' : '#f8fafc';
    try { localStorage.setItem('gopal-theme', value); } catch {}
    drawCanvas(0);
  }
  $('.theme-toggle').addEventListener('click', () => theme(state.theme === 'light' ? 'dark' : 'light'));

  const filterLabels = { all: 'all capabilities', digital: 'digital and coding', operations: 'accounts and operations', marketing: 'marketing and sales' };
  function setFilter(value) {
    if (!Object.hasOwn(filterLabels, value)) return;
    const cards = $$('.capability');
    const before = new Map(cards.filter(card => !card.hidden).map(card => [card, card.getBoundingClientRect()]));
    state.filter = value;
    $$('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === value)));
    $('.capability-grid').dataset.filtered = String(value !== 'all');
    cards.forEach(card => {
      card.hidden = value !== 'all' && card.dataset.category !== value;
      if (!card.hidden) {
        card.style.opacity = '1';
        card.style.setProperty('--reveal-y', '0px');
        if (canMove()) {
          const next = card.getBoundingClientRect();
          const previous = before.get(card);
          card.animate([
            { translate: previous ? (previous.left - next.left) + 'px ' + (previous.top - next.top) + 'px' : '0px 12px', opacity: previous ? .72 : 0 },
            { translate: '0px 0px', opacity: 1 }
          ], { duration: 380, easing: 'cubic-bezier(.2,.7,.2,1)' });
        }
      }
    });
    $('#filter-status').textContent = 'Showing ' + filterLabels[value];
    refreshScroll();
  }
  $$('[data-filter]').forEach(button => button.addEventListener('click', () => setFilter(button.dataset.filter)));

  const snippets = {
    profile: {
      filename: 'gopal.profile.ts', language: 'TypeScript', caption: 'The person behind the work',
      code: 'const gopal = {\n  name: "Gopal Gurjar",\n  role: "Marketing Executive",\n  base: "Bengaluru, India",\n  languages: ["Hindi", "English"],\n  digital: ["Web Development", "Coding"],\n  operations: ["SAP", "Tally", "Supply Chain"],\n  mindset: "Practical. Curious. Connected."\n};'
    },
    operations: {
      filename: 'erp_logistics.log', language: 'Work context', caption: 'Areas of work · No live business data',
      code: '# A connected operations checklist\nSAP         / portal management\nACCOUNTS    / Tally & purchase review\nDOCUMENTS   / Bills of Entry\nTAXATION    / checking the details\nINVENTORY   / keeping track\nDISPATCH    / clear coordination\nCUSTOMERS   / the next conversation\n# People, process and follow-through.'
    },
    automation: {
      filename: 'automate.ps1', language: 'PowerShell', caption: 'Illustrative read-only diagnostic snippet',
      code: '# Start with the basics. Inspect first.\n$network = Get-NetIPConfiguration\n$dns = Resolve-DnsName "example.com"\n$connection = Test-Connection "example.com" -Count 2\n\n# Review the result before the next step.\n$network | Format-List\n$dns | Select-Object Name, IPAddress\n$connection | Format-Table'
    }
  };
  const inspector = $('.inspector');
  const inspectorTabs = $$('[data-inspect]');
  const inspectorOrder = ['profile', 'operations', 'automation'];
  let inspectorTimer = 0;
  let inspectorVisible = false;
  let inspectorHovered = false;
  let inspectorPaused = false;

  function highlightCode(code) {
    const lines = document.createElement('ol');
    lines.className = 'code-lines';
    code.split('\n').forEach(line => {
      const li = document.createElement('li');
      const content = document.createElement('span');
      const tokens = line.split(/("[^"]*"|'[^']*'|#[^\n]*|\bconst\b|\$[a-zA-Z]+|\b[a-zA-Z_]+(?=:))/g);
      tokens.forEach(part => {
        if (!part) return;
        let category = '';
        if (/^["']/.test(part)) category = 'string';
        else if (/^#/.test(part)) category = 'comment';
        else if (part === 'const') category = 'keyword';
        else if (/^\$/.test(part) || /^\w+$/.test(part)) category = 'property';
        if (category) {
          const token = document.createElement('span');
          token.className = 'token-' + category;
          token.textContent = part;
          content.append(token);
        } else content.append(document.createTextNode(part));
      });
      if (!line) content.append(document.createTextNode(' '));
      li.append(content);
      lines.append(li);
    });
    $('#inspector-code').replaceChildren(lines);
  }

  function scheduleInspector() {
    clearTimeout(inspectorTimer);
    inspector.classList.remove('auto-running');
    if (!canMove() || inspectorPaused || !inspectorVisible || inspectorHovered || document.hidden || inspector.contains(document.activeElement)) return;
    void inspector.offsetWidth;
    inspector.classList.add('auto-running');
    inspectorTimer = setTimeout(() => {
      setInspector(inspectorOrder[(inspectorOrder.indexOf(state.inspector) + 1) % inspectorOrder.length]);
    }, 5000);
  }
  function setInspector(value) {
    if (!Object.hasOwn(snippets, value)) return;
    state.inspector = value;
    inspectorTabs.forEach(tab => {
      const active = tab.dataset.inspect === value;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    const item = snippets[value];
    $('#inspector-panel').setAttribute('aria-labelledby', 'inspect-' + value);
    $('#inspector-filename').textContent = item.filename;
    $('#inspector-language').textContent = item.language;
    $('#inspector-caption').textContent = item.caption;
    highlightCode(item.code);
    if (canMove()) $('#inspector-code').animate([{ opacity: .25, translate: '0 4px' }, { opacity: 1, translate: '0 0' }], { duration: 250, easing: 'ease-out' });
    scheduleInspector();
  }
  function keyboardTabs(tabs, keyName, apply) {
    tabs.forEach((tab, index) => tab.addEventListener('keydown', event => {
      let next = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      apply(tabs[next].dataset[keyName]);
      tabs[next].focus();
    }));
  }
  inspectorTabs.forEach(tab => tab.addEventListener('click', () => setInspector(tab.dataset.inspect)));
  keyboardTabs(inspectorTabs, 'inspect', setInspector);
  inspector.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { inspectorHovered = true; scheduleInspector(); } });
  inspector.addEventListener('pointerleave', event => { if (event.pointerType === 'mouse') { inspectorHovered = false; scheduleInspector(); } });
  inspector.addEventListener('focusin', scheduleInspector);
  inspector.addEventListener('focusout', () => setTimeout(scheduleInspector, 0));
  $('.sequence-toggle').addEventListener('click', () => {
    inspectorPaused = !inspectorPaused;
    updateSequenceControl();
    scheduleInspector();
  });
  function updateSequenceControl() {
    const paused = inspectorPaused || !canMove();
    const button = $('.sequence-toggle');
    button.disabled = !canMove();
    button.setAttribute('aria-pressed', String(paused));
    button.setAttribute('aria-label', paused ? 'Play inspector sequence' : 'Pause inspector sequence');
    $('use', button).setAttribute('href', './icons-v2.svg#' + (paused ? 'play' : 'pause'));
  }
  $('.copy-code').addEventListener('click', () => copy(snippets[state.inspector].code, 'Snippet copied'));

  function preview(value) {
    $$('[data-preview]').forEach(tab => {
      const active = tab.dataset.preview === value;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      $('#preview-panel-' + tab.dataset.preview).hidden = !active;
    });
    if (canMove()) $('#preview-panel-' + value).animate([{ opacity: .2 }, { opacity: 1 }], { duration: 240 });
  }
  $$('[data-preview]').forEach(tab => tab.addEventListener('click', () => preview(tab.dataset.preview)));
  keyboardTabs($$('[data-preview]'), 'preview', preview);

  const tracks = {
    hiring: { subject: 'Professional opportunity', text: 'Hi Gopal, I’d like to discuss a full-time role or professional opportunity in marketing, accounts or operations.' },
    web: { subject: 'Web development project', text: 'Hi Gopal, I’d like to discuss a web development project for my business or personal brand.' },
    campaign: { subject: 'Meta campaign and digital support', text: 'Hi Gopal, I’d like to discuss Meta campaign support and digital communication workflows.' }
  };
  const draft = () => {
    let text = tracks[state.track].text;
    if (state.track === 'web') text = 'Hi Gopal, I’d like to discuss ' + ({ business: 'a business website', landing: 'a landing page', portfolio: 'a personal portfolio website' }[state.webKind]) + '.';
    if (state.track === 'campaign') text = 'Hi Gopal, I’d like to discuss Meta campaign and digital support focused on ' + ({ enquiries: 'customer enquiries', presence: 'brand presence', workflow: 'communication workflows' }[state.campaignGoal]) + '.';
    return text + (state.note.trim() ? '\n\n' + state.note.trim() : '\n\nLet’s connect about the details.');
  };
  ['inline', 'dialog'].forEach(prefix => {
    const content = $('#composer-template').content.cloneNode(true);
    const field = $('[data-note]', content);
    field.id = prefix + '-note';
    $('[data-note-label]', content).setAttribute('for', field.id);
    const feedback = document.createElement('span');
    feedback.className = 'sr-only';
    feedback.dataset.feedback = '';
    feedback.setAttribute('role', 'status');
    $('.composer-form', content).append(feedback);
    $('#' + prefix + '-composer').append(content);
  });

  function renderComposer() {
    $$('[data-feedback]').forEach(item => { item.textContent = ''; });
    $$('[data-track]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.track === state.track)));
    $$('[data-note]').forEach(field => {
      if (field.value !== state.note) field.value = state.note;
    });
    $$('.character-count').forEach(counter => { counter.textContent = state.note.length + ' / 700'; });
    $$('[data-draft]').forEach(element => { element.textContent = draft(); });
    $$('[data-composer-step="choose"]').forEach(element => element.classList.add('active'));
    $$('[data-composer-step="describe"]').forEach(element => element.classList.toggle('active', Boolean(state.note.trim())));
    $$('[data-composer-step="connect"]').forEach(element => element.classList.remove('active'));
  }
  $$('[data-track]').forEach(button => button.addEventListener('click', () => {
    state.track = button.dataset.track;
    renderComposer();
  }));
  $$('[data-note]').forEach(field => field.addEventListener('input', () => {
    state.note = field.value.slice(0, 700);
    renderComposer();
  }));
  $$('.composer-form').forEach(form => form.addEventListener('submit', event => event.preventDefault()));
  $$('[data-channel]').forEach(link => link.addEventListener('click', () => {
    const details = contact();
    if (link.dataset.channel === 'whatsapp') link.href = 'https://wa.me/' + details.phone + '?text=' + encodeURIComponent(draft());
    else link.href = 'mailto:' + details.email + '?subject=' + encodeURIComponent(tracks[state.track].subject) + '&body=' + encodeURIComponent(draft());
    $$('[data-composer-step="connect"]').forEach(element => element.classList.add('active'));
  }));
  $$('.copy-message').forEach(button => button.addEventListener('click', () => copy(draft(), 'Your message is copied')));
  $$('[data-copy-contact]').forEach(button => button.addEventListener('click', () => {
    const details = contact();
    const email = button.dataset.copyContact === 'email';
    copy(email ? details.email : '+' + details.phone, email ? 'Email address copied' : 'WhatsApp number copied');
  }));

  function openDialog(element) {
    $$('dialog[open]').forEach(dialog => dialog.close());
    closeMenu();
    element.showModal();
    root.classList.add('modal-open');
    scheduleInspector();
    syncCanvas();
  }
  function openInquiry(track) {
    if (Object.hasOwn(tracks, track)) state.track = track;
    renderComposer();
    openDialog($('#inquiry-dialog'));
  }
  $$('[data-inquiry]').forEach(button => button.addEventListener('click', () => openInquiry(button.dataset.inquiry)));
  $$('[data-close]').forEach(button => button.addEventListener('click', () => $('#' + button.dataset.close).close()));
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('close', () => {
      if (!$('dialog[open]')) root.classList.remove('modal-open');
      scheduleInspector();
      syncCanvas();
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  });

  const commandDialog = $('#command-dialog');
  const commandSearch = $('#command-search');
  let currentCommands = [];
  let commandIndex = 0;
  function navigate(id) {
    const section = document.getElementById(id);
    if (!section) return;
    location.hash = id;
    const heading = $('h2', section);
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  }
  const commands = [
    { id: 'expertise', group: 'Explore', name: 'Explore expertise', keywords: 'skills capabilities', glyph: 'layers', action: () => navigate('expertise') },
    { id: 'projects', group: 'Explore', name: 'Projects & capabilities', keywords: 'work website build', glyph: 'code-xml', action: () => navigate('projects') },
    { id: 'experience', group: 'Explore', name: 'Chemical industry experience', keywords: 'career jobs bhansali accounts', glyph: 'briefcase-business', action: () => navigate('experience') },
    { id: 'about', group: 'Explore', name: 'About Gopal', keywords: 'person location languages rajasthan bengaluru', glyph: 'map-pin', action: () => navigate('about') },
    { id: 'contact', group: 'Explore', name: 'Contact & enquiry builder', keywords: 'email whatsapp connect', glyph: 'mail', action: () => navigate('contact') },
    { id: 'hiring', group: 'Start a conversation', name: 'Discuss a role or hiring enquiry', keywords: 'jobs full time accounts marketing', glyph: 'briefcase-business', action: () => openInquiry('hiring') },
    { id: 'web', group: 'Start a conversation', name: 'Scope a web development project', keywords: 'freelance website coding development', glyph: 'code-xml', action: () => openInquiry('web') },
    { id: 'campaign', group: 'Start a conversation', name: 'Discuss Meta campaign support', keywords: 'ads digital marketing', glyph: 'megaphone', action: () => openInquiry('campaign') },
    { id: 'filter-digital', group: 'Quick actions', name: 'Filter digital & coding capabilities', keywords: 'skills html css javascript powershell', glyph: 'terminal', action: () => { setFilter('digital'); navigate('expertise'); } },
    { id: 'filter-operations', group: 'Quick actions', name: 'Filter accounts & operations', keywords: 'sap tally purchase dispatch supply chain', glyph: 'boxes', action: () => { setFilter('operations'); navigate('expertise'); } },
    { id: 'filter-marketing', group: 'Quick actions', name: 'Filter marketing & sales', keywords: 'customers meta b2b', glyph: 'megaphone', action: () => { setFilter('marketing'); navigate('expertise'); } },
    { id: 'copy-email', group: 'Quick actions', name: 'Copy email address', keywords: 'contact email', glyph: 'copy', action: () => copy(contact().email, 'Email address copied') },
    { id: 'copy-phone', group: 'Quick actions', name: 'Copy WhatsApp number', keywords: 'phone mobile contact', glyph: 'copy', action: () => copy('+' + contact().phone, 'WhatsApp number copied') },
    { id: 'theme', group: 'Quick actions', name: 'Switch light / dark theme', keywords: 'appearance display mode', glyph: 'sun', action: () => theme(state.theme === 'light' ? 'dark' : 'light') },
    { id: 'motion', group: 'Quick actions', name: 'Pause / resume ambient motion', keywords: 'animation reduce movement', glyph: 'pause', action: () => { state.motion = !state.motion; motionChanged(); } },
    { id: 'github', group: 'Public profiles', name: 'Open GitHub profile', keywords: 'code source repository', glyph: 'code-xml', hint: 'Opens a new tab', action: () => window.open('https://github.com/rjgopalgurjar', '_blank', 'noopener,noreferrer') },
    { id: 'linkedin', group: 'Public profiles', name: 'Connect on LinkedIn', keywords: 'professional profile', glyph: 'briefcase-business', hint: 'Opens a new tab', action: () => window.open('https://www.linkedin.com/in/rjgopalgurjar/', '_blank', 'noopener,noreferrer') }
  ];
  function selectCommand(index) {
    commandIndex = Math.max(0, Math.min(index, currentCommands.length - 1));
    $$('.command-option').forEach((button, position) => button.setAttribute('aria-selected', String(position === commandIndex)));
    if (currentCommands[commandIndex]) {
      const id = 'command-' + currentCommands[commandIndex].id;
      commandSearch.setAttribute('aria-activedescendant', id);
      const option = document.getElementById(id);
      const results = $('#command-results');
      const top = option.getBoundingClientRect().top - results.getBoundingClientRect().top + results.scrollTop;
      if (top < results.scrollTop) results.scrollTop = top;
      else if (top + option.offsetHeight > results.scrollTop + results.clientHeight) results.scrollTop = top + option.offsetHeight - results.clientHeight;
    } else commandSearch.removeAttribute('aria-activedescendant');
  }
  function runCommand(command) {
    commandDialog.close();
    command.action();
  }
  function renderCommands() {
    const terms = commandSearch.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    currentCommands = commands.filter(command => terms.every(term => (command.name + ' ' + command.keywords).toLowerCase().includes(term)));
    const results = $('#command-results');
    results.replaceChildren();
    let group = '';
    currentCommands.forEach((command, index) => {
      if (command.group !== group) {
        group = command.group;
        const label = document.createElement('div');
        label.className = 'command-group';
        label.setAttribute('role', 'presentation');
        label.textContent = group;
        results.append(label);
      }
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'command-option';
      button.id = 'command-' + command.id;
      button.tabIndex = -1;
      button.setAttribute('role', 'option');
      button.append(icon(command.glyph), document.createTextNode(command.name));
      if (command.hint) {
        const hint = document.createElement('small');
        hint.textContent = command.hint;
        button.append(hint);
      }
      button.addEventListener('pointermove', () => selectCommand(index));
      button.addEventListener('click', () => runCommand(command));
      results.append(button);
    });
    if (!currentCommands.length) {
      const empty = document.createElement('p');
      empty.className = 'command-empty';
      empty.textContent = 'No matching commands. Try “web”, “skills” or “contact”.';
      results.append(empty);
    }
    selectCommand(0);
  }
  function openCommands() {
    commandSearch.value = '';
    openDialog(commandDialog);
    renderCommands();
    commandSearch.focus();
  }
  $('.command-trigger').addEventListener('click', openCommands);
  $$('[data-open-commands]').forEach(button => button.addEventListener('click', openCommands));
  commandSearch.addEventListener('input', renderCommands);
  commandSearch.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      if (currentCommands.length) selectCommand((commandIndex + step + currentCommands.length) % currentCommands.length);
    } else if (event.key === 'Enter' && currentCommands[commandIndex]) {
      event.preventDefault();
      runCommand(currentCommands[commandIndex]);
    }
  });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (commandDialog.open) commandDialog.close(); else openCommands();
    } else if (event.key === 'Escape' && !menu.hidden) { closeMenu(); menuButton.focus(); }
  });

  let scrollContext = null;
  function scrollAnimations() {
    if (scrollContext) { scrollContext.revert(); scrollContext = null; }
    if (!window.gsap || !window.ScrollTrigger || !canMove()) {
      $$('.reveal').forEach(element => { element.style.opacity = '1'; element.style.setProperty('--reveal-y', '0px'); element.style.setProperty('--reveal-x', '0px'); element.style.setProperty('--reveal-scale', '1'); });
      $('.timeline-track>span').style.transform = 'scaleY(1)';
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    scrollContext = gsap.context(() => {
      $$('.reveal').forEach((element, index) => {
        if (element.hidden || element.getBoundingClientRect().bottom < 0) return;
        gsap.fromTo(element, { opacity: 0, '--reveal-y': '32px', '--reveal-x': (index % 2 ? 14 : -14) + 'px', '--reveal-scale': '.985' }, {
          opacity: 1, '--reveal-y': '0px', '--reveal-x': '0px', '--reveal-scale': '1', duration: .8, ease: 'power2.out',
          scrollTrigger: { trigger: element, start: 'top 94%', once: true }
        });
      });
      gsap.fromTo('.timeline-track>span', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.career-timeline', start: 'top 70%', end: 'bottom 65%', scrub: .6 } });
      gsap.to('.mesh-blue', { y: 130, x: -40, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
      gsap.to('.mesh-amber', { y: -100, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
    });
  }
  $$('.career-entry').forEach(entry => entry.addEventListener('toggle', () => {
    refreshScroll();
    if (entry.open && canMove()) $('.career-body', entry).animate([{ opacity: .15, translate: '0 -5px' }, { opacity: 1, translate: '0 0' }], { duration: 280, easing: 'ease-out' });
  }));

  let scrollFrame = 0;
  let lastScroll = scrollY;
  let scrollVelocity = 0;
  let activeSection = null;
  function updateScroll() {
    scrollFrame = 0;
    const height = root.scrollHeight - innerHeight;
    $('.reading-progress').style.transform = 'scaleX(' + (height > 0 ? Math.min(1, scrollY / height) : 0) + ')';
    const journeyFill = $('.journey-line>span');
    if (journeyFill) journeyFill.style.transform = 'scaleY(' + (height > 0 ? Math.min(1, scrollY / height) : 0) + ')';
    let next = '';
    $$('main>section[id]').forEach(section => { if (section.getBoundingClientRect().top < Math.max(170, innerHeight * .3)) next = section.id; });
    if (next !== activeSection) {
      activeSection = next;
      $$('.desktop-nav a').forEach(link => {
        const active = link.hash === '#' + next;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
      });
      $$('.journey-rail a').forEach(link => {
        const active = link.hash === '#' + (next || 'main');
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
      });
    }
    scrollVelocity = Math.min(30, Math.abs(scrollY - lastScroll));
    lastScroll = scrollY;
  }
  addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); }, { passive: true });
  addEventListener('resize', updateScroll, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(updateScroll).observe(document.body);

  $$('.reactive-card').forEach(card => {
    let frame = 0;
    let coordinates;
    card.addEventListener('pointermove', event => {
      if (!canMove() || !finePointer.matches || event.pointerType !== 'mouse') return;
      coordinates = { x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = card.getBoundingClientRect();
        const x = (coordinates.x - rect.left) / rect.width;
        const y = (coordinates.y - rect.top) / rect.height;
        card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        if (card.hasAttribute('data-tilt')) {
          card.style.setProperty('--rx', ((.5 - y) * 6).toFixed(2) + 'deg');
          card.style.setProperty('--ry', ((x - .5) * 6).toFixed(2) + 'deg');
        }
      });
    }, { passive: true });
    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame);
      frame = 0;
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
  $$('.magnetic').forEach(button => {
    button.addEventListener('pointermove', event => {
      if (!canMove() || !finePointer.matches || event.pointerType !== 'mouse') return;
      const rect = button.getBoundingClientRect();
      button.style.setProperty('--button-x', ((event.clientX - rect.left - rect.width / 2) * .035).toFixed(1) + 'px');
      button.style.setProperty('--button-y', ((event.clientY - rect.top - rect.height / 2) * .05).toFixed(1) + 'px');
    }, { passive: true });
    button.addEventListener('pointerleave', () => { button.style.setProperty('--button-x', '0px'); button.style.setProperty('--button-y', '0px'); });
  });

  const canvas = $('#coordinate-field');
  const context = canvas.getContext('2d');
  const hero = $('.hero');
  let canvasWidth = 0, canvasHeight = 0, canvasFrame = 0, lastCanvasFrame = 0, heroVisible = true;
  const pointer = { x: 0, y: 0, active: false };
  let nodes = [];
  let ripples = [];
  function sizeCanvas() {
    const rect = hero.getBoundingClientRect();
    canvasWidth = rect.width;
    canvasHeight = rect.height;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(canvasWidth * ratio);
    canvas.height = Math.round(canvasHeight * ratio);
    if (context) context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = canvasWidth < 768 ? 19 : 38;
    nodes = Array.from({ length: count }, (_, index) => ({ x: ((index * .61803398875) % 1) * canvasWidth, y: ((index * .41421356237 + .12) % 1) * canvasHeight, phase: index * 1.7 }));
    drawCanvas(0);
    syncCanvas();
  }
  function drawCanvas(time) {
    if (!context || !canvasWidth || !canvasHeight) return;
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    const dark = state.theme === 'dark';
    const rgb = dark ? '112,184,255' : '61,122,186';
    context.fillStyle = 'rgba(' + rgb + ',' + (dark ? '.15' : '.18') + ')';
    for (let x = 24; x < canvasWidth; x += 44) {
      for (let y = 30; y < canvasHeight; y += 44) {
        context.beginPath(); context.arc(x, y, .65, 0, Math.PI * 2); context.fill();
      }
    }
    const animated = canMove();
    const positions = nodes.map(node => {
      let x = node.x + (animated ? Math.sin(time * .00015 + node.phase) * 14 : 0);
      let y = node.y + (animated ? Math.cos(time * .00012 + node.phase) * 11 + scrollVelocity * .1 : 0);
      const dx = x - pointer.x, dy = y - pointer.y, distance = Math.hypot(dx, dy);
      if (pointer.active && animated && distance < 140 && distance > 0) {
        const force = (140 - distance) / 140;
        x += dx / distance * force * 17; y += dy / distance * force * 17;
      }
      return { x, y };
    });
    positions.forEach((node, index) => {
      const fade = node.x < canvasWidth * .5 ? .35 : 1;
      for (let other = index + 1; other < positions.length; other++) {
        const next = positions[other];
        const distance = Math.hypot(node.x - next.x, node.y - next.y);
        if (distance > 190) continue;
        context.strokeStyle = 'rgba(' + rgb + ',' + ((1 - distance / 190) * .19 * fade).toFixed(3) + ')';
        context.lineWidth = .65; context.beginPath(); context.moveTo(node.x, node.y); context.lineTo(next.x, next.y); context.stroke();
      }
      context.fillStyle = 'rgba(' + rgb + ',' + (.32 * fade).toFixed(2) + ')';
      context.beginPath(); context.arc(node.x, node.y, index % 4 === 0 ? 2.5 : 1.5, 0, Math.PI * 2); context.fill();
    });
    if (animated) {
      ripples = ripples.filter(ripple => time - ripple.time < 900);
      ripples.forEach(ripple => {
        const progress = (time - ripple.time) / 900;
        context.strokeStyle = 'rgba(' + rgb + ',' + ((1 - progress) * .16).toFixed(3) + ')';
        context.beginPath(); context.arc(ripple.x, ripple.y, 10 + progress * 100, 0, Math.PI * 2); context.stroke();
      });
    }
    scrollVelocity *= .92;
  }
  function canvasLoop(time) {
    canvasFrame = 0;
    if (!canMove() || document.hidden || !heroVisible || $('dialog[open]')) return;
    if (time - lastCanvasFrame > 32) { lastCanvasFrame = time; drawCanvas(time); }
    canvasFrame = requestAnimationFrame(canvasLoop);
  }
  function syncCanvas() {
    cancelAnimationFrame(canvasFrame); canvasFrame = 0;
    if (canMove() && !document.hidden && heroVisible && !$('dialog[open]')) canvasFrame = requestAnimationFrame(canvasLoop);
    else drawCanvas(0);
  }
  hero.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    const rect = hero.getBoundingClientRect();
    pointer.x = event.clientX - rect.left; pointer.y = event.clientY - rect.top; pointer.active = true;
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { pointer.active = false; });
  hero.addEventListener('pointerdown', event => {
    if (!canMove() || event.pointerType !== 'mouse' || event.target.closest('button,a')) return;
    const rect = hero.getBoundingClientRect();
    ripples.push({ x: event.clientX - rect.left, y: event.clientY - rect.top, time: performance.now() });
    if (ripples.length > 3) ripples.shift();
  }, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(sizeCanvas).observe(hero);
  else addEventListener('resize', sizeCanvas);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { heroVisible = entries[0].isIntersecting; syncCanvas(); }, { threshold: 0 }).observe(hero);
    new IntersectionObserver(entries => {
      inspectorVisible = entries[0].isIntersecting && entries[0].intersectionRatio >= .25;
      scheduleInspector();
    }, { threshold: [0, .25] }).observe(inspector);
    const visibleContact = new Map();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => visibleContact.set(entry.target, entry.isIntersecting));
      root.classList.toggle('contact-visible', Array.from(visibleContact.values()).some(Boolean));
    });
    observer.observe($('#contact')); observer.observe($('.site-footer'));
  } else inspectorVisible = true;

  function motionChanged() {
    root.classList.toggle('motion-off', !canMove());
    const button = $('.motion-toggle');
    button.setAttribute('aria-pressed', String(!canMove()));
    button.textContent = reduced.matches ? 'Device reduced motion enabled' : (state.motion ? 'Pause ambient motion' : 'Resume ambient motion');
    button.disabled = reduced.matches;
    updateSequenceControl();
    if (!canMove()) $$('.reactive-card').forEach(card => { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); });
    scrollAnimations(); scheduleInspector(); syncCanvas();
    document.dispatchEvent(new CustomEvent('gopal:motion', { detail: { enabled: canMove() } }));
  }
  $('.motion-toggle').addEventListener('click', () => { state.motion = !state.motion; motionChanged(); });
  reduced.addEventListener('change', event => { state.motion = !event.matches; motionChanged(); });
  document.addEventListener('visibilitychange', () => { scheduleInspector(); syncCanvas(); });
  const digitalDemos = {
    web: { code: '<experience\n  responsive="by design"\n  focus="people first"\n/>', caption: 'Responsive interfaces shaped around the people using them.' },
    diagnostics: { code: 'inspect the issue\n  > check the basics\n  > understand the result\n  > choose the next step', caption: 'Practical troubleshooting with CMD, PowerShell and a methodical approach.' },
    workflow: { code: 'a clear requirement\n  + a useful message\n  + the right next step\n  = a connected workflow', caption: 'Email workflows that keep communication and follow-through connected.' }
  };
  $$('[data-digital-demo]').forEach(button => button.addEventListener('click', () => {
    const item = digitalDemos[button.dataset.digitalDemo];
    $$('[data-digital-demo]').forEach(control => control.setAttribute('aria-pressed', String(control === button)));
    const code = document.createElement('code');
    code.textContent = item.code;
    $('#digital-demo').replaceChildren(code);
    $('#digital-demo-caption').textContent = item.caption;
    if (canMove()) $('#digital-demo').animate([{ opacity: .35, translate: '0 5px' }, { opacity: 1, translate: '0 0' }], { duration: 260 });
    refreshScroll();
  }));
  const operationDetails = {
    purchase: 'Reviewing import and domestic purchases with attention to the details.',
    documents: 'Checking import and customs documents, including Bills of Entry and taxation details.',
    dispatch: 'Connecting inventory, SAP portal work and dispatch coordination in everyday operations.'
  };
  $$('[data-ops-stage]').forEach(button => button.addEventListener('click', () => {
    $$('[data-ops-stage]').forEach(control => control.setAttribute('aria-pressed', String(control === button)));
    $('#ops-stage-detail').textContent = operationDetails[button.dataset.opsStage];
    if (canMove()) $('#ops-stage-detail').animate([{ opacity: .2 }, { opacity: 1 }], { duration: 260 });
  }));
  const workMap = $('.connection-map');
  const workSteps = ['understand', 'coordinate', 'follow'];
  const workDescriptions = {
    understand: 'Start with the customer’s requirements and keep the conversation clear.',
    coordinate: 'Connect people, information and everyday commercial operations around the requirement.',
    follow: 'Keep the next step visible through communication, email workflows and practical follow-through.'
  };
  let workStep = 'understand', workTimer = 0, workVisible = false, workHovered = false;
  function scheduleWork() {
    clearTimeout(workTimer);
    if (!canMove() || !workVisible || workHovered || workMap.contains(document.activeElement) || document.hidden) return;
    workTimer = setTimeout(() => changeWork(workSteps[(workSteps.indexOf(workStep) + 1) % workSteps.length]), 5000);
  }
  function changeWork(value) {
    workStep = value;
    $$('[data-work-step]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.workStep === value)));
    $('#work-step-detail').textContent = workDescriptions[value];
    if (canMove()) $('#work-step-detail').animate([{ opacity: .2, translate: '0 4px' }, { opacity: 1, translate: '0 0' }], { duration: 300 });
    scheduleWork();
  }
  $$('[data-work-step]').forEach(button => button.addEventListener('click', () => changeWork(button.dataset.workStep)));
  workMap.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { workHovered = true; scheduleWork(); } });
  workMap.addEventListener('pointerleave', event => { if (event.pointerType === 'mouse') { workHovered = false; scheduleWork(); } });
  workMap.addEventListener('focusin', scheduleWork);
  workMap.addEventListener('focusout', () => setTimeout(scheduleWork, 0));
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { workVisible = entries[0].isIntersecting; scheduleWork(); }, { threshold: .3 }).observe(workMap);
  document.addEventListener('visibilitychange', scheduleWork);
  document.addEventListener('gopal:motion', scheduleWork);
  const websiteKinds = {
    business: 'A clear home for your business, services and contact details.',
    landing: 'A focused page that introduces an offer and guides visitors to a conversation.',
    portfolio: 'A personal website that brings your experience, work and public profiles together.'
  };
  $$('[data-web-kind]').forEach(button => button.addEventListener('click', () => {
    state.webKind = button.dataset.webKind;
    $$('[data-web-kind]').forEach(control => control.setAttribute('aria-pressed', String(control === button)));
    $('#web-kind-feedback').textContent = websiteKinds[state.webKind];
    renderComposer();
    refreshScroll();
  }));
  const campaignGoals = {
    enquiries: 'Campaign support and clear coordination around customer enquiries.',
    presence: 'Campaign support that connects a business message with its digital presence.',
    workflow: 'Email communication and practical coordination around digital campaign work.'
  };
  $$('[data-campaign-goal]').forEach(button => button.addEventListener('click', () => {
    state.campaignGoal = button.dataset.campaignGoal;
    $$('[data-campaign-goal]').forEach(control => control.setAttribute('aria-pressed', String(control === button)));
    $('#campaign-goal-feedback').textContent = campaignGoals[state.campaignGoal];
    renderComposer();
    refreshScroll();
  }));
  $$('[data-career]').forEach((button, index) => {
    button.setAttribute('aria-pressed', String(index === 0));
    button.addEventListener('click', () => {
      const entry = document.getElementById(button.dataset.career);
      entry.open = true;
      $$('[data-career]').forEach(control => control.setAttribute('aria-pressed', String(control === button)));
      entry.scrollIntoView({ behavior: canMove() ? 'smooth' : 'instant', block: 'start' });
      $('summary', entry).focus({ preventScroll: true });
      refreshScroll();
    });
  });
  const places = {
    roots: 'Originally from Mohangarh, Beawar, Rajasthan. Rajasthan remains my preferred location for opportunities.',
    base: 'Based in Bengaluru, Karnataka, with an outlook open to opportunities across India.'
  };
  $$('[data-location]').forEach(button => button.addEventListener('click', () => {
    $$('[data-location]').forEach(control => control.setAttribute('aria-pressed', String(control === button)));
    $('#location-detail').textContent = places[button.dataset.location];
    if (canMove()) $('#location-detail').animate([{ opacity: .2 }, { opacity: 1 }], { duration: 280 });
  }));
  $$('.copy-message').forEach(button => button.addEventListener('click', () => $$('[data-composer-step="connect"]').forEach(element => element.classList.add('active'))));
  theme(state.theme);
  setInspector('profile');
  renderComposer();
  sizeCanvas();
  motionChanged();
  updateScroll();
  document.fonts.ready.then(refreshScroll);
})();
