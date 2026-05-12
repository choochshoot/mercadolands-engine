import { getSlug, escapeHtml, toRegistryKey } from "./helpers.js";
import { getTemplate } from "./template-registry.js";
import { loadTheme } from "./theme-registry.js";

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
}

function renderError(mount, message) {
  mount.innerHTML = `
    <main class="state-page">
      <section class="state-card">
        <h1>${escapeHtml(message)}</h1>
      </section>
    </main>
  `;
}

