/* ============================================
   GESTIONE CHATBOT
   ============================================ */
class ChatBot {
    constructor() {
        this.chatbotToggle = document.getElementById('chatbotToggle');
        this.chatbotBody = document.getElementById('chatbotBody');
        this.chatbotHeader = document.getElementById('chatbotHeader');
        this.sendBtn = document.getElementById('sendBtn');
        this.userInput = document.getElementById('userInput');
        this.chatbotMessages = document.querySelector('.chatbot-messages');
        
        this.init();
    }

    init() {
        if (this.chatbotToggle) {
            this.chatbotToggle.addEventListener('click', () => this.toggleChat());
            this.chatbotHeader.addEventListener('click', () => this.toggleChat());
        }

        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => this.sendMessage());
            this.userInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        }
    }

    toggleChat() {
        if (this.chatbotBody.style.display === 'none' || !this.chatbotBody.style.display) {
            this.chatbotBody.style.display = 'flex';
            this.chatbotToggle.textContent = '−';
        } else {
            this.chatbotBody.style.display = 'none';
            this.chatbotToggle.textContent = '+';
        }
    }

    sendMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;

        // Aggiungi messaggio dell'utente
        this.addMessage(message, 'user');
        this.userInput.value = '';

        // Simula risposta del bot
        setTimeout(() => {
            const response = this.getBotResponse(message);
            this.addMessage(response, 'bot');
        }, 500);
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.innerHTML = `<p>${this.escapeHtml(text)}</p>`;
        this.chatbotMessages.appendChild(messageDiv);
        this.chatbotMessages.scrollTop = this.chatbotMessages.scrollHeight;
    }

    getBotResponse(userMessage) {
        const responses = {
            'ciao': 'Ciao! 👋 Come posso aiutarti oggi?',
            'prodotti': 'Realizziamo borse e pochette artigianali all\'uncinetto, fatte interamente a mano. Vuoi scoprire la collezione?',
            'prezzo': 'Il prezzo varia in base al modello. Scrivici su WhatsApp il prodotto che ti interessa e ti rispondiamo subito!',
            'spedizion': 'Scrivici su WhatsApp o via email per organizzare insieme spedizione o ritiro del tuo ordine.',
            'contatt': 'Puoi scriverci su WhatsApp al +39 392 596 1105 oppure via email a gmbags@gmail.com. Ti rispondiamo il prima possibile!',
            'whatsapp': 'Scrivici su WhatsApp al +39 392 596 1105, ti rispondiamo il prima possibile!',
            'default': 'Grazie per la tua domanda! Per informazioni scrivici su WhatsApp al +39 392 596 1105 o via email a gmbags@gmail.com'
        };

        const lowerMessage = userMessage.toLowerCase();
        for (const [key, response] of Object.entries(responses)) {
            if (lowerMessage.includes(key)) {
                return response;
            }
        }

        return responses.default;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

/* ============================================
   ANIMAZIONI SCROLL
   ============================================ */
class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, this.observerOptions);

        this.init();
    }

    init() {
        const fadeInElements = document.querySelectorAll('.fade-in');
        fadeInElements.forEach(element => {
            this.observer.observe(element);
        });

        // Rete di sicurezza: se per qualsiasi motivo l'osservatore non
        // rivela un elemento (JS lento, bot, browser particolare), il
        // contenuto non deve restare invisibile per sempre.
        setTimeout(() => {
            fadeInElements.forEach(element => element.classList.add('visible'));
        }, 2500);
    }
}

/* ============================================
   SMOOTH SCROLL PER LINK INTERNI
   ============================================ */
class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href !== '#') {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    }
}

/* ============================================
   GESTIONE NAVBAR STICKY
   ============================================ */
class StickyNav {
    constructor() {
        this.header = document.getElementById('site-header');
        this.lastScrollY = 0;
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.handleScroll());
    }

    handleScroll() {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 100) {
            this.header.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.12)';
        } else {
            this.header.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)';
        }

        this.lastScrollY = currentScrollY;
    }
}

/* ============================================
   FORM NEWSLETTER
   ============================================ */
class NewsletterForm {
    constructor() {
        this.form = document.querySelector('.newsletter-form');
        if (this.form) {
            this.init();
        }
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    handleSubmit(e) {
        e.preventDefault();
        const input = this.form.querySelector('input[type="email"]');
        const button = this.form.querySelector('button');
        if (!input.value.trim()) return;

        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = 'Invio...';

        fetch('https://formsubmit.co/ajax/gmbags@gmail.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
                _subject: 'Nuova iscrizione Newsletter GMBag',
                email: input.value.trim()
            })
        })
            .then(() => {
                button.textContent = '✓ Iscritto!';
                button.style.background = '#d4af37';
            })
            .catch(() => {
                button.textContent = 'Errore, riprova';
            })
            .finally(() => {
                setTimeout(() => {
                    input.value = '';
                    button.textContent = originalText;
                    button.style.background = '';
                    button.disabled = false;
                }, 2500);
            });
    }
}

