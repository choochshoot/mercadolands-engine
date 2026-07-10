import { getAvailableTemplates } from "../core/template-registry.js";
import { getAvailableThemes } from "../core/theme-registry.js";

const STORAGE_BUCKET = "landing-assets";
const TEXT_SPELLCHECK_ATTRS = 'spellcheck="true" lang="es-MX" autocapitalize="sentences"';

const FALLBACK_CONTRACTS = {
  creator: {
    template: "creator",
    theme: "green-gold",
    profile: {
      name: "Daniela Ramirez",
      title: "Comunicadora | Creadora de contenido",
      photo: ""
    },
    hero: {
      message: "Conectemos y hagamos cosas increibles juntos"
    },
    about: {
      text: "Me encanta conectar personas y marcas.",
      cta: "Hablemos y trabajemos juntos"
    },
    buttons: [
      {
        label: "WhatsApp",
        link: "https://wa.me/5210000000000",
        type: "whatsapp",
        subtitle: "ESCRIBEME POR"
      }
    ]
  }
};

const state = {
  contract: {},
  data: {}
};

const els = {
  form: document.querySelector("#builder-form"),
  slug: document.querySelector("#slug"),
  template: document.querySelector("#template"),
  theme: document.querySelector("#theme"),
  fields: document.querySelector("#dynamic-fields"),
  status: document.querySelector("#admin-status"),
  preview: document.querySelector("#json-preview"),
  viewLink: document.querySelector("#view-link"),
  shareLink: document.querySelector("#share-link"),
  loadBtn: document.querySelector("#load-btn"),
  copyJson: document.querySelector("#copy-json")
};

bootAdmin();

async function bootAdmin() {
  fillSelect(els.template, getAvailableTemplates());
  fillSelect(els.theme, getAvailableThemes());

  els.template.value = "business";
  els.theme.value = "green-gold";

  await loadTemplateContract("business");
  bindEvents();
  updatePreview();
}

function bindEvents() {
  els.template.addEventListener("change", async () => {
    await loadTemplateContract(els.template.value);
    updatePreview();
  });

  els.theme.addEventListener("change", updatePreview);
  els.slug.addEventListener("input", updateViewLink);
  els.fields.addEventListener("input", handleFieldsInput);
  els.fields.addEventListener("change", handleFieldChange);
  els.fields.addEventListener("click", handleDynamicClick);
  els.form.addEventListener("submit", saveLanding);
  els.loadBtn.addEventListener("click", loadLandingBySlug);
  els.copyJson.addEventListener("click", copyJson);
}

function fillSelect(select, options) {
  select.innerHTML = options
    .map((option) => `<option value="${option}">${toTitle(option)}</option>`)
    .join("");
}

async function loadTemplateContract(template) {
  state.contract = await getContract(template);
  state.data = structuredClone(state.contract);
  state.data.template = template;
  state.data.theme = els.theme.value || state.data.theme || "green-gold";

  renderDynamicFields();
}

async function getContract(template) {
  if (template === "business") {
    const response = await fetch("./contracts/business.json");
    return response.json();
  }

  if (template === "wedding") {
    const response = await fetch("./contracts/wedding.json");
    return response.json();
  }

  if (template === "dermatology") {
    const response = await fetch("./contracts/dermatology.json");
    return response.json();
  }

  if (template === "realestate") {
    const response = await fetch("./contracts/realestate.json");
    return response.json();
  }

  return structuredClone(FALLBACK_CONTRACTS[template] || FALLBACK_CONTRACTS.creator);
}

function renderDynamicFields() {
  const editableData = { ...state.data };
  delete editableData.template;
  delete editableData.theme;

  if (shouldUseVanessaCatalogEditor()) {
    els.fields.innerHTML = renderVanessaCatalogEditor(editableData);
    return;
  }

  els.fields.innerHTML = Object.entries(editableData)
    .map(([key, value]) => renderGroup(key, value, key))
    .join("");
}

function shouldUseVanessaCatalogEditor() {
  return cleanSlug(els.slug.value) === "vanessa-gonzalez" && Array.isArray(state.data.serviceSections);
}

