import { test } from "node:test";
import assert from "node:assert/strict";
import { CP1252, cleanText } from "../src/lib/text.ts";

test("decodes HTML entities", () => {
  assert.equal(cleanText("VP Pricing &amp; Packaging"), "VP Pricing & Packaging");
});

test("repairs UTF-8 mistakenly decoded as cp1252 (mojibake)", () => {
  assert.equal(
    cleanText("JumpCloudÂ® is hiring. Weâ€™re here"),
    "JumpCloud® is hiring. We’re here"
  );
  assert.equal(
    cleanText("naÃ¯ve and ðŸ‘‡ ok"),
    "naïve and \u{1f447} ok"
  );
});

test("leaves already-correct UTF-8 text unchanged", () => {
  assert.equal(cleanText("São Paulo"), "São Paulo");
});

test("cp1252 table covers all 32 byte values 0x80-0x9F", () => {
  assert.equal(CP1252.length, 32);
});
