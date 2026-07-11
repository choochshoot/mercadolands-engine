import { renderActionButton } from "../components/action-button.js";
import { escapeHtml, safeUrl } from "../core/helpers.js";

const DERMA_BUTTON_CLASS = "vg-rose-button";

export function render(data = {}, context = {}) {
  const brand = data.brand || {};
  const hero = data.hero || {};
  const doctor = data.doctor || {};
  const experience = data.experience || {};
  const services = Array.isArray(data.services) ? data.services : [];
  const promotions = Array.isArray(data.promotions) ? data.promotions : [];
  const serviceSections = Array.isArray(data.serviceSections) ? data.serviceSections : [];
  const catalogIntro = data.catalogIntro || {};
  const cases = Array.isArray(data.cases) ? data.cases : [];
  const contact = data.contact || {};
  const social = data.social || {};
  const privacyNotice = getPrivacyNotice(data, context);

  return `
    <main class="derma-page">
      <section id="derma-services" class="derma-card derma-services-card derma-services-first">
        ${serviceSections.length ? renderServiceFunnel(serviceSections, catalogIntro, context, brand) : renderLegacyServices(services, context)}
        ${promotions.length ? renderPromotions(promotions) : ""}
      </section>

      <section class="derma-hero">
        ${renderHeroMedia(hero, brand.name || "Cl\u00ednica dermatol\u00f3gica")}
        <div class="derma-hero-shade"></div>
        <div class="derma-hero-content">
          ${brand.showHeroLogo ? renderBrandLogo(brand, "derma-hero-logo", { fallback: false }) : ""}
          ${renderHeroAvatar(doctor)}
          <p class="derma-eyebrow">${escapeCopy(hero.eyebrow || brand.specialty)}</p>
          <h1>${escapeCopy(hero.title)}</h1>
          <p>${escapeCopy(hero.subtitle)}</p>
          <div class="derma-actions">
            ${renderDermaActionButton({ label: normalizeSpanishCopy(hero.ctaPrimaryLabel || "Agendar cita"), link: hero.ctaPrimaryLink || contact.whatsapp, type: "whatsapp", subtitle: "CITA PRIVADA" })}
            ${hero.ctaSecondaryLink ? renderDermaActionButton({ label: normalizeSpanishCopy(hero.ctaSecondaryLabel || "Tratamientos"), link: hero.ctaSecondaryLink, type: "menu", subtitle: "EXPLORAR" }) : ""}
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

      <section class="derma-card">
        <div class="derma-section-head">
          <span>Resultados sutiles</span>
          <h2>Evoluci&oacute;n natural sin estridencias</h2>
        </div>
        <div class="derma-cases">
          ${cases.map(renderCase).join("")}
        </div>
      </section>

      <section class="derma-card derma-contact">
        <div class="derma-section-head">
          <span>Cita privada</span>
          <h2>${escapeCopy(contact.title || "Reserva tu valoraci\u00f3n")}</h2>
          <p>${escapeCopy(contact.text)}</p>
        </div>
        <div class="derma-contact-info">
          <p>${escapeCopy(contact.address)}</p>
          <div class="derma-actions">
            ${renderDermaActionButton({ label: "WhatsApp", link: contact.whatsapp, type: "whatsapp", subtitle: "AGENDAR" })}
            ${renderDermaActionButton({ label: "C\u00f3mo llegar", link: contact.mapUrl, type: "map", subtitle: "MAPS" })}
            ${social.instagram ? renderDermaActionButton({ label: social.label || "Instagram", link: social.instagram, type: "instagram", subtitle: "REDES" }) : ""}
          </div>
        </div>
      </section>

      <footer class="derma-footer">
        <p>${escapeCopy(brand.name)} - Dermatolog&iacute;a est&eacute;tica de precisi&oacute;n</p>
        ${privacyNotice ? `<small>${escapeCopy(privacyNotice)}</small>` : ""}
      </footer>
      ${renderPromoStickyBanner(getPromoStickyBanner(data, context), contact)}
    </main>
  `;
}

