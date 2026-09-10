/* ============================================
   UTILITY: ESCAPE HTML
   Da usare SEMPRE quando si inserisce nel DOM (via innerHTML) un
   testo scritto da un utente (nome, messaggio, prodotto...): evita
   che qualcuno possa inserire codice invece di testo (XSS). Sicura
   sia dentro al testo che dentro ad attributi HTML tra virgolette.
   ============================================ */
function escapeHtml(text) {
    if (text == null) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/* ============================================
   UTILITY: CARICAMENTO IMMAGINI (solo Admin)
   Carica un file scelto dall'admin nello spazio "immagini" di
   Supabase Storage e restituisce il link pubblico da salvare nel
   campo "Immagine" di un prodotto o articolo.
   Prima del caricamento, la foto viene ridimensionata e compressa in
   automatico (le foto dirette dal telefono possono essere enormi:
   qui vengono ridotte a un lato massimo di 1600px e salvate come
   JPEG di qualita' alta, senza che l'admin debba pensarci).
   ============================================ */
function ridimensionaImmagine(file, latoMassimo = 1600, qualita = 0.85) {
    return new Promise((resolve) => {
        // Le GIF le lasciamo intatte: ridisegnarle su canvas perderebbe
        // l'eventuale animazione.
        if (file.type === 'image/gif') {
            resolve(file);
            return;
        }

        const img = new Image();
        const urlTemporaneo = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(urlTemporaneo);

            const scala = Math.min(1, latoMassimo / Math.max(img.width, img.height));
            const larghezza = Math.round(img.width * scala);
            const altezza = Math.round(img.height * scala);

            // Se la foto e' gia' piccola, non serve ricomprimerla.
            if (scala === 1 && file.size < 700 * 1024) {
                resolve(file);
                return;
            }

            const canvas = document.createElement('canvas');
            canvas.width = larghezza;
            canvas.height = altezza;
            canvas.getContext('2d').drawImage(img, 0, 0, larghezza, altezza);

            canvas.toBlob((blob) => {
                if (!blob) {
                    resolve(file);
                    return;
                }
                const nomeJpeg = file.name.replace(/\.[^.]+$/, '') + '.jpg';
                resolve(new File([blob], nomeJpeg, { type: 'image/jpeg' }));
            }, 'image/jpeg', qualita);
        };

        img.onerror = () => {
            URL.revokeObjectURL(urlTemporaneo);
            resolve(file); // se qualcosa va storto, carichiamo il file originale
        };

        img.src = urlTemporaneo;
    });
}

async function caricaImmagine(file, cartella) {
    const fileOttimizzato = await ridimensionaImmagine(file);
    const nomeSicuro = fileOttimizzato.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const percorso = `${cartella}/${Date.now()}-${nomeSicuro}`;

    const { error } = await supabaseClient.storage.from('immagini').upload(percorso, fileOttimizzato);
    if (error) return { error };

    const { data } = supabaseClient.storage.from('immagini').getPublicUrl(percorso);
    return { url: data.publicUrl };
}

/* ============================================
   UTILITY: TAG E TRACCIAMENTO STATO ORDINE
   Condivise tra account.html e admin.html
   ============================================ */
function statusTagClass(stato) {
    return 'status-tag status-tag--' + stato.replace(/\s+/g, '-');
}

function formatDataBreve(iso) {
    return new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
}

function trackingHtml(order) {
    const righe = [];
    righe.push(`In attesa: ${formatDataBreve(order.created_at)}`);
    if (order.data_ordinato) righe.push(`Ordinato: ${formatDataBreve(order.data_ordinato)}`);
    if (order.data_spedito) righe.push(`Spedito: ${formatDataBreve(order.data_spedito)}`);
    if (order.data_incassato) {
        const importo = order.importo_incassato != null
            ? Number(order.importo_incassato).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
            : '';
        righe.push(`Incassato: ${formatDataBreve(order.data_incassato)} ${importo}`);
    }
    return righe.join('<br>');
}

/* ============================================
   GESTIONE CHATBOT
   ============================================ */
class ChatBot {
    constructor() {
        this.chatbotWidget = document.getElementById('chatbotWidget');
        this.chatbotToggle = document.getElementById('chatbotToggle');
        this.chatbotBody = document.getElementById('chatbotBody');
        this.chatbotHeader = document.getElementById('chatbotHeader');
        this.sendBtn = document.getElementById('sendBtn');
        this.userInput = document.getElementById('userInput');
        this.chatbotMessages = document.querySelector('.chatbot-messages');
        this.risposte = null;

        this.init();
        this.caricaRisposte();
    }

