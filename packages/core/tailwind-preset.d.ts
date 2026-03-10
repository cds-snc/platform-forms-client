import type { Config } from "tailwindcss";

declare const preset: Pick<Config, "theme" | "plugins">;

export = preset;
