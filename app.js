import { bootLanding } from "./core/render.js?v=20260706-category-hero-v5";

bootLanding({
  mountSelector: "#app",
  supabaseClient: window.supabaseClient
});