    init() {
        if (this.chatbotToggle) {
            // Parte sempre chiuso (solo il pulsante rotondo): si apre al click,
            // cosi' non copre mai il contenuto della pagina da sola.
            this.chatbotBody.style.display = 'none';
            this.chatbotToggle.textContent = '+';
            this.chatbotWidget.classList.add('collapsed');

            // Un solo listener sull'intestazione: il pulsante +/- ci sta
            // dentro, quindi un click sul pulsante farebbe scattare anche
            // questo per "bubbling". Due listener separati avrebbero fatto
            // scattare il toggle due volte, annullandosi a vicenda.
            this.chatbotHeader.addEventListener('click', () => this.toggleChat());
        }

        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => this.sendMessage());
            this.userInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        }
    }

    async caricaRisposte() {
        if (typeof isSupabaseConfigured === 'undefined' || !isSupabaseConfigured) return;
        const { data, error } = await supabaseClient
            .from('bot_risposte')
            .select('*')
            .eq('attivo', true);
        if (!error && data) this.risposte = data;
    }

    toggleChat() {
        if (this.chatbotBody.style.display === 'none' || !this.chatbotBody.style.display) {
            this.chatbotBody.style.display = 'flex';
            this.chatbotToggle.textContent = '−';
            this.chatbotWidget.classList.remove('collapsed');
        } else {
            this.chatbotBody.style.display = 'none';
            this.chatbotToggle.textContent = '+';
            this.chatbotWidget.classList.add('collapsed');
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
        const rispostaSicurezza = 'Grazie per la tua domanda! Per informazioni scrivici su WhatsApp al +39 392 596 1105 o via email a gmbags@gmail.com';

        if (!this.risposte || this.risposte.length === 0) {
            return rispostaSicurezza;
        }

        const lowerMessage = userMessage.toLowerCase();
        const trovata = this.risposte.find((r) => r.parola_chiave && lowerMessage.includes(r.parola_chiave.toLowerCase()));
        if (trovata) return trovata.risposta;

        const predefinita = this.risposte.find((r) => r.predefinita);
        return predefinita ? predefinita.risposta : rispostaSicurezza;
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

        fetch('https://formsubmit.co/ajax/andrea.marrano69@gmail.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
                _subject: 'Nuova iscrizione Newsletter GMBags',
                email: input.value.trim()
            })
        })
            .then(() => {
                button.textContent = '✓ Iscritto!';
                button.style.background = '#b9a184';
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
    initCartUI();

    console.log('✓ GMBags - Sito caricato correttamente');
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

function formatEuro(amount) {
    return amount.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
}

/* ============================================
   CARRELLO (localStorage, condiviso da tutte le pagine)
   Il carrello e' libero per chiunque, anche senza account: il login
   viene richiesto solo al momento del checkout, non per aggiungere
   prodotti al carrello.
   ============================================ */
const CART_KEY = 'gmbags_cart';

function getCart() {
    try {
        const raw = localStorage.getItem(CART_KEY);
        const cart = raw ? JSON.parse(raw) : [];
        return Array.isArray(cart) ? cart : [];
    } catch (e) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
}

function addToCart(product) {
    const cart = getCart();
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
        existing.quantita += 1;
    } else {
        cart.push({
            id: product.id,
            nome: product.nome,
            prezzo: product.prezzo,
            immagine: product.immagine,
            quantita: 1
        });
    }
    saveCart(cart);
}

function removeFromCart(productId) {
    saveCart(getCart().filter((item) => item.id !== productId));
}

function updateCartQty(productId, quantita) {
    const cart = getCart();
    const item = cart.find((i) => i.id === productId);
    if (!item) return;
    item.quantita = Math.max(1, parseInt(quantita, 10) || 1);
    saveCart(cart);
}

function clearCart() {
    saveCart([]);
}

function cartCount() {
    return getCart().reduce((sum, item) => sum + item.quantita, 0);
}

function cartTotal() {
    return getCart().reduce((sum, item) => {
        return sum + (item.prezzo != null ? Number(item.prezzo) * item.quantita : 0);
    }, 0);
}

function updateCartBadge() {
    const badge = document.getElementById('cartCount');
    if (!badge) return;
    const count = cartCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
}

function initCartUI() {
    const nav = document.querySelector('.navbar-nav');
    if (!nav || document.getElementById('cartNavLink')) return;
    const li = document.createElement('li');
    li.innerHTML = `
        <a href="carrello.html" id="cartNavLink" class="nav-link" aria-label="Carrello" style="display: inline-flex; align-items: center; gap: 0.3rem;">
            🛒 <span id="cartCount" class="cart-badge">0</span>
        </a>
    `;
    nav.appendChild(li);
    updateCartBadge();
}

function showCartToast(message) {
    let toast = document.getElementById('cartToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cartToast';
        toast.className = 'cart-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toast._hideTimeout);
    toast._hideTimeout = setTimeout(() => toast.classList.remove('visible'), 2200);
}

document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add-to-cart]');
    if (!btn) return;
    const prezzoRaw = btn.dataset.prezzo;
    addToCart({
        id: btn.dataset.id,
        nome: btn.dataset.nome,
        prezzo: prezzoRaw === '' ? null : Number(prezzoRaw),
        immagine: btn.dataset.immagine
    });
    showCartToast(`Aggiunto al carrello: ${btn.dataset.nome}`);
});

