// Next.js static export writes route payloads to nested files such as
//   templates/__next.templates/__PAGE__.txt
// but the client requests the same payload with dots instead of slashes:
//   templates/__next.templates.__PAGE__.txt
// On a plain static host the second path 404s, so every prefetch fails and every navigation falls back to a
// full page load. This script copies each nested file to the path the client asks for. Run after `next build`.
import { readdirSync, copyFileSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

const OUT = "out";
if (!existsSync(OUT)) {
  console.error("fix-rsc-paths: no ./out folder; run the build first");
  process.exit(1);
}

let copied = 0;

function walkFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walkFiles(p) : [p];
  });
}

function visit(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (!statSync(p).isDirectory() || name === "_next") continue;
    if (name.startsWith("__next.")) {
      for (const file of walkFiles(p)) {
        const flat = `${name}.${relative(p, file).split(sep).join(".")}`;
        copyFileSync(file, join(dir, flat));
        copied++;
      }
    } else {
      visit(p);
    }
  }
}

visit(OUT);
console.log(`fix-rsc-paths: added ${copied} flattened route payload files`);