function renderVanessaCatalogEditor(editableData) {
  const serviceSections = Array.isArray(state.data.serviceSections) ? state.data.serviceSections : [];
  const promotions = Array.isArray(state.data.promotions) ? state.data.promotions : [];
  const priceItems = collectVanessaPriceItems(serviceSections);
  const serviceCount = serviceSections.reduce((total, section) => total + getSectionServiceCount(section), 0);
  const categoryCount = serviceSections.reduce((total, section) => total + (Array.isArray(section.categories) ? section.categories.length : 0), 0);
  const otherGroups = Object.entries(editableData)
    .filter(([key]) => key !== "serviceSections")
    .map(([key, value]) => renderGroup(key, value, key))
    .join("");

  return `
    <section class="vanessa-admin-hero">
      <div>
        <span>Editor especial</span>
        <h2>Vanessa Gonzalez Studio</h2>
        <p>Gestiona el catalogo por secciones, categorias, servicios y variantes sin modificar el admin de otros slugs.</p>
      </div>
      <div class="vanessa-admin-stats">
        ${renderVanessaStat(serviceSections.length, "secciones")}
        ${renderVanessaStat(categoryCount, "categorias")}
        ${renderVanessaStat(serviceCount, "servicios")}
        ${renderVanessaStat(promotions.length, "promos")}
      </div>
    </section>

    ${renderVanessaPriceDashboard(priceItems)}

    <section class="field-group vanessa-catalog" data-path="serviceSections">
      <div class="group-title vanessa-catalog-title">
        <div>
          <span>Catalogo operativo</span>
          <h2>Categorias y servicios actuales</h2>
        </div>
        <button type="button" class="mini-btn" data-action="add" data-path="serviceSections">Agregar seccion</button>
      </div>
      <div class="vanessa-section-list">
        ${serviceSections.map((section, sectionIndex) => renderVanessaSection(section, sectionIndex)).join("")}
      </div>
    </section>

    <details class="field-group vanessa-secondary-groups">
      <summary>
        <span>Datos generales</span>
        <strong>Marca, hero, promos, contacto y SEO</strong>
      </summary>
      <div class="vanessa-secondary-body">
        ${otherGroups}
      </div>
    </details>
  `;
}

function collectVanessaPriceItems(serviceSections = []) {
  return serviceSections.flatMap((section, sectionIndex) => {
    const categories = Array.isArray(section.categories) ? section.categories : [];

    return categories.flatMap((category, categoryIndex) => {
      const services = Array.isArray(category.services) ? category.services : [];

      return services.map((service, serviceIndex) => {
        const servicePath = `serviceSections.${sectionIndex}.categories.${categoryIndex}.services.${serviceIndex}`;
        const title = service.variant ? `${service.name || "Servicio"} - ${service.variant}` : service.name || `Servicio ${serviceIndex + 1}`;

        return {
          title,
          section: section.name || "Sin seccion",
          category: category.name || "Sin categoria",
          slug: service.slug || "",
          price: service.price || "",
          pricePath: `${servicePath}.price`
        };
      });
    });
  });
}

function renderVanessaPriceDashboard(items = []) {
  return `
    <section class="field-group vanessa-price-dashboard">
      <div class="group-title vanessa-price-title">
        <div>
          <span>Dashboard de precios</span>
          <h2>Control diario de servicios</h2>
        </div>
        <button type="button" class="mini-btn vanessa-save-prices" data-action="save-prices">Guardar precios</button>
      </div>
      <div class="vanessa-price-tools">
        <div class="field-row">
          <label>Buscar servicio</label>
          <input type="search" data-price-search placeholder="Nombre, categoria o slug" spellcheck="false">
        </div>
        <p>${escapeHtml(items.length)} precios editables. Los cambios se guardan en el mismo JSON de la landing.</p>
      </div>
      <div class="vanessa-price-list">
        ${items.map(renderVanessaPriceRow).join("")}
      </div>
    </section>
  `;
}

function renderVanessaPriceRow(item = {}) {
  const searchText = [item.title, item.section, item.category, item.slug, item.price].join(" ").toLowerCase();

  return `
    <article class="vanessa-price-row" data-price-row data-search="${escapeHtml(searchText)}">
      <div>
        <span>${escapeHtml(item.section)} / ${escapeHtml(item.category)}</span>
        <strong>${escapeHtml(item.title)}</strong>
        <small>${item.slug ? `/${escapeHtml(item.slug)}` : "sin slug"}</small>
      </div>
      <label>
        <span>Precio</span>
        <input data-path="${item.pricePath}" value="${escapeHtml(item.price)}" spellcheck="false">
      </label>
    </article>
  `;
}
function renderVanessaStat(value, label) {
  return `
    <div>
      <strong>${escapeHtml(value)}</strong>
      <span>${escapeHtml(label)}</span>
    </div>
  `;
}

