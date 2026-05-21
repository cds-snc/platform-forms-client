import html from "https://esm.sh/solid-js@1.9.9/html";

export function ModeSelector(props) {
  return html`
    <div class="mode-row">
      ${() =>
        props.modes.map(
          (mode) => html`
            <label class="mode-option">
              <input
                type="radio"
                name="mode"
                value=${mode.value}
                checked=${() => props.currentMode() === mode.value}
                onchange=${() => props.setCurrentMode(mode.value)}
              />
              <span>${mode.label}</span>
            </label>
          `
        )}
    </div>
  `;
}
