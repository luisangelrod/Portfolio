(() => {
  const windows = [...document.querySelectorAll('.window')];
  const taskButtons = document.getElementById('task-buttons');
  const startButton = document.getElementById('start-button');
  const startMenu = document.getElementById('start-menu');
  let topZ = 60;
  let dukeStarted = false;

  const labels = {
    welcome: 'Welcome Home', internet: 'Selected Work', computer: 'My Computer',
    notepad: 'About Luis.txt', duke: 'Duke3D Shareware', paint: 'Paint',
    mines: 'Minesweeper', recycle: 'Recycle Bin'
  };

  function findWindow(app) { return document.querySelector(`[data-app="${app}"]`); }

  function focusWindow(win) {
    if (!win || win.hidden) return;
    windows.forEach((item) => item.classList.remove('active-window'));
    win.classList.add('active-window');
    win.style.zIndex = String(++topZ);
    document.querySelectorAll('.task-button').forEach((button) => {
      button.classList.toggle('active', button.dataset.task === win.dataset.app);
    });
  }

  function syncTaskbar() {
    taskButtons.replaceChildren();
    windows.filter((win) => !win.hidden).forEach((win) => {
      const button = document.createElement('button');
      button.className = `task-button${win.classList.contains('active-window') ? ' active' : ''}`;
      button.dataset.task = win.dataset.app;
      button.textContent = labels[win.dataset.app] || win.dataset.app;
      button.addEventListener('click', () => {
        if (win.classList.contains('minimized')) {
          win.classList.remove('minimized');
          win.style.display = '';
          focusWindow(win);
        } else if (win.classList.contains('active-window')) {
          win.classList.add('minimized');
          win.style.display = 'none';
        } else focusWindow(win);
        syncTaskbar();
      });
      taskButtons.append(button);
    });
  }

  function openWindow(app) {
    const win = findWindow(app);
    if (!win) return;
    win.hidden = false;
    win.classList.remove('minimized');
    win.style.display = '';
    focusWindow(win);
    startMenu.hidden = true;
    startButton.setAttribute('aria-expanded', 'false');
    syncTaskbar();
  }

  function closeWindow(win) {
    win.hidden = true;
    win.classList.remove('active-window', 'maximized', 'minimized');
    win.style.display = '';
    const remaining = windows.filter((item) => !item.hidden);
    if (remaining.length) focusWindow(remaining[remaining.length - 1]);
    syncTaskbar();
  }

  document.querySelectorAll('[data-open]').forEach((control) => {
    control.addEventListener('click', (event) => {
      if (control.tagName === 'A') return;
      event.stopPropagation();
      openWindow(control.dataset.open);
    });
  });

  windows.forEach((win) => {
    win.addEventListener('pointerdown', () => focusWindow(win));
    win.querySelector('[data-close]')?.addEventListener('click', () => closeWindow(win));
    win.querySelector('[data-minimize]')?.addEventListener('click', () => {
      win.classList.add('minimized');
      win.style.display = 'none';
      win.classList.remove('active-window');
      syncTaskbar();
    });
    win.querySelector('[data-maximize]')?.addEventListener('click', () => {
      win.classList.toggle('maximized');
      focusWindow(win);
    });

    const bar = win.querySelector('.titlebar');
    let drag = null;
    bar?.addEventListener('pointerdown', (event) => {
      if (event.target.closest('button') || win.classList.contains('maximized') || innerWidth <= 700) return;
      const rect = win.getBoundingClientRect();
      drag = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      bar.setPointerCapture(event.pointerId);
    });
    bar?.addEventListener('pointermove', (event) => {
      if (!drag) return;
      const maxX = innerWidth - Math.min(win.offsetWidth, innerWidth) - 4;
      const maxY = innerHeight - 76;
      win.style.left = `${Math.max(0, Math.min(maxX, event.clientX - drag.x))}px`;
      win.style.top = `${Math.max(0, Math.min(maxY, event.clientY - drag.y))}px`;
    });
    bar?.addEventListener('pointerup', () => { drag = null; });
  });

  startButton.addEventListener('click', (event) => {
    event.stopPropagation();
    startMenu.hidden = !startMenu.hidden;
    startButton.setAttribute('aria-expanded', String(!startMenu.hidden));
  });
  startMenu.addEventListener('click', (event) => event.stopPropagation());
  document.addEventListener('click', () => {
    startMenu.hidden = true;
    startButton.setAttribute('aria-expanded', 'false');
  });

  function updateClock() {
    document.getElementById('clock').textContent = new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(new Date());
  }
  updateClock();
  window.setInterval(updateClock, 30000);
  window.setTimeout(() => document.getElementById('boot-screen').classList.add('done'), 1450);

  document.getElementById('shutdown').addEventListener('click', () => {
    startMenu.hidden = true;
    const boot = document.getElementById('boot-screen');
    boot.querySelector('small').textContent = 'It is now safe to close this tab.';
    boot.querySelector('.boot-track').hidden = true;
    boot.classList.remove('done');
  });
  document.getElementById('logoff').addEventListener('click', () => {
    startMenu.hidden = true;
    windows.forEach((win) => { if (win.dataset.app !== 'welcome') win.hidden = true; });
    openWindow('welcome');
  });

  document.getElementById('empty-bin').addEventListener('click', () => {
    const list = document.querySelector('.recycle ul');
    list.innerHTML = '<li>Recycle Bin is empty.</li>';
    document.getElementById('recycle-status').textContent = '0 objects';
  });

  const launchDuke = document.getElementById('launch-duke');
  launchDuke.addEventListener('click', () => {
    if (dukeStarted) return;
    if (typeof window.Dos !== 'function') {
      document.getElementById('game-status').textContent = 'Emulator could not load — check connection';
      return;
    }
    dukeStarted = true;
    document.querySelector('.game-shell').classList.add('running');
    document.getElementById('game-status').textContent = 'Loading 1996 shareware files…';
    window.Dos(document.getElementById('dos-player'), {
      url: 'games/duke3d/duke3d-shareware.jsdos',
      theme: 'dark',
      autoStart: true,
      kiosk: false,
      onEvent: (event) => {
        if (event === 'ci-ready') document.getElementById('game-status').textContent = 'Duke3D running in DOS';
      }
    });
  });

  const canvas = document.getElementById('paint-canvas');
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  let drawing = false;
  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height };
  }
  canvas.addEventListener('pointerdown', (event) => {
    drawing = true;
    canvas.setPointerCapture(event.pointerId);
    const point = canvasPoint(event);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!drawing) return;
    const point = canvasPoint(event);
    ctx.strokeStyle = document.getElementById('paint-color').value;
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  });
  canvas.addEventListener('pointerup', () => { drawing = false; });
  document.querySelector('[data-tool="clear"]').addEventListener('click', () => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  });

  const mineGrid = document.getElementById('mine-grid');
  const mineReset = document.getElementById('mine-reset');
  let mineTimer = null;
  let mineSeconds = 0;
  let mineCells = [];
  function resetMines() {
    window.clearInterval(mineTimer);
    mineTimer = null;
    mineSeconds = 0;
    document.getElementById('mine-time').textContent = '000';
    document.getElementById('mine-count').textContent = '010';
    mineReset.textContent = '🙂';
    mineGrid.replaceChildren();
    const bombs = new Set();
    while (bombs.size < 10) bombs.add(Math.floor(Math.random() * 81));
    mineCells = Array.from({ length: 81 }, (_, index) => ({ bomb: bombs.has(index), revealed: false, flagged: false }));
    mineCells.forEach((cell, index) => {
      const button = document.createElement('button');
      button.className = 'mine-cell';
      button.setAttribute('aria-label', `Covered cell ${index + 1}`);
      button.addEventListener('click', () => revealMine(index));
      button.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        if (cell.revealed) return;
        cell.flagged = !cell.flagged;
        button.classList.toggle('flagged', cell.flagged);
      });
      mineGrid.append(button);
    });
  }
  function neighbors(index) {
    const row = Math.floor(index / 9), col = index % 9, result = [];
    for (let dy = -1; dy <= 1; dy += 1) for (let dx = -1; dx <= 1; dx += 1) {
      const y = row + dy, x = col + dx;
      if ((dx || dy) && y >= 0 && y < 9 && x >= 0 && x < 9) result.push(y * 9 + x);
    }
    return result;
  }
  function revealMine(index) {
    const cell = mineCells[index];
    if (!cell || cell.flagged || cell.revealed) return;
    if (!mineTimer) mineTimer = window.setInterval(() => {
      mineSeconds = Math.min(999, mineSeconds + 1);
      document.getElementById('mine-time').textContent = String(mineSeconds).padStart(3, '0');
    }, 1000);
    const button = mineGrid.children[index];
    cell.revealed = true;
    button.classList.add('revealed');
    if (cell.bomb) {
      button.textContent = '💣';
      mineReset.textContent = '😵';
      window.clearInterval(mineTimer);
      mineCells.forEach((item, i) => { if (item.bomb) mineGrid.children[i].textContent = '💣'; });
      return;
    }
    const count = neighbors(index).filter((i) => mineCells[i].bomb).length;
    if (count) { button.textContent = String(count); button.dataset.n = String(count); }
    else neighbors(index).forEach(revealMine);
    if (mineCells.filter((item) => item.revealed).length === 71) { mineReset.textContent = '😎'; window.clearInterval(mineTimer); }
  }
  mineReset.addEventListener('click', resetMines);
  resetMines();
  syncTaskbar();
})();
