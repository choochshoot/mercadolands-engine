import { bootLanding } from "./core/render.js?v=20260624-treatment-cards";

bootLanding({
  mountSelector: "#app",
  supabaseClient: window.supabaseClient
});