function showLoginRequiredModal(message) {
    let modal = document.getElementById('loginRequiredOverlay');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'order-modal-overlay';
        modal.id = 'loginRequiredOverlay';
        modal.innerHTML = `
            <div class="order-modal" style="text-align: center;">
                <button type="button" class="order-modal-close" id="loginRequiredClose" aria-label="Chiudi">&times;</button>
                <h3>Accesso Richiesto</h3>
                <p id="loginRequiredMessage" style="margin-bottom: 1.5rem; color: #666;"></p>
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
    document.getElementById('loginRequiredMessage').textContent =
        message || 'Per completare il checkout devi prima accedere o creare un account gratuito. Sfogliare il sito e aggiungere al carrello resta libero per tutti.';
    modal.classList.add('active');
}

/* ============================================
   CATALOGO PRODOTTI (letto dalla tabella "prodotti")
   Usato sia in index.html (solo in_evidenza) che in prodotti.html
   (tutti i prodotti attivi).
   ============================================ */
function productCardHtml(product) {
    const priceHtml = product.prezzo != null
        ? formatEuro(Number(product.prezzo))
        : 'Scrivici per il prezzo';
    const img = escapeHtml(product.immagine || 'assets/img/logo.jpg');
    const esaurito = product.quantita_disponibile != null && product.quantita_disponibile <= 0;
    const prezzoAttr = product.prezzo != null ? String(Number(product.prezzo)) : '';
    return `
        <div class="product-card">
            <div class="product-image">
                <img src="${img}" alt="${escapeHtml(product.nome)}">
            </div>
            <div class="product-info">
                <div class="product-name">${escapeHtml(product.nome)}</div>
                <div class="product-price">${priceHtml}</div>
                <p class="product-description">${escapeHtml(product.descrizione || '')}</p>
                ${esaurito
                    ? '<button class="btn-cart" disabled style="opacity:0.6; cursor:not-allowed;">Esaurito</button>'
                    : `<button class="btn-cart" data-add-to-cart data-id="${escapeHtml(product.id)}" data-nome="${escapeHtml(product.nome)}" data-prezzo="${prezzoAttr}" data-immagine="${img}">Aggiungi al Carrello</button>`
                }
            </div>
        </div>
    `;
}

async function loadProducts(containerId, { onlyFeatured = false } = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!isSupabaseConfigured) {
        container.innerHTML = '<p>Il catalogo non è ancora disponibile. Contattaci per informazioni sui prodotti.</p>';
        return;
    }

    let query = supabaseClient.from('prodotti').select('*').eq('attivo', true);
    if (onlyFeatured) query = query.eq('in_evidenza', true);
    const { data: products, error } = await query.order('created_at', { ascending: true });

    if (error) {
        container.innerHTML = '<p>Errore nel caricamento dei prodotti.</p>';
        return;
    }

    if (!products || products.length === 0) {
        container.innerHTML = '<p>Nuovi modelli in arrivo presto! Scrivici per sapere cosa abbiamo di disponibile in questo momento.</p>';
        return;
    }

    container.innerHTML = products.map(productCardHtml).join('');
}
