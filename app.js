import { bootLanding } from "./core/render.js";

bootLanding({
  mountSelector: "#app",
  supabaseClient: window.supabaseClient
});
