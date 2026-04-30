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

// ── Booking Modal ────────────────────────────────────────
const BIN_ID  = '69f1daaa856a682189873789';
const API_KEY = '$2a$10$zBwelpwQgG216q.q8YasGeJxALIxr1LJm/E9Lk9HhkIlr3uVXtmaK';
let blockedDates = [];

fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
    headers: { 'X-Master-Key': API_KEY }
}).then(r => r.json()).then(d => { blockedDates = d.record.blocked || []; }).catch(() => {});

// Inject modal HTML
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.createElement('div');
    modal.id = 'booking-modal';
    modal.className = 'bm-overlay';
    modal.innerHTML = `
    <div class="bm-box">
        <button class="bm-close" onclick="closeBookingModal()" aria-label="Chiudi">✕</button>
        <h2 class="bm-title">Prenota un Tavolo</h2>
        <p class="bm-sub">Compila il modulo. Per gruppi numerosi chiama il <a href="tel:+390513428554">051 342854</a>.</p>

        <div id="bm-success" class="bm-success" style="display:none">
            <p>Prenotazione confermata. La aspettiamo da Bakkalà!</p>
        </div>

        <form id="bm-form" class="bm-form">
            <div class="bm-grid">
                <div class="bm-field">
                    <label for="bm-nome">Nome e Cognome</label>
                    <input type="text" id="bm-nome" name="Nome" placeholder="Mario Rossi" required>
                </div>
                <div class="bm-field">
                    <label for="bm-email">Email</label>
                    <input type="email" id="bm-email" name="Email" placeholder="mario@esempio.it" required>
                </div>
                <div class="bm-field">
                    <label for="bm-persone">Quanti siete?</label>
                    <select id="bm-persone" name="Numero persone" required>
                        <option value="" disabled selected>Seleziona</option>
                        <option value="1">1 persona</option>
                        <option value="2">2 persone</option>
                        <option value="3">3 persone</option>
                        <option value="4">4 persone</option>
                        <option value="5">5 persone</option>
                        <option value="6">6 persone</option>
                    </select>
                </div>
                <div class="bm-field">
                    <label for="bm-data">Data</label>
                    <input type="date" id="bm-data" name="Data" required>
                    <p class="bm-error" id="bm-error-data" style="display:none"></p>
                </div>
                <div class="bm-field bm-full">
                    <label for="bm-orario">Fascia oraria</label>
                    <select id="bm-orario" name="Orario" required disabled>
                        <option value="" disabled selected>Scegli prima una data</option>
                    </select>
                    <p class="bm-notice" id="bm-notice-orario" style="display:none"></p>
                    <p class="bm-hint" id="bm-hint-domenica" style="display:none">La domenica siamo aperti solo a pranzo.</p>
                </div>
            </div>
            <p class="bm-error" id="bm-error-submit" style="display:none"></p>
            <button type="submit" class="bm-submit" id="bm-submit-btn">Invia Prenotazione</button>
        </form>
    </div>`;
    document.body.appendChild(modal);

    modal.addEventListener('click', e => { if (e.target === modal) closeBookingModal(); });

    // set min date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('bm-data').min = tomorrow.toISOString().split('T')[0];

    // date change handler
    document.getElementById('bm-data').addEventListener('change', function () {
        const val = this.value;
        const [y, mo, d] = val.split('-').map(Number);
        const day = new Date(y, mo - 1, d).getDay();
        const blocks      = blockedDates.filter(b => b.date === val);
        const blockAll    = day === 1 || blocks.some(b => b.service === 'all');
        const blockLunch  = blocks.some(b => b.service === 'lunch');
        const blockDinner = blocks.some(b => b.service === 'dinner');

        const errData    = document.getElementById('bm-error-data');
        const noticeOra  = document.getElementById('bm-notice-orario');
        const hintDom    = document.getElementById('bm-hint-domenica');
        const orarioSel  = document.getElementById('bm-orario');

        errData.style.display  = 'none';
        noticeOra.style.display = 'none';
        hintDom.style.display  = day === 0 ? 'block' : 'none';

        if (day === 1) {
            errData.textContent = 'Il lunedì siamo chiusi. Scegli un altro giorno.';
            errData.style.display = 'block';
        } else if (blockAll) {
            errData.textContent = 'Il locale è chiuso in questa data. Scegli un altro giorno.';
            errData.style.display = 'block';
        } else if (blockLunch) {
            noticeOra.textContent = '⚠ Prenotazioni esaurite a pranzo — disponibile solo la cena.';
            noticeOra.style.display = 'block';
        } else if (blockDinner) {
            noticeOra.textContent = '⚠ Prenotazioni esaurite a cena — disponibile solo il pranzo.';
            noticeOra.style.display = 'block';
        }

        orarioSel.innerHTML = '';
        if (blockAll || day === 1) {
            orarioSel.disabled = true;
            orarioSel.innerHTML = '<option value="" disabled selected>Data non disponibile</option>';
            return;
        }

        let list = getTimeSlots(day);
        if (blockLunch)  list = list.filter(t => parseInt(t) >= 19);
        if (blockDinner) list = list.filter(t => parseInt(t) < 17);

        if (list.length === 0) {
            orarioSel.disabled = true;
            orarioSel.innerHTML = '<option value="" disabled selected>Nessun orario disponibile</option>';
            return;
        }

        orarioSel.disabled = false;
        const ph = document.createElement('option');
        ph.value = ''; ph.disabled = true; ph.selected = true; ph.textContent = 'Seleziona orario';
        orarioSel.appendChild(ph);
        list.forEach(t => {
            const o = document.createElement('option');
            o.value = t; o.textContent = t;
            orarioSel.appendChild(o);
        });
    });

    // form submit via AJAX
    document.getElementById('bm-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        const btn = document.getElementById('bm-submit-btn');
        btn.disabled = true;
        btn.textContent = 'Invio in corso…';
        const errSubmit = document.getElementById('bm-error-submit');
        errSubmit.style.display = 'none';

        const data = new FormData(this);
        data.append('_subject', 'Nuova Prenotazione – Bakkalà');

        const payload = {
            nome:    this.querySelector('[name="Nome"]').value,
            email:   this.querySelector('[name="Email"]').value,
            persone: this.querySelector('[name="Numero persone"]').value,
            data:    this.querySelector('[name="Data"]').value,
            orario:  this.querySelector('[name="Orario"]').value,
        };

        try {
            const [emailRes] = await Promise.all([
                fetch('https://formsubmit.co/ajax/soriafrancesco@gmail.com', {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: data
                }),
                fetch('https://script.google.com/macros/s/AKfycbxPxpy7rGczhxVTvaNZDYLfwc94q5X_AbXuZmmIVmo9YwKNgQU7hXjIrBIVbQ1Zb_MGOQ/exec', {
                    method: 'POST',
                    mode: 'no-cors',
                    body: JSON.stringify(payload)
                })
            ]);
            if (emailRes.ok) {
                document.getElementById('bm-form').style.display = 'none';
                document.getElementById('bm-success').style.display = 'block';
            } else {
                throw new Error();
            }
        } catch {
            errSubmit.textContent = 'Errore nell\'invio. Riprova o chiama il 051 342854.';
            errSubmit.style.display = 'block';
            btn.disabled = false;
            btn.textContent = 'Invia Prenotazione';
        }
    });
});