function renderVanessaSection(section = {}, sectionIndex = 0) {
  const sectionPath = `serviceSections.${sectionIndex}`;
  const categories = Array.isArray(section.categories) ? section.categories : [];

  return `
    <details class="vanessa-section-card" open>
      <summary>
        <div>
          <span>${escapeHtml(getSectionServiceCount(section))} servicios</span>
          <strong>${escapeHtml(section.name || `Seccion ${sectionIndex + 1}`)}</strong>
        </div>
        <button type="button" class="mini-btn" data-action="remove" data-path="${sectionPath}">Quitar</button>
      </summary>
      <div class="vanessa-section-fields">
        ${renderInput("name", section.name || "", `${sectionPath}.name`)}
        <div class="vanessa-add-row">
          <button type="button" class="mini-btn" data-action="add" data-path="${sectionPath}.categories">Agregar categoria</button>
        </div>
      </div>
      <div class="vanessa-category-list">
        ${categories.map((category, categoryIndex) => renderVanessaCategory(category, sectionPath, categoryIndex)).join("")}
      </div>
    </details>
  `;
}

function renderVanessaCategory(category = {}, sectionPath = "", categoryIndex = 0) {
  const categoryPath = `${sectionPath}.categories.${categoryIndex}`;
  const services = Array.isArray(category.services) ? category.services : [];

  return `
    <details class="vanessa-category-card" open>
      <summary>
        <div>
          <span>${escapeHtml(services.length)} opciones</span>
          <strong>${escapeHtml(category.name || `Categoria ${categoryIndex + 1}`)}</strong>
        </div>
        <button type="button" class="mini-btn" data-action="remove" data-path="${categoryPath}">Quitar</button>
      </summary>
      <div class="vanessa-category-fields">
        ${renderInput("name", category.name || "", `${categoryPath}.name`)}
        ${renderAssetInput("thumbImage", category.thumbImage || "", `${categoryPath}.thumbImage`)}
        <div class="vanessa-add-row">
          <button type="button" class="mini-btn" data-action="add" data-path="${categoryPath}.services">Agregar servicio</button>
        </div>
      </div>
      <div class="vanessa-service-list">
        ${services.map((service, serviceIndex) => renderVanessaService(service, categoryPath, serviceIndex)).join("")}
      </div>
    </details>
  `;
}

function renderVanessaService(service = {}, categoryPath = "", serviceIndex = 0) {
  const servicePath = `${categoryPath}.services.${serviceIndex}`;
  const title = service.variant ? `${service.name || "Servicio"} - ${service.variant}` : service.name || `Servicio ${serviceIndex + 1}`;
  const slug = service.slug ? `/${service.slug}` : "sin slug";

  return `
    <details class="vanessa-service-card">
      <summary class="vanessa-service-head">
        <div>
          <span>${escapeHtml(service.recordType || service.category || "servicio")}</span>
          <h3>${escapeHtml(title)}</h3>
          <p>${service.price ? escapeHtml(service.price) : "Precio pendiente"} - ${escapeHtml(slug)}</p>
        </div>
        <button type="button" class="mini-btn" data-action="remove" data-path="${servicePath}">Quitar</button>
      </summary>
      <div class="vanessa-service-body">
        <div class="vanessa-service-grid">
          ${renderInput("name", service.name || "", `${servicePath}.name`)}
          ${renderInput("variant", service.variant || "", `${servicePath}.variant`)}
          ${renderInput("price", service.price || "", `${servicePath}.price`)}
          ${renderInput("recordType", service.recordType || "", `${servicePath}.recordType`)}
          ${renderInput("category", service.category || "", `${servicePath}.category`)}
          ${renderInput("slug", service.slug || "", `${servicePath}.slug`)}
        </div>
        ${renderInput("description", service.description || "", `${servicePath}.description`)}
        <div class="vanessa-service-grid">
          ${renderInput("starts", service.starts || "", `${servicePath}.starts`)}
          ${renderInput("duration", service.duration || "", `${servicePath}.duration`)}
        </div>
        <div class="vanessa-list-grid">
          ${renderListTextarea("benefits", service.benefits, `${servicePath}.benefits`)}
          ${renderListTextarea("idealFor", service.idealFor, `${servicePath}.idealFor`)}
          ${renderListTextarea("includes", service.includes, `${servicePath}.includes`)}
          ${renderListTextarea("attributes", service.attributes, `${servicePath}.attributes`)}
        </div>
        ${renderInput("notes", service.notes || service.detailNote || "", `${servicePath}.${service.notes !== undefined ? "notes" : "detailNote"}`)}
        ${renderInput("whatsappUrl", service.whatsappUrl || "", `${servicePath}.whatsappUrl`)}
        <div class="vanessa-service-grid">
          ${renderAssetInput("thumbImage", service.thumbImage || "", `${servicePath}.thumbImage`)}
          ${renderAssetInput("previewImage", service.previewImage || "", `${servicePath}.previewImage`)}
          ${renderAssetInput("detailImage", service.detailImage || "", `${servicePath}.detailImage`)}
          ${renderInput("thumbLink", service.thumbLink || "", `${servicePath}.thumbLink`)}
        </div>
      </div>
    </details>
  `;
}