function getPromoStickyBanner(data = {}, context = {}) {
  if (data.promoStickyBanner) return data.promoStickyBanner;

  if (context.slug === "vanessa-gonzalez") {
    return {
      enabled: true,
      image: "../share/assets/vanessa-gonzalez/banner-promos-semanales.webp",
      imageAlt: "Solicitar promociones especiales de la semana",
      link: "#derma-promos",
      showAfterMs: "3000",
      visibleMs: "5000",
      hiddenMs: "3000"
    };
  }

  return {};
}
function renderPromoStickyBanner(banner = {}, contact = {}) {
  if (banner.enabled === false) return "";

  const image = safeUrl(banner.image);
  if (!image) return "";

  const link = safeUrl(banner.link || contact.whatsapp || "#derma-promos") || "#derma-promos";
  const showAfter = parseTiming(banner.showAfterMs, 3000);
  const visible = parseTiming(banner.visibleMs, 5000);
  const hidden = parseTiming(banner.hiddenMs, 3000);

  return `
    <a class="derma-promo-sticky-banner" href="${link}" data-promo-sticky-banner data-show-after="${showAfter}" data-visible-ms="${visible}" data-hidden-ms="${hidden}" aria-label="${escapeHtml(banner.imageAlt || "Solicitar promociones especiales")}">
      <img src="${image}" alt="${escapeHtml(banner.imageAlt || "Promociones especiales de la semana")}">
    </a>
  `;
}

function parseTiming(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.round(number) : fallback;
}
function getPrivacyNotice(data = {}, context = {}) {
  if (data.privacyNotice) return data.privacyNotice;

  if (context.slug === "vanessa-gonzalez") {
    return "Aviso de privacidad: los datos recolectados son para uso de poder compartir informacion de los tratamientos a quien lo solicite.";
  }

  return "";
}
function renderDetailImage(item = {}, className = "derma-detail-image") {
  const thumb = safeUrl(item.thumbImage || item.previewImage || item.detailImage);
  const target = safeUrl(item.thumbLink || item.detailImage || item.previewImage || item.thumbImage);

  if (!thumb) return "";

  return `
    <a class="${className}" href="${target || thumb}" target="_blank" rel="noopener noreferrer" aria-label="Ver arte de ${escapeHtml(item.name || "servicio")}">
      <img src="${thumb}" alt="${escapeHtml(item.name || "Servicio")}">
    </a>
  `;
}

function renderLegacyServices(services = [], context = {}) {
  return `
    <div class="derma-section-head derma-treatment-intro">
      <span>Tratamientos signature</span>
      <h2>Est&aacute;s a un paso de renovar tu piel</h2>
      <p>Elige el protocolo que quieres explorar y descubre c&oacute;mo puede verse una versi&oacute;n m&aacute;s luminosa, firme y fresca de ti.</p>
    </div>
    <div class="derma-services">
      ${services.map((service) => renderService(service, context)).join("")}
    </div>
  `;
}

function renderPromotions(promotions = []) {
  return `
    <div id="derma-promos" class="derma-section-head derma-treatment-intro derma-promo-intro">
      <span>Promociones primero</span>
      <h2>Oportunidades activas para reservar hoy</h2>
      <p>Precios publicados, alcance claro y condiciones visibles antes de escribir por WhatsApp.</p>
    </div>
    <div class="derma-promo-grid">
      ${promotions.map(renderPromotion).join("")}
    </div>
  `;
}

