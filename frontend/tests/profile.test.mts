import { test } from "node:test";
import assert from "node:assert/strict";
import {
  displayName,
  fieldLabel,
  groupWarnings,
  profileStats,
  sectionAnchor,
  sectionForWarning,
} from "../src/lib/profile.ts";

test("displayName title-cases ALL CAPS names only", () => {
  assert.equal(displayName("MUHAMMAD ALEXANDER WIRYAWAN-SOEDJATMIKO"), "Muhammad Alexander Wiryawan-Soedjatmiko");
  assert.equal(displayName("Ana de Souza"), "Ana de Souza");
  assert.equal(displayName("   "), "Profil kamu");
  assert.equal(displayName(null), "Profil kamu");
});

test("fieldLabel turns backend paths into readable labels", () => {
  assert.equal(fieldLabel("experience[0].end_date"), "Pengalaman › #1 › tanggal selesai");
  assert.equal(fieldLabel("contact.phone"), "Kontak › Nomor telepon");
  assert.equal(fieldLabel("custom_field"), "custom field");
});

test("sectionForWarning maps the first path segment to a profile row", () => {
  assert.equal(sectionForWarning("contact.phone"), "contact");
  assert.equal(sectionForWarning("experience[2].title"), "experience");
  assert.equal(sectionForWarning("education"), "education");
  assert.equal(sectionForWarning("skills"), "skills");
  assert.equal(sectionForWarning("projects[0].link"), "projects");
  assert.equal(sectionForWarning("summary"), "summary");
  assert.equal(sectionForWarning("certifications[0]"), "other");
  assert.equal(sectionForWarning("languages"), "other");
  assert.equal(sectionForWarning("something_new"), "other");
});

test("groupWarnings keeps order inside each row", () => {
  const warnings = [
    { field: "contact.phone", message: "a" },
    { field: "experience[0].end_date", message: "b" },
    { field: "contact.email", message: "c" },
  ];
  const groups = groupWarnings(warnings);
  assert.deepEqual(groups.contact?.map((w) => w.message), ["a", "c"]);
  assert.deepEqual(groups.experience?.map((w) => w.message), ["b"]);
  assert.equal(groups.skills, undefined);
});

test("sectionAnchor builds a stable element id", () => {
  assert.equal(sectionAnchor("experience"), "section-experience");
});

test("profileStats counts the four headline sections", () => {
  const profile = {
    contact: { full_name: "A", other_links: [] },
    skills: [{ name: "Go" }, { name: "SQL" }],
    experience: [{ company: "X", title: "Y", is_current: false, bullets: [], skills_used: [] }],
    education: [],
    projects: [{ name: "P", technologies: [] }, { name: "Q", technologies: [] }, { name: "R", technologies: [] }],
    certifications: [],
    languages: [],
  };
  assert.deepEqual(profileStats(profile), [
    { label: "pengalaman", value: 1 },
    { label: "keahlian", value: 2 },
    { label: "proyek", value: 3 },
    { label: "pendidikan", value: 0 },
  ]);
});
