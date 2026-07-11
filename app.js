import { bootLanding } from "./core/render.js?v=20260711-no-call-button-v1";

bootLanding({
  mountSelector: "#app",
  supabaseClient: window.supabaseClient
});