function renderPromotion(promo = {}) {
  const target = promo.serviceSlug ? `#service-${escapeHtml(slugifyFilename(promo.serviceSlug))}` : "#derma-funnel";

  return `
    <article class="derma-promo derma-promo-premium">
      <div class="derma-promo-hero">
        <div class="derma-promo-copy">
          <span>Promo activa</span>
          <h3>${escapeCopy(promo.name)}</h3>
          <p>${escapeCopy(promo.includes)}</p>
          <strong class="derma-promo-price">${escapeCopy(promo.price || "Promocion")}</strong>
        </div>
        ${renderPromoImage(promo)}
      </div>
      ${renderPromoBenefits(promo)}
      ${promo.condition ? `<small>${escapeCopy(promo.condition)}</small>` : ""}
      <div class="derma-inline-actions">
        <a href="${target}">${escapeCopy(promo.ctaLabel || "Ver detalle")}</a>
        ${renderDermaActionButton({ label: "WhatsApp", link: promo.whatsappUrl, type: "whatsapp", subtitle: "AGENDAR" })}
      </div>
    </article>
  `;
}

function renderPromoImage(promo = {}) {
  const thumb = safeUrl(promo.thumbImage || promo.previewImage || promo.detailImage);
  const target = safeUrl(promo.detailImage || promo.previewImage || promo.thumbImage);

  if (!thumb) return "";

  return `
    <a class="derma-promo-image derma-promo-image-float" href="${target || thumb}" target="_blank" rel="noopener noreferrer" aria-label="Ver arte de ${escapeHtml(promo.name || "promocion")}">
      <img src="${thumb}" alt="${escapeHtml(promo.name || "Promocion")}">
    </a>
  `;
}

function renderPromoBenefits(promo = {}) {
  const items = getPromoBenefitItems(promo);

  if (!items.length) return "";

  return `
    <div class="derma-promo-benefits" aria-label="Beneficios de la promocion">
      <span>Beneficios</span>
      ${items.map((item) => `
        <div>
          ${renderPromoIcon(promo)}
          <p>${escapeCopy(item)}</p>
        </div>
      `).join("")}
    </div>
  `;
}

function getPromoBenefitItems(promo = {}) {
  const name = String(promo.name || promo.includes || "").toLowerCase();
  const includes = String(promo.includes || "");

  if (name.includes("cabello") || name.includes("corte")) {
    return ["Corte personalizado segun tu estilo", "Acabado profesional y cuidado", "Cabello con movimiento, forma y frescura"];
  }

  if (name.includes("pesta") || name.includes("ceja")) {
    return ["Mirada mas definida", "Efecto visible desde la primera cita", "Promo ideal para renovar cejas y pestanas"];
  }

  if (name.includes("manos") || name.includes("pies") || name.includes("gel")) {
    return ["Acabado limpio y duradero", "Manos y pies listos en una sola cita", "Look cuidado con precio promocional"];
  }

  if (name.includes("labio") || name.includes("hialuronico")) {
    return ["Valoracion profesional previa", "Procedimiento personalizado", "Promo con cupos limitados"];
  }

  return includes ? [includes, "Detalle visible antes de reservar", "Agenda directa por WhatsApp"] : ["Promo destacada", "Detalle visible antes de reservar", "Agenda directa por WhatsApp"];
}

function renderPromoIcon(promo = {}) {
  const name = String(promo.name || promo.includes || "").toLowerCase();
  let path = "M12 2l2.5 6.8 7.2.3-5.6 4.4 1.9 7-6-3.9-6 3.9 1.9-7-5.6-4.4 7.2-.3L12 2z";

  if (name.includes("cabello") || name.includes("corte")) {
    path = "M8.2 5.1 18.9 15.8a2.5 2.5 0 1 1-1.4 1.4L6.8 6.5a2.5 2.5 0 1 1 1.4-1.4zM15.8 8.2l1.7-1.7a2.5 2.5 0 1 1 1.4 1.4l-1.7 1.7M4 20l7.4-7.4";
  } else if (name.includes("pesta") || name.includes("ceja")) {
    path = "M2.8 12s3.5-5 9.2-5 9.2 5 9.2 5-3.5 5-9.2 5-9.2-5-9.2-5zm9.2 2.6a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2z";
  } else if (name.includes("manos") || name.includes("pies") || name.includes("gel")) {
    path = "M7 21c-1.7-1.3-2.7-3-2.7-5.2V8.4a1.4 1.4 0 0 1 2.8 0v4.3-6.6a1.4 1.4 0 0 1 2.8 0v6.2-7.5a1.4 1.4 0 0 1 2.8 0v7.5-5.9a1.4 1.4 0 0 1 2.8 0v8.1l1.2-2.2a1.5 1.5 0 0 1 2.7 1.3l-2.2 4.6c-1 2-2.8 3.4-5 3.8H7z";
  } else if (name.includes("labio") || name.includes("hialuronico")) {
    path = "M3.5 12.5c2.2-3.2 4.5-4.8 6.8-2.5 1 .9 2.4.9 3.4 0 2.3-2.3 4.6-.7 6.8 2.5-2.8 4-5.7 5.5-8.5 5.5s-5.7-1.5-8.5-5.5zm1.9.2h13.2";
  }

  return `<span class="derma-promo-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${path}"/></svg></span>`;
}