/* ============================================
   SOCIAL (Instagram)
   ============================================ */
const INSTAGRAM_URL = 'https://www.instagram.com/gm_bags___/';

function initSocialLinks() {
    const igIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`;

    const navList = document.querySelector('.navbar-nav');
    if (navList && !document.getElementById('instagramNavLink')) {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${INSTAGRAM_URL}" id="instagramNavLink" class="nav-link" target="_blank" rel="noopener" aria-label="Seguici su Instagram" style="display: inline-flex; align-items: center;">${igIcon}</a>`;
        navList.appendChild(li);
    }

    const footerP = document.querySelector('footer p');
    if (footerP && !document.getElementById('instagramFooterLink')) {
        footerP.append(' | ');
        const a = document.createElement('a');
        a.href = INSTAGRAM_URL;
        a.id = 'instagramFooterLink';
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = 'Instagram';
        footerP.appendChild(a);
    }
}

/* ============================================
   INIZIALIZZAZIONE AL CARICAMENTO
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    new ChatBot();
    new ScrollAnimations();
    new SmoothScroll();
    new StickyNav();
    new NewsletterForm();
    initSocialLinks();
    initNavbarToggle();

    console.log('✓ GMBag - Sito caricato correttamente');
});

/* ============================================
   MENU MOBILE (hamburger)
   ============================================ */