function renderListTextarea(key, value = [], path) {
  const lines = Array.isArray(value) ? value.join("\n") : String(value || "");

  return `
    <div class="field-row vanessa-list-field">
      <label>${getFieldLabel(key, path)}</label>
      <textarea data-list-path="${path}" placeholder="Una linea por item" ${TEXT_SPELLCHECK_ATTRS}>${escapeHtml(lines)}</textarea>
    </div>
  `;
}

function getSectionServiceCount(section = {}) {
  const categories = Array.isArray(section.categories) ? section.categories : [];
  return categories.reduce((total, category) => total + (Array.isArray(category.services) ? category.services.length : 0), 0);
}
function renderGroup(key, value, path) {
  return `
    <section class="field-group" data-path="${path}">
      <div class="group-title">
        <div>
          <span>${escapeHtml(key)}</span>
          <h2>${toTitle(key)}</h2>
        </div>
        ${Array.isArray(value) ? `<button type="button" class="mini-btn" data-action="add" data-path="${path}">Agregar</button>` : ""}
      </div>
      ${renderValue(value, path)}
    </section>
  `;
}

function renderValue(value, path) {
  if (Array.isArray(value)) {
    return `
      <div class="array-list">
        ${value.map((item, index) => renderArrayItem(item, `${path}.${index}`, index)).join("")}
      </div>
    `;
  }

  if (isObject(value)) {
    return Object.entries(value)
      .map(([key, child]) => renderField(key, child, `${path}.${key}`))
      .join("");
  }

  return renderInput(path.split(".").pop(), value, path);
}

function renderArrayItem(item, path, index) {
  return `
    <article class="array-item">
      <div class="array-item-header">
        <strong>Item ${index + 1}</strong>
        <button type="button" class="mini-btn" data-action="remove" data-path="${path}">Quitar</button>
      </div>
      ${isObject(item)
        ? Object.entries(item).map(([key, value]) => renderField(key, value, `${path}.${key}`)).join("")
        : renderInput("value", item, path)}
    </article>
  `;
}

function renderField(key, value, path) {
  if (Array.isArray(value) || isObject(value)) {
    return renderGroup(key, value, path);
  }

  return renderInput(key, value, path);
}

function renderInput(key, value, path) {
  if (typeof value === "boolean") {
    return renderBooleanInput(key, value, path);
  }

  if (isAssetField(key, path)) {
    return renderAssetInput(key, value, path);
  }

  const tag = shouldUseTextarea(key, value) ? "textarea" : "input";
  const inputValue = escapeHtml(value);

  if (tag === "textarea") {
    return `
      <div class="field-row">
        <label>${getFieldLabel(key, path)}</label>
        <textarea data-path="${path}" ${TEXT_SPELLCHECK_ATTRS}>${inputValue}</textarea>
      </div>
    `;
  }

  const spellcheckAttrs = shouldSpellcheckField(key, path) ? ` ${TEXT_SPELLCHECK_ATTRS}` : ' spellcheck="false"';

  return `
    <div class="field-row">
      <label>${toTitle(key)}</label>
      <input data-path="${path}" value="${inputValue}"${spellcheckAttrs}>
    </div>
  `;
}