function renderServiceFunnel(serviceSections = [], intro = {}, context = {}, brand = {}) {
  const categories = collectServiceCategories(serviceSections);

  return `
    ${renderCatalogStickyLogo(brand, intro)}
    <div id="derma-funnel" class="derma-section-head derma-treatment-intro derma-category-first-intro derma-category-first-intro-with-media">
      <div class="derma-category-intro-copy">
        <span>${escapeCopy(intro.eyebrow || "Catalogo interactivo")}</span>
        <h2>${escapeCopy(intro.title || "Explora por categoria")}</h2>
        <p>${escapeCopy(intro.description || "Elige una categoria, revisa sus tratamientos y abre la ficha informativa antes de reservar.")}</p>
      </div>
      ${renderCatalogIntroMedia(intro)}
    </div>
    <div class="derma-funnel derma-category-first-grid">
      ${categories.map((category, index) => renderServiceCategory(category, index, context)).join("")}
    </div>
  `;
}

function renderCatalogStickyLogo(brand = {}, intro = {}) {
  const logo = safeUrl(brand.logo || intro.stickyLogo || intro.logo || intro.logoImage);
  const label = brand.name || intro.title || "Logo";

  if (!logo) return "";

  return `
    <div class="derma-catalog-sticky-logo" aria-label="${escapeHtml(label)}">
      <img src="${logo}" alt="${escapeHtml(label)}">
    </div>
  `;
}
function renderCatalogIntroMedia(intro = {}) {
  const image = getCatalogIntroImage(intro);

  if (!image) return `<div class="derma-category-intro-image derma-category-intro-image-empty" aria-hidden="true"></div>`;

  return `<img class="derma-category-intro-image" src="${image}" alt="${escapeHtml(intro.imageAlt || intro.title || "Catalogo de servicios")}">`;
}

function getCatalogIntroImage(intro = {}) {
  return safeUrl(intro.image || intro.photo || intro.thumbImage || intro.previewImage);
}

function collectServiceCategories(serviceSections = []) {
  return serviceSections.flatMap((section) => {
    const categories = Array.isArray(section.categories) ? section.categories : [];

    return categories.map((category) => ({
      ...category,
      sectionName: section.name,
      services: expandKeratinaLengthPrices(category.services)
    }));
  });
}

function expandKeratinaLengthPrices(services = []) {
  if (!Array.isArray(services)) return [];

  return services.flatMap((service) => {
    if (service.slug !== "keratina" || service.variant) return service;
    return createKeratinaLengthServices(service);
  });
}

function createKeratinaLengthServices(base = {}) {
  return [
    ["SV011A", 110, "Cabello corto", "keratina-cabello-corto", "$499"],
    ["SV011B", 111, "Cabello mediano", "keratina-cabello-mediano", "$799"],
    ["SV011C", 112, "Cabello largo", "keratina-cabello-largo", "$999"],
    ["SV011D", 113, "Cabello extra largo", "keratina-cabello-extra-largo", "$1,199"]
  ].map(([id, order, variant, slug, price]) => {
    const whatsappMessage = `Hola, quiero informacion y disponibilidad sobre Keratina - ${variant}.`;

    return {
      ...base,
      id,
      order,
      variant,
      slug,
      shareSlug: "keratina",
      route: `/servicios/${slug}`,
      price,
      whatsappMessage,
      whatsappUrl: `https://wa.me/525542460371?text=${encodeURIComponent(whatsappMessage)}`,
      notes: "Precio por largo de cabello."
    };
  });
}

