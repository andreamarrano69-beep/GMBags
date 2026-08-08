// Intestazioni CORS condivise dalle Edge Function: permettono al sito
// (GitHub Pages) di chiamare queste funzioni dal browser.
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
