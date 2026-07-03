import { bootLanding } from "./core/render.js?v=20260703-service-share-v3";

bootLanding({
  mountSelector: "#app",
  supabaseClient: window.supabaseClient
});
