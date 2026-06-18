import { escapeHtml, safeUrl } from "../core/helpers.js";

const DEFAULT_WHATSAPP_PHONE = "523310976219";
const DEFAULT_WHATSAPP_MESSAGE = "Hola Lourdes, me interesa agendar una cita.";

export function render(data = {}) {
  const agent = data.agent || {};
  const hero = data.hero || {};
  const developments = Array.isArray(data.developments) ? data.developments : [];
  const benefits = Array.isArray(data.benefits) ? data.benefits : [];
  const contact = data.contact || {};

  return `
    <main class="estate-page">
      <section class="estate-hero">
        ${renderImage(hero.photo, hero.imageAlt || hero.title, "estate-hero-photo")}
        <div class="estate-hero-shade"></div>

        <div class="estate-hero-top">
          <span class="estate-wordmark">${escapeHtml(agent.brandName || "Asesoría inmobiliaria")}</span>
          <a class="estate-top-cta" href="${safeUrl(buildWhatsappUrl(contact))}" target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        </div>

        <div class="estate-hero-content">
          ${renderAgentBadge(agent)}
          <p class="estate-eyebrow">${escapeHtml(hero.eyebrow || "Desarrollos seleccionados")}</p>
          <h1>${escapeHtml(hero.title || "Encuentra un lugar que se sienta tuyo")}</h1>
          <p>${escapeHtml(hero.subtitle)}</p>
          <div class="estate-hero-actions">
            ${renderWhatsappLink(hero.ctaLabel || "Agenda una visita privada", buildWhatsappUrl(contact), "QUIERO CONOCERLOS")}
            <a class="estate-secondary-link" href="#desarrollos">Explorar desarrollos <span aria-hidden="true">↓</span></a>
          </div>
        </div>
      </section>

      <section class="estate-intro">
        <p class="estate-eyebrow">${escapeHtml(agent.role || "Asesora inmobiliaria")}</p>
        <h2>${escapeHtml(agent.name)}</h2>
        <p>${escapeHtml(agent.introduction)}</p>
        <div class="estate-trust">
          ${benefits.slice(0, 3).map((item) => `
            <div>
              <strong>${escapeHtml(item.value)}</strong>
              <span>${escapeHtml(item.label)}</span>
            </div>
          `).join("")}
        </div>
      </section>

      <section id="desarrollos" class="estate-developments">
        <header class="estate-section-head">
          <div>
            <p class="estate-eyebrow">Portafolio destacado</p>
            <h2>Espacios que vale la pena vivir</h2>
          </div>
          <p>Explora interiores, amenidades y ubicaciones. Lourdes puede acompañarte personalmente a conocer tus favoritos.</p>
        </header>

        <div class="estate-development-list">
          ${developments.map((development, index) => renderDevelopment(development, index, contact)).join("")}
        </div>
      </section>

      <section class="estate-guided-tour">
        <div class="estate-tour-copy">
          <p class="estate-eyebrow">${escapeHtml(data.tour?.eyebrow || "Visita guiada")}</p>
          <h2>${escapeHtml(data.tour?.title || "No tienes que elegir a ciegas")}</h2>
          <p>${escapeHtml(data.tour?.text)}</p>
        </div>
        ${renderWhatsappLink(data.tour?.ctaLabel || "Recorrer opciones con Lourdes", buildWhatsappUrl(contact), "AGENDA PERSONALIZADA")}
      </section>

      <footer class="estate-contact">
        ${renderAgentBadge(agent, "estate-footer-badge")}
        <div>
          <p class="estate-eyebrow">Hablemos de tu próxima inversión</p>
          <h2>${escapeHtml(agent.name)}</h2>
          <p>${escapeHtml(formatWhatsappPhone(contact))}${contact.email ? ` · ${escapeHtml(contact.email)}` : ""}</p>
        </div>
        ${renderWhatsappLink(contact.ctaLabel || "Escribir por WhatsApp", buildWhatsappUrl(contact), "RESPUESTA DIRECTA")}
      </footer>
    </main>
  `;
}

