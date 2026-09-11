-- ============================================================
-- GMBag - Risposte iniziali del chatbot (migrazione da quelle
-- attualmente scritte nel codice)
-- ============================================================
-- Esegui prima la sezione "GESTIONE UTENTI E RISPOSTE CHATBOT" di
-- supabase-schema.sql, poi questo file una sola volta: se lo lanci
-- di nuovo crei righe duplicate. Dopo, potrai modificare tutto dal
-- pannello Admin, sezione "Gestione Chatbot".
-- ============================================================

insert into public.bot_risposte (parola_chiave, risposta, predefinita, attivo)
values
  ('ciao', 'Ciao! 👋 Come posso aiutarti oggi?', false, true),
  ('prodotti', 'Realizziamo borse e pochette artigianali all''uncinetto, fatte interamente a mano. Vuoi scoprire la collezione?', false, true),
  ('prezzo', 'Il prezzo varia in base al modello. Scrivici su WhatsApp il prodotto che ti interessa e ti rispondiamo subito!', false, true),
  ('spedizion', 'Scrivici su WhatsApp o via email per organizzare insieme spedizione o ritiro del tuo ordine.', false, true),
  ('contatt', 'Puoi scriverci su WhatsApp (link nella pagina Contatti) oppure via email a gmbags2026@gmail.com. Ti rispondiamo il prima possibile!', false, true),
  ('whatsapp', 'Scrivici su WhatsApp dalla pagina Contatti del sito, ti rispondiamo il prima possibile!', false, true),
  ('', 'Grazie per la tua domanda! Per informazioni scrivici su WhatsApp (link nella pagina Contatti) o via email a gmbags2026@gmail.com', true, true);
