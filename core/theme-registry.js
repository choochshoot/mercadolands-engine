const themes = {
  "green-gold": "green-gold.css",
  "rose-gold": "rose-gold.css",
  "dark-luxury": "dark-luxury.css",
  minimal: "minimal.css"
};

export function resolveTheme(themeName) {
  return themes[themeName] ? themeName : "green-gold";
}

export function loadTheme(themeName) {
  const theme = resolveTheme(themeName);
  const existing = document.getElementById("mercadolands-theme");
  const href = new URL(`../themes/${themes[theme]}`, import.meta.url).href;

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

