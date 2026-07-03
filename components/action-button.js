import { escapeHtml, safeUrl, toRegistryKey } from "../core/helpers.js";
import { getDefaultSubtitle, getIcon } from "../core/icons.js";

export function renderActionButton(button = {}) {
  const type = toRegistryKey(button.type, "link");
  const link = safeUrl(button.link);
  const targetAttrs = isInternalLink(button.link)
    ? ""
    : ' target="_blank" rel="noopener noreferrer"';
  const extraClass = normalizeClassNames(button.className);
  const classes = ["btn", `btn-${type}`, extraClass].filter(Boolean).join(" ");

  return `
    <a href="${link}"${targetAttrs} class="${classes}">
      <div class="btn-left">
        <span class="icon">${getIcon(type)}</span>
        <div>
          <small>${escapeHtml(button.subtitle || getDefaultSubtitle(type))}</small>
          <div>${escapeHtml(button.label)}</div>
        </div>
      </div>
      <span class="arrow" aria-hidden="true">&rsaquo;</span>
    </a>
  `;
}

function normalizeClassNames(value = "") {
  return String(value)
    .split(/\s+/)
    .map((className) => className.trim())
    .filter((className) => /^[a-zA-Z0-9_-]+$/.test(className))
    .join(" ");
}

function isInternalLink(link = "") {
  return String(link).trim().startsWith("#");
}
