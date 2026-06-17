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
          <p class="derma-eyebrow">${escapeCopy(hero.eyebrow || brand.specialty)}</p>
          <h1>${escapeCopy(hero.title)}</h1>
          <p>${escapeCopy(hero.subtitle)}</p>
          <div class="derma-actions">
            ${renderActionButton({ label: normalizeSpanishCopy(hero.ctaPrimaryLabel || "Agendar cita"), link: hero.ctaPrimaryLink || contact.whatsapp, type: "whatsapp", subtitle: "CITA PRIVADA" })}
            ${hero.ctaSecondaryLink ? renderActionButton({ label: normalizeSpanishCopy(hero.ctaSecondaryLabel || "Tratamientos"), link: hero.ctaSecondaryLink, type: "menu", subtitle: "EXPLORAR" }) : ""}
          </div>
        </div>
      </section>

      <section class="derma-card derma-brand-card">
        ${renderBrandLogo(brand, "derma-logo", { enabled: brand.showBrandCardLogo !== false })}
        <div>
          <p class="derma-eyebrow">${escapeCopy(brand.tagline)}</p>
          <h2>${escapeCopy(brand.name)}</h2>
          <p>${escapeCopy(brand.specialty)}</p>
        </div>
      </section>

      <section class="derma-card derma-doctor">
        ${renderImage(doctor.photo, doctor.name, "derma-doctor-photo")}
        <div class="derma-section-head">
          <span>Especialista</span>
          <h2>${escapeCopy(doctor.name)}</h2>
          <p>${escapeCopy(doctor.title)}</p>
        </div>
        <p class="derma-copy">${escapeCopy(doctor.description)}</p>
        <blockquote>${escapeCopy(doctor.quote)}</blockquote>
        ${renderStats(doctor.stats)}
      </section>

      <section class="derma-card derma-experience">
        <div>
          <p class="derma-eyebrow">${escapeCopy(experience.eyebrow || "Experiencia")}</p>
          <h2>${escapeCopy(experience.title)}</h2>
          <p>${escapeCopy(experience.description)}</p>
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
          <h2>${escapeCopy(contact.title || "Reserva tu valoración")}</h2>
          <p>${escapeCopy(contact.text)}</p>
        </div>
        <div class="derma-contact-info">
          <p>${escapeCopy(contact.address)}</p>
          <div class="derma-actions">
            ${renderActionButton({ label: "WhatsApp", link: contact.whatsapp, type: "whatsapp", subtitle: "AGENDAR" })}
            ${renderActionButton({ label: "Llamar", link: contact.phone, type: "phone", subtitle: "CONTACTO" })}
            ${renderActionButton({ label: "Cómo llegar", link: contact.mapUrl, type: "map", subtitle: "MAPS" })}
            ${social.instagram ? renderActionButton({ label: social.label || "Instagram", link: social.instagram, type: "instagram", subtitle: "REDES" }) : ""}
          </div>
        </div>
      </section>

      <footer class="derma-footer">
        ${escapeCopy(brand.name)} - Dermatología estética de precisión
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
          <strong>${escapeCopy(item.value)}</strong>
          <span>${escapeCopy(item.label)}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderMaterials(materials = []) {
  if (!Array.isArray(materials) || !materials.length) return "";

  return `
    <div class="derma-materials">
      ${materials.map((item) => `<span>${escapeCopy(item)}</span>`).join("")}
    </div>
  `;
}

function renderService(service = {}) {
  return `
    <article class="derma-service">
      <span>${escapeCopy(service.category)}</span>
      <h3>${escapeCopy(service.name)}</h3>
      <p>${escapeCopy(service.description)}</p>
    </article>
  `;
}

function renderCase(item = {}) {
  return `
    <article class="derma-case">
      ${renderImage(item.image, item.title, "derma-case-image")}
      <div>
        <h3>${escapeCopy(item.title)}</h3>
        <p>${escapeCopy(item.description)}</p>
      </div>
    </article>
  `;
}

function escapeCopy(value) {
  return escapeHtml(normalizeSpanishCopy(value));
}

function normalizeSpanishCopy(value) {
  if (value === null || value === undefined) return "";

  return String(value)
    .replace(/\bDermatologia\b/g, "Dermatología")
    .replace(/\bdermatologia\b/g, "dermatología")
    .replace(/\bEstetica\b/g, "Estética")
    .replace(/\bestetica\b/g, "estética")
    .replace(/\bClinica\b/g, "Clínica")
    .replace(/\bclinica\b/g, "clínica")
    .replace(/\bMedica\b/g, "Médica")
    .replace(/\bmedica\b/g, "médica")
    .replace(/\bAmerica\b/g, "América")
    .replace(/\bValoracion\b/g, "Valoración")
    .replace(/\bvaloracion\b/g, "valoración")
    .replace(/\bEvolucion\b/g, "Evolución")
    .replace(/\bevolucion\b/g, "evolución")
    .replace(/\bdisenado\b/g, "diseñado")
    .replace(/\bdisenar\b/g, "diseñar")
    .replace(/\barmonia\b/g, "armonía")
    .replace(/\bintima\b/g, "íntima")
    .replace(/\bdiagnostico\b/g, "diagnóstico")
    .replace(/\banos\b/g, "años")
    .replace(/\batmosfera\b/g, "atmósfera")
    .replace(/\bsofisticacion\b/g, "sofisticación")
    .replace(/\biluminacion\b/g, "iluminación")
    .replace(/\bcalida\b/g, "cálida")
    .replace(/\bprecision\b/g, "precisión")
    .replace(/\bexpresion\b/g, "expresión")
    .replace(/\bregeneracion\b/g, "regeneración")
    .replace(/\bhumedo\b/g, "húmedo")
    .replace(/\bhidratacion\b/g, "hidratación")
    .replace(/\bcolageno\b/g, "colágeno")
    .replace(/\bcutanea\b/g, "cutánea")
    .replace(/\bArmonia\b/g, "Armonía")
    .replace(/\bDefinicion\b/g, "Definición")
    .replace(/\bdefinicion\b/g, "definición")
    .replace(/\bGonzalez\b/g, "González")
    .replace(/\bSalmon Face\b/g, "Salmón Face")
    .replace(/\bBioestimulacion\b/g, "Bioestimulación")
    .replace(/\bbioestimulacion\b/g, "bioestimulación");
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

