import { readFile, writeFile } from "node:fs/promises";

const SITE_URL = "https://choochshoot.github.io/mercadolands-engine";
const CONFIG_PATH = new URL("../config.js", import.meta.url);

const slug = process.argv[2];

if (!slug) {
  console.error("Uso: node scripts/generate-share.js <slug>");
  process.exit(1);
}

const config = await loadConfig();
const landing = await fetchLanding(config, slug);
const html = renderShareHtml(landing);
const outputPath = new URL(`../share/${slug}.html`, import.meta.url);

await writeFile(outputPath, html, "utf8");
console.log(`Share generado: share/${slug}.html`);

async function loadConfig() {
  const text = await readFile(CONFIG_PATH, "utf8");
  const url = text.match(/SUPABASE_URL:\s*"([^"]+)"/)?.[1];
  const key = text.match(/SUPABASE_KEY:\s*"([^"]+)"/)?.[1];

  if (!url || !key) {
    throw new Error("No se pudo leer SUPABASE_URL o SUPABASE_KEY desde config.js.");
  }

  return { url, key };
}

async function fetchLanding(config, slugValue) {
  const endpoint = `${config.url}/rest/v1/landings?slug=eq.${encodeURIComponent(slugValue)}&select=*`;
  const response = await fetch(endpoint, {
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase respondió ${response.status}.`);
  }

  const rows = await response.json();
  const landing = rows[0];

  if (!landing) {
    throw new Error(`No existe el slug "${slugValue}".`);
  }

  return {
    slug: landing.slug,
    data: landing.data || {}
  };
}

function renderShareHtml(landing) {
  const data = landing.data;
  const brand = data.brand || {};
  const agent = data.agent || {};
  const hero = data.hero || {};
  const contact = data.contact || {};
  const share = data.share || {};
  const canonical = `${SITE_URL}/share/${encodeURIComponent(landing.slug)}.html`;
  const landingUrl = `${SITE_URL}/u/index.html?slug=${encodeURIComponent(landing.slug)}`;
  const entityName = brand.name || agent.name || agent.brandName || hero.title || "MercadoLands";
  const title = share.title || `${entityName}`;
  const description = share.description || hero.subtitle || contact.text || "Landing digital MercadoLands.";
  const image = absoluteUrl(share.image || brand.logo || agent.logo || hero.photo || `${SITE_URL}/share/assets/${landing.slug}-og.png`);
  const imageAlt = share.imageAlt || `${entityName}`;
  const width = String(share.imageWidth || "1200");
  const height = String(share.imageHeight || "630");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index, follow">

  <link rel="canonical" href="${canonical}">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="MercadoLands">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:image:secure_url" content="${escapeHtml(image)}">
  <meta property="og:image:alt" content="${escapeHtml(imageAlt)}">
  <meta property="og:image:width" content="${escapeHtml(width)}">
  <meta property="og:image:height" content="${escapeHtml(height)}">
  <meta property="og:url" content="${canonical}">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
  <meta name="twitter:image:alt" content="${escapeHtml(imageAlt)}">

  ${renderStructuredData({ landing, title, description, image, agent, contact, canonical })}

  <style>
    :root {
      color-scheme: dark;
      font-family: Arial, sans-serif;
      background: #101515;
      color: #fff;
    }

    body {
      min-height: 100vh;
      margin: 0;
      display: grid;
      place-items: center;
      padding: 24px;
      text-align: center;
    }

    a {
      color: #ffb1e6;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <main>
    <p>Abriendo landing...</p>
    <p><a href="${landingUrl}">Abrir ${escapeHtml(entityName)}</a></p>
  </main>

  <script>
    setTimeout(() => {
      window.location.replace("${landingUrl}");
    }, 600);
  </script>
</body>
</html>
`;
}

function renderStructuredData({ landing, title, description, image, agent, contact, canonical }) {
  const isRealEstate = landing.data.template === "realestate";

  if (!isRealEstate) return "";

  const phone = contact.phone || contact.whatsappPhone || "";
  const schema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: agent.brandName || agent.name || title,
    description,
    url: canonical,
    image,
    telephone: phone,
    employee: agent.name
      ? {
          "@type": "Person",
          name: agent.name,
          jobTitle: agent.role || "Asesora inmobiliaria"
        }
      : undefined
  };

  return `<script type="application/ld+json">${JSON.stringify(schema).replaceAll("<", "\\u003c")}</script>`;
}

function absoluteUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${SITE_URL}${url}`;
  return `${SITE_URL}/${url.replace(/^\.?\//, "")}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
