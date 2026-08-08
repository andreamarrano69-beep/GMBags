// ============================================================
// Edge Function: capture-paypal-order
// Chiamata dalla pagina pagamento-completato.html quando PayPal
// rimanda il cliente sul sito dopo l'approvazione. "Incassa"
// davvero il pagamento lato server (PayPal richiede questo passaggio
// esplicito) e poi segna l'ordine come "incassato".
// ============================================================
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID")!;
const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET")!;
const PAYPAL_API_BASE = Deno.env.get("PAYPAL_API_BASE") ?? "https://api-m.sandbox.paypal.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paypal_order_id, order_id } = await req.json();
    if (!paypal_order_id || !order_id) {
      return jsonError("Richiesta non valida", 400);
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

    const captureResp = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${paypal_order_id}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const captureData = await captureResp.json();

    if (!captureResp.ok || captureData.status !== "COMPLETED") {
      return jsonError("Il pagamento PayPal non è stato completato.", 502);
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("totale, spese_spedizione")
      .eq("id", order_id)
      .single();

    const importoIncassato = Number(order?.totale ?? 0) + Number(order?.spese_spedizione ?? 0);

    await supabaseAdmin
      .from("orders")
      .update({
        stato: "incassato",
        data_incassato: new Date().toISOString(),
        importo_incassato: importoIncassato,
        payment_reference: paypal_order_id,
      })
      .eq("id", order_id)
      .eq("stato", "in attesa");

    return jsonOk({ success: true });
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
