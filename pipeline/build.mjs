import { build } from "esbuild";
import { solidPlugin } from "esbuild-plugin-solid";

// ASVS 15.2.3: bundle only the application entry, never developer/test tooling.
await build({
  entryPoints: [process.argv[2] ?? "src/main.tsx"],
  bundle: true,
  format: "esm",
  target: "es2020",
  platform: "browser",
  minify: true,
  sourcemap: true,
  outfile: "dist/main.js",
  plugins: [solidPlugin()],
});
