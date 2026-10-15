/* ============================================================
   NAV.JS — Menu open/close, mobile hamburger, sound toggle
   ============================================================ */

(function() {
  'use strict';

  // ── DOM references ──
  const mainToggle       = document.querySelector('.main-toggle');
  const mobileToggle     = document.querySelector('.menu-toggle-mobile');
  const desktopMenuWrap  = document.querySelector('.menu-wrapper-desktop');
  const desktopMenuBlock = document.querySelector('.menu-block');
  const mobileMenu       = document.querySelector('.mobile-menu');
  const soundToggle      = document.getElementById('sound-toggle');
  const navCtaBtn        = document.querySelector('.nav-cta-btn');
  const backdrop         = document.querySelector('.contact-popup-backdrop');

  let isMenuOpen = false;
  let isSoundOn  = false;

  // ── Desktop menu open/close ──
  function openDesktopMenu() {
    if (!desktopMenuWrap || !desktopMenuBlock) return;
    isMenuOpen = true;
    desktopMenuWrap.style.opacity     = '1';
    desktopMenuWrap.style.visibility  = 'visible';
    desktopMenuWrap.style.pointerEvents = 'all';

    if (window.gsap) {
      gsap.to(desktopMenuBlock, {
        'clip-path': 'circle(150% at 95% 5%)',
        opacity: 1,
        visibility: 'visible',
        duration: 0.7,
        ease: 'power3.inOut',
      });
    } else {
      desktopMenuBlock.style.clipPath   = 'circle(150% at 95% 5%)';
      desktopMenuBlock.style.opacity    = '1';
      desktopMenuBlock.style.visibility = 'visible';
    }

    mainToggle?.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeDesktopMenu() {
    if (!desktopMenuBlock) return;
    isMenuOpen = false;

    if (window.gsap) {
      gsap.to(desktopMenuBlock, {
        'clip-path': 'circle(0% at 95% 5%)',
        opacity: 0,
        duration: 0.5,
        ease: 'power3.inOut',
        onComplete: () => {
          desktopMenuBlock.style.visibility = 'hidden';
          desktopMenuWrap.style.opacity     = '0';
          desktopMenuWrap.style.visibility  = 'hidden';
          desktopMenuWrap.style.pointerEvents = 'none';
        }
      });
    } else {
      desktopMenuBlock.style.clipPath   = 'circle(0% at 95% 5%)';
      desktopMenuBlock.style.opacity    = '0';
      desktopMenuBlock.style.visibility = 'hidden';
    }

    mainToggle?.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function toggleDesktopMenu() {
    if (isMenuOpen) closeDesktopMenu();
    else openDesktopMenu();
  }

  // ── Mobile menu open/close ──
  function openMobileMenu() {
    mobileMenu?.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    mobileMenu?.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function toggleMobileMenu() {
    if (mobileMenu?.classList.contains('is-open')) closeMobileMenu();
    else openMobileMenu();
  }

  // ── Sound toggle ──
  function toggleSound() {
    isSoundOn = !isSoundOn;
    if (soundToggle) {
      soundToggle.setAttribute('aria-pressed', isSoundOn ? 'true' : 'false');
      soundToggle.setAttribute('aria-label', isSoundOn ? 'Disable sound' : 'Enable sound');
      soundToggle.setAttribute('title', isSoundOn ? 'Disable sound' : 'Enable sound');
      // Swap icon opacity to indicate state
      const svgG = soundToggle.querySelector('g');
      if (svgG) svgG.style.opacity = isSoundOn ? '1' : '0.4';
    }
  }

  // ── Close menu on outside click (desktop) ──
  function handleOutsideClick(e) {
    if (!isMenuOpen) return;
    if (desktopMenuBlock && !desktopMenuBlock.contains(e.target) &&
        mainToggle && !mainToggle.contains(e.target)) {
      closeDesktopMenu();
    }
  }

  // ── Keyboard escape to close ──
  function handleKeydown(e) {
    if (e.key === 'Escape') {
      if (isMenuOpen) closeDesktopMenu();
      if (mobileMenu?.classList.contains('is-open')) closeMobileMenu();
    }
  }

  // ── Nav CTA "let's talk" opens contact popup ──
  function handleNavCta() {
    if (window.openContactPopup) window.openContactPopup();
    // Also close any open menus
    if (isMenuOpen) closeDesktopMenu();
    if (mobileMenu?.classList.contains('is-open')) closeMobileMenu();
  }

  // ── Bind events ──
  mainToggle?.addEventListener('click', toggleDesktopMenu);
  mobileToggle?.addEventListener('click', toggleMobileMenu);
  soundToggle?.addEventListener('click', toggleSound);
  navCtaBtn?.addEventListener('click', handleNavCta);
  document.addEventListener('click', handleOutsideClick);
  document.addEventListener('keydown', handleKeydown);

  // Close mobile menu on any link click
  document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // ── Expose close functions globally ──
  window.closeDesktopMenu = closeDesktopMenu;
  window.closeMobileMenu  = closeMobileMenu;

})();
