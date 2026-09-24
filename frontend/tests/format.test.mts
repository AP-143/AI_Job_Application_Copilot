import { test } from "node:test";
import assert from "node:assert/strict";
import { ageLabel, daysAgo, isFresh, timeAgo } from "../src/lib/format.ts";

const NOW = Date.parse("2026-09-24T12:00:00Z");
const hoursBefore = (hours: number) => new Date(NOW - hours * 3_600_000).toISOString();

test("daysAgo counts whole days and rejects bad input", () => {
  assert.equal(daysAgo(hoursBefore(5), NOW), 0);
  assert.equal(daysAgo(hoursBefore(30), NOW), 1);
  assert.equal(daysAgo(hoursBefore(24 * 9 + 1), NOW), 9);
  assert.equal(daysAgo(new Date(NOW + 3_600_000).toISOString(), NOW), 0);
  assert.equal(daysAgo(null, NOW), null);
  assert.equal(daysAgo("not a date", NOW), null);
});

test("ageLabel names today and yesterday", () => {
  assert.equal(ageLabel(0), "Hari ini");
  assert.equal(ageLabel(1), "Kemarin");
  assert.equal(ageLabel(12), "12 hari lalu");
});

test("timeAgo uses the largest whole unit", () => {
  assert.equal(timeAgo(new Date(NOW - 20_000).toISOString(), NOW), "baru saja");
  assert.equal(timeAgo(new Date(NOW - 5 * 60_000).toISOString(), NOW), "5 menit lalu");
  assert.equal(timeAgo(hoursBefore(2), NOW), "2 jam lalu");
  assert.equal(timeAgo(hoursBefore(26), NOW), "kemarin");
  assert.equal(timeAgo(hoursBefore(24 * 3), NOW), "3 hari lalu");
  assert.equal(timeAgo(undefined, NOW), null);
});

test("isFresh keeps the last 30 days and undated listings", () => {
  assert.equal(isFresh({ posted_at: hoursBefore(24 * 29), fetched_at: hoursBefore(1) }, NOW), true);
  assert.equal(isFresh({ posted_at: hoursBefore(24 * 31), fetched_at: hoursBefore(1) }, NOW), false);
  assert.equal(isFresh({ posted_at: null, fetched_at: hoursBefore(24 * 31) }, NOW), false);
  assert.equal(isFresh({ posted_at: "garbage", fetched_at: hoursBefore(1) }, NOW), true);
});
