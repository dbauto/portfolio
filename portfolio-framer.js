(() => {
  const root = document.getElementById('projectCards');
  if (!root || !Array.isArray(window.DCODE_PROJECTS)) return;

  const hidden = new Set(['monday','sheets','ops-dashboard']);
  const projects = window.DCODE_PROJECTS
    .filter(project => !hidden.has(project.id))
    .sort((a,b) => Number(a.order || 99) - Number(b.order || 99));

  const caseHref = (p) => {
    if (p.id === 'workspace-ops') return 'workspace-ops-case-study.html';
    if (p.id === 'monday-project-ops') return 'monday-project-ops-case-study.html';
    if (p.id === 'ocr') return 'spx-case-study-v2.html?v=20260905-spx-modern1';
    if (p.id === 'zoho-migration') return 'migration-case-study.html?v=20260905-crashfix2';
    return `case-study.html?id=${p.id}`;
  };

  const previewHref = (p) => {
    if (p.id === 'portal') return 'secure-candidate-review.html';
    if (p.id === 'recruitment') return 'demo.html?id=recruitment&embed=1&v=20260908-hide-p01-agent-demo2';
    if (p.id === 'ocr') return 'demo.html?id=ocr&embed=1&v=20260905-spx-modern1';
    if (p.id === 'zoho-migration') return 'migration-demo-control.html?embed=1&v=20260905-crashfix2';
    if (p.id === 'monday-project-ops') return 'monday-project-ops-demo-native-v8.html?embed=1&v=20260908-sidebar-icons1';
    if (p.id === 'workspace-ops') return 'workspace-ops-demo-v2.html?embed=1&v=20260903-workspace-ops2';
    return `demo.html?id=${p.id}&embed=1`;
  };

  const renderPreview = (p) => {
    if (p.demoAvailable === false) {
      return `<div class="development-preview">
        <div class="development-top"><span>Ongoing R&amp;D</span><span class="dev-live">Private build</span></div>
        <div class="development-map">
          <svg viewBox="0 0 760 420" aria-hidden="true">
            <path d="M130 210 C215 210 205 115 300 115"/><path d="M130 210 C215 210 205 305 300 305"/>
            <path d="M430 115 C505 115 495 210 585 210"/><path d="M430 305 C505 305 495 210 585 210"/>
          </svg>
          <article style="left:4%;top:43%"><small>Entry</small><b>User / Trigger</b></article>
          <article style="left:34%;top:17%"><small>Routing</small><b>Orchestrator</b></article>
          <article style="left:34%;top:68%"><small>Specialists</small><b>Persistent Agents</b></article>
          <article class="accent" style="right:4%;top:43%"><small>Governance</small><b>Approval + Audit</b></article>
        </div>
        <div class="development-note"><b>Public demo intentionally withheld</b><span>Architecture and implementation progress are documented while the runtime remains under active development.</span></div>
      </div>`;
    }

    const id = `preview-${p.id}`;
    return `<div class="preview-frame" id="${id}">
      <div class="preview-bar">
        <div class="preview-dots"><i></i><i></i><i></i></div>
        <span class="preview-title">${p.title}</span>
        <button class="preview-open fullscreen-btn" type="button" data-target="${id}" aria-label="Open ${p.title} fullscreen">↗</button>
      </div>
      <div class="preview-screen">
        <iframe class="live-demo-preview" src="${previewHref(p)}" title="Interactive preview of ${p.title}" loading="lazy" allowfullscreen></iframe>
        <span class="preview-badge">Interactive reconstruction</span>
      </div>
    </div>`;
  };

  projects.forEach((p) => {
    const article = document.createElement('article');
    article.className = 'project reveal';
    article.dataset.id = p.id;
    const n8n = p.stack?.some(item => /\bn8n\b/i.test(item));
    const demoAvailable = p.demoAvailable !== false;
    const period = p.period ? `<div class="project-period">${p.period}</div>` : '';
    const demoAction = demoAvailable
      ? `<button class="btn dark fullscreen-btn" type="button" data-target="preview-${p.id}">Open demo <span class="arr">↗</span></button>`
      : '';
    const n8nAction = n8n ? '<button class="btn" type="button" data-workflow-contact>View n8n workflow</button>' : '';

    article.innerHTML = `
      <div class="projectcopy">
        <div class="projecttop"><span class="num">${p.order || '--'} / ${p.category}</span><span class="status">${p.status}</span></div>
        ${period}
        <h3>${p.title}</h3>
        <p>${p.subtitle}</p>
        <div class="chips">${(p.stack || []).slice(0,5).map(x => `<span class="chip">${x}</span>`).join('')}</div>
        <div class="metricline">${(p.metrics || []).slice(0,2).map(m => `<div class="mini"><strong>${m[0]}</strong><span>${m[1]}</span></div>`).join('')}</div>
        <div class="projectactions">
          <a class="btn" href="${caseHref(p)}">Read case study <span class="arr">↗</span></a>
          ${demoAction}
          ${n8nAction}
        </div>
      </div>
      <div class="projectvisual">${renderPreview(p)}</div>
    `;
    root.appendChild(article);
  });

  const PREVIEW_W = 1600;
  const PREVIEW_H = 900;
  function fitPreview(iframe) {
    const screen = iframe.closest('.preview-screen');
    if (!screen) return;
    const apply = () => {
      const frame = iframe.closest('.preview-frame');
      if (document.fullscreenElement === frame) {
        iframe.style.cssText = '';
        return;
      }
      const scale = Math.min(screen.clientWidth / PREVIEW_W, screen.clientHeight / PREVIEW_H);
      const width = PREVIEW_W * scale;
      const height = PREVIEW_H * scale;
      iframe.style.width = PREVIEW_W + 'px';
      iframe.style.height = PREVIEW_H + 'px';
      iframe.style.transform = `scale(${scale})`;
      iframe.style.left = Math.max(0,(screen.clientWidth-width)/2) + 'px';
      iframe.style.top = Math.max(0,(screen.clientHeight-height)/2) + 'px';
    };
    new ResizeObserver(apply).observe(screen);
    iframe.addEventListener('load', apply);
    iframe._fitPreview = apply;
    apply();
  }
  document.querySelectorAll('.live-demo-preview').forEach(fitPreview);

  document.addEventListener('click', async (event) => {
    const button = event.target.closest('.fullscreen-btn');
    if (!button) return;
    const target = document.getElementById(button.dataset.target);
    if (!target) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await target.requestFullscreen();
    } catch (_) {
      target.scrollIntoView({behavior:'smooth',block:'center'});
    }
  });

  document.addEventListener('fullscreenchange', () => {
    document.querySelectorAll('.live-demo-preview').forEach(iframe => iframe._fitPreview?.());
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:.12});
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  const glow = document.querySelector('.cursor-glow');
  if (glow && matchMedia('(pointer:fine)').matches) {
    addEventListener('mousemove', e => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
      glow.style.opacity = '1';
    }, {passive:true});
  }

})();