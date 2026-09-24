// Pure text-cleanup helpers for job listing display: HTML entities and double-encoded UTF-8
// ("mojibake"). No imports, so `node --test` can load this file directly.

const ENTITY: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": "\"",
  "&#39;": "'",
  "&#x27;": "'",
  "&nbsp;": " ",
};

// Windows-1252 code points for bytes 0x80-0x9F, used to undo UTF-8 text that was decoded as cp1252.
// Bytes with no cp1252 glyph (0x81, 0x8D, 0x8F, 0x90, 0x9D) are written as \u escapes since they are
// otherwise invisible in source; the rest are the literal characters for readability.
export const CP1252 = "€\u0081‚ƒ„…†‡ˆ‰Š‹Œ\u008dŽ\u008f\u0090‘’“”•–—˜™š›œ\u009džŸ";

const MOJIBAKE_RUN = new RegExp(`[Â-ô][\u0080-¿${CP1252}]+`, "g");

function decodeRun(run: string): string {
  const bytes = Array.from(run, (ch) => {
    const code = ch.charCodeAt(0);
    return code <= 0xff ? code : 0x80 + CP1252.indexOf(ch);
  });
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(new Uint8Array(bytes));
  } catch {
    return run;
  }
}

function repairMojibake(value: string): string {
  return value.replace(MOJIBAKE_RUN, decodeRun);
}

// Source feeds sometimes ship HTML entities or double-encoded UTF-8; clean for display only.
export function cleanText(value: string): string {
  return repairMojibake(value).replace(/&(?:amp|lt|gt|quot|nbsp|#39|#x27);/g, (match) => ENTITY[match] ?? match);
}
