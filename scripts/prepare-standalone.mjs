import fs from "node:fs";
import path from "node:path";

// Next's standalone output intentionally leaves static assets and public/ out.
// Copy them next to server.js so `npm start` works without extra manual steps.
const root = process.cwd();
const standalone = path.join(root, ".next", "standalone");

if (!fs.existsSync(standalone)) {
  console.log("standalone output not found — skip");
  process.exit(0);
}

fs.cpSync(path.join(root, ".next", "static"), path.join(standalone, ".next", "static"), {
  recursive: true,
});
fs.cpSync(path.join(root, "public"), path.join(standalone, "public"), { recursive: true });

console.log("standalone: static assets and public/ copied");