function pad(n) { return String(n).padStart(2, '0'); }

function makeSlots(startH, startM, endH, endM) {
    const res = [];
    let h = startH, m = startM;
    while (h * 60 + m + 30 <= endH * 60 + endM) {
        res.push(pad(h) + ':' + pad(m));
        m += 30; if (m >= 60) { h++; m -= 60; }
    }
    return res;
}

function getTimeSlots(day) {
    if (day === 1) return [];
    if (day === 0) return makeSlots(12, 0, 14, 45);
    if (day === 2 || day === 3) return [...makeSlots(12, 30, 14, 45), ...makeSlots(19, 30, 22, 45)];
    return [...makeSlots(12, 0, 14, 30), ...makeSlots(19, 30, 22, 45)];
}

function openBookingModal() {
    closeMobile();
    const modal = document.getElementById('booking-modal');
    document.getElementById('bm-form').style.display = 'block';
    document.getElementById('bm-form').reset();
    document.getElementById('bm-success').style.display = 'none';
    document.getElementById('bm-orario').disabled = true;
    document.getElementById('bm-orario').innerHTML = '<option value="" disabled selected>Scegli prima una data</option>';
    document.getElementById('bm-error-data').style.display = 'none';
    document.getElementById('bm-notice-orario').style.display = 'none';
    document.getElementById('bm-hint-domenica').style.display = 'none';
    document.getElementById('bm-submit-btn').disabled = false;
    document.getElementById('bm-submit-btn').textContent = 'Invia Prenotazione';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeBookingModal() {
    document.getElementById('booking-modal').classList.remove('open');
    document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeBookingModal();
});
