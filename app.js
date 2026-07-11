import { bootLanding } from "./core/render.js?v=20260710-promo-sticky-banner-v1";

bootLanding({
  mountSelector: "#app",
  supabaseClient: window.supabaseClient
});
