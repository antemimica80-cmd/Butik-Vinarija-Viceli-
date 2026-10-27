// Copies the MapLibre web worker to /public so bundlers do not need to resolve it.
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const pkg = path.dirname(require.resolve("maplibre-gl/package.json"));
mkdirSync("public/vendor", { recursive: true });
copyFileSync(path.join(pkg, "dist/maplibre-gl-worker.mjs"), "public/vendor/maplibre-gl-worker.mjs");
console.log("Copied maplibre-gl-worker.mjs to public/vendor/");
