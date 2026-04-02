/* =========================================================
   MYTAXPERT — Main JS
   - Navbar scroll effect
   - Mobile menu toggle
   - Scroll-reveal animations
   - Animated counters
   - Testimonial carousel
   - Contact form with validation & Formspree submission
   - Back-to-top button
========================================================= */

/* ── Config constants ────────────────────────────────── */
const CONFIG = {
  SCROLL_THRESHOLD:  60,              // px scrolled before navbar changes style
  SCROLL_BTT:       400,              // px scrolled before back-to-top appears
  SCROLL_OFFSET:     80,              // px offset for smooth anchor scrolling
  STAGGER_DELAY:     80,              // ms between staggered reveal animations
  REVEAL_THRESHOLD:  0.12,            // IntersectionObserver threshold for reveals
  COUNTER_DURATION:  1600,            // ms total for counter animation
  COUNTER_STEP:      16,              // ms per counter tick (~60 fps)
  COUNTER_THRESHOLD: 0.5,             // IntersectionObserver threshold for counters
  CAROUSEL_INTERVAL: 4000,            // ms between carousel auto-play advances
  FORM_RESET_DELAY:  3500,            // ms before form resets after successful submit
  FORMSPREE_ID:     'YOUR_FORM_ID',  // Replace with your Formspree form ID
};

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar ─────────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > CONFIG.SCROLL_THRESHOLD);
    document.getElementById('backToTop').classList.toggle('visible', window.scrollY > CONFIG.SCROLL_BTT);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile menu ─────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ── Scroll-reveal ───────────────────────────────────── */
  const revealEls = document.querySelectorAll('.fade-up, .fade-left, .fade-right');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const siblings = [...e.target.parentElement.querySelectorAll('.fade-up, .fade-left, .fade-right')];
        const idx = siblings.indexOf(e.target);
        e.target.style.transitionDelay = `${idx * CONFIG.STAGGER_DELAY}ms`;
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: CONFIG.REVEAL_THRESHOLD });
  revealEls.forEach(el => revealObs.observe(el));

  /* ── Counter animation ───────────────────────────────── */
  const counters = document.querySelectorAll('.stat-num[data-target]');
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = +el.dataset.target;
      const inc    = target / (CONFIG.COUNTER_DURATION / CONFIG.COUNTER_STEP);
      let current  = 0;
      const timer  = setInterval(() => {
        current += inc;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = Math.floor(current);
      }, CONFIG.COUNTER_STEP);
      counterObs.unobserve(el);
    });
  }, { threshold: CONFIG.COUNTER_THRESHOLD });
  counters.forEach(c => counterObs.observe(c));

  /* ── Testimonials carousel ───────────────────────────── */
  const track    = document.getElementById('testimonialsTrack');
  const dotsWrap = document.getElementById('testDots');
  if (track) {
    const cards   = track.querySelectorAll('.testimonial-card');
    const perView = window.innerWidth < 768 ? 1 : 2;
    const total   = Math.ceil(cards.length / perView);
    let current   = 0;

    // Build dots
    for (let i = 0; i < total; i++) {
      const b = document.createElement('button');
      b.setAttribute('aria-label', `Go to slide ${i + 1} of ${total}`);
      b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
      if (i === 0) b.classList.add('active');
      b.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(b);
    }

    const goTo = (idx) => {
      current = idx;
      const cardWidth = cards[0].offsetWidth + 24; // gap = 24px
      track.style.transform = `translateX(-${current * perView * cardWidth}px)`;
      dotsWrap.querySelectorAll('button').forEach((b, i) => {
        b.classList.toggle('active', i === current);
        b.setAttribute('aria-pressed', i === current ? 'true' : 'false');
      });
      track.setAttribute('aria-label', `Testimonials, slide ${current + 1} of ${total}`);
    };

    track.setAttribute('aria-label', `Testimonials, slide 1 of ${total}`);

    let autoplay = setInterval(() => goTo((current + 1) % total), CONFIG.CAROUSEL_INTERVAL);
    track.addEventListener('mouseenter', () => clearInterval(autoplay));
    track.addEventListener('mouseleave', () => {
      autoplay = setInterval(() => goTo((current + 1) % total), CONFIG.CAROUSEL_INTERVAL);
    });
  }

  /* ── Contact form — validation & Formspree submission ── */
  const form = document.getElementById('contactForm');
  if (form) {
    const statusEl = document.getElementById('formStatus');

    const showError = (input, message) => {
      const group = input.closest('.form-group');
      group.classList.add('error');
      const errEl = group.querySelector('.form-error');
      if (errEl) errEl.textContent = message;
      input.setAttribute('aria-invalid', 'true');
    };

    const clearError = (input) => {
      const group = input.closest('.form-group');
      group.classList.remove('error');
      const errEl = group.querySelector('.form-error');
      if (errEl) errEl.textContent = '';
      input.setAttribute('aria-invalid', 'false');
    };

    const validateField = (field) => {
      const val = field.value.trim();
      const label = field.labels?.[0]?.textContent || 'This field';
      if (field.required && !val) {
        showError(field, `${label} is required.`);
        return false;
      }
      if (field.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        showError(field, 'Please enter a valid email address.');
        return false;
      }
      clearError(field);
      return true;
    };

    // Live validation on blur / re-validate on input after an error
    form.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.closest('.form-group').classList.contains('error')) validateField(field);
      });
    });

    const validateAll = () => {
      let valid = true;
      form.querySelectorAll('input, select, textarea').forEach(field => {
        if (!validateField(field)) valid = false;
      });
      return valid;
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateAll()) return;

      const btn  = form.querySelector('button[type=submit]');
      const orig = btn.textContent;
      btn.textContent = 'Sending…';
      btn.disabled = true;
      statusEl.textContent = '';
      statusEl.className = 'form-status';

      try {
        const res = await fetch(`https://formspree.io/f/${CONFIG.FORMSPREE_ID}`, {
          method:  'POST',
          headers: { 'Accept': 'application/json' },
          body:    new FormData(form),
        });

        if (res.ok) {
          btn.textContent = '✓ Message Sent!';
          btn.style.background = 'linear-gradient(135deg, #10B981, #059669)';
          statusEl.textContent = 'Thank you! We will get back to you within 24 hours.';
          statusEl.className = 'form-status success';
          form.reset();
          setTimeout(() => {
            btn.textContent = orig;
            btn.style.background = '';
            btn.disabled = false;
            statusEl.textContent = '';
            statusEl.className = 'form-status';
          }, CONFIG.FORM_RESET_DELAY);
        } else {
          throw new Error('Server error');
        }
      } catch {
        btn.textContent = orig;
        btn.disabled = false;
        statusEl.textContent = 'Something went wrong. Please try again or email us directly at letter@mytaxpert.org';
        statusEl.className = 'form-status error';
      }
    });
  }

  /* ── Back to top ─────────────────────────────────────── */
  document.getElementById('backToTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── Smooth anchor scrolling with offset ─────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - CONFIG.SCROLL_OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

});
