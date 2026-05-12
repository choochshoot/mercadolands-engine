import { renderActionButton } from "../components/action-button.js";
import { escapeHtml, safeUrl } from "../core/helpers.js";

export function render(data = {}) {
  const business = data.business || {};
  const buttons = Array.isArray(data.buttons) ? data.buttons : [];
  const highlights = Array.isArray(data.highlights) ? data.highlights : [];
  const services = Array.isArray(data.services) ? data.services : [];
  const hours = Array.isArray(data.hours) ? data.hours : [];

  return `
    <main class="mockup-bg">
      <article class="phone business-phone">
        <section class="screen business-screen">
          <header class="business-hero">
            ${renderCover(business)}

            <div class="business-identity">
              ${renderLogo(business)}
              <p class="business-kicker">${escapeHtml(business.category || "Negocio local")}</p>
              <h1>${escapeHtml(business.name)}</h1>
              <p>${escapeHtml(data.hero?.message || business.description)}</p>
            </div>
          </header>

          ${renderHighlights(highlights)}
          ${renderServices(services)}

          <section class="business-actions">
            ${buttons.map(renderActionButton).join("")}
          </section>

          ${renderContact(data.contact, hours)}
        </section>

        <footer class="footer business-footer">
          <div>
            <span aria-hidden="true">&#10003;</span>
            <small>${escapeHtml(data.trust?.[0] || "Verificado")}</small>
          </div>
          <div>
            <span aria-hidden="true">&#9719;</span>
            <small>${escapeHtml(data.trust?.[1] || "Abierto hoy")}</small>
          </div>
          <div>
            <span aria-hidden="true">&#9733;</span>
            <small>${escapeHtml(data.trust?.[2] || "Servicio premium")}</small>
          </div>
        </footer>
      </article>
    </main>
  `;
}

function renderCover(business = {}) {
  const image = business.coverPhoto || business.photo;

  if (!image) {
    return `<div class="business-cover business-cover-fallback"></div>`;
  }

  return `
    <div class="business-cover">
      <img src="${safeUrl(image)}" alt="${escapeHtml(business.name || "Negocio")}">
    </div>
  `;
}

function renderLogo(business = {}) {
  if (business.logo) {
    return `
      <div class="business-logo">
        <img src="${safeUrl(business.logo)}" alt="${escapeHtml(business.name || "Logo")}">
      </div>
    `;
  }

  const initials = String(business.name || "ML")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return `<div class="business-logo business-logo-fallback">${escapeHtml(initials)}</div>`;
}

function renderHighlights(highlights = []) {
  if (!highlights.length) return "";

  return `
    <section class="business-highlights">
      ${highlights.slice(0, 3).map((item) => `
        <div>
          <strong>${escapeHtml(item.value)}</strong>
          <span>${escapeHtml(item.label)}</span>
        </div>
      `).join("")}
    </section>
  `;
}

function renderServices(services = []) {
  if (!services.length) return "";

  return `
    <section class="business-section">
      <div class="business-section-head">
        <span>Servicios</span>
        <h2>Lo mas pedido</h2>
      </div>

      <div class="business-services">
        ${services.slice(0, 4).map((service) => `
          <article>
            <div>
              <h3>${escapeHtml(service.title)}</h3>
              <p>${escapeHtml(service.description)}</p>
            </div>
            <strong>${escapeHtml(service.price)}</strong>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderContact(contact = {}, hours = []) {
  if (!contact && !hours.length) return "";

  return `
    <section class="business-contact">
      <div>
        <span>Contacto</span>
        <p>${escapeHtml(contact?.address)}</p>
      </div>

      ${hours.length ? `
        <div class="business-hours">
          ${hours.slice(0, 3).map((item) => `
            <p>
              <span>${escapeHtml(item.label)}</span>
              <strong>${escapeHtml(item.value)}</strong>
            </p>
          `).join("")}
        </div>
      ` : ""}
    </section>
  `;
}
