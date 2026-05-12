const icons = {
  whatsapp: `
    <svg viewBox="0 0 24 24" class="icon-svg" aria-hidden="true">
      <path fill="currentColor" d="M12 2a10 10 0 0 0-8.7 15l-1.3 4.7 4.8-1.2A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.2-1.2l-.3-.2-2.8.7.7-2.7-.2-.3A8 8 0 1 1 12 20zm4.3-5.5c-.2-.1-1.2-.6-1.4-.7s-.3-.1-.4.1-.5.7-.6.8-.2.2-.4.1a6.6 6.6 0 0 1-2-1.2 7.3 7.3 0 0 1-1.3-1.6c-.1-.2 0-.3.1-.4.1-.1.2-.3.3-.4s.1-.2.2-.3 0-.2 0-.3-.4-1-.5-1.4-.3-.3-.4-.3h-.3c-.1 0-.3 0-.4.2s-.6.6-.6 1.4.6 1.6.7 1.7 1.2 1.8 2.9 2.6 1.7.5 2 .5.9-.4 1-.8.1-.8.1-.8-.2-.1-.4-.2z"/>
    </svg>`,
  instagram: `
    <svg viewBox="0 0 24 24" class="icon-svg" aria-hidden="true">
      <path fill="currentColor" d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm10 2c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3h10zm-5 3.2A4.8 4.8 0 1 0 16.8 12 4.8 4.8 0 0 0 12 7.2zm0 7.6A2.8 2.8 0 1 1 14.8 12 2.8 2.8 0 0 1 12 14.8zM17.5 6.5a1 1 0 1 0 1 1 1 1 0 0 0-1-1z"/>
    </svg>`,
  email: `
    <svg viewBox="0 0 24 24" class="icon-svg" aria-hidden="true">
      <path fill="currentColor" d="M2 4h20v16H2V4zm10 7L4 6v12h16V6l-8 5z"/>
    </svg>`,
  phone: `
    <svg viewBox="0 0 24 24" class="icon-svg" aria-hidden="true">
      <path fill="currentColor" d="M6.6 10.8a15.8 15.8 0 0 0 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.2 1.3.4 2.7.7 4.1.7.7 0 1.3.6 1.3 1.3v3.5c0 .7-.6 1.3-1.3 1.3C10.4 21.8 2.2 13.6 2.2 3.3 2.2 2.6 2.8 2 3.5 2H7c.7 0 1.3.6 1.3 1.3 0 1.4.2 2.8.7 4.1.1.4 0 .9-.3 1.2l-2.1 2.2z"/>
    </svg>`,
  map: `
    <svg viewBox="0 0 24 24" class="icon-svg" aria-hidden="true">
      <path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/>
    </svg>`,
  menu: `
    <svg viewBox="0 0 24 24" class="icon-svg" aria-hidden="true">
      <path fill="currentColor" d="M4 5h16v2H4V5zm0 6h16v2H4v-2zm0 6h16v2H4v-2z"/>
    </svg>`
};

export function getIcon(type) {
  return icons[type] || "";
}

export function getDefaultSubtitle(type) {
  const subtitles = {
    whatsapp: "ESCRIBEME POR",
    instagram: "SIGUEME EN",
    email: "ESCRIBEME UN",
    phone: "LLAMA AHORA",
    map: "COMO LLEGAR",
    menu: "VER OPCIONES"
  };

  return subtitles[type] || "";
}
