/* ============================================================
   PRELOADER.JS — Page load overlay animation (GSAP)
   ============================================================ */

(function() {
  'use strict';

  const BELT_COUNT = 10;

  // ── DOM references ──
  const whiteOverlay  = document.querySelector('.pl-white-overlay');
  const overlay       = document.querySelector('.pl-overlay');
  const overlayCenter = document.querySelector('.pl-overlay-center');
  const belts         = document.querySelectorAll('.pl-overlay .pl-belt');
  const flyingPluses  = document.querySelectorAll('.pl-flying-plus');
  const logoBox       = document.querySelector('.pl-logo-black-box');
  const borderSvg     = document.querySelector('.pl-border-svg');
  const tPaths        = document.querySelectorAll('.pl-t-path');
  const cornerPluses  = document.querySelectorAll('.pl-logo-corner-plus');
  const counter       = document.querySelector('.pl-overlay-counter');
  const slotReels     = document.querySelectorAll('.pl-slot-reel .pl-slot-strip');
  const tagWords      = document.querySelectorAll('.pl-tag-word');
  const tagDots       = document.querySelectorAll('.pl-tag-dot');
  const mainEl        = document.querySelector('main');

  // ── Counter digits setup ──
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  function buildSlotStrips() {
    slotReels.forEach((strip, i) => {
      // tens, ones, last reel
      const nums = [];
      if (i === 0) {
        for (let n = 0; n <= 10; n++) nums.push(String(Math.floor(n / 1) % 10));
      } else {
        for (let n = 0; n <= 10; n++) nums.push(String(n % 10));
      }
      strip.innerHTML = nums.map(d => `<span class="pl-slot-digit">${d}</span>`).join('');
    });
  }

  // ── Flying plus positions ──
  function randomPlus(el) {
    const x = 10 + Math.random() * 80;
    const y = 10 + Math.random() * 80;
    el.style.left = x + 'vw';
    el.style.top  = y + 'vh';
  }

  // ── Main preloader sequence ──
  function runPreloader() {
    if (!window.gsap) {
      // Fallback: just show page immediately
      finishPreloader();
      return;
    }

    const gsap = window.gsap;
    const tl = gsap.timeline({ onComplete: finishPreloader });

    // Set initial states
    gsap.set(overlay, { visibility: 'visible' });
    gsap.set(overlayCenter, { visibility: 'visible' });
    gsap.set(belts, { scaleY: 0, transformOrigin: '50% 0%' });

    // 1. Belts stagger in from top
    tl.to(belts, {
      scaleY: 1,
      duration: 0.6,
      stagger: 0.04,
      ease: 'power2.inOut',
    }, 0);

    // 2. White overlay out
    tl.to(whiteOverlay, { opacity: 0, duration: 0.3, ease: 'power2.out' }, 0.2);

    // 3. Show logo center
    tl.set(logoBox, { opacity: 1 }, 0.5);

    // 4. Logo box reveal
    tl.to(logoBox, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.5);

    // 5. Corner pluses appear
    tl.fromTo(cornerPluses,
      { opacity: 0, scale: 0 },
      { opacity: 1, scale: 1, duration: 0.3, stagger: 0.05, ease: 'back.out(2)' },
      0.7
    );

    // 6. T-paths draw
    tPaths.forEach((path, i) => {
      tl.to(path, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.8 + i * 0.1);
    });

    // 7. Flying pluses animate
    flyingPluses.forEach((el, i) => {
      randomPlus(el);
      tl.to(el, { opacity: 1, duration: 0.2, ease: 'power2.out' }, 0.9 + i * 0.08);
      tl.to(el, {
        x: (Math.random() - 0.5) * 100,
        y: (Math.random() - 0.5) * 100,
        duration: 1.5,
        ease: 'power1.inOut',
      }, 0.9 + i * 0.08);
    });

    // 8. Counter appears
    tl.to(counter, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0.8);

    // 9. Counter counts 0→100
    const countObj = { val: 0 };
    tl.to(countObj, {
      val: 100,
      duration: 1.5,
      ease: 'power1.inOut',
      onUpdate: function() {
        const v = Math.round(countObj.val);
        const hundreds = Math.floor(v / 100);
        const tens     = Math.floor((v % 100) / 10);
        const ones     = v % 10;
        // Update slot strips by translating them
        if (slotReels[0]) {
          gsap.set(slotReels[0], { y: -(hundreds * 1) + 'rem' });
        }
        if (slotReels[1]) {
          gsap.set(slotReels[1], { y: -(tens * 1) + 'rem' });
        }
        if (slotReels[2]) {
          gsap.set(slotReels[2], { y: -(ones * 1) + 'rem' });
        }
      }
    }, 0.9);

    // 10. Tagline words appear
    tl.call(() => {
      tagWords.forEach((w, i) => {
        setTimeout(() => w.classList.add('visible'), i * 150);
      });
      tagDots.forEach((d, i) => {
        setTimeout(() => d.classList.add('visible'), i * 150 + 75);
      });
    }, null, 1.8);

    // 11. Hold on screen briefly
    tl.to({}, { duration: 0.8 }, 2.4);

    // 12. Belt strips exit downward
    tl.to(belts, {
      scaleY: 0,
      transformOrigin: '50% 100%',
      duration: 0.6,
      stagger: { amount: 0.3, from: 'random' },
      ease: 'power2.inOut',
    }, 3.2);

    // 13. Logo box and overlays out
    tl.to([logoBox, counter, ...flyingPluses], {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out',
    }, 3.2);

    tl.to([overlayCenter], { visibility: 'hidden', duration: 0 }, 3.8);
    tl.to([overlay], { visibility: 'hidden', duration: 0 }, 3.8);
  }

  function finishPreloader() {
    // Reveal main page content
    if (mainEl) {
      if (window.gsap) {
        gsap.to(mainEl, { opacity: 1, visibility: 'visible', duration: 0 });
      } else {
        mainEl.style.opacity = '1';
        mainEl.style.visibility = 'visible';
      }
    }
    // Hide white overlay
    if (whiteOverlay) whiteOverlay.style.display = 'none';
    // Fire page animations
    if (window.initPageAnimations) window.initPageAnimations();
    // Refresh ScrollTrigger after layout becomes visible
    if (window.ScrollTrigger) {
      window.ScrollTrigger.refresh();
      setTimeout(() => window.ScrollTrigger.refresh(), 200);
    }
  }

  // ── Init ──
  function init() {
    buildSlotStrips();
    // Hide main until preloader finishes
    if (mainEl) {
      mainEl.style.opacity = '0';
      mainEl.style.visibility = 'hidden';
    }
    runPreloader();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
