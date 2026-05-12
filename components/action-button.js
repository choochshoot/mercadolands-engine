import { escapeHtml, safeUrl, toRegistryKey } from "../core/helpers.js";
import { getDefaultSubtitle, getIcon } from "../core/icons.js";

export function renderActionButton(button = {}) {
  const type = toRegistryKey(button.type, "link");

  return `
    <a href="${safeUrl(button.link)}" target="_blank" rel="noopener noreferrer" class="btn btn-${type}">
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

