import { SELF, env } from "cloudflare:test";
import { describe, it, expect } from "vitest";

declare module "cloudflare:test" {
  interface ProvidedEnv {
    DB: D1Database;
  }
}

describe("remoji api", () => {
  it.only("responds to GET /:org/:id", async () => {
    const schema = `
CREATE TABLE IF NOT EXISTS reactions
    (id INTEGER PRIMARY KEY, org TEXT, instanceId TEXT, emoji TEXT, count INTEGER);`;
    await env.DB.prepare(schema).run();

    const sql = `INSERT INTO reactions 
    (id, org, instanceId, emoji, count) VALUES 
        (1, '127.0.0.1:8080', 'abcd', '😄', 2);`;
    await env.DB.prepare(sql).run();
    const response = await SELF.fetch(
      "https://example.com/127.0.0.1:8080/abcd"
    );
    expect(await response.json()).toStrictEqual({
      "😄": {
        count: 2,
      },
    });
  });

  it("responds to POST /:org/:id", async () => {
    const response = await SELF.fetch("https://example.com/example.com/abc", {
      method: "POST",
      body: JSON.stringify({
        emoji: "😄",
        action: "decrement",
      }),
    });
    expect(await response.json()).toStrictEqual({
      "😄": {
        count: 1,
      },
    });
  });

  it("responds to POST /:org/:id", async () => {
    const response = await SELF.fetch("https://example.com/example.com/abc", {
      method: "POST",
      body: JSON.stringify({
        emoji: "😄",
        action: "increment",
      }),
    });
    expect(await response.json()).toStrictEqual({
      "😄": {
        count: 2,
      },
    });
  });
});
