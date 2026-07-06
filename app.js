import { bootLanding } from "./core/render.js?v=20260705-service-space-v1";

bootLanding({
  mountSelector: "#app",
  supabaseClient: window.supabaseClient
});
