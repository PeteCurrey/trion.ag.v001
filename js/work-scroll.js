/* ============================================================
   WORK-SCROLL.JS — Selected Work Horizontal Pin Scroll
   Smooth horizontal pinning scroll trigger for featured project cards.
   ============================================================ */

(function () {
  'use strict';

  function initWorkScroll() {
    const section = document.getElementById('work-section');
    const track = document.getElementById('work-track');
    if (!section || !track || !window.gsap || !window.ScrollTrigger) return;

    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    const isDesktop = window.innerWidth >= 768;

    if (isDesktop) {
      // Calculate total horizontal scroll width
      const getScrollAmount = () => {
        return track.scrollWidth - window.innerWidth;
      };

      const tween = gsap.to(track, {
        x: () => -getScrollAmount(),
        ease: 'none',
      });

      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${getScrollAmount() * 1.2}`,
        pin: true,
        scrub: 1,
        animation: tween,
        invalidateOnRefresh: true,
      });

      // Animate project separator lines
      const lines = section.querySelectorAll('.work-card-line');
      lines.forEach((line, i) => {
        gsap.fromTo(line, 
          { scaleY: 0 },
          {
            scaleY: 1,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: line.closest('.work-card'),
              containerAnimation: tween,
              start: 'left center',
              toggleActions: 'play none none reverse'
            }
          }
        );
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWorkScroll);
  } else {
    initWorkScroll();
  }
})();
