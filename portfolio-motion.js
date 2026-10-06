(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (n,min=0,max=1) => Math.min(max,Math.max(min,n));
  const invLerp = (a,b,v) => a === b ? 0 : (v-a)/(b-a);

  const progress = document.createElement('div');
  progress.className = 'motion-progress';
  progress.setAttribute('aria-hidden','true');
  document.body.prepend(progress);

  document.body.classList.add('motion-ready');

  // Build a clean masked hero reveal without changing the copy.
  const heroTitle = document.querySelector('.hero h1');
  if (heroTitle && !heroTitle.dataset.motionSplit) {
    heroTitle.dataset.motionSplit = '1';
    const nodes = [...heroTitle.childNodes];
    heroTitle.innerHTML = '';
    let line = document.createElement('span');
    line.className = 'motion-mask';
    let inner = document.createElement('span');
    line.appendChild(inner);
    heroTitle.appendChild(line);

    nodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        inner.appendChild(document.createTextNode(node.textContent));
      } else {
        inner.appendChild(node);
      }
    });
  }

  document.querySelectorAll('.section-title').forEach(title => {
    title.classList.add('motion-title');
  });

  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.body.classList.add('motion-loaded');
  }));

  if (reduceMotion) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    return;
  }

  const hero = document.querySelector('.hero');
  const intro = document.querySelector('.intro-section');
  const rnd = document.querySelector('.rnd');
  const stack = document.querySelector('.stack-section');
  const contact = document.querySelector('.contact-section');
  const nav = document.querySelector('.site-nav');
  const systemCard = document.querySelector('.system-card');
  const projects = [...document.querySelectorAll('.project')];
  const caps = [...document.querySelectorAll('.cap-row')];
  const titles = [...document.querySelectorAll('.motion-title')];

  let lastY = scrollY;
  let ticking = false;
  let pointerX = 0;
  let pointerY = 0;
  let cardPointerActive = false;

  function elementProgress(el,start=.88,end=.18){
    if (!el) return 1;
    const r = el.getBoundingClientRect();
    const vh = innerHeight || 1;
    return clamp(invLerp(vh*start,vh*end,r.top));
  }

  function centerFocus(el){
    const r = el.getBoundingClientRect();
    const vh = innerHeight || 1;
    const center = r.top + r.height/2;
    const distance = Math.abs(center - vh/2);
    return clamp(1 - (distance / (vh*.88)));
  }

  function update(){
    ticking = false;
    const y = scrollY;
    const doc = document.documentElement;
    const maxScroll = Math.max(1,doc.scrollHeight-innerHeight);
    doc.style.setProperty('--scroll-progress',clamp(y/maxScroll).toFixed(4));

    // Hero is scrubbed for roughly the first viewport.
    const heroH = hero?.offsetHeight || innerHeight;
    const hp = clamp(y / Math.max(1,heroH*.92));
    doc.style.setProperty('--hero-progress',hp.toFixed(4));
    doc.style.setProperty('--nav-progress',clamp(y/420).toFixed(4));

    // Hide nav only during intentional downward scrolling after the hero.
    if (nav) {
      const delta = y - lastY;
      if (y > innerHeight*.72 && delta > 7) nav.classList.add('nav-hidden');
      else if (delta < -5 || y < innerHeight*.72) nav.classList.remove('nav-hidden');
    }

    const ip = elementProgress(intro,.9,.22);
    doc.style.setProperty('--intro-progress',ip.toFixed(4));

    titles.forEach(title => {
      const tp = elementProgress(title,.92,.42);
      title.style.setProperty('--title-progress',tp.toFixed(4));
    });

    projects.forEach((project,index) => {
      const focus = centerFocus(project);
      const copy = elementProgress(project,.88,.38);
      project.style.setProperty('--card-focus',focus.toFixed(4));
      project.style.setProperty('--copy-progress',copy.toFixed(4));
      project.style.setProperty('--card-index',index);
      if (focus > .12) project.classList.add('in');
    });

    if (rnd) rnd.style.setProperty('--rnd-progress',elementProgress(rnd,.93,.35).toFixed(4));

    caps.forEach(row => {
      row.style.setProperty('--row-progress',elementProgress(row,.96,.62).toFixed(4));
      if (elementProgress(row,.96,.74) > .05) row.classList.add('in');
    });

    if (stack) {
      const sp = elementProgress(stack,.95,.32);
      doc.style.setProperty('--stack-progress',sp.toFixed(4));
      stack.querySelector('.stack-panel')?.classList.add('in');
    }

    const cp = elementProgress(contact,.97,.28);
    doc.style.setProperty('--contact-progress',cp.toFixed(4));
    if (cp > .05) contact?.querySelector('.contact-panel')?.classList.add('in');

    // Other fallback reveals still get a smooth trigger.
    document.querySelectorAll('.reveal:not(.in)').forEach(el => {
      if (elementProgress(el,.96,.78) > .1) el.classList.add('in');
    });

    lastY = y;
  }

  function requestUpdate(){
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  addEventListener('scroll',requestUpdate,{passive:true});
  addEventListener('resize',requestUpdate,{passive:true});
  update();

  // Framer-like depth on the hero architecture card.
  if (systemCard && matchMedia('(pointer:fine)').matches) {
    systemCard.addEventListener('mouseenter',() => {
      cardPointerActive = true;
    });
    systemCard.addEventListener('mouseleave',() => {
      cardPointerActive = false;
      systemCard.style.setProperty('--card-tilt-x','0deg');
      systemCard.style.setProperty('--card-tilt-z','0deg');
      systemCard.style.setProperty('--card-tilt-y','0deg');
    });
    systemCard.addEventListener('mousemove',event => {
      if (!cardPointerActive) return;
      const r = systemCard.getBoundingClientRect();
      pointerX = clamp((event.clientX-r.left)/r.width,0,1);
      pointerY = clamp((event.clientY-r.top)/r.height,0,1);
      const rx = (pointerX-.5)*6;
      const ry = (pointerY-.5)*-5;
      systemCard.style.setProperty('--card-tilt-x',rx.toFixed(2)+'deg');
      systemCard.style.setProperty('--card-tilt-z',ry.toFixed(2)+'deg');
    },{passive:true});
  }

  // Links get a light magnetic pull; desktop only.
  if (matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.btn,.nav-cta,.contact-email').forEach(el => {
      el.addEventListener('mousemove',event => {
        const r = el.getBoundingClientRect();
        const x = (event.clientX-r.left-r.width/2)*.12;
        const y = (event.clientY-r.top-r.height/2)*.18;
        el.style.transform = `translate3d(${x}px,${y}px,0)`;
      },{passive:true});
      el.addEventListener('mouseleave',() => {
        el.style.transform = '';
      });
    });
  }
})();