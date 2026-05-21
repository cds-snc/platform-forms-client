import html from "https://esm.sh/solid-js@1.9.9/html";

export function DirectorySection(props) {
  return html`
    <div>
      <div class="section-title">Directories</div>
      <div class="directory-list">
        ${() =>
          props.currentNode().directories.length === 0
            ? html`<div class="empty">No subdirectories here.</div>`
            : props
                .currentNode()
                .directories.map(
                  (directory) => html`
                    <button
                      type="button"
                      class="dir-button"
                      onclick=${() => props.setCurrentPath(directory.relativePath)}
                    >
                      ${directory.name}/
                    </button>
                  `
                )}
      </div>
    </div>
  `;
}
