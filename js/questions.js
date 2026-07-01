/* ============================================
   花圃數學園 - Question Manager
   ============================================ */

const QuestionManager = (() => {

  let allTopicsG1 = [];
  let allTopicsG2 = [];
  let currentTopic = null;
  let currentFlower = null;
  let currentQuestion = null;
  let usedIndices = [];
  let answerValue = '';
  let isAnswered = false;
  let displayedOpts = [];   // shuffled option order for current MC question

  /* ── Load question banks ────────────────── */
  async function init() {
    try {
      const [res1, res2] = await Promise.all([
        fetch('data/questions.json'),
        fetch('data/questions_g2.json')
      ]);
      const [data1, data2] = await Promise.all([res1.json(), res2.json()]);
      allTopicsG1 = data1.topics;
      allTopicsG2 = data2.topics;
    } catch (e) {
      console.error('Failed to load questions:', e);
      // Fallback: try loading only grade 1
      try {
        const res = await fetch('data/questions.json');
        const data = await res.json();
        allTopicsG1 = data.topics;
      } catch (e2) {
        console.error('Grade 1 questions also failed:', e2);
      }
    }
  }

  /* ── Get active topics by grade ─────────── */
  function getActiveTopics() {
    return Storage.getGrade() === 2 ? allTopicsG2 : allTopicsG1;
  }

  /* ── Pick a question for current topic ─── */
  function pickQuestion() {
    if (!currentTopic) return null;
    const qs = currentTopic.questions;
    if (usedIndices.length >= qs.length) usedIndices = [];

    let idx;
    do {
      idx = Math.floor(Math.random() * qs.length);
    } while (usedIndices.includes(idx) && usedIndices.length < qs.length);

    usedIndices.push(idx);
    return qs[idx];
  }

  /* ── Load topic into question panel ───── */
  function loadTopic(flower) {
    currentFlower = flower;
    const topics = getActiveTopics();
    currentTopic = topics.find(t => t.id === flower.id);
    if (!currentTopic) return;

    usedIndices = [];

    // Show question area, hide placeholder
    document.getElementById('no-topic-placeholder').classList.add('hidden');
    document.getElementById('question-area').classList.remove('hidden');

    // Update topic bar
    document.getElementById('q-flower-icon').textContent = flower.icon;
    document.getElementById('q-topic-name').innerHTML = toRuby(flower.chineseName || flower.name);

    updateProgressBar();
    showNextQuestion();
  }

  /* ── Update progress bar ──────────────── */
  function updateProgressBar() {
    if (!currentFlower) return;
    const p = Storage.getFlowerProgress(currentFlower.id);
    const correct = p.correct || 0;
    const pct = Math.min(100, Math.round((correct / 50) * 100));
    document.getElementById('q-progress-fill').style.width = pct + '%';
    document.getElementById('q-progress-text').textContent = correct + ' / 50';
  }

  /* ── Display next question ─────────────── */
  function showNextQuestion() {
    currentQuestion = pickQuestion();
    if (!currentQuestion) return;

    isAnswered = false;
    answerValue = '';
    updateAnswerDisplay();
    clearFeedback();
    resetMcButtons();

    // Question number
    const qNum = document.getElementById('question-number');
    const p = Storage.getFlowerProgress(currentFlower.id);
    const num = (p.correct || 0) + 1;
    qNum.innerHTML = `<ruby>第<rt>ㄉㄧˋ</rt></ruby> ${num} <ruby>題<rt>ㄊㄧˊ</rt></ruby>`;

    // Context (情境題): show story paragraph before question
    const ctxEl = document.getElementById('question-context');
    if (currentQuestion.context) {
      ctxEl.innerHTML = toRuby(currentQuestion.context);
      ctxEl.classList.remove('hidden');
    } else {
      ctxEl.classList.add('hidden');
    }

    // Question text (with auto 注音)
    document.getElementById('question-text').innerHTML = toRuby(currentQuestion.q);

    // Visual (emoji passes through unchanged)
    const vis = document.getElementById('question-visual');
    vis.innerHTML = toRuby(currentQuestion.visual || '');

    const isMc = currentQuestion.type === 'mc';
    const mcOpts = document.getElementById('mc-options');
    const answerArea = document.getElementById('answer-area');

    if (isMc) {
      // Multiple choice: show options, hide numpad
      mcOpts.classList.remove('hidden');
      answerArea.classList.add('hidden');

      // Shuffle options so the correct answer isn't always in the same position
      displayedOpts = [...currentQuestion.opts].sort(() => Math.random() - 0.5);

      const btns = mcOpts.querySelectorAll('.mc-btn');
      btns.forEach((btn, i) => {
        if (i < displayedOpts.length) {
          btn.innerHTML = toRuby(String(displayedOpts[i]));
          btn.className = 'mc-btn';
          btn.disabled = false;
          btn.style.display = '';
        } else {
          btn.style.display = 'none';
        }
      });
    } else {
      // Fill in: hide MC, show numpad
      mcOpts.classList.add('hidden');
      answerArea.classList.remove('hidden');
    }

    // Clear scratchpad
    clearScratchpad();
  }

  /* ── MC option click ─────────────────── */
  function handleMcAnswer(idx) {
    if (isAnswered) return;
    isAnswered = true;

    const btns = document.querySelectorAll('.mc-btn');
    btns.forEach(b => b.disabled = true);

    // Compare against the DISPLAYED (shuffled) options, not the original array
    const selectedValue = String(displayedOpts[idx]);
    const isCorrect = selectedValue === String(currentQuestion.answer);
    const correctIdx = displayedOpts.findIndex(o => String(o) === String(currentQuestion.answer));

    if (isCorrect) {
      btns[idx].classList.add('correct');
      onCorrect();
    } else {
      btns[idx].classList.add('wrong');
      if (correctIdx >= 0) btns[correctIdx].classList.add('reveal-correct');
      onWrong(currentQuestion.answer);
    }
  }

  /* ── Fill-in submit ──────────────────── */
  function handleFillSubmit() {
    if (isAnswered || answerValue === '') return;
    isAnswered = true;

    const userAns = answerValue.trim();
    const correctAns = String(currentQuestion.answer).trim();
    const isCorrect = userAns === correctAns;

    document.getElementById('submit-btn').disabled = true;

    if (isCorrect) {
      onCorrect();
    } else {
      onWrong(correctAns);
    }
  }

  /* ── Correct answer flow ─────────────── */
  function onCorrect() {
    const prevCorrect = (Storage.getFlowerProgress(currentFlower.id).correct || 0);
    const newCorrect = Storage.addCorrect(currentFlower.id);
    const prevStage = getStage(prevCorrect);
    const newStage = getStage(newCorrect);

    showFeedback(true);
    updateProgressBar();

    // Trigger particles
    Particles.burstCorrect(currentFlower.id);

    // Update flower card
    updateFlowerCard(currentFlower.id);

    // Check level up
    if (newStage > prevStage) {
      setTimeout(() => {
        triggerLevelUpAnimation(currentFlower.id, newStage);
      }, 800);
    }

    // Next question after delay
    setTimeout(() => {
      clearFeedback();
      document.getElementById('submit-btn').disabled = false;
      showNextQuestion();
    }, 1800);
  }

  /* ── Wrong answer flow ───────────────── */
  function onWrong(correctAns) {
    Storage.addAttempt(currentFlower.id);
    showFeedback(false, correctAns);

    // After showing feedback, move to next question
    setTimeout(() => {
      clearFeedback();
      document.getElementById('submit-btn').disabled = false;
      showNextQuestion();
    }, 2200);
  }

  /* ── Feedback display ────────────────── */
  function showFeedback(isCorrect, correctAns) {
    const fb = document.getElementById('answer-feedback');
    const fcorrect = document.getElementById('feedback-correct');
    const fwrong = document.getElementById('feedback-wrong');

    fb.classList.remove('hidden');

    if (isCorrect) {
      fcorrect.classList.remove('hidden');
      fwrong.classList.add('hidden');
    } else {
      fcorrect.classList.add('hidden');
      fwrong.classList.remove('hidden');
      const wrongText = document.getElementById('feedback-wrong-text');
      wrongText.innerHTML = correctAns
        ? `<ruby>再<rt>ㄗㄞˋ</rt></ruby><ruby>想<rt>ㄒㄧㄤˇ</rt></ruby><ruby>想<rt>ㄒㄧㄤˇ</rt></ruby><ruby>看<rt>ㄎㄢˋ</rt></ruby>！<ruby>正<rt>ㄓㄥˋ</rt></ruby><ruby>確<rt>ㄑㄩㄝˋ</rt></ruby><ruby>答<rt>ㄉㄚˊ</rt></ruby><ruby>案<rt>ㄢˋ</rt></ruby><ruby>是<rt>ㄕˋ</rt></ruby> ${correctAns}`
        : '<ruby>再<rt>ㄗㄞˋ</rt></ruby><ruby>想<rt>ㄒㄧㄤˇ</rt></ruby><ruby>想<rt>ㄒㄧㄤˇ</rt></ruby><ruby>看<rt>ㄎㄢˋ</rt></ruby>！';
    }
  }

  function clearFeedback() {
    document.getElementById('answer-feedback').classList.add('hidden');
    document.getElementById('feedback-correct').classList.add('hidden');
    document.getElementById('feedback-wrong').classList.add('hidden');
  }

  /* ── Answer display update ────────────── */
  function updateAnswerDisplay() {
    const el = document.getElementById('answer-value-display');
    if (el) el.textContent = answerValue || '__';
  }

  /* ── Numpad handlers ─────────────────── */
  function appendDigit(digit) {
    if (isAnswered) return;
    if (answerValue.length >= 4) return;
    answerValue += digit;
    updateAnswerDisplay();
  }

  function deleteDigit() {
    if (isAnswered) return;
    answerValue = answerValue.slice(0, -1);
    updateAnswerDisplay();
  }

  /* ── MC button reset ─────────────────── */
  function resetMcButtons() {
    const btns = document.querySelectorAll('.mc-btn');
    btns.forEach(b => {
      b.className = 'mc-btn';
      b.disabled = false;
    });
  }

  /* ── Scratchpad ──────────────────────── */
  const scratchpadState = {
    canvas: null,
    ctx: null,
    drawing: false,
    tool: 'pen',
    size: 4,
    lastX: 0,
    lastY: 0,
    initialized: false
  };

  function initScratchpad() {
    const canvas = document.getElementById('scratchpad-canvas');
    if (!canvas) return;

    scratchpadState.canvas = canvas;
    scratchpadState.ctx = canvas.getContext('2d');

    resizeScratchpad();

    // Only bind event listeners once
    if (scratchpadState.initialized) return;
    scratchpadState.initialized = true;

    window.addEventListener('resize', () => setTimeout(resizeScratchpad, 100));

    // Mouse events
    canvas.addEventListener('mousedown',  startDraw);
    canvas.addEventListener('mousemove',  doDraw);
    canvas.addEventListener('mouseup',    stopDraw);
    canvas.addEventListener('mouseleave', stopDraw);

    // Touch events (passive:false needed to prevent page scroll)
    canvas.addEventListener('touchstart',  e => { e.preventDefault(); startDraw(e.touches[0]); }, { passive: false });
    canvas.addEventListener('touchmove',   e => { e.preventDefault(); doDraw(e.touches[0]); },   { passive: false });
    canvas.addEventListener('touchend',    e => { e.preventDefault(); stopDraw(); },              { passive: false });

    // Toolbar
    document.getElementById('tool-pen').addEventListener('click', () => setTool('pen'));
    document.getElementById('tool-eraser').addEventListener('click', () => setTool('eraser'));
    document.getElementById('tool-clear').addEventListener('click', clearScratchpad);
    document.getElementById('stroke-size').addEventListener('input', e => {
      scratchpadState.size = parseInt(e.target.value);
    });
  }

  function resizeScratchpad() {
    const canvas = scratchpadState.canvas;
    if (!canvas) return;
    // Preserve drawing by saving to image before resize
    const img = canvas.toDataURL();
    const parent = canvas.parentElement;
    const toolbar = parent.querySelector('.scratchpad-toolbar');
    const toolbarH = toolbar ? toolbar.offsetHeight : 44;
    const rect = parent.getBoundingClientRect();
    canvas.width  = Math.floor(rect.width);
    canvas.height = Math.floor(rect.height - toolbarH);
    // Restore drawing
    if (img && img !== 'data:,') {
      const image = new Image();
      image.onload = () => scratchpadState.ctx && scratchpadState.ctx.drawImage(image, 0, 0);
      image.src = img;
    }
  }

  function getCanvasPos(e) {
    const canvas = scratchpadState.canvas;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top)  * (canvas.height / rect.height)
    };
  }

  function startDraw(e) {
    scratchpadState.drawing = true;
    const { x, y } = getCanvasPos(e);
    scratchpadState.lastX = x;
    scratchpadState.lastY = y;
    const ctx = scratchpadState.ctx;
    ctx.beginPath();
    ctx.arc(x, y, scratchpadState.size / 2, 0, Math.PI * 2);
    ctx.fillStyle = scratchpadState.tool === 'eraser' ? '#ffffff' : '#1a1a2e';
    ctx.fill();
  }

  function doDraw(e) {
    if (!scratchpadState.drawing) return;
    const ctx = scratchpadState.ctx;
    const { x, y } = getCanvasPos(e);
    const isEraser = scratchpadState.tool === 'eraser';

    ctx.beginPath();
    ctx.moveTo(scratchpadState.lastX, scratchpadState.lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = isEraser ? '#ffffff' : '#1a1a2e';
    ctx.lineWidth = isEraser ? scratchpadState.size * 3 : scratchpadState.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    scratchpadState.lastX = x;
    scratchpadState.lastY = y;
  }

  function stopDraw() {
    scratchpadState.drawing = false;
  }

  function setTool(tool) {
    scratchpadState.tool = tool;
    document.getElementById('tool-pen').classList.toggle('active', tool === 'pen');
    document.getElementById('tool-eraser').classList.toggle('active', tool === 'eraser');
  }

  function clearScratchpad() {
    const { canvas, ctx } = scratchpadState;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  /* ── Public API ──────────────────────── */
  return {
    init,
    loadTopic,
    handleMcAnswer,
    handleFillSubmit,
    appendDigit,
    deleteDigit,
    initScratchpad,
    updateProgressBar
  };

})();
