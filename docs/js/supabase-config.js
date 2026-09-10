/* ============================================================
   CONFIGURAZIONE SUPABASE
   ============================================================
   Sostituisci i due valori qui sotto con quelli del tuo progetto:
   Supabase -> Project Settings -> API -> "Project URL" e "anon public".
   Finche' restano ai valori di esempio, login/registrazione/ordini non
   funzioneranno (il sito lo segnala con un messaggio chiaro).
   ============================================================ */
const SUPABASE_URL = 'https://vuvuwvoyphxyrlmlcdgy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LoxgJbyaqlwdXjpCQ2Sgdg_T3g4iS7_';

const isSupabaseConfigured =
  SUPABASE_URL !== 'INSERISCI_QUI_IL_TUO_PROJECT_URL' &&
  SUPABASE_ANON_KEY !== 'INSERISCI_QUI_LA_TUA_ANON_KEY';

const supabaseClient = isSupabaseConfigured
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/* ============================================================
   MODALITA' VETRINA / NEGOZIO
   ============================================================
   Con NEGOZIO_ATTIVO = false il sito mostra solo i prodotti (e il
   chatbot), senza pulsante "Aggiungi al Carrello", senza icona
   carrello e senza il link "Accedi" nel menu: per i visitatori e'
   una vetrina, non un e-commerce funzionante.
   Le pagine login.html / registrazione.html / admin.html restano
   raggiungibili digitando l'indirizzo direttamente (non sono
   collegate nel menu), quindi l'accesso resta possibile solo a chi
   conosce gia' il link (admin e chi deve registrarsi).
   Quando si e' pronti a vendere davvero, basta rimettere true qui
   sotto: tutto il resto (carrello, checkout, pagamenti) e' gia'
   pronto e non richiede altre modifiche.
   ============================================================ */
const NEGOZIO_ATTIVO = false;