function renderBooleanInput(key, value, path) {
  return `
    <label class="toggle-row">
      <span>${toTitle(key)}</span>
      <input type="checkbox" data-path="${path}" ${value ? "checked" : ""}>
    </label>
  `;
}
function renderAssetInput(key, value, path) {
  const inputValue = escapeHtml(value);
  const accept = getAssetAccept(path);
  const placeholder = getAssetPlaceholder(path);

  return `
    <div class="field-row asset-row">
      <label>${getFieldLabel(key, path)}</label>
      <div class="asset-control">
        <input data-path="${path}" value="${inputValue}" placeholder="${placeholder}">
        <label class="asset-upload-btn">
          Subir archivo
          <input type="file" accept="${accept}" data-upload-path="${path}">
        </label>
      </div>
      ${value ? `
        <div class="asset-preview">
          ${isVideoUrl(value) ? `
            <video src="${inputValue}" muted loop playsinline controls></video>
          ` : `
            <img src="${inputValue}" alt="${escapeHtml(getFieldLabel(key, path))}">
          `}
        </div>
      ` : ""}
    </div>
  `;
}

function handleDynamicClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  event.preventDefault();
  event.stopPropagation();

  const path = button.dataset.path;

  if (button.dataset.action === "add") {
    addArrayItem(path);
  }

  if (button.dataset.action === "remove") {
    removeArrayItem(path);
  }

  if (button.dataset.action === "save-prices") {
    saveLanding(event);
    return;
  }

  renderDynamicFields();
  updatePreview();
}

function handleFieldsInput(event) {
  updatePreview();

  if (event.target.matches("[data-price-search]")) {
    applyVanessaPriceFilter(event.target.value);
  }
}

function applyVanessaPriceFilter(value = "") {
  const query = String(value || "").trim().toLowerCase();

  els.fields.querySelectorAll("[data-price-row]").forEach((row) => {
    row.hidden = query ? !String(row.dataset.search || "").includes(query) : false;
  });
}

async function handleFieldChange(event) {
  const input = event.target;

  if (!input.matches("input[type='file'][data-upload-path]")) {
    updatePreview();
    return;
  }

  await uploadAssetForField(input);
}

function addArrayItem(path) {
  syncStateFromFields();

  const list = getByPath(state.data, path);
  if (!Array.isArray(list)) return;

  const sample = list[0] || getByPath(state.contract, `${path}.0`) || "";
  list.push(cloneEmpty(sample));
}

function removeArrayItem(path) {
  syncStateFromFields();

  const parts = path.split(".");
  const index = Number(parts.pop());
  const list = getByPath(state.data, parts.join("."));

  if (Array.isArray(list)) {
    list.splice(index, 1);
  }
}

function updatePreview() {
  syncStateFromFields();
  updateViewLink();
  els.preview.textContent = JSON.stringify(getPayload(), null, 2);
}

function syncStateFromFields() {
  state.data.template = els.template.value;
  state.data.theme = els.theme.value;

  els.fields.querySelectorAll("[data-path]").forEach((field) => {
    if (field.matches("input[type='checkbox']")) {
      setByPath(state.data, field.dataset.path, field.checked);
      return;
    }

    if (field.matches("input, textarea")) {
      setByPath(state.data, field.dataset.path, field.value);
    }
  });

  els.fields.querySelectorAll("[data-list-path]").forEach((field) => {
    const items = field.value
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);

    setByPath(state.data, field.dataset.listPath, items);
  });
}

function getPayload() {
  return {
    ...state.data,
    template: els.template.value,
    theme: els.theme.value
  };
}

async function loadLandingBySlug() {
  const slug = cleanSlug(els.slug.value);

  if (!slug) {
    setStatus("Escribe un slug para cargar.", "warn");
    return;
  }

  try {
    setStatus("Cargando landing...");

    const { data, error } = await window.supabaseClient
      .from("landings")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      setStatus("No existe ese slug. Puedes crearlo al guardar.", "warn");
      return;
    }

    const template = data.template || data.data?.template || "creator";
    const theme = data.theme || data.data?.theme || "green-gold";

    els.template.value = template;
    els.theme.value = theme;

    state.contract = await getContract(template);
    state.data = deepMerge(structuredClone(state.contract), data.data || {});
    state.data.template = template;
    state.data.theme = theme;
    normalizeLoadedData(template);

    renderDynamicFields();
    updatePreview();
    setStatus("Landing cargada.");
  } catch (error) {
    console.error(error);
    setStatus("No se pudo cargar el slug.", "error");
  }
}

