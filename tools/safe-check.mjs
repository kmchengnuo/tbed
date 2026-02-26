import { readdirSync, readFileSync, statSync } from "fs";
import path from "path";

const ROOT = process.cwd();
const SUSPICIOUS_IMPORTS = new Set([
  "http",
  "net",
  "tls",
  "dgram",
  "child_process",
  "fs",
  "fs/promises",
  "os",
]);
const SUSPICIOUS_STRINGS = [
  "169.254.169.254",
  "/proc/self/environ",
  ".aws/credentials",
];
const ALLOW_DIRS = new Set([
  "assets",
  "functions",
  "d1",
  "doc",
  "node_modules",
]);

function walk(dir, files = []) {
  const list = readdirSync(dir);
  for (const name of list) {
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      files.push(...walk(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

function isTextFile(file) {
  return /\.(mjs|cjs|js|ts|jsx|tsx|json|md|txt)$/i.test(file);
}

function checkFile(file) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  const top = rel.split("/")[0];
  if (top === "node_modules" || top === ".git" || top === "tools") {
    return { ok: true };
  }
  if (!ALLOW_DIRS.has(top) && isTextFile(file)) {
    if (rel.endsWith(".mjs")) {
      return { ok: false, reason: "unexpected_mjs_in_root", file: rel };
    }
  }
  if (!isTextFile(file)) return { ok: true };
  if (rel.endsWith("server.mjs")) {
    return { ok: false, reason: "blocked_file:server.mjs", file: rel };
  }
  const text = readFileSync(file, "utf8");
  const importBad = /from\s+["']([^"']+)["']|require\(\s*["']([^"']+)["']\s*\)/g;
  let m;
  while ((m = importBad.exec(text)) !== null) {
    const mod = (m[1] || m[2] || "").trim();
    if (SUSPICIOUS_IMPORTS.has(mod)) {
      return { ok: false, reason: `restricted_import:${mod}`, file: rel };
    }
  }
  for (const s of SUSPICIOUS_STRINGS) {
    if (text.includes(s)) {
      return { ok: false, reason: `restricted_literal:${s}`, file: rel };
    }
  }
  return { ok: true };
}

function main() {
  const files = walk(ROOT);
  const problems = [];
  for (const f of files) {
    const r = checkFile(f);
    if (!r.ok) problems.push(r);
  }
  if (problems.length) {
    console.error("安全拦截：发现可疑文件/代码：");
    for (const p of problems) {
      console.error(`- ${p.file} => ${p.reason}`);
    }
    console.error("请移除上述文件或代码后再继续。");
    process.exit(1);
  }
}

main();
