/* ============================================================
   CARDS.JS — 3D perspective tilt on key facts cards
   ============================================================ */

(function() {
  'use strict';

  const cards = document.querySelectorAll('[data-kf-card]');
  if (!cards.length) return;

  const MAX_TILT = 8; // degrees max tilt
  const SCALE    = 1.02;

  function handleMouseMove(e, card) {
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top  + rect.height / 2;
    const mouseX  = e.clientX - centerX;
    const mouseY  = e.clientY - centerY;

    const rotY =  (mouseX / (rect.width  / 2)) * MAX_TILT;
    const rotX = -(mouseY / (rect.height / 2)) * MAX_TILT;

    if (window.gsap) {
      gsap.to(card, {
        rotationX: rotX,
        rotationY: rotY,
        scale: SCALE,
        duration: 0.4,
        ease: 'power2.out',
        transformPerspective: 1000,
        transformOrigin: '50% 50%',
      });
    } else {
      card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${SCALE})`;
    }
  }

  function handleMouseLeave(card) {
    if (window.gsap) {
      gsap.to(card, {
        rotationX: 0,
        rotationY: 0,
        scale: 1,
        duration: 0.6,
        ease: 'power3.out',
      });
    } else {
      card.style.transform = '';
    }
  }

  // Only apply tilt on non-touch devices
  const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (!isTouchDevice()) {
    cards.forEach(card => {
      card.addEventListener('mousemove', e => handleMouseMove(e, card));
      card.addEventListener('mouseleave', () => handleMouseLeave(card));
    });
  }

  // ── Scroll reveal for cards ──
  if (window.gsap && window.ScrollTrigger) {
    cards.forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: i * 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none',
          }
        }
      );
    });
  }

  // ── Awards logo cycling ──
  const awardsLogoList = document.querySelector('.awards-logo-list');
  if (awardsLogoList) {
    const imgs = awardsLogoList.querySelectorAll('img');
    let current = 0;
    imgs.forEach((img, i) => {
      img.style.opacity = i === 0 ? '1' : '0';
      img.style.transition = 'opacity 0.4s ease';
    });

    setInterval(() => {
      imgs[current].style.opacity = '0';
      current = (current + 1) % imgs.length;
      imgs[current].style.opacity = '1';
    }, 2000);
  }

})();
