-- ============================================================
-- GMBag - Schema database Supabase (PostgreSQL)
-- ============================================================
-- Istruzioni: copia tutto questo file e incollalo nell'SQL Editor
-- di Supabase (Project -> SQL Editor -> New query), poi clicca "Run".
-- Puoi eseguirlo una sola volta su un progetto nuovo.
-- ============================================================

-- ------------------------------------------------------------
-- TABELLA: profiles
-- Un profilo per ogni utente registrato (nome, telefono, ruolo admin).
-- Collegata a auth.users, la tabella utenti gestita da Supabase Auth.
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  telefono text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Un utente puo' leggere e modificare solo il proprio profilo
create policy "Utenti leggono il proprio profilo"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Utenti aggiornano il proprio profilo"
  on public.profiles for update
  using (auth.uid() = id);

-- Gli admin possono leggere tutti i profili (serve per il pannello admin)
create policy "Admin legge tutti i profili"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- ------------------------------------------------------------
-- TRIGGER: crea automaticamente il profilo alla registrazione
-- Legge "nome" e "telefono" passati come metadata in fase di signup.
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nome, telefono)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', ''),
    new.raw_user_meta_data ->> 'telefono'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- TABELLA: orders
-- Un ordine/richiesta per ogni prodotto richiesto da un utente loggato.
-- ------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  prodotto text not null,
  quantita integer not null default 1,
  prezzo_unitario numeric(10, 2),
  totale numeric(10, 2),
  messaggio text,
  stato text not null default 'in attesa',
  metodo_pagamento text not null default 'contrassegno',
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

-- Un utente crea e legge solo i propri ordini
create policy "Utenti creano i propri ordini"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Utenti leggono i propri ordini"
  on public.orders for select
  using (auth.uid() = user_id);

-- Gli admin leggono e aggiornano tutti gli ordini (stato/pagamento)
create policy "Admin legge tutti gli ordini"
  on public.orders for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

create policy "Admin aggiorna tutti gli ordini"
  on public.orders for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- ------------------------------------------------------------
