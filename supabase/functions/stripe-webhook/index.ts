// ============================================================
// Edge Function: stripe-webhook
// Stripe chiama QUESTO indirizzo direttamente (non passa dal browser
// del cliente) quando un pagamento va a buon fine: e' l'unica fonte
// davvero affidabile, perche' verifica la firma crittografica di
// Stripe prima di fidarsi del messaggio. Segna l'ordine come
// "incassato" in automatico.
// ============================================================
import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature!, STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return new Response("Firma non valida: " + (e as Error).message, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;

    if (orderId) {
      const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
      const { data: order } = await supabaseAdmin
        .from("orders")
        .select("spese_spedizione")
        .eq("id", orderId)
        .single();

      const importoIncassato = (session.amount_total ?? 0) / 100 + Number(order?.spese_spedizione ?? 0);

      await supabaseAdmin
        .from("orders")
        .update({
          stato: "incassato",
          data_incassato: new Date().toISOString(),
          importo_incassato: importoIncassato,
          payment_reference: session.id,
        })
        .eq("id", orderId)
        .eq("stato", "in attesa"); // evita di sovrascrivere un ordine gia' aggiornato
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
