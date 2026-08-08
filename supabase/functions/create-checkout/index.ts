// ============================================================
// Edge Function: create-checkout
// Chiamata dal sito (carrello.html) quando il cliente sceglie di
// pagare online (Stripe o PayPal). Crea la sessione di pagamento e
// restituisce l'indirizzo a cui mandare il cliente.
//
// L'ordine deve gia' esistere nel database (creato dal sito prima di
// chiamare questa funzione) con stato = 'in attesa'. Qui verifichiamo
// che l'ordine appartenga davvero a chi sta chiamando, cosi' nessuno
// puo' pagare (o far pagare) l'ordine di qualcun altro.
// ============================================================
import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://andreamarrano69-beep.github.io/GMBags";
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET");
const PAYPAL_API_BASE = Deno.env.get("PAYPAL_API_BASE") ?? "https://api-m.sandbox.paypal.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace("Bearer ", "");
    const { provider, order_id } = await req.json();

    if (!order_id || (provider !== "stripe" && provider !== "paypal")) {
      return jsonError("Richiesta non valida", 400);
    }

    // Client "service role": bypassa le RLS, usato solo dopo aver
    // verificato chi e' l'utente che ha chiamato la funzione.
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(jwt);
    if (userError || !userData.user) {
      return jsonError("Sessione non valida, accedi di nuovo.", 401);
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return jsonError("Ordine non trovato.", 404);
    }
    if (order.user_id !== userData.user.id) {
      return jsonError("Questo ordine non ti appartiene.", 403);
    }
    if (order.stato !== "in attesa") {
      return jsonError("Questo ordine e' gia' stato gestito.", 409);
    }

    const { data: items, error: itemsError } = await supabaseAdmin
      .from("order_items")
      .select("*")
      .eq("order_id", order_id);

    if (itemsError || !items || items.length === 0) {
      return jsonError("Nessun articolo trovato per questo ordine.", 400);
    }

    const totale = Number(order.totale ?? 0);

    if (provider === "stripe") {
      if (!STRIPE_SECRET_KEY) return jsonError("Pagamento con carta non ancora configurato.", 503);
      const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: items.map((item) => ({
          quantity: item.quantita,
          price_data: {
            currency: "eur",
            unit_amount: Math.round(Number(item.prezzo_unitario ?? 0) * 100),
            product_data: { name: item.nome_prodotto },
          },
        })),
        metadata: { order_id: order.id },
        success_url: `${SITE_URL}/pagamento-completato.html?provider=stripe&order_id=${order.id}`,
        cancel_url: `${SITE_URL}/carrello.html`,
        customer_email: userData.user.email,
      });

      return jsonOk({ url: session.url });
    }

    // provider === "paypal"
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      return jsonError("Pagamento PayPal non ancora configurato.", 503);
    }

    const tokenResp = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    const tokenData = await tokenResp.json();
    if (!tokenResp.ok) return jsonError("Errore di autenticazione PayPal.", 502);

    const orderResp = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            custom_id: order.id,
            amount: { currency_code: "EUR", value: totale.toFixed(2) },
          },
        ],
        application_context: {
          return_url: `${SITE_URL}/pagamento-completato.html?provider=paypal&order_id=${order.id}`,
          cancel_url: `${SITE_URL}/carrello.html`,
        },
      }),
    });
    const paypalOrder = await orderResp.json();
    if (!orderResp.ok) return jsonError("Errore nella creazione dell'ordine PayPal.", 502);

    const approveLink = (paypalOrder.links || []).find((l: { rel: string }) => l.rel === "approve");
    return jsonOk({ url: approveLink?.href });
  } catch (e) {
    return jsonError("Errore interno: " + (e as Error).message, 500);
  }
});

function jsonOk(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
