import { createVerifierSourceOwner } from "./verifier-source-lifetime.mjs";

let implementation;

/** Load the development command owner and its canonical process source graph. */
export async function createVerifierCommands(options = {}) {
  return createVerifierSourceOwner(options, async (ownedOptions) => {
    implementation ??= import("tsx/esm/api").then(({ tsImport }) =>
      tsImport(
        new URL("./verifier-command-owner.mts", import.meta.url).href,
        import.meta.url,
      ),
    );
    const module = await implementation;
    return module.createVerifierCommands(ownedOptions);
  });
}
