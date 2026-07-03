import { bootLanding } from "./core/render.js?v=20260702-vanessa-assets-v6";

bootLanding({
  mountSelector: "#app",
  supabaseClient: window.supabaseClient
});
