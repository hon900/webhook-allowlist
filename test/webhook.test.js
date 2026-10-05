import assert from "node:assert/strict";
import { test } from "node:test";
import { createWebhookGuard, HostfenceError } from "../src/index.js";

const publicDns = async () => ["1.1.1.1"];

test("validates exact allowlisted callbacks through a custom resolver", async () => {
  const guard = createWebhookGuard({ allowedHosts: ["hooks.example.com"], lookup: publicDns });
  assert.equal((await guard.validate("https://hooks.example.com/events")).pathname, "/events");
  await assert.rejects(guard.validate("https://child.hooks.example.com/"), HostfenceError);
});

test("forwards protocol and CIDR restrictions", async () => {
  const guard = createWebhookGuard({ protocols: ["https"], extraDeniedCidrs: ["1.1.1.0/24"], lookup: publicDns });
  await assert.rejects(guard.validate("http://8.8.8.8/"), HostfenceError);
  await assert.rejects(guard.validate("https://hooks.example.com/"), HostfenceError);
  assert.equal((await guard.validate("https://8.8.8.8/")).hostname, "8.8.8.8");
});

test("an allowlisted name cannot bypass private DNS rejection", async () => {
  const guard = createWebhookGuard({ allowedHosts: ["hooks.example.com"], lookup: async () => ["10.0.0.1"] });
  const result = await guard.check("https://hooks.example.com/");
  assert.equal(result.ok, false);
  assert.deepEqual(result.addresses, ["10.0.0.1"]);
  assert.ok(result.reasons.length > 0);
  await assert.rejects(guard.validate("https://hooks.example.com/"), HostfenceError);
});

test("credentials remain forbidden even when policy tries to enable them", async () => {
  const guard = createWebhookGuard({ allowCredentials: true });
  const url = "https://user:secret@1.1.1.1/callback";
  assert.equal((await guard.check(url)).ok, false);
  await assert.rejects(guard.validate(url), HostfenceError);
});

test("check returns structured success and still rejects malformed input", async () => {
  const guard = createWebhookGuard();
  const result = await guard.check("https://1.1.1.1/callback");
  assert.equal(result.ok, true);
  assert.equal(result.url.pathname, "/callback");
  assert.deepEqual(result.addresses, ["1.1.1.1"]);
  assert.deepEqual(result.reasons, []);
  await assert.rejects(guard.check("not a URL"), { code: "HOSTFENCE_INVALID_URL" });
});
