import { bootLanding } from "./core/render.js?v=20260706-category-hero-v4";

bootLanding({
  mountSelector: "#app",
  supabaseClient: window.supabaseClient
});
