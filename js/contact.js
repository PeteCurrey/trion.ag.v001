/* ============================================================
   CONTACT.JS — Popup open/close + form select dropdowns
   ============================================================ */

(function() {
  'use strict';

  const popup       = document.querySelector('.contact-popup-wrapper');
  const panel       = document.querySelector('.contact-popup-panel');
  const backdrop    = document.querySelector('.contact-popup-backdrop');
  const closeBtn    = document.querySelector('.popup-close');
  const navCta      = document.querySelector('.nav-cta-btn');

  // All "open popup" triggers
  const openTriggers = document.querySelectorAll('[data-open-contact]');

  // ── Open ──
  function openContactPopup() {
    if (!popup || !panel) return;
    popup.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    panel.removeAttribute('aria-hidden');

    // Focus first input after transition
    setTimeout(() => {
      const firstInput = panel.querySelector('input, textarea, button[type="button"]');
      firstInput?.focus();
    }, 700);
  }

  // ── Close ──
  function closeContactPopup() {
    if (!popup) return;
    popup.classList.remove('is-open');
    document.body.style.overflow = '';
    panel?.setAttribute('aria-hidden', 'true');
  }

  // ── Expose globally (called from nav.js) ──
  window.openContactPopup  = openContactPopup;
  window.closeContactPopup = closeContactPopup;

  // ── Events ──
  navCta?.addEventListener('click', openContactPopup);
  openTriggers.forEach(el => el.addEventListener('click', openContactPopup));
  closeBtn?.addEventListener('click', closeContactPopup);
  backdrop?.addEventListener('click', closeContactPopup);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && popup?.classList.contains('is-open')) {
      closeContactPopup();
    }
  });

  // ── Custom Select Dropdowns ──
  const selectGroups = document.querySelectorAll('.form-select-group');

  selectGroups.forEach(group => {
    const btn      = group.querySelector('.form-select-btn');
    const dropdown = group.querySelector('.select-dropdown');
    const options  = group.querySelectorAll('.select-option');

    if (!btn || !dropdown) return;

    // Toggle open/close
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('is-open');
      // Close all other dropdowns first
      document.querySelectorAll('.select-dropdown.is-open').forEach(d => {
        d.classList.remove('is-open');
        d.previousElementSibling?.querySelector('.select-chevron')?.style.setProperty('transform', 'rotate(0deg)');
      });
      if (!isOpen) {
        dropdown.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        const chevron = btn.querySelector('.select-chevron');
        if (chevron) chevron.style.transform = 'rotate(180deg)';
      }
    });

    // Option select
    options.forEach(opt => {
      opt.addEventListener('click', () => {
        const val = opt.textContent.trim();
        const label = btn.querySelector('.select-label');
        if (label) {
          label.textContent = val;
          label.style.color = '';
        }
        btn.classList.add('has-value');
        btn.setAttribute('aria-expanded', 'false');
        dropdown.classList.remove('is-open');
        const chevron = btn.querySelector('.select-chevron');
        if (chevron) chevron.style.transform = 'rotate(0deg)';

        // Store value
        group.dataset.value = val;

        // Mark as selected
        options.forEach(o => o.removeAttribute('aria-selected'));
        opt.setAttribute('aria-selected', 'true');
      });
    });
  });

  // Close dropdowns on outside click
  document.addEventListener('click', () => {
    document.querySelectorAll('.select-dropdown.is-open').forEach(d => {
      d.classList.remove('is-open');
    });
  });

  // ── Form submission ──
  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      // Basic validation
      let valid = true;
      const required = form.querySelectorAll('[required]');
      required.forEach(input => {
        if (!input.value.trim()) {
          input.style.borderColor = '#d9432b';
          valid = false;
        } else {
          input.style.borderColor = '';
        }
      });
      if (!valid) return;

      // Show success state
      const submitBtn = form.querySelector('.form-submit-btn');
      if (submitBtn) {
        const word = submitBtn.querySelector('.btn .word');
        if (word) word.textContent = 'Sent! ✓';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.6';
      }
    });

    // Clear error state on input
    form.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('input', () => {
        input.style.borderColor = '';
      });
    });
  }

})();
