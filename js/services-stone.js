/* ============================================================
   SERVICES-STONE.JS — 3D Rotating Stone Scroll Sequence & Cards
   Preloads 371 frames of the 3D stone, scrubs through them on scroll,
   and animates 6 floating glassmorphism service cards.
   ============================================================ */

(function () {
  'use strict';

  function initStoneServices() {
    const section = document.getElementById('trionn-services');
    const canvas = document.getElementById('stone-canvas');
    if (!section || !canvas || !window.gsap || !window.ScrollTrigger) return;

    const ctx = canvas.getContext('2d');
    const TOTAL_FRAMES = 371;
    const images = new Array(TOTAL_FRAMES);
    let loadedCount = 0;
    let currentFrameIndex = 0;

    // ── Resize canvas to sharp DPI ──
    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);
      renderFrame(currentFrameIndex);
    }

    // ── Render Frame ──
    function renderFrame(index) {
      const img = images[index];
      if (!img || !img.complete) return;

      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      // Maintain aspect ratio cover / contain
      const aspect = img.naturalWidth / img.naturalHeight || (16 / 9);
      let renderW = w;
      let renderH = w / aspect;
      if (renderH > h) {
        renderH = h;
        renderW = h * aspect;
      }

      const x = (w - renderW) / 2;
      const y = (h - renderH) / 2;

      ctx.drawImage(img, x, y, renderW, renderH);
    }

    // ── Preload Strategy ──
    // Load first 20 frames immediately for rapid interaction, then the rest in background
    function preloadFrames() {
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        const img = new Image();
        img.decoding = 'async';
        const frameNum = String(i + 1).padStart(4, '0');
        img.src = `https://trionn.com/images/stone/frame_${frameNum}.webp`;
        img.onload = () => {
          loadedCount++;
          if (i === 0) renderFrame(0);
        };
        images[i] = img;
      }
    }

    preloadFrames();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // ── ScrollTrigger Pin & Scrub ──
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    const cards = section.querySelectorAll('.svc-card');
    const centerWords = section.querySelectorAll('[data-service-word]');
    const subtitleG = section.querySelector('.services-sub-1');
    const subtitleB = section.querySelector('.services-sub-2');

    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=400%',
      pin: true,
      scrub: 0.5,
      anticipatePin: 1,
      onUpdate: self => {
        const progress = self.progress;

        // Map progress 0..1 to frame index 0..370
        const frame = Math.min(TOTAL_FRAMES - 1, Math.floor(progress * TOTAL_FRAMES));
        if (frame !== currentFrameIndex) {
          currentFrameIndex = frame;
          renderFrame(frame);
        }

        // Center marquee text fades out as stone rotates
        const wordAlpha = Math.max(0, 1 - progress * 3.5);
        centerWords.forEach(w => {
          w.style.opacity = wordAlpha;
          w.style.filter = `blur(${(1 - wordAlpha) * 10}px)`;
        });

        // Subtitle flip
        if (subtitleG && subtitleB) {
          if (progress < 0.5) {
            subtitleG.style.opacity = Math.max(0, 1 - progress * 2);
            subtitleB.style.opacity = '0';
          } else {
            subtitleG.style.opacity = '0';
            subtitleB.style.opacity = Math.min(1, (progress - 0.5) * 2.5);
          }
        }

        // Cards appearance window (progress 0.25 to 0.85)
        cards.forEach((card, idx) => {
          const isLeft = card.classList.contains('card-left');
          const cardWindowStart = 0.2 + idx * 0.08;
          const cardWindowEnd = cardWindowStart + 0.3;

          let cardProg = 0;
          if (progress >= cardWindowStart && progress <= cardWindowEnd) {
            cardProg = (progress - cardWindowStart) / (cardWindowEnd - cardWindowStart);
          } else if (progress > cardWindowEnd) {
            cardProg = 1;
          }

          if (progress < cardWindowStart - 0.05 || progress > 0.9) {
            card.style.opacity = '0';
            card.style.pointerEvents = 'none';
          } else {
            const cardOpacity = Math.sin(cardProg * Math.PI);
            card.style.opacity = Math.max(0, cardOpacity);
            card.style.pointerEvents = cardOpacity > 0.5 ? 'auto' : 'none';

            const offset = (1 - cardProg) * (isLeft ? -80 : 80);
            card.style.transform = `translate3d(${offset}px, 0, 0)`;
          }
        });

        // Bottom transition stripes (progress 0.85 to 1.0)
        const stripes = section.querySelectorAll('.svc-stripe');
        if (progress > 0.85) {
          const stripeProg = (progress - 0.85) / 0.15;
          stripes.forEach((stripe, i) => {
            const sProg = Math.min(1, Math.max(0, (stripeProg - i * 0.1) / 0.5));
            stripe.style.transform = `scaleY(${sProg})`;
          });
        } else {
          stripes.forEach(s => s.style.transform = 'scaleY(0)');
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStoneServices);
  } else {
    initStoneServices();
  }
})();
