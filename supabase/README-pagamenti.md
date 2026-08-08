# Attivare i pagamenti online (Stripe + PayPal)

Il sito è già pronto per accettare pagamenti online: carrello, ordine
nel database, pagina di ritorno dopo il pagamento sono tutti
funzionanti. Mancano solo questi passaggi, che **solo tu puoi fare**
perché richiedono i tuoi account Stripe/PayPal (io non posso crearli
per te, e non devi mai condividere con me le chiavi segrete).

Finché non completi questi passaggi, scegliere "Carta di
credito/debito online" o "PayPal" al checkout mostra semplicemente un
messaggio che invita a scegliere Contrassegno/Bonifico: **il resto del
sito continua a funzionare normalmente**.

## 1. Installa lo strumento Supabase CLI (una volta sola)

Sul tuo PC, nel terminale di VS Code:

```
npm install -g supabase
supabase login
```

Si aprirà il browser per autorizzare l'accesso al tuo account Supabase.

## 2. Collega il progetto

```
cd GMBags
supabase link --project-ref vuvuwvoyphxyrlmlcdgy
```

## 3. Crea un account Stripe

Vai su https://dashboard.stripe.com/register e crea un account (puoi
iniziare anche senza Partita IVA, in modalità "test" — potrai
attivare i pagamenti veri quando avrai la Partita IVA).

Dalla Dashboard Stripe, sezione **Sviluppatori → Chiavi API**, copia:
- **Chiave segreta** (Secret key, inizia con `sk_test_...` in modalità test)

## 4. Crea un'app PayPal

Vai su https://developer.paypal.com/dashboard/applications e crea una
app REST (di default sarai in modalità Sandbox/test). Copia:
- **Client ID**
- **Secret**

## 5. Configura le chiavi segrete su Supabase

Sempre dal terminale (sostituisci i valori con quelli veri copiati sopra):

```
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx
supabase secrets set PAYPAL_CLIENT_ID=xxxxx
supabase secrets set PAYPAL_CLIENT_SECRET=xxxxx
supabase secrets set PAYPAL_API_BASE=https://api-m.sandbox.paypal.com
supabase secrets set SITE_URL=https://andreamarrano69-beep.github.io/GMBags
```

## 6. Pubblica le funzioni

```
supabase functions deploy create-checkout
supabase functions deploy capture-paypal-order
supabase functions deploy stripe-webhook --no-verify-jwt
```

(l'ultima ha `--no-verify-jwt` perché a chiamarla è Stripe, non un
utente loggato sul sito: la sicurezza lì è garantita dalla firma
segreta, non dal login).

## 7. Collega il webhook Stripe

Dashboard Stripe → **Sviluppatori → Webhook → Aggiungi endpoint**:
- URL: `https://vuvuwvoyphxyrlmlcdgy.supabase.co/functions/v1/stripe-webhook`
- Evento da ascoltare: `checkout.session.completed`

Dopo averlo creato, Stripe ti mostra una **chiave segreta del webhook**
(inizia con `whsec_...`): copiala ed esegui:

```
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

## 8. Prova

Con le chiavi Stripe/PayPal in modalità test, fai un ordine di prova
dal sito scegliendo "Carta di credito online": Stripe in modalità test
accetta la carta finta `4242 4242 4242 4242`, qualunque data futura e
CVC. Dopo il pagamento, controlla che l'ordine risulti "incassato" nel
pannello Admin.

## 9. Quando sei pronta a incassare soldi veri

1. Attiva l'account Stripe (serve completare il tuo profilo attività,
   di solito con la Partita IVA).
2. Sostituisci `sk_test_...` con la chiave **live** (`sk_live_...`) e
   rifai il passaggio 7 (il webhook live è separato da quello test).
3. Per PayPal, passa `PAYPAL_API_BASE` a `https://api-m.paypal.com`
   (senza "sandbox") e usa le chiavi della tua app PayPal in modalità
   Live invece che Sandbox.

Se ti blocchi in qualche passaggio, fammi uno screenshot dell'errore
esatto e ti aiuto a risolverlo.
