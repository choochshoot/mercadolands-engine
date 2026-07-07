const THEME_ASSET_VERSION = "20260706-category-hero-v5";

const themes = {
  "green-gold": "green-gold.css",
  "rose-gold": "rose-gold.css",
  "rosa-neon-lux": "rosa-neon-lux.css",
  "dark-luxury": "dark-luxury.css",
  "estate-luxury": "estate-luxury.css",
  minimal: "minimal.css",
  glassmorphism: "glassmorphism.css"
};

export function resolveTheme(themeName) {
  return themes[themeName] ? themeName : "green-gold";
}

export function loadTheme(themeName) {
  const theme = resolveTheme(themeName);
  const existing = document.getElementById("mercadolands-theme");
  const href = new URL(`../themes/${themes[theme]}?v=${THEME_ASSET_VERSION}`, import.meta.url).href;

  if (existing) {
    existing.href = href;
    return theme;
  }

  const link = document.createElement("link");
  link.id = "mercadolands-theme";
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);

  return theme;
}

export function getAvailableThemes() {
  return Object.keys(themes);
}