async function saveLanding(event) {
  event.preventDefault();

  const slug = cleanSlug(els.slug.value);

  if (!slug) {
    setStatus("El slug es obligatorio.", "error");
    return;
  }

  try {
    setStatus("Guardando landing...");

    const payload = getPayload();
    const record = {
      slug,
      template: payload.template,
      theme: payload.theme,
      category: payload.template,
      data: payload
    };

    const { data: existing } = await window.supabaseClient
      .from("landings")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();

    const result = existing
      ? await window.supabaseClient.from("landings").update(record).eq("slug", slug)
      : await window.supabaseClient.from("landings").insert([record]);

    if (result.error) {
      throw result.error;
    }

    setStatus("Landing guardada y lista para publicar.");
    updateViewLink();
  } catch (error) {
    console.error(error);
    setStatus(error.message || "No se pudo guardar.", "error");
  }
}

async function copyJson() {
  await navigator.clipboard.writeText(JSON.stringify(getPayload(), null, 2));
  setStatus("JSON copiado.");
}

async function uploadAssetForField(input) {
  const file = input.files?.[0];
  const fieldPath = input.dataset.uploadPath;
  const slug = cleanSlug(els.slug.value);
  const template = els.template.value;

  if (!file || !fieldPath) return;

  if (!slug) {
    input.value = "";
    setStatus("Escribe un slug antes de subir imagenes.", "error");
    return;
  }

  try {
    validateAssetFile(file, fieldPath);
    setStatus(`Subiendo ${toTitle(fieldPath.split(".").pop())}...`);

    const filePath = createAssetPath({ slug, template, fieldPath, file });
    const { error: uploadError } = await window.supabaseClient
      .storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = window.supabaseClient
      .storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    const publicUrl = data.publicUrl;
    await saveAssetHistory({
      slug,
      fieldPath,
      publicUrl
    });

    const urlField = els.fields.querySelector(`[data-path="${cssEscape(fieldPath)}"]`);

    if (urlField) {
      urlField.value = publicUrl;
    }

    setByPath(state.data, fieldPath, publicUrl);
    renderDynamicFields();
    updatePreview();
    setStatus("Archivo subido y conectado al campo.");
  } catch (error) {
    console.error(error);
    setStatus(error.message || "No se pudo subir la imagen.", "error");
  } finally {
    input.value = "";
  }
}

async function saveAssetHistory({ slug, fieldPath, publicUrl }) {
  const { error } = await window.supabaseClient
    .from("landing_assets")
    .insert([
      {
        slug,
        asset_type: fieldPathToAssetType(fieldPath),
        asset_url: publicUrl
      }
    ]);

  if (error) {
    console.warn("Asset uploaded but history was not saved:", error);
  }
}

function validateAssetFile(file, fieldPath = "") {
  const allowedImages = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/heic",
    "image/gif"
  ];
  const allowedVideos = [
    "video/webm",
    "video/mp4"
  ];
  const isImage = allowedImages.includes(file.type);
  const isVideo = allowedVideos.includes(file.type);
  const isImageOnly = isImageOnlyAssetPath(fieldPath);

  if (isImageOnly && !isImage) {
    throw new Error("Este campo solo permite PNG, JPG, WEBP, HEIC o GIF.");
  }

  if (!isImage && !isVideo) {
    throw new Error("Formato no permitido. Usa PNG, JPG, WEBP, HEIC, GIF, WEBM o MP4.");
  }

  const maxMB = String(fieldPath).toLowerCase() === "share.image" ? 1 : isVideo ? 20 : 5;

  if (file.size > maxMB * 1024 * 1024) {
    throw new Error(`El archivo supera ${maxMB}MB.`);
  }
}

