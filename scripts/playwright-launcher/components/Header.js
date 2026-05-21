import html from "https://esm.sh/solid-js@1.9.9/html";

export function Header() {
  return html`
    <div class="header">
      <div class="eyebrow">Local Playwright Runner</div>
      <h1 class="title">Playwright Launcher</h1>
      <p class="subtitle">
        Browse your e2e tree, select specs, copy the exact rerun command, and launch the same local
        Playwright flows you already use.
      </p>
    </div>
  `;
}
