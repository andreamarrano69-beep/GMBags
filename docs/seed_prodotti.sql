-- ============================================================
-- GMBag - Prodotti iniziali (migrazione dei 4 prodotti attuali)
-- ============================================================
-- Istruzioni: esegui prima supabase-schema.sql (sezione "PRODOTTI
-- GESTIBILI DA ADMIN"), poi copia e incolla questo file nell'SQL
-- Editor di Supabase e clicca "Run". Va eseguito una sola volta:
-- se lo lanci di nuovo creerai prodotti duplicati.
--
-- Il prezzo e' impostato a NULL ("da confermare"): potrai modificarlo
-- in qualsiasi momento dal pannello Admin, sezione "Gestione Prodotti".
-- ============================================================

insert into public.prodotti (nome, descrizione, prezzo, immagine, in_evidenza, attivo)
values
  (
    'Pochette Nera con Catena',
    'Pochette all''uncinetto nera con tracolla a catena dorata. Fatta interamente a mano.',
    null,
    'assets/img/image0.jpeg',
    true,
    true
  ),
  (
    'Clutch Lilla',
    'Clutch all''uncinetto color lilla, morbida e capiente. Un tocco di colore per ogni look.',
    null,
    'assets/img/image1.jpeg',
    true,
    true
  ),
  (
    'Pochette Panna',
    'Pochette all''uncinetto color panna, elegante e versatile. Perfetta per ogni occasione.',
    null,
    'assets/img/image2.jpeg',
    true,
    true
  ),
  (
    'Borsa Senape a Tracolla',
    'Borsa all''uncinetto color senape con tracolla a catena dorata. Un accessorio unico fatto a mano.',
    null,
    'assets/img/image4.jpeg',
    true,
    true
  );
