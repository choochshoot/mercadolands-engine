import { bootLanding } from "./core/render.js?v=20260710-scroll-premium-polish-v1";

bootLanding({
  mountSelector: "#app",
  supabaseClient: window.supabaseClient
});
