import { test } from "node:test";
import assert from "node:assert/strict";
import { isPublicPath } from "../src/lib/routes.ts";

test("only the landing page and login are public", () => {
  for (const path of ["/", "/login"]) assert.equal(isPublicPath(path), true, path);
  for (const path of ["/jobs", "/design-preview", "/login/extra", "/loginx", ""]) {
    assert.equal(isPublicPath(path), false, path);
  }
});
