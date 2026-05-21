import html from "https://esm.sh/solid-js@1.9.9/html";

export function FileSection(props) {
  return html`
    <div>
      <div class="section-title">Files</div>
      <div class="file-list">
        ${() =>
          props.currentNode().files.length === 0
            ? html`<div class="empty">No Playwright specs in this directory.</div>`
            : props.currentNode().files.map(
                (file) => html`
                  <label class="file-item">
                    <input
                      type="checkbox"
                      checked=${() => props.selectedFiles().includes(file)}
                      onchange=${() => props.toggleFile(file)}
                    />
                    <span class="selected-path">${file}</span>
                  </label>
                `
              )}
      </div>
    </div>
  `;
}
