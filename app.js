
// ==========================
// HELPERS
// ==========================

// Obtener slug desde la URL
function getSlug() {
  const params = new URLSearchParams(window.location.search);
  return params.get("slug");
}

// Sanitizar texto básico para evitar romper HTML
function safe(v) {
  if (v === null || v === undefined) return "";
  return String(v);
}

// Iconos por tipo (puedes cambiar por SVG luego)
function getIcon(type) {

  if (type === "whatsapp") {
    return `
    <svg viewBox="0 0 24 24" class="icon-svg">
      <path fill="currentColor" d="M12 2a10 10 0 0 0-8.7 15l-1.3 4.7 4.8-1.2A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.2-1.2l-.3-.2-2.8.7.7-2.7-.2-.3A8 8 0 1 1 12 20zm4.3-5.5c-.2-.1-1.2-.6-1.4-.7s-.3-.1-.4.1-.5.7-.6.8-.2.2-.4.1a6.6 6.6 0 0 1-2-1.2 7.3 7.3 0 0 1-1.3-1.6c-.1-.2 0-.3.1-.4.1-.1.2-.3.3-.4s.1-.2.2-.3 0-.2 0-.3-.4-1-.5-1.4-.3-.3-.4-.3h-.3c-.1 0-.3 0-.4.2s-.6.6-.6 1.4.6 1.6.7 1.7 1.2 1.8 2.9 2.6 1.7.5 2 .5.9-.4 1-.8.1-.8.1-.8-.2-.1-.4-.2z"/>
    </svg>`;
  }

  if (type === "instagram") {
    return `
    <svg viewBox="0 0 24 24" class="icon-svg">
      <path fill="currentColor" d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm10 2c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3h10zm-5 3.2A4.8 4.8 0 1 0 16.8 12 4.8 4.8 0 0 0 12 7.2zm0 7.6A2.8 2.8 0 1 1 14.8 12 2.8 2.8 0 0 1 12 14.8zM17.5 6.5a1 1 0 1 0 1 1 1 1 0 0 0-1-1z"/>
    </svg>`;
  }

  if (type === "email") {
    return `
    <svg viewBox="0 0 24 24" class="icon-svg">
      <path fill="currentColor" d="M2 4h20v16H2V4zm10 7L4 6v12h16V6l-8 5z"/>
    </svg>`;
  }

  return "";
}

// ==========================
// CARGAR LANDING
// ==========================
async function loadLanding() {
  const slug = getSlug();

  if (!slug) {
    renderError("❌ Falta slug en la URL");
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from("landings")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      console.error("ERROR:", error);
      renderError("No encontrado");
      return;
    }

    // data.data es tu JSON guardado
    render(data.data, data.template, data.theme);

  } catch (err) {
    console.error("ERROR CRÍTICO:", err);
    renderError("Error cargando datos");
  }
}

function getDefaultSubtitle(type) {
  switch(type) {
    case "whatsapp": return "ESCRÍBEME POR";
    case "instagram": return "SÍGUEME EN";
    case "email": return "ESCRÍBEME UN";
    default: return "";
  }
}

// ==========================
// RENDER MOCKUP PRO REAL
// ==========================
function render(
  d = {},
  template = "creator",
  theme = "green-gold"
) {

  // 🔥 TEMPLATE SYSTEM
  document.body.className = "";

  document.body.classList.add(`template-${template}`);

  document.body.classList.add(`theme-${theme}`);

  // botones dinámicos
  const buttons = Array.isArray(d.buttons) ? d.buttons : [];

  document.getElementById("app").innerHTML = `
  
  <div class="mockup-bg">

    <div class="phone">

      <div class="screen">

        <!-- HERO -->
        <div class="hero-pro">

          <div class="hero-text">
            <p class="intro">Hola, soy</p>
            <h1 class="name">${safe(d.profile?.name)}</h1>

            <div class="divider"></div>

            <p class="role">${safe(d.profile?.title)}</p>

            <p class="script">
              ${safe(d.hero?.message)}
            </p>
          </div>

          <div class="hero-image">
            <img src="${safe(d.profile?.photo)}" alt="profile">
          </div>

        </div>

        <!-- CTA BOX (CORE VISUAL) -->
        <div class="cta-box">

          ${buttons.map(b => `
            <a href="${safe(b.link)}" target="_blank" class="btn ${safe(b.type)}">
              
              <div class="btn-left">
                <span class="icon">${getIcon(b.type)}</span>
                <div>
                  <small>${b.subtitle || getDefaultSubtitle(b.type)}</small>
                  <div>${b.label}</div>
                </div>
              </div>

              <span class="arrow">›</span>

            </a>
          `).join("")}

        </div>

        <!-- ABOUT -->
        <div class="about">
          <h3>Sobre mí</h3>
          <p>${safe(d.about?.text)}</p>

          <p class="cta-final">
            ¡Hablemos y trabajemos juntos!
          </p>
        </div>

      </div>
        <!-- CTA BOX (CORE VISUAL) -->
      <div class="footer">

        <div>
          <span>✔</span>
          <small>Confianza</small>
        </div>

        <div>
          <span>⏱</span>
          <small>Respuesta rápida</small>
        </div>

        <div>
          <span>★</span>
          <small>Atención personalizada</small>
        </div>

      </div>

    </div>

  </div>
  `;
}

// ==========================
// RENDER ERROR
// ==========================
function renderError(msg) {
  document.getElementById("app").innerHTML = `
    <div style="padding:40px; text-align:center;">
      <h2>${safe(msg)}</h2>
    </div>
  `;
}

// ==========================
// INIT
// ==========================
loadLanding();