function createAssetPath({ slug, template, fieldPath, file }) {
  const ext = getFileExtension(file);
  const cleanField = fieldPath
    .replace(/\.\d+\./g, "-")
    .replace(/\./g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();

  return `${slug}/${template}/${cleanField}-${Date.now()}.${ext}`;
}

function getFileExtension(file) {
  const ext = file.name.split(".").pop();
  return (ext || "webp").toLowerCase();
}

function fieldPathToAssetType(fieldPath) {
  return String(fieldPath)
    .replace(/\.\d+\./g, "_")
    .replace(/\./g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .toLowerCase();
}

function updateViewLink() {
  const slug = cleanSlug(els.slug.value) || "daniela";
  els.viewLink.href = `./u/index.html?slug=${encodeURIComponent(slug)}`;
  els.shareLink.href = `./share/${encodeURIComponent(slug)}.html`;
}

function setStatus(message, tone = "default") {
  els.status.textContent = message;
  els.status.dataset.tone = tone;
}

function deepMerge(base, override) {
  if (Array.isArray(base) || Array.isArray(override)) {
    return override === undefined ? base : override;
  }

  if (!isObject(base) || !isObject(override)) {
    return override === undefined ? base : override;
  }

  const result = { ...base };

  Object.entries(override).forEach(([key, value]) => {
    result[key] = deepMerge(base[key], value);
  });

  return result;
}

function getFieldLabel(key, path = "") {
  const labels = {
    "doctor.photo": "Foto doctora",
    "experience.photo": "Foto atm&oacute;sfera",
    "hero.photo": "Foto principal",
    "brand.logo": "Logo marca",
    "share.image": "Imagen para compartir",
    "catalogIntro.image": "WEBP/imagen del inicio del catalogo: columna derecha superior"
  };
  const normalizedPath = String(path || "").toLowerCase();

  if (normalizedPath === "catalogintro.image") {
    return "Sube aqui el WEBP/PNG de la mejora visual del inicio de la landing";
  }

  if (normalizedPath.includes(".categories.") && normalizedPath.endsWith(".thumbimage")) {
    return "Thumb del boton de esta categoria";
  }

  if (normalizedPath.includes(".services.") && normalizedPath.endsWith(".thumbimage")) {
    return "Thumb visual de este tratamiento";
  }

  return labels[path] || toTitle(key);
}

function setByPath(target, path, value) {
  const parts = path.split(".");
  const last = parts.pop();
  const parent = parts.reduce((current, part) => current?.[part], target);

  if (parent && last !== undefined) {
    parent[last] = value;
  }
}

function getByPath(target, path) {
  if (!path) return target;
  return path.split(".").reduce((current, part) => current?.[part], target);
}

function cloneEmpty(value) {
  if (Array.isArray(value)) return [];
  if (typeof value === "boolean") return false;
  if (isObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, cloneEmpty(child)])
    );
  }
  return "";
}

function shouldUseTextarea(key, value) {
  return String(value).length > 52 || ["description", "message", "text", "address"].includes(key);
}

function shouldSpellcheckField(key, path = "") {
  const fieldName = String(key || "").toLowerCase();
  const fullPath = String(path || "").toLowerCase();

  if (isAssetField(key, path)) return false;
  if (fullPath.startsWith("share.")) return false;
  if (["url", "link", "email", "phone", "whatsappurl", "thumblink", "slug"].some((token) => fieldName.includes(token))) return false;
  if (["price", "amount", "duration", "rating", "year", "count"].some((token) => fieldName.includes(token))) return false;

  return true;
}

function isAssetField(key, path) {
  const fieldName = String(key || path.split(".").pop()).toLowerCase();
  const fullPath = String(path || "").toLowerCase();

  if (fullPath === "share.image") return true;
  if (fullPath.startsWith("share.")) return false;
  if (["imagealt", "imagewidth", "imageheight"].includes(fieldName)) return false;
  if (fieldName.includes("mapurl")) return false;
  if (fieldName === "url" || fieldName === "link" || fieldName === "email") return false;

  return [
    "photo",
    "video",
    "image",
    "logo",
    "cover",
    "avatar",
    "thumbnail",
    "background",
    "gallery"
  ].some((token) => fieldName.includes(token) || fullPath.includes(`.${token}`));
}

function getAssetAccept(path = "") {
  if (isImageOnlyAssetPath(path)) {
    return "image/png,image/jpeg,image/webp,image/heic,image/gif";
  }

  return "image/png,image/jpeg,image/webp,image/heic,image/gif,video/webm,video/mp4";
}

