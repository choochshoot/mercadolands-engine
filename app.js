import { bootLanding } from "./core/render.js?v=20260706-category-black-v1";

bootLanding({
  mountSelector: "#app",
  supabaseClient: window.supabaseClient
});
