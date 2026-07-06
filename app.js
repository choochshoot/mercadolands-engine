import { bootLanding } from "./core/render.js?v=20260705-promo-cards-v1";

bootLanding({
  mountSelector: "#app",
  supabaseClient: window.supabaseClient
});