function initNavbarToggle() {
    const toggle = document.getElementById('navbarToggle');
    const nav = document.querySelector('.navbar-nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
        nav.classList.toggle('open');
    });

    nav.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            nav.classList.remove('open');
        }
    });
}

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */
function scrollToProducts() {
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

/* ============================================
   PREZZI PRODOTTO
   Inserisci qui il prezzo unitario (in euro) di ogni prodotto quando e'
   deciso. Finche' resta "null", il sito mostra "prezzo da confermare" e
   il totale verra' comunicato via email invece di essere calcolato.
   ============================================ */
const PRODUCT_PRICES = {
    'Pochette Nera con Catena': null,
    'Clutch Lilla': null,
    'Pochette Panna': null,
    'Borsa Senape a Tracolla': null
};

function formatEuro(amount) {
    return amount.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
}

/* ============================================
   MODULO ORDINE PRODOTTO (invio diretto via email)
   ============================================ */
function buildOrderModal() {
    if (document.getElementById('orderModalOverlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'order-modal-overlay';
    overlay.id = 'orderModalOverlay';
    overlay.innerHTML = `
        <div class="order-modal">
            <button type="button" class="order-modal-close" id="orderModalClose" aria-label="Chiudi">&times;</button>
            <h3>Richiedi il Prodotto</h3>
            <p class="order-product-name" id="orderProductName"></p>
            <form id="orderForm">
                <div class="form-group">
                    <label for="orderName">Nome Completo *</label>
                    <input type="text" id="orderName" required>
                </div>
                <div class="form-group">
                    <label for="orderEmail">Email *</label>
                    <input type="email" id="orderEmail" required>
                </div>
                <div class="form-group">
                    <label for="orderPhone">Telefono</label>
                    <input type="tel" id="orderPhone">
                </div>
                <div class="form-group">
                    <label for="orderQuantity">Quantità</label>
                    <input type="number" id="orderQuantity" min="1" value="1">
                </div>
                <p class="order-total" id="orderTotal"></p>
                <div class="form-group">
                    <label for="orderMessage">Messaggio</label>
                    <textarea id="orderMessage" placeholder="Colore, domande..."></textarea>
                </div>
                <button type="submit" class="order-modal-submit" id="orderSubmitBtn">Invia Richiesta</button>
                <p class="order-modal-status" id="orderModalStatus"></p>
            </form>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeOrderModal();
    });
    document.getElementById('orderModalClose').addEventListener('click', closeOrderModal);
    document.getElementById('orderForm').addEventListener('submit', handleOrderSubmit);
    document.getElementById('orderQuantity').addEventListener('input', updateOrderTotal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeOrderModal();
    });
}

function updateOrderTotal() {
    const totalEl = document.getElementById('orderTotal');
    const productName = document.getElementById('orderForm').dataset.product;
    const unitPrice = PRODUCT_PRICES[productName];
    const qtyInput = document.getElementById('orderQuantity');
    const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
    qtyInput.value = qty;

    if (unitPrice == null) {
        totalEl.textContent = 'Totale: da confermare (ti diremo il prezzo appena possibile)';
    } else {
        totalEl.textContent = `Totale: ${formatEuro(unitPrice * qty)} (${formatEuro(unitPrice)} x ${qty})`;
    }
}

function showLoginRequiredModal(productName) {
    let modal = document.getElementById('loginRequiredOverlay');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'order-modal-overlay';
        modal.id = 'loginRequiredOverlay';
        modal.innerHTML = `
            <div class="order-modal" style="text-align: center;">
                <button type="button" class="order-modal-close" id="loginRequiredClose" aria-label="Chiudi">&times;</button>
                <h3>Accesso Richiesto</h3>
                <p style="margin-bottom: 1.5rem; color: #666;">
                    Per ordinare <strong id="loginRequiredProduct"></strong> devi prima accedere
                    o creare un account gratuito. La consultazione del sito resta libera per tutti.
                </p>
                <a href="login.html" class="btn-primary" style="display: block; margin-bottom: 1rem;">Accedi</a>
                <a href="registrazione.html" class="form-footnote" style="display: block;">Non hai un account? Registrati</a>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
        document.getElementById('loginRequiredClose').addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }
    document.getElementById('loginRequiredProduct').textContent = productName;
    modal.classList.add('active');
}

async function openOrderModal(productName) {
    if (!isSupabaseConfigured) {
        alert('Il sistema di account e ordini non è ancora attivo su questo sito. Contattaci direttamente per informazioni su questo prodotto.');
        return;
    }

    const { session, profile } = await getSessionAndProfile();
    if (!session) {
        showLoginRequiredModal(productName);
        return;
    }

    buildOrderModal();
    document.getElementById('orderProductName').textContent = `Prodotto: ${productName}`;
    document.getElementById('orderForm').dataset.product = productName;
    document.getElementById('orderModalStatus').textContent = '';
    document.getElementById('orderQuantity').value = 1;
    document.getElementById('orderName').value = profile ? profile.nome : '';
    document.getElementById('orderEmail').value = session.user.email;
    document.getElementById('orderPhone').value = (profile && profile.telefono) || '';
    updateOrderTotal();
    document.getElementById('orderModalOverlay').classList.add('active');
}

function closeOrderModal() {
    const overlay = document.getElementById('orderModalOverlay');
    if (overlay) overlay.classList.remove('active');
}

async function handleOrderSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const btn = document.getElementById('orderSubmitBtn');
    const statusEl = document.getElementById('orderModalStatus');
    const productName = form.dataset.product;
    const name = document.getElementById('orderName').value;
    const email = document.getElementById('orderEmail').value;
    const phone = document.getElementById('orderPhone').value;
    const message = document.getElementById('orderMessage').value;
    const qty = Math.max(1, parseInt(document.getElementById('orderQuantity').value, 10) || 1);
    const unitPrice = PRODUCT_PRICES[productName];
    const totaleNumerico = unitPrice == null ? null : unitPrice * qty;
    const totaleTesto = unitPrice == null ? 'da confermare' : formatEuro(totaleNumerico);

    btn.disabled = true;
    btn.textContent = 'Invio in corso...';
    statusEl.textContent = '';

    const { session } = await getSessionAndProfile();
    if (!session) {
        statusEl.style.color = '#c62828';
        statusEl.textContent = "Sessione scaduta, effettua di nuovo l'accesso.";
        btn.disabled = false;
        btn.textContent = 'Invia Richiesta';
        return;
    }

    const { error } = await supabaseClient.from('orders').insert({
        user_id: session.user.id,
        prodotto: productName,
        quantita: qty,
        prezzo_unitario: unitPrice,
        totale: totaleNumerico,
        messaggio: message
    });

    if (error) {
        statusEl.style.color = '#c62828';
        statusEl.textContent = "Si è verificato un errore nel salvare l'ordine. Riprova o scrivici a gmbags@gmail.com.";
        btn.disabled = false;
        btn.textContent = 'Invia Richiesta';
        return;
    }

    // Notifica via email, best-effort: se fallisce l'ordine e' comunque salvato
    fetch('https://formsubmit.co/ajax/gmbags@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
            _subject: `Nuovo ordine: ${productName} (x${qty})`,
            prodotto: productName,
            quantita: qty,
            totale: totaleTesto,
            nome: name,
            email: email,
            telefono: phone,
            messaggio: message
        })
    }).catch(() => {});

    statusEl.style.color = '#2e7d32';
    statusEl.textContent = `Grazie ${name}! Il tuo ordine per "${productName}" è stato registrato. Ti aggiorneremo su ${email}.`;
    form.reset();
    btn.disabled = false;
    btn.textContent = 'Invia Richiesta';
    setTimeout(closeOrderModal, 3000);
}
