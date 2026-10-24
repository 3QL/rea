import { createRequire } from "node:module";
import { withVerifierCleanup } from "./verifier-cleanup.mjs";

let compiler;
let sourceScopes = 0;

/** Share the source compiler until every verifier command scope has closed. */
export async function createVerifierSourceOwner(options, create) {
  // Reserve before loading so one closing scope cannot stop a peer's import.
  sourceScopes++;
  let released = false;
  let adopted = false;
  const close = async () => {
    if (released) return;
    if (sourceScopes === 1) await compiler?.stop();
    sourceScopes--;
    released = true;
  };
  return withVerifierCleanup(async () => {
    compiler ??= createRequire(import.meta.resolve("tsx/package.json"))(
      "esbuild",
    );
    const owner = await create({
      ...options,
      closeHooks: [...(options?.closeHooks ?? []), close],
    });
    adopted = true;
    return owner;
  }, [() => (adopted ? undefined : close())]);
}
