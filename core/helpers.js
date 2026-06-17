export function getSlug() {
  const params = new URLSearchParams(window.location.search);
  return params.get("slug");
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

  if (url.startsWith("#") || allowedPrefixes.some((prefix) => url.startsWith(prefix))) {
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
