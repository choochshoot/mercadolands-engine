const ADMIN_SESSION_KEY = "mercadolands_admin_unlocked";
const ADMIN_KEY = "mercadolands2026";

const lock = document.querySelector("#admin-lock");
const form = document.querySelector("#lock-form");
const input = document.querySelector("#admin-key");
const error = document.querySelector("#lock-error");

if (sessionStorage.getItem(ADMIN_SESSION_KEY) === "true") {
  unlockAdmin();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (input.value.trim() !== ADMIN_KEY) {
    error.textContent = "Clave incorrecta.";
    input.select();
    return;
  }

  sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
  await unlockAdmin();
});

async function unlockAdmin() {
  lock.hidden = true;
  document.body.classList.add("admin-unlocked");
  await loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2");
  await loadScript("./config.js");
  await import("./panel.js?v=20260705-promo-thumb-v1");
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);

    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}
