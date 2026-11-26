// One Word From Grandma — entrypoint.
// Writes exactly one word to entry.txt in the output directory.
// Gate (from RULES.txt): UTF-8 text, 1-30 characters, not only white space.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const WORD = "Toaster";
const MIN_CHARS = 1;
const MAX_CHARS = 30;

// Collect every gate violation for a candidate word instead of
// failing on the first one, so the error message shows all problems.
function gatherProblems(candidate: string): string[] {
  const problems: string[] = [];

  const charCount = [...candidate].length;
  if (charCount < MIN_CHARS) {
    problems.push(`too short: ${charCount} character(s), need at least ${MIN_CHARS}`);
  }
  if (charCount > MAX_CHARS) {
    problems.push(`too long: ${charCount} character(s), need at most ${MAX_CHARS}`);
  }

  // "Not only white space" — at least one non-whitespace character.
  if (!/\S/u.test(candidate)) {
    problems.push("word is empty or only white space");
  }

  // One word means no internal whitespace at all.
  if (/\s/u.test(candidate)) {
    problems.push("word contains white space; exactly one word is allowed");
  }

  // UTF-8 round-trip: encoding then decoding must give the same text.
  const roundTripped = Buffer.from(candidate, "utf8").toString("utf8");
  if (roundTripped !== candidate) {
    problems.push("word does not survive a UTF-8 encode/decode round-trip");
  }

  return problems;
}

function resolveOutputDir(): string {
  const override = process.env.MAKEFUN_OUTPUT_DIR;
  if (typeof override === "string" && override.trim() !== "") {
    return override;
  }
  return "/output";
}

function main(): void {
  const problems = gatherProblems(WORD);
  if (problems.length > 0) {
    console.error("Entry word failed the gate:");
    for (const problem of problems) {
      console.error(`  - ${problem}`);
    }
    process.exit(1);
  }

  const outDir = resolveOutputDir();
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, WORD, "utf8");

  // Guard: read the file back and prove the bytes on disk are exactly
  // the intended word — catches truncated writes, stray newlines, or
  // an output directory that silently swallowed the file.
  const onDisk = readFileSync(outPath, "utf8");
  const expectedBytes = Buffer.byteLength(WORD, "utf8");
  const actualBytes = Buffer.byteLength(onDisk, "utf8");
  if (onDisk !== WORD || actualBytes !== expectedBytes) {
    console.error(
      `Read-back check failed for ${outPath}: ` +
        `expected ${JSON.stringify(WORD)} (${expectedBytes} byte(s)), ` +
        `found ${JSON.stringify(onDisk)} (${actualBytes} byte(s))`,
    );
    process.exit(1);
  }

  console.log(
    `Wrote and verified ${[...WORD].length} character(s) ` +
      `(${expectedBytes} byte(s)) at ${outPath}`,
  );
}

main();
