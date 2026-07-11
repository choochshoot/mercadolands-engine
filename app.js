import { bootLanding } from "./core/render.js?v=20260711-logo-preloader-v1";

bootLanding({
  mountSelector: "#app",
  supabaseClient: window.supabaseClient
});
