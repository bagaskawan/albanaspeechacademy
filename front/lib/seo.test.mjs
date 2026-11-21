import assert from "node:assert/strict";
import test from "node:test";
import { buildHomeJsonLd, buildProgramJsonLd, serializeJsonLd, SITE_URL } from "./seo.ts";

test("home schema identifies the site and academy with absolute URLs", () => {
  const graph = JSON.parse(serializeJsonLd(buildHomeJsonLd()))["@graph"];
  assert.equal(graph[0]["@id"], `${SITE_URL}/#website`);
  assert.equal(graph[0].publisher["@id"], graph[1]["@id"]);
  assert.equal(graph[1].logo.url, `${SITE_URL}/seo/logo-512.png`);
  assert.ok(graph[1].sameAs.every((url) => URL.canParse(url)));
});

test("program schema matches the available program facts", () => {
  const input = { slug: "public-speaking-series", title: "Public Speaking Series", description: "Latihan", topics: ["MC"] };
  const course = buildProgramJsonLd(input)["@graph"];
  assert.equal(course[0]["@type"], "BreadcrumbList");
  assert.equal(course[1]["@type"], "Course");
  assert.deepEqual(course[1].teaches, ["MC"]);
  assert.ok(!("offers" in course[1] || "startDate" in course[1] || "aggregateRating" in course[1]));
  assert.equal(buildProgramJsonLd({ ...input, topics: [] })["@graph"][1]["@type"], "WebPage");
  assert.equal(buildProgramJsonLd({ ...input, slug: "inhouse-training" })["@graph"][1]["@type"], "Service");
});

test("JSON-LD serialisation prevents a script tag from ending the block", () => {
  const json = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
  assert.ok(!json.includes("<"));
  assert.equal(JSON.parse(json).name, "</script><script>alert(1)</script>");
});
