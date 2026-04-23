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

// ── Carousel drag-to-scroll ─────────────────────────────
const track = document.getElementById('carousel');
let isDragging = false, startX, scrollLeft;

track.addEventListener('mousedown', e => {
    isDragging = true;
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
    track.style.cursor = 'grabbing';
});

track.addEventListener('mouseleave', () => { isDragging = false; track.style.cursor = 'grab'; });
track.addEventListener('mouseup',    () => { isDragging = false; track.style.cursor = 'grab'; });

track.addEventListener('mousemove', e => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    track.scrollLeft = scrollLeft - (x - startX) * 1.2;
});
