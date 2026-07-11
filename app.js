import { bootLanding } from "./core/render.js?v=20260710-footer-privacy-v1";

bootLanding({
  mountSelector: "#app",
  supabaseClient: window.supabaseClient
});
