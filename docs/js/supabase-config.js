/* ============================================================
   CONFIGURAZIONE SUPABASE
   ============================================================
   Sostituisci i due valori qui sotto con quelli del tuo progetto:
   Supabase -> Project Settings -> API -> "Project URL" e "anon public".
   Finche' restano ai valori di esempio, login/registrazione/ordini non
   funzioneranno (il sito lo segnala con un messaggio chiaro).
   ============================================================ */
const SUPABASE_URL = 'INSERISCI_QUI_IL_TUO_PROJECT_URL';
const SUPABASE_ANON_KEY = 'INSERISCI_QUI_LA_TUA_ANON_KEY';

const isSupabaseConfigured =
  SUPABASE_URL !== 'INSERISCI_QUI_IL_TUO_PROJECT_URL' &&
  SUPABASE_ANON_KEY !== 'INSERISCI_QUI_LA_TUA_ANON_KEY';

const supabaseClient = isSupabaseConfigured
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
