import html from "https://esm.sh/solid-js@1.9.9/html";

export function SelectedSpecsPanel(props) {
  return html`
    <aside class="panel">
      <div class="section-title">Selected specs</div>
      <div class="selected-list">
        ${() =>
          props.orderedFiles().length === 0
            ? html`<div class="empty">No tests selected yet.</div>`
            : props.orderedFiles().map(
                (file) => html`
                  <label class="file-item">
                    <input
                      type="checkbox"
                      checked=${true}
                      onchange=${() => props.toggleFile(file)}
                    />
                    <span class="selected-path">${file}</span>
                  </label>
                `
              )}
      </div>

      <div class="command-panel">
        <div class="command-copy-row">
          <div class="command-label">Reusable command</div>
          <button
            class="copy-button"
            type="button"
            onclick=${props.copyCommand}
            disabled=${() => props.orderedFiles().length === 0}
          >
            Copy command
          </button>
        </div>
        <pre class="command-preview">${() => "$ " + props.command()}</pre>
      </div>

      <button class="run-button" type="button" onclick=${props.runTests}>Run selected tests</button>
      <div class=${() => (props.status().kind === "success" ? "status success" : "status")}>
        ${() => props.status().message}
      </div>
    </aside>
  `;
}