-- STATO ORDINE: valori consigliati per il campo "stato"
--   'in attesa'   -> richiesta ricevuta, non ancora confermata
--   'confermato'  -> ordine confermato, in preparazione
--   'spedito'     -> pacco spedito
--   'pagato'      -> pagamento ricevuto (utile se non e' contrassegno)
--   'annullato'   -> ordine annullato
-- ------------------------------------------------------------

-- ------------------------------------------------------------
-- COME DIVENTARE ADMIN (fallo una volta sola, dopo esserti registrato
-- normalmente dal sito con la tua email):
--
--   update public.profiles set is_admin = true where id =
--     (select id from auth.users where email = 'gmbags@gmail.com');
--
-- ------------------------------------------------------------

-- ============================================================
-- AGGIORNAMENTO: BLOG GESTIBILE + MESSAGGI DI CONTATTO
-- Se avevi gia' eseguito la parte sopra, puoi incollare ed eseguire
-- solo questa sezione: e' sicura da eseguire anche piu' di una volta.
-- ============================================================

-- ------------------------------------------------------------
-- TABELLA: blog_posts
-- Articoli del blog, scrivibili solo dall'admin. Chiunque puo' leggere
-- solo gli articoli pubblicati (pubblicato = true).
-- ------------------------------------------------------------
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  titolo text not null,
  slug text not null unique,
  estratto text,
  contenuto text not null,
  immagine text,
  pubblicato boolean not null default true,
  autore_id uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blog_posts enable row level security;

create policy "Tutti leggono gli articoli pubblicati"
  on public.blog_posts for select
  using (pubblicato = true);

create policy "Admin legge tutti gli articoli, anche bozze"
  on public.blog_posts for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

create policy "Admin crea articoli"
  on public.blog_posts for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

create policy "Admin modifica articoli"
  on public.blog_posts for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

create policy "Admin elimina articoli"
  on public.blog_posts for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- ------------------------------------------------------------
-- TABELLA: contact_messages
-- Messaggi ricevuti dal modulo Contatti. Chiunque (anche non loggato)
-- puo' inviarne uno, ma solo l'admin puo' leggerli.
-- ------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  telefono text,
  oggetto text,
  messaggio text not null,
  stato text not null default 'nuovo',
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "Chiunque puo' inviare un messaggio di contatto"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

create policy "Admin legge tutti i messaggi"
  on public.contact_messages for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

create policy "Admin aggiorna lo stato dei messaggi"
  on public.contact_messages for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- STATO MESSAGGIO: 'nuovo' oppure 'risposto'

-- ============================================================
-- CORREZIONE: funzione is_admin() per evitare ricorsione RLS
-- Le policy "Admin legge/scrive tutto" controllavano is_admin facendo
-- una query sulla STESSA tabella profiles su cui erano applicate:
-- Postgres a volte va in "infinite recursion detected in policy for
-- relation" e blocca silenziosamente la lettura. Con questa funzione
-- (SECURITY DEFINER, quindi bypassa le policy quando esegue il
-- controllo) il problema si risolve. Esegui questa sezione anche se
-- avevi gia' eseguito tutto il resto: e' sicura da rieseguire.
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

drop policy if exists "Admin legge tutti i profili" on public.profiles;
create policy "Admin legge tutti i profili"
  on public.profiles for select
  using (public.is_admin());

drop policy if exists "Admin legge tutti gli ordini" on public.orders;
create policy "Admin legge tutti gli ordini"
  on public.orders for select
  using (public.is_admin());

drop policy if exists "Admin aggiorna tutti gli ordini" on public.orders;
create policy "Admin aggiorna tutti gli ordini"
  on public.orders for update
  using (public.is_admin());

drop policy if exists "Admin legge tutti gli articoli, anche bozze" on public.blog_posts;
create policy "Admin legge tutti gli articoli, anche bozze"
  on public.blog_posts for select
  using (public.is_admin());

drop policy if exists "Admin crea articoli" on public.blog_posts;
create policy "Admin crea articoli"
  on public.blog_posts for insert
  with check (public.is_admin());

drop policy if exists "Admin modifica articoli" on public.blog_posts;
create policy "Admin modifica articoli"
  on public.blog_posts for update
  using (public.is_admin());

drop policy if exists "Admin elimina articoli" on public.blog_posts;
create policy "Admin elimina articoli"
  on public.blog_posts for delete
  using (public.is_admin());

drop policy if exists "Admin legge tutti i messaggi" on public.contact_messages;
create policy "Admin legge tutti i messaggi"
  on public.contact_messages for select
  using (public.is_admin());

drop policy if exists "Admin aggiorna lo stato dei messaggi" on public.contact_messages;
create policy "Admin aggiorna lo stato dei messaggi"
  on public.contact_messages for update
  using (public.is_admin());

-- ============================================================
-- AGGIORNAMENTO: TRACCIAMENTO ORDINI CON DATE E IMPORTO AUTOMATICI
-- Aggiunge le colonne per registrare automaticamente quando un ordine
-- passa a "ordinato", "spedito" e "incassato" (con importo incassato).
-- Sicura da rieseguire anche piu' di una volta.
-- ============================================================

alter table public.orders add column if not exists data_ordinato timestamptz;
alter table public.orders add column if not exists data_spedito timestamptz;
alter table public.orders add column if not exists data_incassato timestamptz;
alter table public.orders add column if not exists importo_incassato numeric(10, 2);

-- ------------------------------------------------------------
-- NUOVO ELENCO STATI (usati da qui in avanti dal sito):
--   'in attesa'   -> richiesta ricevuta (data = created_at)
--   'ordinato'    -> confermato con il cliente
--   'spedito'     -> pacco spedito/consegnato
--   'incassato'   -> pagamento riscosso (importo salvato in automatico)
--   'annullato'   -> ordine annullato
-- ------------------------------------------------------------

-- ============================================================
-- AGGIORNAMENTO: PRODOTTI GESTIBILI DA ADMIN + SPESE DI SPEDIZIONE
-- Sposta i prodotti dal codice del sito a una tabella nel database,
-- cosi' l'admin puo' modificare i prezzi e aggiungerne di nuovi dal
-- pannello Admin senza bisogno del mio aiuto. Aggiunge anche le spese
-- di spedizione sugli ordini. Sicura da rieseguire piu' di una volta.
-- ============================================================

-- ------------------------------------------------------------
-- TABELLA: prodotti
-- Chiunque puo' leggere solo i prodotti attivi (attivo = true).
-- Solo l'admin puo' creare/modificare/eliminare prodotti.
-- ------------------------------------------------------------
create table if not exists public.prodotti (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descrizione text,
  prezzo numeric(10, 2),
  immagine text,
  in_evidenza boolean not null default false,
  attivo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.prodotti enable row level security;

drop policy if exists "Tutti leggono i prodotti attivi" on public.prodotti;
create policy "Tutti leggono i prodotti attivi"
  on public.prodotti for select
  using (attivo = true);

drop policy if exists "Admin legge tutti i prodotti" on public.prodotti;
create policy "Admin legge tutti i prodotti"
  on public.prodotti for select
  using (public.is_admin());

drop policy if exists "Admin crea prodotti" on public.prodotti;
create policy "Admin crea prodotti"
  on public.prodotti for insert
  with check (public.is_admin());

drop policy if exists "Admin modifica prodotti" on public.prodotti;
create policy "Admin modifica prodotti"
  on public.prodotti for update
  using (public.is_admin());

drop policy if exists "Admin elimina prodotti" on public.prodotti;
create policy "Admin elimina prodotti"
  on public.prodotti for delete
  using (public.is_admin());

-- ------------------------------------------------------------
-- ORDINI: spese di spedizione
-- Importo che l'admin puo' inserire per ordine; viene sommato al
-- totale quando l'ordine viene segnato come "incassato".
-- ------------------------------------------------------------
alter table public.orders add column if not exists spese_spedizione numeric(10, 2) not null default 0;

-- ============================================================
-- SICUREZZA: chiude due falle scoperte durante un controllo del codice
-- Sicura da rieseguire piu' di una volta.
-- ============================================================

-- ------------------------------------------------------------
-- FALLA 1: un utente registrato poteva promuoversi admin da solo
-- La policy "Utenti aggiornano il proprio profilo" permette di
-- modificare il proprio profilo (nome, telefono), ma non impediva di
-- modificare anche la colonna is_admin nella stessa richiesta: bastava
-- aprire la Console del browser e scrivere una riga di codice per
-- diventare admin. Questo trigger blocca la modifica di is_admin a
-- chiunque non sia gia' admin, lasciando pero' funzionante la
-- procedura manuale "COME DIVENTARE ADMIN" descritta piu' sopra
-- (quella eseguita dall'SQL Editor di Supabase).
-- ------------------------------------------------------------
create or replace function public.prevent_is_admin_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_is_admin_escalation on public.profiles;
create trigger prevent_is_admin_escalation
  before update on public.profiles
  for each row execute procedure public.prevent_is_admin_escalation();

-- ------------------------------------------------------------
-- FALLA 2: un utente poteva creare un ordine gia' finto "incassato"
-- La policy di inserimento ordini controllava solo che l'ordine fosse
-- intestato a se stessi, non i valori dei campi: chiunque poteva
-- inserire (sempre dalla Console del browser, bypassando il sito)
-- un ordine con stato "incassato" e importo a piacere, senza aver
-- pagato nulla. Ora un nuovo ordine puo' nascere solo con stato
-- "in attesa" e senza date/importo di tracciamento: solo l'admin puo'
-- farli avanzare (come gia' avviene dal pannello Admin).
-- ------------------------------------------------------------
drop policy if exists "Utenti creano i propri ordini" on public.orders;
create policy "Utenti creano i propri ordini"
  on public.orders for insert
  with check (
    auth.uid() = user_id
    and stato = 'in attesa'
    and data_ordinato is null
    and data_spedito is null
    and data_incassato is null
    and importo_incassato is null
  );

-- ============================================================
-- AGGIORNAMENTO: CARRELLO MULTI-PRODOTTO, INDIRIZZO, MAGAZZINO,
-- PAGAMENTI ONLINE
-- Sicura da rieseguire piu' di una volta.
-- ============================================================

-- ------------------------------------------------------------
-- PROFILES: indirizzo di spedizione salvato (facoltativo, di comodo:
-- viene precompilato al checkout, l'utente puo' sempre modificarlo).
-- ------------------------------------------------------------
alter table public.profiles add column if not exists indirizzo text;
alter table public.profiles add column if not exists citta text;
alter table public.profiles add column if not exists cap text;
alter table public.profiles add column if not exists provincia text;

-- ------------------------------------------------------------
-- PRODOTTI: quantita' disponibile in magazzino.
-- Se resta NULL, il prodotto NON traccia il magazzino (comportamento
-- attuale, illimitato): l'admin decide per quali prodotti attivare
-- il conteggio impostando un numero.
-- ------------------------------------------------------------
alter table public.prodotti add column if not exists quantita_disponibile integer;

-- ------------------------------------------------------------
-- ORDERS: diventa la "testata" di un ordine che puo' contenere piu'
-- prodotti (vedi tabella order_items sotto). Aggiunge l'indirizzo di
-- spedizione (fotografato al momento dell'ordine, non collegato al
-- profilo: se il cliente cambia indirizzo dopo, l'ordine vecchio
-- resta corretto) e il tracciamento del pagamento online.
-- ------------------------------------------------------------
alter table public.orders add column if not exists indirizzo_spedizione text;
alter table public.orders add column if not exists citta_spedizione text;
alter table public.orders add column if not exists cap_spedizione text;
alter table public.orders add column if not exists provincia_spedizione text;
alter table public.orders add column if not exists payment_provider text; -- 'stripe' | 'paypal' | 'manuale'
alter table public.orders add column if not exists payment_reference text; -- id transazione esterna

-- ------------------------------------------------------------
-- TABELLA: order_items
-- Un prodotto per riga, collegato a un ordine: e' quello che rende
-- possibile il carrello con piu' articoli. nome_prodotto e'
-- "fotografato" al momento dell'ordine (resta corretto anche se il
-- prodotto viene poi rinominato o rimosso dal catalogo).
-- ------------------------------------------------------------
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  prodotto_id uuid references public.prodotti (id) on delete set null,
  nome_prodotto text not null,
  quantita integer not null default 1,
  prezzo_unitario numeric(10, 2),
  created_at timestamptz not null default now()
);

alter table public.order_items enable row level security;

drop policy if exists "Utenti leggono gli articoli dei propri ordini" on public.order_items;
create policy "Utenti leggono gli articoli dei propri ordini"
  on public.order_items for select
  using (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

drop policy if exists "Admin legge tutti gli articoli ordine" on public.order_items;
create policy "Admin legge tutti gli articoli ordine"
  on public.order_items for select
  using (public.is_admin());

drop policy if exists "Utenti creano articoli nei propri ordini" on public.order_items;
create policy "Utenti creano articoli nei propri ordini"
  on public.order_items for insert
  with check (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

-- ------------------------------------------------------------
-- MAGAZZINO AUTOMATICO
-- Quando viene aggiunto un articolo a un ordine, se il prodotto
-- traccia il magazzino (quantita_disponibile non nullo) la quantita'
-- viene scalata in automatico; se non ce n'e' abbastanza, l'intero
-- ordine viene rifiutato (evita di vendere due volte l'ultimo pezzo,
-- anche con piu' persone che ordinano nello stesso momento).
-- Se l'ordine viene poi segnato "annullato", la quantita' torna
-- disponibile automaticamente.
-- ------------------------------------------------------------
create or replace function public.scala_magazzino()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  righe_aggiornate integer;
begin
  if new.prodotto_id is not null then
    update public.prodotti
      set quantita_disponibile = quantita_disponibile - new.quantita
      where id = new.prodotto_id
        and quantita_disponibile is not null
        and quantita_disponibile >= new.quantita;
    get diagnostics righe_aggiornate = row_count;
    if righe_aggiornate = 0
       and exists (select 1 from public.prodotti where id = new.prodotto_id and quantita_disponibile is not null) then
      raise exception 'Quantita non disponibile per il prodotto richiesto';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists scala_magazzino on public.order_items;
create trigger scala_magazzino
  before insert on public.order_items
  for each row execute procedure public.scala_magazzino();

create or replace function public.ripristina_magazzino_su_annullamento()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.stato = 'annullato' and old.stato is distinct from 'annullato' then
    update public.prodotti p
      set quantita_disponibile = p.quantita_disponibile + oi.quantita
      from public.order_items oi
      where oi.order_id = new.id
        and oi.prodotto_id = p.id
        and p.quantita_disponibile is not null;
  end if;
  return new;
end;
$$;

drop trigger if exists ripristina_magazzino_su_annullamento on public.orders;
create trigger ripristina_magazzino_su_annullamento
  after update on public.orders
  for each row execute procedure public.ripristina_magazzino_su_annullamento();

-- ============================================================
-- AGGIORNAMENTO: GESTIONE UTENTI E RISPOSTE CHATBOT DA ADMIN
-- Sicura da rieseguire piu' di una volta.
-- ============================================================

-- ------------------------------------------------------------
-- PROFILES: salva anche l'email (comoda da mostrare in Admin senza
-- dover interrogare auth.users, che il sito non puo' leggere
-- direttamente). Viene popolata automaticamente alla registrazione;
-- per chi si era gia' registrato prima di questo aggiornamento,
-- l'UPDATE qui sotto la recupera una volta sola da auth.users.
-- ------------------------------------------------------------
alter table public.profiles add column if not exists email text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nome, telefono, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', ''),
    new.raw_user_meta_data ->> 'telefono',
    new.email
  );
  return new;
end;
$$;

update public.profiles p
  set email = au.email
  from auth.users au
  where p.id = au.id and p.email is null;

-- ------------------------------------------------------------
-- PROFILES: l'admin puo' ora anche AGGIORNARE i profili altrui (fino
-- ad oggi poteva solo leggerli), per poter promuovere/rimuovere altri
-- admin dal pannello Gestione Utenti. Il trigger anti-escalation
-- creato in precedenza continua a impedire che un utente NON admin
-- modifichi da solo la propria colonna is_admin.
-- ------------------------------------------------------------
drop policy if exists "Admin aggiorna tutti i profili" on public.profiles;
create policy "Admin aggiorna tutti i profili"
  on public.profiles for update
  using (public.is_admin());

-- ------------------------------------------------------------
-- TABELLA: bot_risposte
-- Le risposte automatiche del chatbot, modificabili dall'admin invece
-- che scritte nel codice. "predefinita" = la risposta usata quando
-- nessuna parola chiave corrisponde al messaggio scritto dal cliente.
-- ------------------------------------------------------------
create table if not exists public.bot_risposte (
  id uuid primary key default gen_random_uuid(),
  parola_chiave text not null default '',
  risposta text not null,
  predefinita boolean not null default false,
  attivo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.bot_risposte enable row level security;

drop policy if exists "Tutti leggono le risposte attive" on public.bot_risposte;
create policy "Tutti leggono le risposte attive"
  on public.bot_risposte for select
  using (attivo = true);

drop policy if exists "Admin legge tutte le risposte" on public.bot_risposte;
create policy "Admin legge tutte le risposte"
  on public.bot_risposte for select
  using (public.is_admin());

drop policy if exists "Admin crea risposte" on public.bot_risposte;
create policy "Admin crea risposte"
  on public.bot_risposte for insert
  with check (public.is_admin());

drop policy if exists "Admin modifica risposte" on public.bot_risposte;
create policy "Admin modifica risposte"
  on public.bot_risposte for update
  using (public.is_admin());

drop policy if exists "Admin elimina risposte" on public.bot_risposte;
create policy "Admin elimina risposte"
  on public.bot_risposte for delete
  using (public.is_admin());

-- ============================================================
-- AGGIORNAMENTO: CARICAMENTO IMMAGINI DAL PANNELLO ADMIN
-- Crea uno spazio (bucket) dove admin.html puo' caricare le foto di
-- prodotti e articoli direttamente da telefono/PC, senza passare da
-- GitHub. Le immagini caricate sono leggibili da chiunque (serve,
-- altrimenti i visitatori non le vedrebbero sul sito), ma solo
-- l'admin puo' caricarne/modificarne/eliminarne.
-- Sicura da rieseguire piu' di una volta.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('immagini', 'immagini', true)
on conflict (id) do nothing;

drop policy if exists "Chiunque legge le immagini" on storage.objects;
create policy "Chiunque legge le immagini"
  on storage.objects for select
  using (bucket_id = 'immagini');

drop policy if exists "Admin carica immagini" on storage.objects;
create policy "Admin carica immagini"
  on storage.objects for insert
  with check (bucket_id = 'immagini' and public.is_admin());

drop policy if exists "Admin aggiorna immagini" on storage.objects;
create policy "Admin aggiorna immagini"
  on storage.objects for update
  using (bucket_id = 'immagini' and public.is_admin());

drop policy if exists "Admin elimina immagini" on storage.objects;
create policy "Admin elimina immagini"
  on storage.objects for delete
  using (bucket_id = 'immagini' and public.is_admin());

-- ============================================================
-- AGGIORNAMENTO: CONTENUTI HOMEPAGE MODIFICABILI DALL'ADMIN
-- I testi del banner iniziale e della sezione "Perche' Sceglierci"
-- vengono salvati qui invece che scritti nel codice, cosi' l'admin
-- puo' modificarli dal pannello senza bisogno di interventi tecnici.
-- Se una chiave non esiste ancora nel database, il sito mostra il
-- testo di default gia' scritto nella pagina (le righe qui sotto
-- inseriscono i testi attuali, cosi' il pannello Admin parte gia'
-- precompilato con quello che e' online adesso).
-- ============================================================
create table if not exists public.site_content (
  chiave text primary key,
  valore text not null default ''
);

alter table public.site_content enable row level security;

drop policy if exists "Tutti leggono i contenuti del sito" on public.site_content;
create policy "Tutti leggono i contenuti del sito"
  on public.site_content for select
  using (true);

drop policy if exists "Admin crea contenuti" on public.site_content;
create policy "Admin crea contenuti"
  on public.site_content for insert
  with check (public.is_admin());

drop policy if exists "Admin modifica contenuti" on public.site_content;
create policy "Admin modifica contenuti"
  on public.site_content for update
  using (public.is_admin());

drop policy if exists "Admin elimina contenuti" on public.site_content;
create policy "Admin elimina contenuti"
  on public.site_content for delete
  using (public.is_admin());

insert into public.site_content (chiave, valore) values
  ('hero_titolo', 'Borse Artigianali all''Uncinetto'),
  ('hero_sottotitolo', 'Ogni borsa GMBags è realizzata interamente a mano, all''uncinetto, con cura per ogni dettaglio'),
  ('perche_titolo', 'Perché Scegliere GMBags'),
  ('perche_sottotitolo', 'Qualità, tradizione e eccellenza in ogni prodotto'),
  ('feature1_titolo', '✨ Fatte a Mano'),
  ('feature1_testo', 'Ogni borsa è realizzata all''uncinetto a mano, un pezzo alla volta, con cura per ogni dettaglio: nessuna produzione in serie.'),
  ('feature2_titolo', '⏰ Da 2 Anni con Passione'),
  ('feature2_testo', 'GMBags nasce dalla passione per l''uncinetto: da due anni creiamo borse e pochette uniche, curate nei minimi dettagli.'),
  ('feature3_titolo', '💬 Assistenza Diretta'),
  ('feature3_testo', 'Scrivici su WhatsApp o via email: ti seguiamo personalmente in ogni fase, dall''ordine alla consegna.')
on conflict (chiave) do nothing;

-- ============================================================
-- AGGIORNAMENTO: TESTIMONIANZE VERE (al posto del testo di esempio)
-- Le 3 recensioni finte scritte nel codice (Maria Rossi, Luca
-- Ferrari, Giulia Bianchi) vengono tolte dal sito: questa tabella
-- ospita le recensioni vere che l'admin aggiunge man mano che
-- arrivano (es. copiate da WhatsApp o Instagram con il consenso del
-- cliente). Se non c'e' ancora nessuna testimonianza attiva, la
-- sezione "Cosa dicono i nostri clienti" non viene mostrata sul
-- sito, invece di mostrare dati inventati.
-- ============================================================
create table if not exists public.testimonianze (
  id uuid primary key default gen_random_uuid(),
  autore text not null,
  testo text not null,
  stelle integer not null default 5 check (stelle between 1 and 5),
  attivo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.testimonianze enable row level security;

drop policy if exists "Tutti leggono le testimonianze attive" on public.testimonianze;
create policy "Tutti leggono le testimonianze attive"
  on public.testimonianze for select
  using (attivo = true);

drop policy if exists "Admin legge tutte le testimonianze" on public.testimonianze;
create policy "Admin legge tutte le testimonianze"
  on public.testimonianze for select
  using (public.is_admin());

drop policy if exists "Admin crea testimonianze" on public.testimonianze;
create policy "Admin crea testimonianze"
  on public.testimonianze for insert
  with check (public.is_admin());

drop policy if exists "Admin modifica testimonianze" on public.testimonianze;
create policy "Admin modifica testimonianze"
  on public.testimonianze for update
  using (public.is_admin());

drop policy if exists "Admin elimina testimonianze" on public.testimonianze;
create policy "Admin elimina testimonianze"
  on public.testimonianze for delete
  using (public.is_admin());
