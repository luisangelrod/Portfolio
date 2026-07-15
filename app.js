(function () {
  const root = document.documentElement;
  const body = document.body;
  const crtToggle = document.querySelector('.crt-toggle');
  const nostalgiaToggle = document.querySelector('.nostalgia-toggle');
  const desktopSwitch = document.querySelector('.desktop-switch');
  const progress = document.querySelector('.page-progress span');
  const navLinks = Array.from(document.querySelectorAll('.topbar nav a'));
  const sections = navLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  const memoryDialog = document.getElementById('system-memory');
  const memoryPreview = document.getElementById('memory-preview');
  const memoryBadge = document.getElementById('memory-badge');
  const memoryCardTrigger = document.querySelector('.memory-card-trigger');
  const creditsOverlay = document.getElementById('credits-overlay');
  const storageKey = 'lr-portfolio-nostalgia-v1';
  let keyBuffer = '';
  let konamiIndex = 0;
  const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

  const memories = {
    brothers: {
      label: 'MEMORY_00 · HOME ERA', title: 'The third controller was mine.',
      copy: 'Born in 1995 and the youngest of three, I learned games, movies, and computers by watching my older brothers first—then changing the settings, opening the case, and eventually building the machine.',
      note: 'That history still shapes my work: software should feel authored, specific, and worth remembering.'
    },
    playstation: {
      label: 'MEMORY_01 · DISC ERA', title: 'A console felt like a place.',
      copy: 'The original PlayStation arrived alongside my generation: a boot sequence with suspense, jewel cases worth studying, memory cards that made progress physical, and strange new 3D worlds behind every disc.',
      note: 'It taught me that navigation, sound, pacing, and anticipation are part of an interface—not decoration added afterward.'
    },
    gameboy: {
      label: 'MEMORY_02 · POCKET SYSTEM', title: 'Constraints created character.',
      copy: 'Game Boy made a tiny screen, four shades, two face buttons, and batteries feel limitless. Nintendo’s portable world proved that durable, focused technology can outlive more powerful hardware.',
      note: 'That is still a useful engineering rule: clarity and reliability beat features that exist only to impress.'
    },
    movies: {
      label: 'MEMORY_03 · VIDEO STORE', title: 'The shelf was an interface.',
      copy: 'A Friday-night video-store wall had seconds to earn your attention. Jurassic Park, Terminator 2, Independence Day, and The Matrix each promised a complete world with one image and a title.',
      note: 'I want project presentation to work the same way: one clear promise, unmistakable character, then proof when you look closer.'
    },
    coke: {
      label: 'MEMORY_04 · NEON NIGHTS', title: 'Ordinary rooms became cinematic.',
      copy: 'A Coca-Cola script glowing red through a shop window could turn an ordinary late-night stop into a scene. The object was familiar; the light made it unforgettable.',
      note: 'That is the kind of nostalgia I want here: specific, lived-in, and secondary to a useful experience.'
    },
    pc: {
      label: 'MEMORY_05 · C:\\BUILD', title: 'Open the case. Learn the machine.',
      copy: 'Building PCs meant jumpers, drivers, BIOS screens, beige towers, mystery beeps, and the satisfaction of a first successful boot. Every choice was visible because every choice mattered.',
      note: 'AI accelerates my work today, but that older habit remains: understand the system, verify the output, and take responsibility for what ships.'
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
    const copy = memoryPreview.querySelector('.memory-copy');
    copy.querySelector(':scope > p:first-child').textContent = memory.label;
    copy.querySelector('h2').textContent = memory.title;
    const copyParagraphs = copy.querySelectorAll(':scope > p');
    if (copyParagraphs[1]) copyParagraphs[1].textContent = memory.copy;
    if (copyParagraphs[2]) copyParagraphs[2].textContent = memory.note;
    memoryPreview.querySelectorAll('[data-scene]').forEach((scene) => {
      const active = scene.dataset.scene === key;
      scene.classList.toggle('is-active', active);
      scene.setAttribute('aria-hidden', String(!active));
    });
    memoryDialog.querySelectorAll('[data-memory]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.memory === key));
    });
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

  if (desktopSwitch) {
    desktopSwitch.addEventListener('click', () => {
      const overlay = document.getElementById('mode-switch-overlay');
      overlay.classList.add('active');
      overlay.setAttribute('aria-hidden', 'false');
      window.setTimeout(() => { window.location.href = './desktop-1995/'; }, 900);
    });
  }

  [memoryBadge, memoryCardTrigger].filter(Boolean).forEach((trigger) => trigger.addEventListener('click', openMemory));
  if (memoryDialog) {
    memoryDialog.querySelector('.memory-close').addEventListener('click', () => memoryDialog.close());
    memoryDialog.addEventListener('click', (event) => {
      if (event.target === memoryDialog) memoryDialog.close();
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
