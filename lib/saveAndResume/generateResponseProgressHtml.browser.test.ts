import { afterEach, describe, expect, it, vi } from "vitest";
import { embedBrandLogoAssets } from "./generateResponseProgressHtml";

describe("embedBrandLogoAssets", () => {
  afterEach(() => vi.restoreAllMocks());

  it("embeds SVG logos as vector data URIs without base64 encoding", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 792 64"><path d="M0 0h792v64H0z"/></svg>',
        { headers: { "content-type": "image/svg+xml" } }
      )
    );

    const html = await embedBrandLogoAssets(
      '<html><body><div class="gcds-signature"><img src="/logo.svg" alt="Logo"></div></body></html>'
    );

    expect(html).toContain("max-width: min(400px, 100%)");
    expect(html).toContain("max-height: 80px");
    expect(html).toContain("data:image/svg+xml;charset=utf-8,%3Csvg");
    expect(html).not.toContain("base64");
    const embeddedSvg = decodeURIComponent(html.match(/src="data:image\/svg\+xml;charset=utf-8,([^"]+)"/)![1]);
    expect(embeddedSvg).toContain('width="792"');
    expect(embeddedSvg).toContain('height="64"');

    const image = new Image();
    image.src = new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector<HTMLImageElement>("img")!.src;
    await new Promise<void>((resolve) => {
      image.onload = () => resolve();
      image.onerror = () => resolve();
    });
    expect(image.naturalWidth).toBeGreaterThan(0);
  });

  it("embeds raster brand logos as data URIs", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(new Uint8Array([1, 2, 3]), {
        headers: { "content-type": "image/png" },
      })
    );

    const html = await embedBrandLogoAssets(
      '<html><body><div class="gcds-signature"><img src="/logo.png" alt="Logo"></div></body></html>'
    );

    expect(html).toContain("src=\"data:image/png;base64,");
  });

  it("preserves SVGs that already have intrinsic dimensions", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="20" viewBox="0 0 100 20"><path d="M0 0h100v20H0z"/></svg>',
        { headers: { "content-type": "image/svg+xml" } }
      )
    );

    const html = await embedBrandLogoAssets(
      '<html><body><div class="gcds-signature"><img src="/logo.svg" alt="Logo"></div></body></html>'
    );

    const embeddedSvg = decodeURIComponent(html.match(/src="data:image\/svg\+xml;charset=utf-8,([^"]+)"/)![1]);
    expect(embeddedSvg).toContain('width="100"');
    expect(embeddedSvg).toContain('height="20"');
  });
});
