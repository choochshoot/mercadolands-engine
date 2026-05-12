window.CONFIG = {
  SUPABASE_URL: "https://qvrdztijxkoihiymuoje.supabase.co",
  SUPABASE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2cmR6dGlqeGtvaWhpeW11b2plIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5Mzg0MDcsImV4cCI6MjA5MzUxNDQwN30.mbseLbDK0f4hXf22dK_cdiiumeOwME4YAXywfXN7LPg"
};

window.supabaseClient = window.supabase.createClient(
  window.CONFIG.SUPABASE_URL,
  window.CONFIG.SUPABASE_KEY
);

var CONFIG = window.CONFIG;
var supabaseClient = window.supabaseClient;
