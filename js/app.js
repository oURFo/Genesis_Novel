/* ============================================
   花圃數學園 - App Controller (Main Entry)
   ============================================ */

/* ======================================================
   Fullscreen
   ====================================================== */
function initFullscreen() {
  const btn = document.getElementById('fullscreen-btn');
  if (!btn) return;

  const supported = document.fullscreenEnabled ||
                    document.webkitFullscreenEnabled ||
                    false;
  if (!supported) { btn.style.display = 'none'; return; }

  btn.addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange',       syncFullscreenBtn);
  document.addEventListener('webkitfullscreenchange', syncFullscreenBtn);
}

function toggleFullscreen() {
  const el = document.documentElement;
  const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
  if (!isFs) {
    (el.requestFullscreen || el.webkitRequestFullscreen).call(el, { navigationUI: 'hide' })
      .catch(() => {});
  } else {
    (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  }
}

function syncFullscreenBtn() {
  const btn = document.getElementById('fullscreen-btn');
  if (!btn) return;
  const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
  btn.textContent = isFs ? '⊡' : '⛶';
  btn.title       = isFs ? '離開全螢幕' : '全螢幕';
}

/* ======================================================
   Post-process static <ruby> elements in HTML
   (those written directly as <ruby>字<rt>注音</rt></ruby>
   don't go through toRuby, so we split them here)
   ====================================================== */
function processStaticRuby() {
  document.querySelectorAll('ruby > rt').forEach(rt => {
    if (rt.children.length === 0 && rt.textContent.trim()) {
      const { body, tone } = splitZhuyin(rt.textContent.trim());
      if (tone === '˙') {
        rt.classList.add('light-tone');
        rt.innerHTML = `<span class="zy-t">˙</span><span class="zy-b">${body}</span>`;
      } else {
        rt.innerHTML = `<span class="zy-b">${body}</span>${tone ? `<span class="zy-t">${tone}</span>` : ''}`;
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {

  /* ── 0. Fix static ruby annotations ───── */
  processStaticRuby();

  /* ── 1. Load question bank ─────────────── */
  await QuestionManager.init();

  /* ── 2. Onboarding / player check ─────── */
  if (!Storage.hasPlayer()) {
    showOnboarding();
  } else {
    startApp();
  }

  /* ── 3. Bind global events ─────────────── */
  bindEvents();
});

/* ======================================================
   Onboarding
   ====================================================== */
function showOnboarding() {
  const overlay = document.getElementById('onboarding-overlay');
  overlay.classList.remove('hidden');

  const input = document.getElementById('player-name-input');
  const startBtn = document.getElementById('start-btn');

  input.focus();

  function handleStart() {
    const name = input.value.trim();
    if (!name) {
      input.style.borderColor = '#e63946';
      input.placeholder = '請輸入名字！';
      input.focus();
      return;
    }
    Storage.setPlayerName(name);
    overlay.classList.add('hidden');
    startApp();
  }

  startBtn.addEventListener('click', handleStart);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') handleStart(); });
}

/* ======================================================
   App Start
   ====================================================== */
function startApp() {
  // Always ensure the onboarding overlay is hidden (covers returning-user case)
  document.getElementById('onboarding-overlay').classList.add('hidden');

  // Show player name in header (names may contain Chinese characters)
  const name = Storage.getPlayerName();
  const nameEl = document.getElementById('player-name-display');
  nameEl.innerHTML = (typeof toRuby === 'function') ? toRuby(name) : name;

  // Restore saved grade tab state
  const savedGrade = Storage.getGrade();
  updateGradeUI(savedGrade);

  // Render flower garden
  renderFlowerGrid();

  // Init scratchpad canvas (resize listener is registered internally)
  QuestionManager.initScratchpad();
}

/* ======================================================
   Grade Switch
   ====================================================== */
function switchGrade(grade) {
  Storage.setGrade(grade);
  updateGradeUI(grade);

  // Clear question panel (show placeholder)
  document.getElementById('question-area').classList.add('hidden');
  document.getElementById('no-topic-placeholder').classList.remove('hidden');

  // Re-render flower grid for new grade
  renderFlowerGrid();
}

function updateGradeUI(grade) {
  // Update Tab buttons
  document.querySelectorAll('.grade-tab').forEach(tab => {
    const tabGrade = parseInt(tab.dataset.grade);
    tab.classList.toggle('active', tabGrade === grade);
  });

  // Update garden title
  const titleEl = document.getElementById('garden-title');
  if (titleEl) {
    const gradeLabel = grade === 2 ? '二年級' : '一年級';
    titleEl.innerHTML = toRuby('我的' + gradeLabel + '花圃');
  }

  // Update bloom total count
  const totalEl = document.getElementById('bloom-total');
  if (totalEl) {
    const flowers = getActiveFlowers();
    totalEl.textContent = flowers.length;
  }
}

/* ======================================================
   Event Bindings
   ====================================================== */
function bindEvents() {

  /* Grade Tab buttons */
  document.querySelectorAll('.grade-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const grade = parseInt(tab.dataset.grade);
      if (grade !== Storage.getGrade()) {
        switchGrade(grade);
      }
    });
  });

  /* Reset button → show confirm modal */
  document.getElementById('reset-btn').addEventListener('click', () => {
    document.getElementById('reset-overlay').classList.remove('hidden');
  });

  /* Cancel reset */
  document.getElementById('cancel-reset-btn').addEventListener('click', () => {
    document.getElementById('reset-overlay').classList.add('hidden');
  });

  /* Confirm reset */
  document.getElementById('confirm-reset-btn').addEventListener('click', () => {
    Storage.reset();
    document.getElementById('reset-overlay').classList.add('hidden');
    // Reload page to restart fresh
    window.location.reload();
  });

  /* Close reset overlay when clicking backdrop */
  document.getElementById('reset-overlay').addEventListener('click', function(e) {
    if (e.target === this) this.classList.add('hidden');
  });

  /* Level-up modal close */
  document.getElementById('levelup-close-btn').addEventListener('click', () => {
    document.getElementById('levelup-overlay').classList.add('hidden');
  });

  /* Close level-up overlay clicking backdrop */
  document.getElementById('levelup-overlay').addEventListener('click', function(e) {
    if (e.target === this) this.classList.add('hidden');
  });

  /* MC option buttons */
  document.querySelectorAll('.mc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx);
      QuestionManager.handleMcAnswer(idx);
    });
  });

  /* Numpad buttons */
  document.querySelectorAll('.np-btn').forEach(btn => {
    if (btn.dataset.num !== undefined) {
      btn.addEventListener('click', () => {
        QuestionManager.appendDigit(btn.dataset.num);
      });
    }
  });

  /* Numpad delete */
  document.getElementById('np-del').addEventListener('click', () => {
    QuestionManager.deleteDigit();
  });

  /* Submit answer */
  document.getElementById('submit-btn').addEventListener('click', () => {
    QuestionManager.handleFillSubmit();
  });

  /* Fullscreen button */
  initFullscreen();

  /* Keyboard support */
  document.addEventListener('keydown', e => {
    // Only when fill-in answer area is visible
    const answerArea = document.getElementById('answer-area');
    if (answerArea.classList.contains('hidden')) return;

    if (e.key >= '0' && e.key <= '9') {
      QuestionManager.appendDigit(e.key);
    } else if (e.key === 'Backspace') {
      QuestionManager.deleteDigit();
    } else if (e.key === 'Enter') {
      QuestionManager.handleFillSubmit();
    }
  });
}
