# GMBag - Sito Web Premium

Benvenuto nella versione **completamente rinnovata** di GMBag! Questo progetto è stato completamente refactorizzato per offrire un'esperienza utente premium, codice pulito e performance ottimizzate.

---

## 📁 Struttura del Progetto

```
GMBag_Nuovo/
├── index.html              # Homepage principale
├── prodotti.html           # Pagina catalogo prodotti
├── blog.html              # Sezione blog
├── contatti.html          # Pagina contatti con form
├── README.md              # Questo file
├── css/
│   └── style.css          # Stili CSS completi e ottimizzati
├── js/
│   └── main.js            # JavaScript con funzionalità interattive
└── assets/
    └── img/               # Cartella immagini prodotti
```

---

## 🎨 Miglioramenti Principali

### 1. **Design Premium**
- **Nuova Palette Colori**: Oro (#d4af37), Nero (#1a1a1a), Bianco e Grigio Caldo
- **Tipografia Raffinata**: Font moderni e leggibili con gerarchia visiva migliorata
- **Animazioni Fluide**: Transizioni smooth e effetti hover eleganti

### 2. **Codice Pulito e Semantico**
- **HTML5 Semantico**: Uso di tag `<section>`, `<article>`, `<header>`, `<footer>`
- **CSS Moderno**: Variabili CSS, Flexbox/Grid, media queries responsive
- **JavaScript Orientato agli Oggetti**: Classi per una migliore manutenibilità

### 3. **Performance Ottimizzate**
- File CSS e JS separati e organizzati
- Caricamento efficiente degli asset
- Immagini ottimizzate con lazy loading supportato

### 4. **Accessibilità**
- Contrasti colori conformi WCAG
- Attributi ARIA per screen reader
- Navigazione da tastiera completa

### 5. **Responsività**
- Design mobile-first
- Breakpoint per tablet e desktop
- Tutti i componenti adattabili

---

## 🚀 Come Utilizzare

### Apertura Locale
1. Scarica la cartella `GMBag_Nuovo`
2. Apri `index.html` nel tuo browser preferito
3. Naviga tra le pagine usando il menu

### Hosting Online
Per deployare il sito online:
- Carica tutti i file su un server web
- Assicurati che la struttura delle cartelle sia mantenuta
- Testa tutte le pagine e i link

---

## 📄 Pagine Disponibili

| Pagina | Descrizione |
| :--- | :--- |
| **index.html** | Homepage con hero banner, vantaggi, bestseller, testimoniali e newsletter |
| **prodotti.html** | Catalogo completo con categorie e griglia prodotti |
| **blog.html** | Sezione articoli con card blog interattive |
| **contatti.html** | Form contatti e informazioni di contatto |

---

## 🎯 Funzionalità Implementate

### Chatbot Widget
- Assistente interattivo con risposte pre-configurate
- Toggle minimizzabile
- Messaggi utente e bot differenziati

### Newsletter
- Form di iscrizione con validazione email
- Feedback visivo al submit

### Animazioni Scroll
- Elementi che appaiono al scroll
- Effetti fade-in automatici

### Smooth Scroll
- Link interni con scroll fluido
- Navigazione migliorata

---

## 🎨 Personalizzazione

### Cambiare i Colori
Modifica le variabili CSS in `css/style.css`:

```css
:root {
    --primary-dark: #1a1a1a;      /* Colore principale scuro */
    --primary-gold: #d4af37;       /* Colore oro accento */
    --primary-light: #f5f5f5;      /* Colore di sfondo chiaro */
    --accent-warm: #8b7355;        /* Colore caldo accento */
    /* ... altre variabili */
}
```

### Aggiungere Prodotti
Duplica il blocco `.product-card` in `prodotti.html` e `index.html`:

```html
<div class="product-card fade-in">
    <div class="product-image">
        <img src="assets/img/image.jpeg" alt="Nome Prodotto">
    </div>
    <div class="product-info">
        <div class="product-name">Nome Prodotto</div>
        <div class="product-price">€XXX,XX</div>
        <p class="product-description">Descrizione...</p>
        <button class="btn-cart" onclick="addToCart('Nome Prodotto')">Aggiungi al Carrello</button>
    </div>
</div>
```

### Modificare il Chatbot
Personalizza le risposte in `js/main.js`, nella funzione `getBotResponse()`:

```javascript
const responses = {
    'parola-chiave': 'Risposta personalizzata',
    'default': 'Risposta di default'
};
```

---

## 📱 Breakpoint Responsive

- **Desktop**: 1200px e superiore
- **Tablet**: 768px - 1199px
- **Mobile**: Fino a 767px
- **Small Mobile**: Fino a 480px

---

## 🔧 Tecnologie Utilizzate

- **HTML5**: Markup semantico
- **CSS3**: Variabili, Flexbox, Grid, Media Queries
- **JavaScript (ES6+)**: Classi, Arrow Functions, Event Listeners
- **Font**: Segoe UI, Tahoma, Geneva (system fonts)

---

## 💡 Suggerimenti per Miglioramenti Futuri

1. **Backend**: Integrare un backend per gestire ordini e newsletter
2. **Database**: Creare un database per prodotti e commenti
3. **Carrello**: Implementare un carrello funzionante con localStorage
4. **Pagamenti**: Integrare Stripe o PayPal
5. **SEO**: Aggiungere meta tag e schema markup
6. **Analytics**: Integrare Google Analytics
7. **CMS**: Usare un CMS per gestire contenuti facilmente

---

## 📞 Supporto

Per domande o problemi, contatta il team di sviluppo o visita la pagina contatti del sito.

---

## 📄 Licenza

Questo progetto è proprietario di GMBag. Tutti i diritti riservati © 2026.

---

## ✨ Note Finali

Il nuovo sito GMBag rappresenta un significativo passo avanti in termini di:
- **Design**: Più elegante, moderno e coerente
- **Codice**: Più pulito, manutenibile e scalabile
- **Performance**: Più veloce e efficiente
- **UX**: Più intuitiva e piacevole

Goditi il nuovo sito e buona vendita! 🎉
