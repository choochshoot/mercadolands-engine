import { renderActionButton } from "../components/action-button.js";
import { escapeHtml, safeUrl } from "../core/helpers.js";

export function render(data = {}) {
  const brand = data.brand || {};
  const hero = data.hero || {};
  const doctor = data.doctor || {};
  const experience = data.experience || {};
  const services = Array.isArray(data.services) ? data.services : [];
  const cases = Array.isArray(data.cases) ? data.cases : [];
  const contact = data.contact || {};
  const social = data.social || {};

  return `
    <main class="derma-page">
      <section class="derma-hero">
        ${renderHeroMedia(hero, brand.name || "Clínica dermatológica")}
        <div class="derma-hero-shade"></div>
        <div class="derma-hero-content">
          ${brand.showHeroLogo ? renderBrandLogo(brand, "derma-hero-logo", { fallback: false }) : ""}
          ${renderHeroAvatar(doctor)}
          <p class="derma-eyebrow">${escapeHtml(hero.eyebrow || brand.specialty)}</p>
          <h1>${escapeHtml(hero.title)}</h1>
          <p>${escapeHtml(hero.subtitle)}</p>
          <div class="derma-actions">
            ${renderActionButton({ label: hero.ctaPrimaryLabel || "Agendar cita", link: hero.ctaPrimaryLink || contact.whatsapp, type: "whatsapp", subtitle: "CITA PRIVADA" })}
            ${hero.ctaSecondaryLink ? renderActionButton({ label: hero.ctaSecondaryLabel || "Tratamientos", link: hero.ctaSecondaryLink, type: "menu", subtitle: "EXPLORAR" }) : ""}
          </div>
        </div>
      </section>

      <section class="derma-card derma-brand-card">
        ${renderBrandLogo(brand, "derma-logo", { enabled: brand.showBrandCardLogo !== false })}
        <div>
          <p class="derma-eyebrow">${escapeHtml(brand.tagline)}</p>
          <h2>${escapeHtml(brand.name)}</h2>
          <p>${escapeHtml(brand.specialty)}</p>
        </div>
      </section>

      <section class="derma-card derma-doctor">
        ${renderImage(doctor.photo, doctor.name, "derma-doctor-photo")}
        <div class="derma-section-head">
          <span>Especialista</span>
          <h2>${escapeHtml(doctor.name)}</h2>
          <p>${escapeHtml(doctor.title)}</p>
        </div>
        <p class="derma-copy">${escapeHtml(doctor.description)}</p>
        <blockquote>${escapeHtml(doctor.quote)}</blockquote>
        ${renderStats(doctor.stats)}
      </section>

      <section class="derma-card derma-experience">
        <div>
          <p class="derma-eyebrow">${escapeHtml(experience.eyebrow || "Experiencia")}</p>
          <h2>${escapeHtml(experience.title)}</h2>
          <p>${escapeHtml(experience.description)}</p>
          ${renderMaterials(experience.materials)}
        </div>
        ${renderImage(experience.photo, experience.title, "derma-experience-photo")}
      </section>

      <section id="derma-services" class="derma-card">
        <div class="derma-section-head">
          <span>Tratamientos signature</span>
          <h2>Protocolos avanzados, resultados naturales</h2>
        </div>
        <div class="derma-services">
          ${services.map(renderService).join("")}
        </div>
      </section>

      <section class="derma-card">
        <div class="derma-section-head">
          <span>Resultados sutiles</span>
          <h2>Evolución natural sin estridencias</h2>
        </div>
        <div class="derma-cases">
          ${cases.map(renderCase).join("")}
        </div>
      </section>

      <section class="derma-card derma-contact">
        <div class="derma-section-head">
          <span>Cita privada</span>
          <h2>${escapeHtml(contact.title || "Reserva tu valoración")}</h2>
          <p>${escapeHtml(contact.text)}</p>
        </div>
        <div class="derma-contact-info">
          <p>${escapeHtml(contact.address)}</p>
          <div class="derma-actions">
            ${renderActionButton({ label: "WhatsApp", link: contact.whatsapp, type: "whatsapp", subtitle: "AGENDAR" })}
            ${renderActionButton({ label: "Llamar", link: contact.phone, type: "phone", subtitle: "CONTACTO" })}
            ${renderActionButton({ label: "Cómo llegar", link: contact.mapUrl, type: "map", subtitle: "MAPS" })}
            ${social.instagram ? renderActionButton({ label: social.label || "Instagram", link: social.instagram, type: "instagram", subtitle: "REDES" }) : ""}
          </div>
        </div>
      </section>

      <footer class="derma-footer">
        ${escapeHtml(brand.name)} - Dermatología estética de precisión
      </footer>
    </main>
  `;
}

function renderHeroAvatar(doctor = {}) {
  if (doctor.showHeroAvatar === false) return "";

  const photo = safeUrl(doctor.photo);

  if (!photo) return "";

  return `
    <div class="derma-hero-avatar">
      <img src="${photo}" alt="${escapeHtml(doctor.name || "Doctora")}">
    </div>
  `;
}
function renderBrandLogo(brand = {}, className = "derma-logo", options = {}) {
  const logo = safeUrl(brand.logo);

  if (options.enabled !== false && logo) {
    return `
      <div class="${className}">
        <img src="${logo}" alt="${escapeHtml(brand.name || "Logo")}">
      </div>
    `;
  }

  if (options.fallback === false) return "";

  return `<div class="${className}">${getInitials(brand.name)}</div>`;
}
function renderImage(src, alt, className) {
  const url = safeUrl(src);

  if (!url) {
    return `<div class="${className} derma-image-fallback"></div>`;
  }

  return `<img class="${className}" src="${url}" alt="${escapeHtml(alt)}">`;
}

function renderHeroMedia(hero = {}, alt) {
  const video = safeUrl(hero.video);
  const photo = safeUrl(hero.photo);

  if (video) {
    const poster = photo ? ` poster="${photo}"` : "";
    return `
      <video class="derma-hero-media derma-hero-video" autoplay muted loop playsinline${poster}>
        <source src="${video}" type="${getVideoType(video)}">
      </video>
    `;
  }

  return renderImage(hero.photo, alt, "derma-hero-media");
}

function getVideoType(url = "") {
  const cleanUrl = String(url).split("?")[0].toLowerCase();

  if (cleanUrl.endsWith(".mp4")) return "video/mp4";
  if (cleanUrl.endsWith(".webm")) return "video/webm";

  return "video/webm";
}

function renderStats(stats = []) {
  if (!Array.isArray(stats) || !stats.length) return "";

  return `
    <div class="derma-stats">
      ${stats.slice(0, 3).map((item) => `
        <div>
          <strong>${escapeHtml(item.value)}</strong>
          <span>${escapeHtml(item.label)}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderMaterials(materials = []) {
  if (!Array.isArray(materials) || !materials.length) return "";

  return `
    <div class="derma-materials">
      ${materials.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
    </div>
  `;
}

function renderService(service = {}) {
  return `
    <article class="derma-service">
      <span>${escapeHtml(service.category)}</span>
      <h3>${escapeHtml(service.name)}</h3>
      <p>${escapeHtml(service.description)}</p>
    </article>
  `;
}

function renderCase(item = {}) {
  return `
    <article class="derma-case">
      ${renderImage(item.image, item.title, "derma-case-image")}
      <div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.description)}</p>
      </div>
    </article>
  `;
}

function getInitials(name = "ML") {
  return String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

