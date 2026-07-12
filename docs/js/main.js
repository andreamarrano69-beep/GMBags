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
            'prodotti': 'Abbiamo una collezione esclusiva di borse, zaini, portafogli e accessori premium. Vuoi scoprire di più?',
            'prezzo': 'I nostri prezzi variano da €35 a €189,99. Dipende dal prodotto che cerchi!',
            'spedizione': 'Offriamo spedizione veloce in tutta Italia. I tempi variano da 2 a 5 giorni lavorativi.',
            'garanzia': 'Tutti i nostri prodotti hanno una garanzia di 2 anni. Siamo qui per supportarti!',
            'contatti': 'Puoi contattarci tramite il modulo nella pagina Contatti o via email. Ti risponderemo entro 24 ore!',
            'default': 'Grazie per la tua domanda! Per informazioni più dettagliate, visita la pagina Contatti o scrivi a support@gmbag.it'
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
        
        if (input.value.trim()) {
            const originalText = button.textContent;
            button.textContent = '✓ Iscritto!';
            button.style.background = '#d4af37';
            
            setTimeout(() => {
                input.value = '';
                button.textContent = originalText;
                button.style.background = '';
            }, 2000);
        }
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

function addToCart(productName) {
    console.log(`Prodotto aggiunto: ${productName}`);
    // Qui puoi aggiungere la logica del carrello
    alert(`${productName} è stato aggiunto al carrello!`);
}
