import { renderActionButton } from "../components/action-button.js";
import { escapeHtml, safeUrl } from "../core/helpers.js";

export function render(data = {}) {
  const buttons = Array.isArray(data.buttons) ? data.buttons : [];

  return `
    <main class="mockup-bg">
      <article class="phone">
        <section class="screen">
          <div class="hero-pro">
            <div class="hero-text">
              <p class="intro">Hola, soy</p>
              <h1 class="name">${escapeHtml(data.profile?.name)}</h1>
              <div class="divider"></div>
              <p class="role">${escapeHtml(data.profile?.title)}</p>
              <p class="script">${escapeHtml(data.hero?.message)}</p>
            </div>

            <div class="hero-image">
              <img src="${safeUrl(data.profile?.photo)}" alt="${escapeHtml(data.profile?.name || "Profile")}">
            </div>
          </div>

          <div class="cta-box">
            ${buttons.map(renderActionButton).join("")}
          </div>

          <section class="about">
            <h2>Sobre mi</h2>
            <p>${escapeHtml(data.about?.text)}</p>
            <p class="cta-final">${escapeHtml(data.about?.cta || "Hablemos y trabajemos juntos")}</p>
          </section>
        </section>

        <footer class="footer">
          <div>
            <span aria-hidden="true">&#10003;</span>
            <small>Confianza</small>
          </div>
          <div>
            <span aria-hidden="true">&#9719;</span>
            <small>Respuesta rapida</small>
          </div>
          <div>
            <span aria-hidden="true">&#9733;</span>
            <small>Atencion personalizada</small>
          </div>
        </footer>
      </article>
    </main>
  `;
}
