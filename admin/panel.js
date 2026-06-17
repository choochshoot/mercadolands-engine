import { getAvailableTemplates } from "../core/template-registry.js";
import { getAvailableThemes } from "../core/theme-registry.js";

const STORAGE_BUCKET = "landing-assets";

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
  els.fields.addEventListener("input", updatePreview);
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

  return structuredClone(FALLBACK_CONTRACTS[template] || FALLBACK_CONTRACTS.creator);
}

function renderDynamicFields() {
  const editableData = { ...state.data };
  delete editableData.template;
  delete editableData.theme;

  els.fields.innerHTML = Object.entries(editableData)
    .map(([key, value]) => renderGroup(key, value, key))
    .join("");
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
        <label>${toTitle(key)}</label>
        <textarea data-path="${path}">${inputValue}</textarea>
      </div>
    `;
  }

  return `
    <div class="field-row">
      <label>${toTitle(key)}</label>
      <input data-path="${path}" value="${inputValue}">
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

  return `
    <div class="field-row asset-row">
      <label>${toTitle(key)}</label>
      <div class="asset-control">
        <input data-path="${path}" value="${inputValue}" placeholder="URL de imagen o video">
        <label class="asset-upload-btn">
          Subir archivo
          <input type="file" accept="image/png,image/jpeg,image/webp,image/heic,image/gif,video/webm,video/mp4" data-upload-path="${path}">
        </label>
      </div>
      ${value ? `
        <div class="asset-preview">
          ${isVideoUrl(value) ? `
            <video src="${inputValue}" muted loop playsinline controls></video>
          ` : `
            <img src="${inputValue}" alt="${escapeHtml(toTitle(key))}">
          `}
        </div>
      ` : ""}
    </div>
  `;
}

function handleDynamicClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const path = button.dataset.path;

  if (button.dataset.action === "add") {
    addArrayItem(path);
  }

  if (button.dataset.action === "remove") {
    removeArrayItem(path);
  }

  renderDynamicFields();
  updatePreview();
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
    state.data = {
      ...structuredClone(state.contract),
      ...(data.data || {}),
      template,
      theme
    };

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
    validateAssetFile(file);
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

function validateAssetFile(file) {
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

  if (!isImage && !isVideo) {
    throw new Error("Formato no permitido. Usa PNG, JPG, WEBP, HEIC, GIF, WEBM o MP4.");
  }

  const maxMB = isVideo ? 20 : 5;

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

function isAssetField(key, path) {
  const fieldName = String(key || path.split(".").pop()).toLowerCase();
  const fullPath = String(path || "").toLowerCase();

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

function isVideoUrl(value) {
  return /\.(webm|mp4)(\?|#|$)/i.test(String(value || ""));
}

function cleanSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toTitle(value) {
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

