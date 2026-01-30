#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const rootDir = process.cwd();
const packagePath = join(rootDir, "package.json");
const manifestPath = join(rootDir, "manifest.json");

const checkOnly = process.argv.includes("--check");

try {
  const packageJson = JSON.parse(readFileSync(packagePath, "utf-8"));
  const manifestJson = JSON.parse(readFileSync(manifestPath, "utf-8"));

  const packageVersion = packageJson.version;
  const manifestVersion = manifestJson.version;

  if (packageVersion === manifestVersion) {
    console.log(`Versions are in sync: ${packageVersion}`);
    process.exit(0);
  }

  if (checkOnly) {
    console.error(`Version mismatch!`);
    console.error(`  package.json:  ${packageVersion}`);
    console.error(`  manifest.json: ${manifestVersion}`);
    process.exit(1);
  }

  // Sync package.json version to manifest.json
  manifestJson.version = packageVersion;
  writeFileSync(manifestPath, JSON.stringify(manifestJson, null, 2) + "\n");

  console.log(
    `Updated manifest.json version: ${manifestVersion} -> ${packageVersion}`
  );
  process.exit(0);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