function renderServiceSection(section = {}, sectionIndex = 0, context = {}) {
  const categories = Array.isArray(section.categories) ? section.categories : [];
  const count = categories.reduce((total, category) => total + (Array.isArray(category.services) ? category.services.length : 0), 0);

  return `
    <details class="derma-funnel-section derma-tone-${sectionIndex % 2 ? "b" : "a"}">
      <summary>
        <span>${escapeCopy(count)} servicios</span>
        <strong>${escapeCopy(section.name)}</strong>
      </summary>
      <div class="derma-category-list">
        ${categories.map((category, index) => renderServiceCategory(category, index, context)).join("")}
      </div>
    </details>
  `;
}

function renderServiceCategory(category = {}, categoryIndex = 0, context = {}) {
  const services = Array.isArray(category.services) ? category.services : [];

  return `
    <details class="derma-category derma-category-button derma-tone-${categoryIndex % 2 ? "b" : "a"}">
      <summary>
        ${renderCategoryThumb(category)}
        <span>${escapeCopy(services.length)} opciones</span>
        <strong>${escapeCopy(category.name)}</strong>
      </summary>
      <div class="derma-detail-list">
        ${services.map((service) => renderServiceDetail(service, context)).join("")}
      </div>
    </details>
  `;
}

function renderCategoryThumb(category = {}) {
  const thumb = safeUrl(category.thumbImage || category.iconImage || category.previewImage);

  if (!thumb) return "";

  return `<img class="derma-category-thumb" src="${thumb}" alt="${escapeHtml(category.name || "Categoria")}">`;
}

function renderServiceDetail(service = {}, context = {}) {
  const title = service.variant ? `${service.name} - ${service.variant}` : service.name;

  return `
    <article id="service-${escapeHtml(slugifyFilename(service.slug || service.name))}" class="derma-service-detail">
      <div class="derma-service-spotlight">
        <div class="derma-service-detail-head">
          <span>${escapeCopy(service.recordType || service.category)}</span>
          <h3>${escapeCopy(title)}</h3>
          ${renderServicePriceBadge(service)}
        </div>
        ${renderDetailImage(service, "derma-detail-image derma-detail-image-spotlight")}
      </div>
      <p>${escapeCopy(service.description)}</p>
      ${renderDetailMeta(service)}
      ${renderDetailList("Beneficios", service.benefits)}
      ${renderDetailList("Ideal para", service.idealFor)}
      ${renderDetailList("Incluye", service.includes)}
      ${renderDetailList("Sellos", service.attributes)}
      ${service.notes || service.detailNote ? `<p class="derma-note">${escapeCopy(service.notes || service.detailNote)}</p>` : ""}
      <div class="derma-inline-actions">
        ${renderDermaActionButton({ label: "Agendar por WhatsApp", link: service.whatsappUrl, type: "whatsapp", subtitle: "CTA SERVICIO" })}
        ${renderServiceShare(service, context)}
      </div>
    </article>
  `;
}

function renderServicePriceBadge(service = {}) {
  if (service.price) {
    return `<strong class="derma-price-badge">${escapeCopy(service.price)}</strong>`;
  }

  return `
    <strong class="derma-price-badge derma-price-premium" aria-label="Servicio premium sin precio publicado">
      <span aria-hidden="true">&#9819;&#9819;&#9819;&#9819;&#9819;</span>
      Premium
    </strong>
  `;
}
function renderDetailMeta(service = {}) {
  const items = [
    service.starts ? ["Inicio", service.starts] : null,
    service.duration ? ["Duracion", service.duration] : null
  ].filter(Boolean);

  if (!items.length) return "";

  return `
    <div class="derma-detail-meta">
      ${items.map(([label, value]) => `
        <div>
          <span>${label}</span>
          <strong>${escapeCopy(value)}</strong>
        </div>
      `).join("")}
    </div>
  `;
}

