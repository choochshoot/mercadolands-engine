import { bootLanding } from "./core/render.js?v=20260703-hero-webm-v1";

bootLanding({
  mountSelector: "#app",
  supabaseClient: window.supabaseClient
});
