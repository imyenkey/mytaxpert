/* =========================================================
   MYTAXPERT — Shared Components
   Injects navbar + footer into every page and wires up
   all common behaviours: scroll, hamburger, back-to-top,
   scroll-reveal, smooth anchor scrolling.
========================================================= */
(function () {

  /* ── Active page detection ───────────────────────────── */
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';

  const NAV_ITEMS = [
    { href: 'index.html',    label: 'Home',     match: 'index.html'    },
    { href: 'services.html', label: 'Services', match: 'services.html' },
    { href: 'about.html',    label: 'About',    match: 'about.html'    },
    { href: 'blog.html',     label: 'Blog',     match: 'blog.html'     },
  ];

  const navLinksHtml = NAV_ITEMS.map(({ href, label, match }) => {
    const active = currentFile === match || (currentFile === '' && match === 'index.html');
    return `<a href="${href}"${active ? ' class="nav-active"' : ''}>${label}</a>`;
  }).join('');

  /* ── Navbar HTML ─────────────────────────────────────── */
  const navHTML = `
<header id="navbar">
  <div class="container nav-inner">
    <a href="index.html" class="logo" aria-label="MyTaxPert — Home">
      <img src="mytaxpert.png" alt="MyTaxPert" class="logo-img" />
    </a>
    <nav class="nav-links" id="navLinks" aria-label="Main navigation">
      ${navLinksHtml}
      <a href="contact.html" class="btn btn-outline-nav">Contact Us</a>
    </nav>
    <button class="hamburger" id="hamburger" aria-label="Toggle menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>`;

  /* ── Footer HTML ─────────────────────────────────────── */
  const year = new Date().getFullYear();
  const footerHTML = `
<footer class="footer">
  <div class="container footer-inner">
    <div class="footer-brand">
      <a href="index.html" class="logo logo-light" aria-label="MyTaxPert — Home">
        <img src="mytaxpert.png" alt="MyTaxPert" class="logo-img" />
      </a>
      <p>Navigate your finances with confidence. Expert accounting and tax services from Chennai's trusted CA firm.</p>
      <div class="social-links" style="margin-top:20px">
        <a href="https://instagram.com/mytaxpert_org" target="_blank" rel="noopener" aria-label="Instagram">
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
        </a>
        <a href="https://twitter.com/Mytaxpert_org" target="_blank" rel="noopener" aria-label="Twitter / X">
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
        <a href="https://facebook.com/mytaxpert.org" target="_blank" rel="noopener" aria-label="Facebook">
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        </a>
        <a href="https://t.me/mytaxpert" target="_blank" rel="noopener" aria-label="Telegram">
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
        </a>
      </div>
    </div>
    <div class="footer-links">
      <h5>Services</h5>
      <ul>
        <li><a href="services.html#gst">GST</a></li>
        <li><a href="services.html#income-tax">Income Tax</a></li>
        <li><a href="services.html#company-reg">Company Registration</a></li>
        <li><a href="services.html#accounting">Accounting &amp; Compliance</a></li>
        <li><a href="services.html#auditing">Auditing &amp; Assurance</a></li>
        <li><a href="services.html#ip">Intellectual Property</a></li>
      </ul>
    </div>
    <div class="footer-links">
      <h5>Company</h5>
      <ul>
        <li><a href="about.html">About Us</a></li>
        <li><a href="about.html#team">Our Team</a></li>
        <li><a href="blog.html">Blog &amp; Updates</a></li>
        <li><a href="contact.html">Contact</a></li>
      </ul>
    </div>
    <div class="footer-contact">
      <h5>Contact</h5>
      <p><a href="tel:+918056040515">+91-8056040515</a></p>
      <p><a href="mailto:letter@mytaxpert.org">letter@mytaxpert.org</a></p>
      <p>Mon–Fri · 8:30 AM – 5:00 PM</p>
      <p>Thirumullaivoyal, Chennai 600062</p>
    </div>
  </div>
  <div class="footer-bottom">
    <p>© ${year} MyTaxPert. All rights reserved.</p>
    <p>Crafted with care in Chennai 🏙</p>
  </div>
</footer>
<button class="back-to-top" id="backToTop" aria-label="Back to top">↑</button>`;

  /* ── Inject into DOM ─────────────────────────────────── */
  document.body.insertAdjacentHTML('afterbegin', navHTML);
  document.body.insertAdjacentHTML('beforeend', footerHTML);

  /* ── Navbar scroll + back-to-top visibility ──────────── */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    const btt = document.getElementById('backToTop');
    if (btt) btt.classList.toggle('visible', window.scrollY > 400);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Hamburger menu ──────────────────────────────────── */
  const hamburger   = document.getElementById('hamburger');
  const navLinksEl  = document.getElementById('navLinks');
  hamburger.addEventListener('click', () => {
    const open = navLinksEl.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(open));
  });
  navLinksEl.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinksEl.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ── Back to top ─────────────────────────────────────── */
  document.getElementById('backToTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── Scroll-reveal (used on all pages) ──────────────── */
  const initReveal = () => {
    const els = document.querySelectorAll('.fade-up, .fade-left, .fade-right');
    if (!els.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const siblings = [...e.target.parentElement.querySelectorAll('.fade-up,.fade-left,.fade-right')];
        e.target.style.transitionDelay = `${siblings.indexOf(e.target) * 80}ms`;
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      });
    }, { threshold: 0.12 });
    els.forEach(el => obs.observe(el));
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveal);
  } else {
    initReveal();
  }

  /* ── Smooth anchor scrolling ─────────────────────────── */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  });

})();
