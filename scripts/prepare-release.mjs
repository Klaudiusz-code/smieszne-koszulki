import { cpSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const projectRoot = process.cwd();
const buildDir = join(projectRoot, "build");

rmSync(buildDir, { recursive: true, force: true });
mkdirSync(join(buildDir, "public", "_next", "static"), { recursive: true });

cpSync(join(projectRoot, ".next", "standalone"), buildDir, { recursive: true });
cpSync(join(projectRoot, "package.json"), join(buildDir, "package.json"));
cpSync(join(projectRoot, "public"), join(buildDir, "public"), { recursive: true });
cpSync(
  join(projectRoot, ".next", "static"),
  join(buildDir, "public", "_next", "static"),
  { recursive: true },
);

console.log(`Pakiet produkcyjny przygotowany w ${buildDir}`);