function renderAgentBadge(agent = {}, extraClass = "") {
  const photo = safeUrl(agent.photo);
  const logo = safeUrl(agent.logo);
  const initials = getInitials(agent.name);

  return `
    <div class="estate-agent-badge ${extraClass}">
      <div class="estate-agent-photo">
        ${photo
          ? `<img src="${photo}" alt="${escapeHtml(agent.name || "Asesora inmobiliaria")}">`
          : `<span>${escapeHtml(initials)}</span>`}
      </div>
      <div class="estate-agent-logo">
        ${logo
          ? `<img src="${logo}" alt="${escapeHtml(agent.brandName || "Logo")}">`
          : `<span>${escapeHtml(getInitials(agent.brandName || agent.name))}</span>`}
      </div>
    </div>
  `;
}

function renderDevelopment(item = {}, index = 0, contact = {}) {
  const gallery = Array.isArray(item.gallery) ? item.gallery.filter(Boolean) : [];
  const features = Array.isArray(item.features) ? item.features : [];

  return `
    <article class="estate-development">
      <div class="estate-development-cover">
        ${renderImage(item.coverPhoto, item.name, "estate-cover-photo")}
        <div class="estate-cover-shade"></div>
        <span class="estate-count">${String(index + 1).padStart(2, "0")}</span>
        ${item.tag ? `<span class="estate-tag">${escapeHtml(item.tag)}</span>` : ""}
        <div class="estate-cover-copy">
          <p>${escapeHtml(item.location)}</p>
          <h3>${escapeHtml(item.name)}</h3>
          <strong>${escapeHtml(item.price)}</strong>
        </div>
      </div>

      <div class="estate-development-body">
        <p>${escapeHtml(item.description)}</p>
        <div class="estate-features">
          ${features.map((feature) => `<span>${escapeHtml(feature)}</span>`).join("")}
        </div>
        ${gallery.length ? `
          <div class="estate-gallery">
            ${gallery.slice(0, 4).map((image, imageIndex) =>
              renderImage(image, `${item.name} ${imageIndex + 1}`, "estate-gallery-photo")
            ).join("")}
          </div>
        ` : ""}
        <div class="estate-development-actions">
          <a class="estate-location-link" href="${safeUrl(item.mapUrl)}" target="_blank" rel="noopener noreferrer">
            Ver ubicación
          </a>
          ${renderWhatsappLink(
            item.ctaLabel || `Visitar ${item.name}`,
            buildWhatsappUrl(contact, getDevelopmentMessage(item)),
            "AGENDAR RECORRIDO"
          )}
        </div>
      </div>
    </article>
  `;
}

function renderWhatsappLink(label, link, subtitle) {
  return `
    <a class="estate-whatsapp" href="${safeUrl(link)}" target="_blank" rel="noopener noreferrer">
      <span class="estate-wa-icon" aria-hidden="true">⌁</span>
      <span><small>${escapeHtml(subtitle)}</small>${escapeHtml(label)}</span>
      <b aria-hidden="true">›</b>
    </a>
  `;
}

function buildWhatsappUrl(contact = {}, message = "") {
  const phone = String(contact.whatsappPhone || DEFAULT_WHATSAPP_PHONE)
    .replace(/\D/g, "");
  const text = message || contact.whatsappMessage || DEFAULT_WHATSAPP_MESSAGE;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

function getDevelopmentMessage(item = {}) {
  const developmentName = String(item.name || "el desarrollo").trim();

  return `Hola Lourdes, me interesa agendar una cita para conocer ${developmentName}.`;
}

function formatWhatsappPhone(contact = {}) {
  const phone = String(contact.whatsappPhone || DEFAULT_WHATSAPP_PHONE)
    .replace(/\D/g, "");

  if (phone.length === 12 && phone.startsWith("52")) {
    return `+52 ${phone.slice(2, 4)} ${phone.slice(4, 6)} ${phone.slice(6, 8)} ${phone.slice(8, 10)} ${phone.slice(10, 12)}`;
  }

  return contact.phone || phone;
}

function renderImage(src, alt, className) {
  const url = safeUrl(src);

  if (!url) return `<div class="${className} estate-image-fallback"></div>`;

  return `<img class="${className}" src="${url}" alt="${escapeHtml(alt)}" loading="lazy">`;
}

function getInitials(value = "") {
  return String(value)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "ML";
}
