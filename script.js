// mobile menu toggle
const menuBtn = document.getElementById('menuBtn');
const nav = document.getElementById('nav');
if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
}

// dynamic year
document.getElementById('year').textContent = new Date().getFullYear();

// header shadow on scroll
const header = document.querySelector('.site-header');
const setHeaderShadow = () => {
  if (window.scrollY > 8) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
};
setHeaderShadow();
window.addEventListener('scroll', setHeaderShadow, { passive: true });

// simple reveal-on-scroll for cards
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.12 });
document.querySelectorAll('.project, .card, .contact-card').forEach(el => {
  el.classList.add('reveal');
  io.observe(el);
});

// scroll spy for nav
const sections = Array.from(document.querySelectorAll('main[id], section[id]'));
const links = Array.from(document.querySelectorAll('.nav a'));
const linkById = Object.fromEntries(links.map(a => [a.getAttribute('href').replace('#',''), a]));

const spy = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    links.forEach(a => a.classList.remove('active'));
    const active = linkById[id];
    if (active) active.classList.add('active');
  });
}, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

sections.forEach(s => spy.observe(s));

// Compact card interactivity: tilt + click-through
const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

document.querySelectorAll('.project').forEach(card => {
  // Make the whole card open data-href (but not when clicking real links)
  const href = card.dataset.href;
  if (href) {
    card.setAttribute('tabindex', '0');
    card.addEventListener('click', e => { if (!e.target.closest('a')) window.open(href, '_blank'); });
    card.addEventListener('keydown', e => { if (e.key === 'Enter') window.open(href, '_blank'); });
  }

  // Tilt on mouse move
  if (!prefersReduce && finePointer) {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--rx', ((0.5 - y) * 6).toFixed(2) + 'deg');
      card.style.setProperty('--ry', ((x - 0.5) * 8).toFixed(2) + 'deg');
    });
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  }
});

// Reveal on scroll for elements with .reveal
(() => {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach((el) => io.observe(el));
})();

// Reveal-on-scroll for any .reveal elements
(() => {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  // Respect reduced motion users
  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduce) {
    items.forEach(el => el.classList.add('in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target); // animate once
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -10% 0px' // start a bit before fully in view
  });

  items.forEach(el => io.observe(el));
})();

// Whole-card click for work cards
document.querySelectorAll('.work-card[data-href]').forEach(card => {
  card.tabIndex = 0;
  const url = card.getAttribute('data-href');
  card.addEventListener('click', e => {
    if (!e.target.closest('a,button')) window.open(url, '_blank');
  });
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter') window.open(url, '_blank');
  });
});

// Interactive legacy project cards (tilt + shine + whole-card click)
(() => {
  const cards = document.querySelectorAll('#projects .project');
  if (!cards.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  cards.forEach(card => {
    // Whole-card click: prefer data-href, else first .links a
    const href = card.dataset.href || card.querySelector('.links a')?.href;
    if (href) {
      card.tabIndex = 0;
      card.addEventListener('click', e => {
        if (!e.target.closest('a,button')) window.open(href, '_blank');
      });
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.open(href, '_blank');
        }
      });
    }

    // Skip tilt/shine for reduced motion or touch
    if (reduce || 'ontouchstart' in window) return;

    const thumb = card.querySelector('.project-thumb');
    let raf = null;

    function applyTilt(clientX, clientY){
      const r = card.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;

      // clamp to ~10deg
      const rx = Math.max(-10, Math.min(10, (-dy / r.height) * 20));
      const ry = Math.max(-10, Math.min(10, ( dx / r.width)  * 20));

      card.style.setProperty('--rx', rx.toFixed(2) + 'deg');
      card.style.setProperty('--ry', ry.toFixed(2) + 'deg');

      if (thumb){
        const tr = thumb.getBoundingClientRect();
        const mx = ((clientX - tr.left) / tr.width) * 100;
        const my = ((clientY - tr.top) / tr.height) * 100;
        card.style.setProperty('--mx', mx.toFixed(1) + '%');
        card.style.setProperty('--my', my.toFixed(1) + '%');
      }
    }

    function onMove(e){
      const p = e.touches ? e.touches[0] : e;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => applyTilt(p.clientX, p.clientY));
    }

    function reset(){
      card.style.setProperty('--rx','0deg');
      card.style.setProperty('--ry','0deg');
      card.style.setProperty('--mx','50%');
      card.style.setProperty('--my','50%');
    }

    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', reset);
    card.addEventListener('touchmove', onMove, {passive:true});
    card.addEventListener('touchend', reset);
  });
})();

// Subtle cursor shine on skill cards
document.querySelectorAll('.skill-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width) * 100;
    const my = ((e.clientY - r.top) / r.height) * 100;
    card.style.setProperty('--mx', mx.toFixed(1) + '%');
    card.style.setProperty('--my', my.toFixed(1) + '%');
  });
});

// 3D tilt + shine for low poly badges
(() => {
  const items = document.querySelectorAll('.poly-badge .poly');
  if (!items.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  items.forEach(el => {
    if (!reduce) {
      let raf;
      const onMove = e => {
        const p = e.touches ? e.touches[0] : e;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width/2;
        const cy = r.top + r.height/2;
        const dx = p.clientX - cx;
        const dy = p.clientY - cy;
        const rx = Math.max(-10, Math.min(10, (-dy / r.height) * 20));
        const ry = Math.max(-10, Math.min(10, ( dx / r.width)  * 20));
        const mx = ((p.clientX - r.left) / r.width) * 100;
        const my = ((p.clientY - r.top)  / r.height) * 100;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.setProperty('--rx', rx.toFixed(2) + 'deg');
          el.style.setProperty('--ry', ry.toFixed(2) + 'deg');
          el.style.setProperty('--mx', mx.toFixed(1) + '%');
          el.style.setProperty('--my', my.toFixed(1) + '%');
        });
      };
      const reset = () => {
        el.style.setProperty('--rx','0deg');
        el.style.setProperty('--ry','0deg');
        el.style.setProperty('--mx','50%');
        el.style.setProperty('--my','50%');
      };
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', reset);
      el.addEventListener('touchmove', onMove, {passive:true});
      el.addEventListener('touchend', reset);
    }
  });
})();
