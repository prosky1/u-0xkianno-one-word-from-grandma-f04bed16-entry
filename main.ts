// One Word From Grandma — entry program.
// Writes the single word Grandma would text about AI to /output/entry.txt.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const WORD = "Witchcraft";

// Gate: the scorer only accepts UTF-8 text of 1 to 30 characters that is
// not only white space, so refuse to write anything that would fail it.
if (WORD.length < 1 || WORD.length > 30 || WORD.trim().length === 0) {
  throw new Error(`word fails the gate: ${JSON.stringify(WORD)}`);
}

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", WORD, "utf8");

// Read back and confirm the written file is byte-identical to the word.
const written = readFileSync("/output/entry.txt", "utf8");
if (written !== WORD) {
  throw new Error(`entry.txt mismatch: wrote ${JSON.stringify(WORD)}, read back ${JSON.stringify(written)}`);
}
console.log(`Wrote one word (${WORD.length} characters) to /output/entry.txt`);
