import { getSlug, escapeHtml, toRegistryKey } from "./helpers.js";
import { getTemplate } from "./template-registry.js";
import { loadTheme } from "./theme-registry.js";

let cleanupLandingEffects = () => {};

export async function bootLanding({
  mountSelector = "#app",
  supabaseClient
} = {}) {
  const mount = document.querySelector(mountSelector);

  if (!mount) return;

  if (!supabaseClient) {
    renderError(mount, "No se pudo iniciar MercadoLands");
    return;
  }

  const slug = getSlug();

  if (!slug) {
    renderError(mount, "Falta slug en la URL");
    return;
  }

  try {
    const landing = await fetchLanding(supabaseClient, slug);
    await renderLanding(mount, landing);
  } catch (error) {
    console.error(error);
    renderError(mount, error.message || "Error cargando landing");
  }
}

async function fetchLanding(supabaseClient, slug) {
  const { data, error } = await supabaseClient
    .from("landings")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    throw new Error("Landing no encontrada");
  }

  return normalizeLanding(data);
}

function normalizeLanding(record) {
  const data = record.data || {};
  const template = toRegistryKey(data.template || record.template, "creator");
  const theme = toRegistryKey(data.theme || record.theme, "green-gold");

  return {
    slug: record.slug,
    template,
    theme,
    data
  };
}

async function renderLanding(mount, landing) {
  const template = await getTemplate(landing.template);
  const theme = loadTheme(landing.theme);

  document.body.className = "";
  document.body.classList.add("mercadolands-page");
  document.body.classList.add(`template-${template.key}`);
  document.body.classList.add(`theme-${theme}`);

  mount.innerHTML = template.render(landing.data, {
    slug: landing.slug,
    template: template.key,
    theme
  });

  cleanupLandingEffects();
  cleanupLandingEffects = initLandingEffects(mount, template.key);
}

function initLandingEffects(mount, templateKey) {
  if (templateKey !== "dermatology") return () => {};

  const hero = mount.querySelector(".derma-hero");
  const video = mount.querySelector(".derma-hero-video");
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!hero || !video || motionQuery.matches) return () => {};

  let ticking = false;

  const updateParallax = () => {
    ticking = false;

    if (motionQuery.matches) {
      video.style.removeProperty("--derma-hero-parallax");
      return;
    }

    const rect = hero.getBoundingClientRect();
    const progress = clamp(-rect.top / Math.max(rect.height, 1), 0, 1);
    const offset = Math.round(progress * 42);

    video.style.setProperty("--derma-hero-parallax", `${offset}px`);
  };

  const requestUpdate = () => {
    if (motionQuery.matches) return;
    if (ticking) return;

    ticking = true;
    window.requestAnimationFrame(updateParallax);
  };

  const handleMotionChange = () => {
    if (motionQuery.matches) {
      video.style.removeProperty("--derma-hero-parallax");
    } else {
      requestUpdate();
    }
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  motionQuery.addEventListener("change", handleMotionChange);
  updateParallax();

  return () => {
    window.removeEventListener("scroll", requestUpdate);
    window.removeEventListener("resize", requestUpdate);
    motionQuery.removeEventListener("change", handleMotionChange);
    video.style.removeProperty("--derma-hero-parallax");
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function renderError(mount, message) {
  cleanupLandingEffects();
  cleanupLandingEffects = () => {};

  mount.innerHTML = `
    <main class="state-page">
      <section class="state-card">
        <h1>${escapeHtml(message)}</h1>
      </section>
    </main>
  `;
}
