export function getSlug() {
  const params = new URLSearchParams(window.location.search);
  const slug = normalizeSlug(params.get("slug"));

  if (slug && params.get("slug") !== slug) {
    params.set("slug", slug);
    const nextUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
    window.history.replaceState(null, "", nextUrl);
  }

  return slug;
}

export function normalizeSlug(value) {
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

export function escapeHtml(value) {
  if (value === null || value === undefined) return "";

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function safeUrl(value) {
  if (!value) return "";

  const url = String(value).trim();
  const allowedPrefixes = ["https://", "http://", "mailto:", "tel:"];

  const allowedRelativePrefixes = ["../share/assets/", "./share/assets/", "share/assets/"];

  if (
    url.startsWith("#") ||
    allowedPrefixes.some((prefix) => url.startsWith(prefix)) ||
    allowedRelativePrefixes.some((prefix) => url.startsWith(prefix))
  ) {
    return escapeHtml(url);
  }

  return "";
}

export function toRegistryKey(value, fallback) {
  const key = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");

  return key || fallback;
}
