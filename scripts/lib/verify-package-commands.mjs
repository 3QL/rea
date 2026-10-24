import { createRequire } from "node:module";
import { withVerifierCleanup } from "./verifier-cleanup.mjs";

let implementation;
let compiler;
let sourceScopes = 0;

/** Load the development owner as one source graph, only when commands are needed. */
export async function createPackageVerifierCommands(options) {
  // Reserve before loading: concurrent scopes share the compiler, including
  // later source imports made while verification is still running.
  sourceScopes++;
  let released = false;
  let adopted = false;
  const sourceOwner = {
    async close() {
      if (released) return;
      if (sourceScopes === 1) await compiler?.stop();
      sourceScopes--;
      released = true;
    },
  };
  return withVerifierCleanup(async () => {
    implementation ??= import("tsx/esm/api").then(({ tsImport }) => {
      const require = createRequire(import.meta.resolve("tsx/package.json"));
      compiler = require("esbuild");
      return tsImport(
        new URL("./package-command-owner.mts", import.meta.url).href,
        import.meta.url,
      );
    });
    const module = await implementation;
    const commands = await module.createPackageVerifierCommands({
      ...options,
      closeHooks: [...(options.closeHooks ?? []), () => sourceOwner.close()],
    });
    adopted = true;
    return commands;
  }, [() => (adopted ? undefined : sourceOwner.close())]);
}
