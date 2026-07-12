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
   INIZIALIZZAZIONE AL CARICAMENTO
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    new ChatBot();
    new ScrollAnimations();
    new SmoothScroll();
    new StickyNav();
    new NewsletterForm();

    console.log('✓ GMBag - Sito caricato correttamente');
});

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */
function scrollToProducts() {
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

const WHATSAPP_NUMBER = '393925961105';

function orderOnWhatsApp(productName) {
    const message = `Ciao! Sono interessato/a a: ${productName}. È disponibile?`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
}
