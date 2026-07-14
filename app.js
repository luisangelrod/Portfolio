(function () {
  const root = document.documentElement;
  const body = document.body;
  const crtToggle = document.querySelector('.crt-toggle');
  const nostalgiaToggle = document.querySelector('.nostalgia-toggle');
  const progress = document.querySelector('.page-progress span');
  const navLinks = Array.from(document.querySelectorAll('.topbar nav a'));
  const sections = navLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  const memoryDialog = document.getElementById('system-memory');
  const memoryWindow = memoryDialog && memoryDialog.querySelector('.memory-window');
  const memoryPreview = document.getElementById('memory-preview');
  const memoryBadge = document.getElementById('memory-badge');
  const prismGuava = document.querySelector('.prism-guava');
  const creditsOverlay = document.getElementById('credits-overlay');
  const storageKey = 'lr-portfolio-nostalgia-v1';
  let keyBuffer = '';
  let konamiIndex = 0;
  const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

  const memories = {
    neon: {
      label: 'MEMORY_NEON', title: 'Built after dark.',
      copy: 'Cherry-red storefront light and cream-colored lettering turn late-night work into an original “useful first, memorable always” sign.',
      note: 'The energy comes from classic soda advertising, but the sign, words, and geometry belong to this portfolio.'
    },
    console: {
      label: 'MEMORY_16BIT', title: 'LR-16 system ready.',
      copy: 'Cobalt geometry, internal cut lines, and a boot-screen attitude recall the confidence of 16-bit consoles without borrowing a console maker’s wordmark.',
      note: 'Three taps on the LR badge unlock this memory from anywhere on the page.'
    },
    stars: {
      label: 'MEMORY_ARCADE', title: 'Star Patrol formation.',
      copy: 'Twelve original signal craft scatter through the background and regroup into a loose LR formation—a quiet nod to fixed-shooter arcades.',
      note: 'Motion is disabled automatically when the device requests reduced motion.'
    },
    dots: {
      label: 'MEMORY_RELAY', title: 'Every mission leaves a trail.',
      copy: 'The page progress line works like a dot relay: it illuminates as you move through proof, method, experience, and contact.',
      note: 'The easter egg also performs real navigation feedback instead of existing only as decoration.'
    },
    av: {
      label: 'MEMORY_AV', title: 'A/V System · 1996 edition.',
      copy: 'Black, silver, and narrow serif details remember the era when consumer electronics looked engineered, permanent, and worth keeping.',
      note: 'That restraint lives inside the player card rather than becoming a copied hardware logo.'
    },
    prism: {
      label: 'MEMORY_PRISM', title: 'The prism guava.',
      copy: 'A six-color pixel fruit celebrates the warmth of early personal computers while staying rooted in Puerto Rico and in an original silhouette.',
      note: 'It is also the footer button that opens this System Memory window.'
    }
  };

  document.getElementById('year').textContent = new Date().getFullYear();

  function readPreference() {
    try { return window.localStorage.getItem(storageKey) === 'on'; }
    catch (_) { return false; }
  }

  function savePreference(on) {
    try { window.localStorage.setItem(storageKey, on ? 'on' : 'off'); }
    catch (_) { /* Preferences are optional. */ }
  }

  function setNostalgia(on, persist) {
    root.dataset.nostalgia = on ? 'on' : 'off';
    if (nostalgiaToggle) {
      nostalgiaToggle.setAttribute('aria-pressed', String(on));
      nostalgiaToggle.title = on ? 'Turn off 1990s nostalgia mode' : 'Turn on 1990s nostalgia mode';
    }
    if (persist) savePreference(on);
  }

  function openMemory() {
    setNostalgia(true, true);
    if (memoryDialog && !memoryDialog.open) memoryDialog.showModal();
  }

  function renderMemory(key) {
    const memory = memories[key];
    if (!memory || !memoryPreview) return;
    memoryPreview.querySelector(':scope > p:first-child').textContent = memory.label;
    memoryPreview.querySelector('h2').textContent = memory.title;
    const paragraphs = memoryPreview.querySelectorAll(':scope > p');
    if (paragraphs[1]) paragraphs[1].textContent = memory.copy;
    if (paragraphs[2]) paragraphs[2].textContent = memory.note;
  }

  setNostalgia(readPreference(), false);

  if (crtToggle) {
    crtToggle.addEventListener('click', () => {
      const isOff = body.classList.toggle('crt-off');
      crtToggle.setAttribute('aria-pressed', String(!isOff));
      crtToggle.innerHTML = '<span aria-hidden="true"></span> CRT ' + (isOff ? 'OFF' : 'ON');
    });
  }

  if (nostalgiaToggle) {
    nostalgiaToggle.addEventListener('click', () => setNostalgia(root.dataset.nostalgia !== 'on', true));
  }

  [memoryBadge, prismGuava].filter(Boolean).forEach((trigger) => trigger.addEventListener('click', openMemory));
  if (memoryDialog) {
    memoryDialog.querySelector('.memory-close').addEventListener('click', () => memoryDialog.close());
    memoryDialog.addEventListener('click', (event) => {
      if (event.target === memoryDialog) memoryDialog.close();
    });
    memoryDialog.querySelectorAll('[data-skin]').forEach((button) => {
      button.addEventListener('click', () => {
        memoryWindow.dataset.memorySkin = button.dataset.skin;
        memoryDialog.querySelectorAll('[data-skin]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      });
    });
    memoryDialog.querySelectorAll('[data-memory]').forEach((button) => button.addEventListener('click', () => renderMemory(button.dataset.memory)));
  }

  function openCredits() {
    if (!creditsOverlay) return;
    creditsOverlay.classList.add('open');
    creditsOverlay.setAttribute('aria-hidden', 'false');
    creditsOverlay.querySelector('button').focus();
  }

  function closeCredits() {
    if (!creditsOverlay) return;
    creditsOverlay.classList.remove('open');
    creditsOverlay.setAttribute('aria-hidden', 'true');
    document.querySelector('.credits-trigger').focus();
  }

  document.querySelector('.credits-trigger').addEventListener('click', openCredits);
  if (creditsOverlay) creditsOverlay.querySelector('button').addEventListener('click', closeCredits);

  let brandTaps = 0;
  let brandTimer;
  document.querySelector('.brand-mark').addEventListener('click', () => {
    brandTaps += 1;
    window.clearTimeout(brandTimer);
    brandTimer = window.setTimeout(() => { brandTaps = 0; }, 900);
    if (brandTaps >= 3) { setNostalgia(true, true); openMemory(); brandTaps = 0; }
  });

  document.addEventListener('keydown', (event) => {
    const target = event.target;
    const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target.isContentEditable;
    if (event.key === 'Escape' && creditsOverlay && creditsOverlay.classList.contains('open')) closeCredits();
    if (typing) return;

    const expected = konami[konamiIndex];
    if (event.key.toLowerCase() === String(expected).toLowerCase()) {
      konamiIndex += 1;
      if (konamiIndex === konami.length) { konamiIndex = 0; openMemory(); }
    } else konamiIndex = 0;

    if (event.key.length === 1) {
      keyBuffer = (keyBuffer + event.key.toLowerCase()).slice(-10);
      if (keyBuffer.endsWith('luis')) setNostalgia(true, true);
      if (keyBuffer.endsWith('credits')) openCredits();
    }
  });

  function updateScrollState() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const percent = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
    progress.style.width = percent + '%';

    let current = '';
    for (const section of sections) {
      if (window.scrollY >= section.offsetTop - 150) current = '#' + section.id;
    }
    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === current;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  window.addEventListener('scroll', updateScrollState, { passive: true });
  window.addEventListener('resize', updateScrollState);
  updateScrollState();
})();
