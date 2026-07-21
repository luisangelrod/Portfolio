import test from "node:test";
import assert from "node:assert/strict";
import handler from "../netlify/functions/evaluate.mjs";

test("the evaluation endpoint rejects non-POST requests", async () => {
  const response = await handler(new Request("http://localhost/api/evaluate", { method: "GET" }));
  assert.equal(response.status, 405);
  const payload = await response.json();
  assert.equal(payload.error.code, "METHOD_NOT_ALLOWED");
});

test("the evaluation endpoint fails transparently when no server key is configured", async () => {
  const previous = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    const response = await handler(new Request("http://localhost/api/evaluate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({})
    }));
    assert.equal(response.status, 503);
    const payload = await response.json();
    assert.equal(payload.error.code, "MODEL_NOT_CONFIGURED");
  } finally {
    if (previous) process.env.OPENAI_API_KEY = previous;
  }
});
