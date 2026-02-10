#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const redirectPath = join(__dirname, "..", "_redirects");
const PADDING = 10;

const contents = readFileSync(redirectPath, "utf8");
const lines = contents.split("\n");

interface Entry {
  path: string;
  destination: string;
}

const entries: Entry[] = [];
let catchAll: Entry | null = null;

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed) continue;

  const match = trimmed.match(/^(\S+)\s+(.+)$/);
  if (!match) continue;

  const [, path, destination] = match;
  if (path === "/*" || path === "/") {
    catchAll = { path, destination };
  } else {
    entries.push({ path, destination });
  }
}

entries.sort((a, b) =>
  a.path.localeCompare(b.path, undefined, { sensitivity: "base" }),
);

const longest = Math.max(
  ...entries.map((e) => e.path.length),
  catchAll ? catchAll.path.length : 0,
);
const width = longest + PADDING;

const formatted = [
  ...entries.map((e) => `${e.path.padEnd(width)}${e.destination}`),
  ...(catchAll
    ? [`${catchAll.path.padEnd(width)}${catchAll.destination}`]
    : []),
].join("\n");

writeFileSync(redirectPath, formatted + "\n\n");
console.log("Formatted _redirects");
