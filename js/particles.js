/* ============================================
   花圃數學園 - Particle Animation System
   ============================================ */

const Particles = (() => {

  const PARTICLE_COUNT = 12;
  const TYPES = ['sparkle', 'sparkle', 'sparkle', 'petal', 'petal', 'leaf'];
  const COLORS = ['#ffd166', '#f4a261', '#f8bbd9', '#b2dfdb', '#fff9c4', '#a5d6a7'];

  /* Get center of question submit button (origin of particles) */
  function getOrigin() {
    const btn = document.getElementById('submit-btn');
    const mc  = document.querySelector('.mc-btn.correct');
    const src = mc || btn;
    if (!src) return { x: window.innerWidth * 0.75, y: window.innerHeight * 0.8 };
    const rect = src.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top  + rect.height / 2
    };
  }

  /* Get center of specific flower card (destination) */
  function getFlowerCardCenter(flowerId) {
    const card = document.querySelector(`.flower-card[data-id="${flowerId}"]`);
    if (!card) return { x: window.innerWidth * 0.2, y: window.innerHeight * 0.5 };
    const rect = card.getBoundingClientRect();
    return {
      x: rect.left + rect.width  / 2,
      y: rect.top  + rect.height / 2
    };
  }

  /* Create and animate a single particle */
  function createParticle(origin, dest, delay) {
    const layer = document.getElementById('particle-layer');
    if (!layer) return;

    const type  = TYPES[Math.floor(Math.random() * TYPES.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const size  = 6 + Math.random() * 8;

    const el = document.createElement('div');
    el.className = `particle particle-${type}`;

    // Scatter offset from origin
    const ox = origin.x + (Math.random() - 0.5) * 40;
    const oy = origin.y + (Math.random() - 0.5) * 20;

    el.style.cssText = `
      left: ${ox}px;
      top:  ${oy}px;
      width:  ${size}px;
      height: ${size}px;
      background: ${type === 'sparkle' ? `radial-gradient(circle, ${color}, transparent)` : color};
      box-shadow: ${type === 'sparkle' ? `0 0 6px ${color}` : 'none'};
    `;

    layer.appendChild(el);

    // Animate: fly from origin to dest using CSS animation
    const duration = 600 + Math.random() * 400;
    const dx = dest.x - ox;
    const dy = dest.y - oy;

    // Use JS-driven WAAPI for precise control
    el.animate([
      { transform: `translate(0, 0) scale(1) rotate(0deg)`,   opacity: 1 },
      { transform: `translate(${dx * 0.3}px, ${dy * 0.3 - 40}px) scale(1.3) rotate(${Math.random() * 180}deg)`, opacity: 1, offset: 0.4 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.2) rotate(${Math.random() * 360}deg)`, opacity: 0 }
    ], {
      duration,
      delay,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      fill: 'forwards'
    }).onfinish = () => el.remove();
  }

  /* Burst of particles on correct answer */
  function burstCorrect(flowerId) {
    const origin = getOrigin();
    const dest   = getFlowerCardCenter(flowerId);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      createParticle(origin, dest, i * 40);
    }

    // Ring burst at origin
    createBurstRing(origin);

    // Brief star shower
    spawnStars(3);
  }

  /* Expanding ring at origin */
  function createBurstRing(origin) {
    const layer = document.getElementById('particle-layer');
    if (!layer) return;

    const ring = document.createElement('div');
    ring.className = 'burst-ring';
    ring.style.cssText = `
      left: ${origin.x - 20}px;
      top:  ${origin.y - 20}px;
      width: 40px;
      height: 40px;
    `;
    layer.appendChild(ring);
    setTimeout(() => ring.remove(), 700);
  }

  /* Falling stars from top */
  function spawnStars(count) {
    const layer = document.getElementById('particle-layer');
    if (!layer) return;

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const star = document.createElement('div');
        star.className = 'star-fall';
        star.textContent = ['⭐','✨','💫'][Math.floor(Math.random() * 3)];
        star.style.left = Math.random() * window.innerWidth + 'px';
        const dur = 1200 + Math.random() * 800;
        star.style.animationDuration = dur + 'ms';
        layer.appendChild(star);
        setTimeout(() => star.remove(), dur + 100);
      }, i * 150);
    }
  }

  return { burstCorrect };

})();
