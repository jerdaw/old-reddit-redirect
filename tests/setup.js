import { readFileSync } from "fs";
import { join } from "path";

export function loadJSON(filename) {
  const filepath = join(process.cwd(), filename);
  return JSON.parse(readFileSync(filepath, "utf-8"));
}

export function loadRules() {
  return loadJSON("rules.json");
}

export function loadManifest() {
  return loadJSON("manifest.json");
}