function getAssetPlaceholder(path = "") {
  const normalizedPath = String(path || "").toLowerCase();

  if (normalizedPath === "catalogintro.image") {
    return "Sube aqui el WEBP/PNG de la mejora visual del inicio de la landing";
  }

  if (normalizedPath.includes(".categories.") && normalizedPath.endsWith(".thumbimage")) {
    return "URL del WEBP/PNG que se vera en el boton de esta categoria";
  }

  if (normalizedPath.includes(".services.") && normalizedPath.endsWith(".thumbimage")) {
    return "URL del thumb visual que se vera en la ficha del tratamiento";
  }

  if (isServicePreviewImagePath(path)) {
    return "URL de thumb WEBP/JPG/PNG ligero para la card";
  }

  if (isServiceDetailImagePath(path)) {
    return "URL de WEBP/JPG/PNG con el detalle del tratamiento";
  }

  if (normalizedPath === "share.image") {
    return "URL de imagen OG: 1200x630, PNG/JPG, ideal <500KB";
  }

  return "URL de imagen o video";
}

function isVideoUrl(value) {
  return /\.(webm|mp4)(\?|#|$)/i.test(String(value || ""));
}

function normalizeLoadedData(template) {
  if (cleanSlug(els.slug.value) === "vanessa-gonzalez") {
    normalizeVanessaCatalogData();
  }

  if (template !== "dermatology") return;
  if (!Array.isArray(state.data.services)) return;

  state.data.services = state.data.services.map((service) => ({
    detailImage: "",
    previewImage: "",
    thumbImage: "",
    thumbLink: "",
    ...service
  }));
}

function normalizeVanessaCatalogData() {
  const sections = Array.isArray(state.data.serviceSections) ? state.data.serviceSections : [];

  sections.forEach((section) => {
    const categories = Array.isArray(section.categories) ? section.categories : [];

    categories.forEach((category) => {
      const services = Array.isArray(category.services) ? category.services : [];
      const keratinaIndex = services.findIndex((service) => service.slug === "keratina" && !service.variant);

      if (keratinaIndex === -1) return;

      const base = services[keratinaIndex];
      services.splice(keratinaIndex, 1, ...createKeratinaVariantServices(base));
    });
  });

  updateVanessaServiceStat(sections);
}

function createKeratinaVariantServices(base = {}) {
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
      route: `/servicios/${slug}`,
      price,
      whatsappMessage,
      whatsappUrl: `https://wa.me/525542460371?text=${encodeURIComponent(whatsappMessage)}`,
      notes: "Precio por largo de cabello."
    };
  });
}

function updateVanessaServiceStat(sections = []) {
  const stats = state.data.doctor && Array.isArray(state.data.doctor.stats) ? state.data.doctor.stats : [];
  const serviceStat = stats.find((stat) => String(stat.label || "").includes("servicios"));

  if (serviceStat) {
    serviceStat.value = String(sections.reduce((total, section) => total + getSectionServiceCount(section), 0));
  }
}

function isImageOnlyAssetPath(path = "") {
  const normalizedPath = String(path).toLowerCase();

  return normalizedPath === "share.image" || normalizedPath === "catalogintro.image" || isServiceImagePath(normalizedPath);
}

function isServiceImagePath(path = "") {
  return isServiceDetailImagePath(path) || isServicePreviewImagePath(path) || String(path || "").toLowerCase().endsWith(".thumbimage");
}

function isServiceDetailImagePath(path = "") {
  return /(^|\.)services\.\d+\.detailimage$/i.test(String(path));
}

function isServicePreviewImagePath(path = "") {
  return /(^|\.)services\.\d+\.previewimage$/i.test(String(path));
}

function cleanSlug(value) {
  const slug = String(value || "")
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const aliases = {
    vanessagonzalez: "vanessa-gonzalez",
    vanessagonzales: "vanessa-gonzalez"
  };

  return aliases[slug] || slug;
}

function toTitle(value) {
  const labels = {
    realestate: "Inmobiliaria",
    "estate-luxury": "Inmobiliario Luxury"
  };

  if (labels[value]) return labels[value];

  return String(value)
    .replace(/-/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function escapeHtml(value) {
  if (value === null || value === undefined) return "";

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cssEscape(value) {
  if (window.CSS?.escape) {
    return window.CSS.escape(value);
  }

  return String(value).replace(/"/g, '\\"');
}



