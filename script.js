// ── Nav scroll: transparent → blue ──────────────────────
const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
    const heroH = document.querySelector('.hero')?.offsetHeight || 300;
    nav.classList.toggle('scrolled', window.scrollY > heroH - 80);
}, { passive: true });

// ── Mobile menu ─────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');

hamburger.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    hamburger.classList.toggle('open', open);
});

function closeMobile() {
    mobileNav.classList.remove('open');
    hamburger.classList.remove('open');
}

// ── Reveal on scroll ────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            revealObserver.unobserve(e.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

