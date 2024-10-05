import { SELF } from "cloudflare:test";
import { describe, it, expect } from "vitest";

describe("remoji api", () => {
  it("responds to GET /:org/:id", async () => {
    const response = await SELF.fetch("https://example.com/example.com/abc");
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
