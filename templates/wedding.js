import { renderActionButton } from "../components/action-button.js";
import { escapeHtml, safeUrl } from "../core/helpers.js";

export function render(data = {}) {
  const couple = data.couple || {};
  const hero = data.hero || {};
  const location = data.location || {};
  const itinerary = Array.isArray(data.itinerary) ? data.itinerary : [];
  const rsvp = data.rsvp || {};
  const social = data.social || {};
  const gallery = data.gallery || {};

  return `
    <main class="wedding-page">
      <section class="wedding-hero">
        <img src="${safeUrl(hero.photo)}" alt="${escapeHtml(couple.names || "Novios")}">
        <div class="wedding-hero-overlay"></div>
        <div class="wedding-hero-content">
          <p>${escapeHtml(hero.eyebrow || "Nuestra boda")}</p>
          <h1>${escapeHtml(couple.names || "Sofia y Eduardo")}</h1>
          <span>${escapeHtml(hero.date)}</span>
        </div>
      </section>

      <section class="wedding-card wedding-location">
        <div class="wedding-section-title">
          <span>Ubicacion</span>
          <h2>${escapeHtml(location.title || "Lugar de celebracion")}</h2>
        </div>
        <p>${escapeHtml(location.address)}</p>
        ${renderMapLink(location.mapUrl, "Abrir mapa")}
      </section>

      <section class="wedding-card">
        <div class="wedding-section-title">
          <span>Itinerario</span>
          <h2>${escapeHtml(data.itineraryTitle || "Momentos del dia")}</h2>
        </div>
        <div class="wedding-timeline">
          ${itinerary.map(renderTimelineItem).join("")}
        </div>
      </section>

      <section class="wedding-full-photo">
        <img src="${safeUrl(gallery.secondPhoto)}" alt="${escapeHtml(gallery.alt || couple.names || "Novios")}">
        <div>
          <span>${escapeHtml(gallery.eyebrow || "Sofia y Eduardo")}</span>
          <h2>${escapeHtml(gallery.title || "Gracias por ser parte de nuestra historia")}</h2>
        </div>
      </section>

      <section class="wedding-card wedding-rsvp">
        <div class="wedding-section-title">
          <span>Confirmacion</span>
          <h2>${escapeHtml(rsvp.title || "Confirma tu asistencia")}</h2>
        </div>
        <p>${escapeHtml(rsvp.text)}</p>
        <div class="wedding-actions">
          ${renderActionButton({
            label: rsvp.brideLabel || "Invitado de la novia",
            link: rsvp.brideWhatsapp,
            type: "whatsapp",
            subtitle: "CLIC AQUI"
          })}
          ${renderActionButton({
            label: rsvp.groomLabel || "Invitado del novio",
            link: rsvp.groomWhatsapp,
            type: "whatsapp",
            subtitle: "CLIC AQUI"
          })}
          ${social.instagram ? renderActionButton({
            label: social.label || "Instagram",
            link: social.instagram,
            type: "instagram",
            subtitle: "VER REDES"
          }) : ""}
        </div>
      </section>

      <footer class="wedding-footer">
        Todos los derechos reservados: ${escapeHtml(couple.names || "Sofia y Eduardo")}
      </footer>
    </main>
  `;
}

function renderTimelineItem(item = {}) {
  return `
    <article class="wedding-timeline-item">
      <div class="wedding-timeline-icon">${getItineraryIcon(item.type)}</div>
      <div>
        <span>${escapeHtml(item.time)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.place)}</p>
        <small>${escapeHtml(item.text)}</small>
        ${renderMapLink(item.mapUrl, "Ver ubicacion")}
      </div>
    </article>
  `;
}

function renderMapLink(url, label) {
  if (!url) return "";

  return `
    <a class="wedding-map-link" href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">
      ${escapeHtml(label)}
    </a>
  `;
}

function getItineraryIcon(type) {
  const icons = {
    cocktail: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 3h16l-6 7v8l3 2v1H7v-1l3-2v-8L4 3zm4.4 2 3.6 4.2L15.6 5H8.4z"/></svg>`,
    civil: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 3h10v4h4v14H3V7h4V3zm2 4h6V5H9v2zm-4 2v10h14V9H5zm3 2h3v3H8v-3zm5 0h3v3h-3v-3z"/></svg>`,
    religious: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M11 2h2v4h4v2h-4v5h5l3 9H3l3-9h5V8H7V6h4V2zm-3.6 13-1.7 5h12.6l-1.7-5H7.4z"/></svg>`
  };

  return icons[type] || icons.cocktail;
}
