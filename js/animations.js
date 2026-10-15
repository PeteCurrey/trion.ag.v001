/* ============================================================
   ANIMATIONS.JS — Scroll reveals, text splits, marquee, Lenis
   ============================================================ */

window.initPageAnimations = function() {
  'use strict';

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap) return;
  if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  // ── Lenis smooth scroll ──
  if (window.Lenis) {
    const lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      smooth: true,
    });
    // Prevent smooth scroll inside elements with data-lenis-prevent
    if (ScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    window._lenis = lenis;
  }

  // ── Utility: split text into character spans ──
  function splitChars(el) {
    const text = el.textContent;
    el.innerHTML = text.split('').map(ch =>
      ch === ' '
        ? `<span class="char" style="display:inline-block;"> </span>`
        : `<span class="char" style="display:inline-block;will-change:transform,opacity,filter;">${ch}</span>`
    ).join('');
    return el.querySelectorAll('.char');
  }

  // ── Helper: build a nav-link with original + clone char layers ──
  function buildNavLink(el, textContent) {
    el.classList.add('nav-link');
    const chars = textContent.split('');
    const buildLayer = (cls) =>
      `<span class="text-layer ${cls}">${
        chars.map(ch => `<span class="char">${ch}</span>`).join('')
      }</span>`;
    el.innerHTML = buildLayer('original') + buildLayer('clone absolute left-0 top-0 opacity-0 pointer-events-none');
  }

  // ── Hero headline reveal ──
  const heroH1s = document.querySelectorAll('.main-banner h1');
  heroH1s.forEach(h1 => {
    h1.style.visibility = 'visible';
    const chars = splitChars(h1);
    gsap.fromTo(chars,
      { y: '110%', opacity: 0 },
      {
        y: '0%', opacity: 1,
        duration: 1,
        stagger: 0.02,
        ease: 'power3.out',
        delay: 0.2,
      }
    );
  });

  // Hero CTA
  const heroCta = document.getElementById('s1-cta');
  if (heroCta) {
    gsap.fromTo(heroCta,
      { opacity: 0, y: 20, visibility: 'visible' },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 1.0 }
    );
  }

  // Hero scroll indicator
  const heroScroll = document.getElementById('s1-scroll');
  if (heroScroll) {
    gsap.fromTo(heroScroll.querySelector('.scroll-inner'),
      { opacity: 0, visibility: 'visible' },
      { opacity: 1, duration: 0.6, ease: 'power2.out', delay: 1.4 }
    );
  }

  // Hero stats/label
  const heroStats = document.getElementById('s1-stats');
  if (heroStats) {
    gsap.fromTo(heroStats,
      { opacity: 0, y: 10, visibility: 'visible' },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 1.2 }
    );
  }

  // Hero sub text
  const heroSub = document.getElementById('s1-sub');
  if (heroSub) {
    gsap.fromTo(heroSub,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 1.2 }
    );
  }

  // Hero badge
  const heroBox = document.getElementById('s1-box');
  if (heroBox) {
    gsap.fromTo(heroBox,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 1.1 }
    );
  }

  // ── About section text reveal (scroll-triggered) ──
  const aboutSection = document.querySelector('#s2-text');
  if (aboutSection) {
    // Section label
    const label = aboutSection.querySelector('.about-section-label');
    if (label) {
      ScrollTrigger.create({
        trigger: aboutSection,
        start: 'top 80%',
        onEnter: () => {
          label.style.visibility = 'visible';
          gsap.fromTo(label,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
          );
        }
      });
    }

    // Large text reveal using scroll progress (clip reveal)
    const ghostText = aboutSection.querySelector('.about-ghost-text');
    const revealText = aboutSection.querySelector('.about-revealed-text');
    if (ghostText && revealText) {
      gsap.to(revealText, {
        clipPath: 'inset(0% 0% 0% 0%)',
        ease: 'none',
        scrollTrigger: {
          trigger: aboutSection,
          start: 'top 70%',
          end: 'center 30%',
          scrub: 1,
        }
      });
    }

    // Tagline
    const tagline = aboutSection.querySelector('.about-section-tagline');
    if (tagline) {
      tagline.style.visibility = 'visible';
      ScrollTrigger.create({
        trigger: tagline,
        start: 'top 85%',
        onEnter: () => {
          gsap.fromTo(tagline,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }
          );
        }
      });
    }

    // About body paragraph + CTA
    const bodyEls = aboutSection.querySelectorAll('.about-body-col p, .about-body-col .button_wrapper');
    bodyEls.forEach((el, i) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        onEnter: () => {
          gsap.fromTo(el,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.7, delay: i * 0.1, ease: 'power2.out' }
          );
        }
      });
    });
  }

  // ── Vision section headline ──
  const visionHeadline = document.querySelector('.vision-headline');
  if (visionHeadline) {
    visionHeadline.style.visibility = 'visible';
    ScrollTrigger.create({
      trigger: visionHeadline,
      start: 'top 80%',
      onEnter: () => {
        const chars = splitChars(visionHeadline);
        gsap.fromTo(chars,
          { y: '110%', opacity: 0 },
          { y: '0%', opacity: 1, duration: 0.9, stagger: 0.015, ease: 'power3.out' }
        );
      }
    });
  }

  const visionTagline = document.querySelector('.vision-tagline');
  if (visionTagline) {
    visionTagline.style.visibility = 'visible';
    ScrollTrigger.create({
      trigger: visionTagline,
      start: 'top 85%',
      onEnter: () => {
        gsap.fromTo(visionTagline,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
        );
      }
    });
  }

  // ── Vision stripes (scroll-triggered scaleY) ──
  const stripes = document.querySelectorAll('.stripe-item');
  if (stripes.length) {
    gsap.to(stripes, {
      scaleY: 1,
      duration: 0.5,
      stagger: { amount: 0.4, from: 'start' },
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: '#vision-section',
        start: 'bottom 90%',
        end: 'bottom 60%',
        scrub: 0.5,
      }
    });
  }

  // ── Key facts headline ──
  const kfHeadline = document.querySelector('#keyfacts-section h2');
  if (kfHeadline) {
    kfHeadline.style.visibility = 'visible';
    ScrollTrigger.create({
      trigger: kfHeadline,
      start: 'top 80%',
      onEnter: () => {
        const chars = splitChars(kfHeadline);
        gsap.fromTo(chars,
          { y: '110%', opacity: 0 },
          { y: '0%', opacity: 1, duration: 0.8, stagger: 0.02, ease: 'power3.out' }
        );
      }
    });
  }

  // ── Partners title ──
  const partnersTitle = document.querySelector('.partners-block .title');
  if (partnersTitle) {
    partnersTitle.style.visibility = 'visible';
    ScrollTrigger.create({
      trigger: partnersTitle,
      start: 'top 85%',
      onEnter: () => {
        gsap.fromTo(partnersTitle,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
        );
      }
    });
  }

  // ── Decorative lines expand ──
  document.querySelectorAll('.line-plus-block .deco-line').forEach(line => {
    ScrollTrigger.create({
      trigger: line.closest('.line-plus-block'),
      start: 'top 85%',
      onEnter: () => line.style.width = '100%',
    });
  });

  // ── Marquee (vision section) ──
  initMarquee();

  if (ScrollTrigger) {
    ScrollTrigger.refresh();
    setTimeout(() => ScrollTrigger.refresh(), 300);
  }
};

// ── Marquee animation ──
function initMarquee() {
  const wrappers = document.querySelectorAll('.marquee-wrapper');
  wrappers.forEach(wrapper => {
    const track = wrapper.querySelector('.marquee-track');
    if (!track) return;

    // Clone the inner content for seamless loop
    const inner = track.querySelector('.marquee-inner');
    if (!inner) return;
    const clone = inner.cloneNode(true);
    track.appendChild(clone);

    let x = 0;
    const speed = 1.2; // px per frame

    function animate() {
      x -= speed;
      const w = inner.offsetWidth;
      if (Math.abs(x) >= w) x += w;
      track.style.transform = `translateX(${x}px)`;
      requestAnimationFrame(animate);
    }
    animate();
  });
}