function renderDetailList(title, items = []) {
  if (!Array.isArray(items) || !items.length) return "";

  return `
    <div class="derma-detail-block">
      <h4>${escapeCopy(title)}</h4>
      <ul>
        ${items.map((item) => `<li>${escapeCopy(item)}</li>`).join("")}
      </ul>
    </div>
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

function renderService(service = {}, context = {}) {
  return `
    <article class="derma-service">
      <div class="derma-service-copy">
        <span>${escapeCopy(service.category)}</span>
        <h3>${escapeCopy(service.name)}</h3>
        <p>${escapeCopy(service.description)}</p>
      </div>
      ${renderServicePreview(service)}
      ${renderServiceDownload(service)}
      ${renderServiceShare(service, context)}
    </article>
  `;
}

function renderServicePreview(service = {}) {
  const previewUrl = safeUrl(service.previewImage || service.detailImage);
  const detailUrl = safeUrl(service.detailImage || service.previewImage);

  if (!previewUrl) return "";

  return `
    <a class="derma-service-preview" href="${detailUrl || previewUrl}" target="_blank" rel="noopener noreferrer" aria-label="Ver detalle de ${escapeHtml(service.name || "tratamiento")}">
      <img src="${previewUrl}" alt="${escapeHtml(service.name || "Tratamiento")}">
    </a>
  `;
}

function renderServiceDownload(service = {}) {
  const url = safeUrl(service.detailImage);

  if (!url) return "";

  const name = escapeHtml(slugifyFilename(service.name || "tratamiento"));

  return `
    <a class="derma-service-download" href="${url}" target="_blank" rel="noopener noreferrer">
      Quiero saber m&aacute;s sobre este tratamiento
    </a>
  `;
}

function renderServiceShare(service = {}, context = {}) {
  const shareUrl = getServiceShareUrl(service, context);
  const title = getServiceDisplayName(service);

  if (!shareUrl) return "";

  return `
    <a class="derma-service-share derma-service-share-card" href="${shareUrl}" target="_blank" rel="noopener noreferrer" aria-label="Compartir ${escapeHtml(title)} por WhatsApp">
      <span class="derma-share-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path fill="currentColor" d="M18 16.1c-.8 0-1.5.3-2 .8L8.9 12.7a3.2 3.2 0 0 0 0-1.4L16 7.1A2.9 2.9 0 1 0 15 5c0 .2 0 .5.1.7L8 9.9A3 3 0 1 0 8 14l7.1 4.2-.1.7a3 3 0 1 0 3-2.8z"/>
        </svg>
      </span>
      <span>
        <small>Tarjeta premium por WhatsApp</small>
        <strong>Compartir a una amiga</strong>
      </span>
    </a>
  `;
}

function getServiceShareUrl(service = {}, context = {}) {
  const title = getServiceDisplayName(service) || "este servicio";
  const hasWindow = typeof window !== "undefined";
  const serviceSlug = slugifyFilename(service.shareSlug || service.slug || service.name);
  const sharePageUrl = hasWindow
    ? new URL(`../share/vanessa-gonzalez/${serviceSlug}.html?v=4`, window.location.href).href
    : "";

  if (!sharePageUrl) return "";

  const message = `Mira este tratamiento de la Dra. Vanessa G \u{1F469}\u200D\u{1F52C}\n${title}\n${sharePageUrl}`;

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
function getServiceDisplayName(service = {}) {
  return service.variant ? `${service.name} - ${service.variant}` : service.name;
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

function slugifyFilename(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "tratamiento";
}

function escapeCopy(value) {
  return escapeHtml(normalizeSpanishCopy(value));
}

function renderDermaActionButton(button = {}) {
  return renderActionButton({ ...button, className: DERMA_BUTTON_CLASS });
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


