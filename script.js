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
