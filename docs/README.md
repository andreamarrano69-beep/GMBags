# GMBag - Sito Web Premium

Benvenuto nella versione **completamente rinnovata** di GMBag! Questo progetto è stato completamente refactorizzato per offrire un'esperienza utente premium, codice pulito e performance ottimizzate.

---

## 📁 Struttura del Progetto

Il sito vive nella cartella `docs/` del repository, cosi' GitHub Pages puo'
pubblicarlo direttamente (Settings → Pages → Branch: main, Folder: /docs).

```
docs/
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
1. Scarica la cartella `docs`
2. Apri `index.html` nel tuo browser preferito
3. Naviga tra le pagine usando il menu

### Pubblicazione su GitHub Pages (gratis)
1. Vai su GitHub → repository GMBags → **Settings** → **Pages**
2. In "Build and deployment" seleziona **Source: Deploy from a branch**
3. Branch: **main**, cartella: **/docs** → **Save**
4. Dopo qualche minuto il sito sara' online su
   `https://andreamarrano69-beep.github.io/GMBags/`

### Modulo Contatti/Newsletter (FormSubmit)
Il modulo contatti e la newsletter inviano i messaggi via email a
`gmbags@gmail.com` tramite il servizio gratuito FormSubmit, senza bisogno
di un server. **Al primo invio**, FormSubmit manda un'email di conferma a
`gmbags@gmail.com`: bisogna cliccare il link di conferma dentro quell'email,
altrimenti i messaggi successivi non arriveranno.

---

## 📄 Pagine Disponibili

| Pagina | Descrizione |
| :--- | :--- |
| **index.html** | Homepage con hero banner, vantaggi, bestseller, testimoniali e newsletter |
| **prodotti.html** | Catalogo completo con categorie e griglia prodotti |
| **blog.html** | Sezione articoli con card blog interattive |
| **contatti.html** | Form contatti e informazioni di contatto |
| **registrazione.html** | Creazione account cliente |
| **login.html** | Accesso account cliente |
| **account.html** | Area riservata cliente: profilo e storico ordini |
| **admin.html** | Pannello amministratore: utenti, ordini, pagamenti |
| **privacy.html** | Privacy Policy |

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
Duplica il blocco `.product-card` in `prodotti.html` e, se e' un bestseller, anche in `index.html`:

```html
<div class="product-card fade-in">
    <div class="product-image">
        <img src="assets/img/image.jpeg" alt="Nome Prodotto">
    </div>
    <div class="product-info">
        <div class="product-name">Nome Prodotto</div>
        <div class="product-price">Scrivici per il prezzo</div>
        <p class="product-description">Descrizione...</p>
        <button class="btn-cart" onclick="openOrderModal('Nome Prodotto')">Ordina via Email</button>
    </div>
</div>
```

Aggiungi anche il prezzo in `js/main.js`, nell'oggetto `PRODUCT_PRICES`:

```javascript
const PRODUCT_PRICES = {
    'Nome Prodotto': 49.90,
    // ...
};
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

## 🔐 Account Utenti, Ordini e Pannello Admin (Supabase)

Il sito ora supporta registrazione/login utenti: solo chi ha un account
puo' ordinare (la navigazione resta libera per tutti). Per attivare questa
funzione serve un progetto Supabase gratuito (database + autenticazione).

### Passo 1: crea il progetto Supabase
1. Vai su [supabase.com](https://supabase.com) e registrati gratis
2. Crea un nuovo progetto (es. nome "gmbags", regione vicina all'Italia
   come "Central EU")
3. Scegli una password del database e salvala in un posto sicuro
4. Aspetta 1-2 minuti che il progetto sia pronto

### Passo 2: crea le tabelle del database
1. Nel progetto Supabase vai su **SQL Editor** (menu a sinistra) → **New query**
2. Apri il file `docs/supabase-schema.sql` di questo repository, copia
   tutto il contenuto e incollalo nell'editor
3. Clicca **Run**: crea le tabelle `profiles` e `orders` con tutte le
   protezioni di sicurezza necessarie

### Passo 3: collega il sito al progetto
1. Nel progetto Supabase vai su **Project Settings → API**
2. Copia il valore **Project URL** e il valore **anon public** (una chiave lunga)
3. Apri `docs/js/supabase-config.js` e sostituisci i due valori placeholder
   con quelli copiati
4. Salva, fai commit e push: da questo momento login/registrazione/ordini
   funzionano

### Passo 4: diventa amministratore
1. Registrati normalmente dal sito (pagina **Registrati**) con la tua email
2. Torna nell'**SQL Editor** di Supabase ed esegui (sostituendo l'email):
   ```sql
   update public.profiles set is_admin = true
   where id = (select id from auth.users where email = 'gmbags@gmail.com');
   ```
3. Accedi di nuovo: nel menu comparirà il link **Admin** con statistiche,
   elenco ordini e possibilità di aggiornarne lo stato (in attesa,
   confermato, pagato, spedito, annullato)

### Note importanti
- Finché `supabase-config.js` ha ancora i valori segnaposto, il sito
  funziona normalmente ma login/registrazione/ordini mostrano un messaggio
  che avvisa che la funzione non è ancora attiva (nessun errore per i
  visitatori)
- Il piano gratuito di Supabase è ampiamente sufficiente per i volumi
  attuali del negozio

---

## ⚠️ Cose da Sistemare Prima di Farlo Conoscere Bene

1. **Prezzi reali**: le schede prodotto mostrano "Scrivici per il prezzo" in
   attesa dei prezzi definitivi da inserire.
2. **Recensioni**: quelle attuali (Maria Rossi, Luca Ferrari, Giulia Bianchi)
   sono di esempio, da sostituire con recensioni vere appena disponibili.
3. **Foto prodotto**: la prima foto (pochette nera) include un profumo Gucci
   e occhiali Ray-Ban come sfondo — meglio rifare la foto solo con il
   prodotto, per non creare confusione con quei marchi.
4. **Catalogo**: al momento sono online solo 4 modelli (quelli fotografati).
   Aggiungete pure altre foto per ampliare il catalogo.

## 💡 Suggerimenti per Miglioramenti Futuri

1. **Pagamenti online**: quando i volumi crescono, aggiungere Stripe Payment
   Links per accettare pagamenti diretti dal sito, senza dover costruire un
   carrello completo.
2. **SEO**: aggiungere sitemap.xml, dati strutturati Product/Organization
3. **Analytics**: integrare Google Analytics o Plausible per capire da dove
   arrivano i visitatori
4. **Dominio personalizzato**: es. gmbags.it al posto di github.io

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
