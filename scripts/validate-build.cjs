const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const ignoredDirs = new Set([".git", "node_modules", "venv", "__pycache__"]);
const requiredFiles = [
  "index.html",
  "404.html",
  "u/index.html",
  "admin.html",
  "app.js",
  "config.js",
  "style.css",
  "core/render.js",
  "core/template-registry.js",
  "core/theme-registry.js",
  "templates/dermatology.js",
  "themes/rosa-neon-lux.css",
  "contracts/vanessa-gonzalez.json",
  "share/vanessa-gonzalez.html",
  ".nojekyll"
];

function walk(dir, extension, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, extension, results);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(extension)) {
      results.push(fullPath);
    }
  }

  return results;
}

function rel(filePath) {
  return path.relative(root, filePath).replace(/\\/g, "/");
}

function assertFile(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing required file: ${relativePath}`);
  }
}

function validateJson(filePath) {
  JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function validateJavascript(filePath) {
  execFileSync(process.execPath, ["--check", filePath], { stdio: "pipe" });
}

function validateVanessaAssets() {
  const contractPath = path.join(root, "contracts", "vanessa-gonzalez.json");
  if (!fs.existsSync(contractPath)) return;

  const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
  const missing = [];

  function visit(value) {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (value && typeof value === "object") {
      Object.values(value).forEach(visit);
      return;
    }

    if (typeof value !== "string") return;
    if (!value.startsWith("../share/assets/vanessa-gonzalez/")) return;

    const localPath = path.normalize(path.join(root, "u", value));
    if (!fs.existsSync(localPath)) missing.push(value);
  }

  visit(contract);

  if (missing.length) {
    throw new Error(`Missing Vanessa asset references:\n${missing.join("\n")}`);
  }
}

try {
  requiredFiles.forEach(assertFile);

  for (const jsonFile of walk(root, ".json")) {
    validateJson(jsonFile);
  }

  for (const jsFile of walk(root, ".js")) {
    validateJavascript(jsFile);
  }

  for (const cjsFile of walk(root, ".cjs")) {
    validateJavascript(cjsFile);
  }

  validateVanessaAssets();

  console.log("Build validation passed.");
  console.log(`Checked ${walk(root, ".js").length} JS files and ${walk(root, ".json").length} JSON files.`);
} catch (error) {
  console.error("Build validation failed.");
  console.error(error.message || error);
  process.exit(1);
}