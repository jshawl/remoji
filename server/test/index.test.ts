import { SELF } from "cloudflare:test";
import { describe, it, expect } from "vitest";

describe("remoji api", () => {
  it("responds to GET /:org/:id", async () => {
    const response = await SELF.fetch(
      "https://example.com/127.0.0.1:8080/abcd"
    );
    expect(await response.json()).toStrictEqual({
      "👀": {
        count: 1,
      },
      "😄": {
        count: 2,
      },
    });
  });

  it("responds to POST /:org/:id", async () => {
    await SELF.fetch("https://example.com/127.0.0.1:8080/abcd", {
      method: "POST",
      body: JSON.stringify({
        emoji: "😄",
        action: "decrement",
      }),
    });
    const response = await SELF.fetch(
      "https://example.com/127.0.0.1:8080/abcd"
    );
    expect(await response.json()).toStrictEqual({
      "👀": {
        count: 1,
      },
      "😄": {
        count: 1,
      },
    });
  });

  it("responds to POST /:org/:id", async () => {
    await SELF.fetch("https://example.com/127.0.0.1:8080/abcd", {
      method: "POST",
      body: JSON.stringify({
        emoji: "😄",
        action: "increment",
      }),
    });
    const response = await SELF.fetch(
      "https://example.com/127.0.0.1:8080/abcd"
    );
    expect(await response.json()).toStrictEqual({
      "👀": {
        count: 1,
      },
      "😄": {
        count: 3,
      },
    });
  });
});
