import html from "https://esm.sh/solid-js@1.9.9/html";

export function Breadcrumbs(props) {
  return html`
    <div class="breadcrumbs">
      <button
        type="button"
        class=${() => "crumb" + (props.currentPath() === "" ? " active" : "")}
        onclick=${() => props.setCurrentPath("")}
      >
        tests/e2e
      </button>
      ${() =>
        props.relativeSegments(props.currentPath()).map((part, index, parts) => {
          const nextPath = parts.slice(0, index + 1).join("/");
          return html`
            <button
              type="button"
              class=${() => "crumb" + (props.currentPath() === nextPath ? " active" : "")}
              onclick=${() => props.setCurrentPath(nextPath)}
            >
              ${part}
            </button>
          `;
        })}
    </div>
  `;
}
