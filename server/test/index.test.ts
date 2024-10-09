import { SELF } from "cloudflare:test";
import { describe, it, expect } from "vitest";

const url = "https://example.com/127.0.0.1:8080/abcd";

describe("remoji api", () => {
  it("responds to GET /:org/:id", async () => {
    const response = await SELF.fetch(url);
    expect(await response.json()).toEqual(
      expect.objectContaining({
        "😄": {
          count: 2,
        },
      })
    );
  });

  it("responds to POST /:org/:id", async () => {
    await SELF.fetch(url, {
      method: "POST",
      body: JSON.stringify({
        emoji: "😄",
        action: "increment",
        userId: "jesse@jesse.sh",
      }),
    });
    const response = await SELF.fetch(url);
    expect(await response.json()).toEqual(
      expect.objectContaining({
        "😄": {
          count: 3,
        },
      })
    );
  });

  it("responds to POST /:org/:id", async () => {
    await SELF.fetch(url, {
      method: "POST",
      body: JSON.stringify({
        emoji: "😄",
        action: "increment",
        userId: "jesse@jesse.sh",
      }),
    });
    const response = await SELF.fetch(url);
    expect(await response.json()).toEqual(
      expect.objectContaining({
        "😄": {
          count: 3,
        },
      })
    );
    await SELF.fetch(url, {
      method: "POST",
      body: JSON.stringify({
        emoji: "😄",
        action: "decrement",
        userId: "jesse@jesse.sh",
      }),
    });
    const response2 = await SELF.fetch(url);
    expect(await response2.json()).toEqual(
      expect.objectContaining({
        "😄": {
          count: 2,
        },
      })
    );
  });

  it("ignores deletions by non-reactors", async () => {
    await SELF.fetch(url, {
      method: "POST",
      body: JSON.stringify({
        emoji: "😄",
        action: "increment",
        userId: "jesse-reactor@jesse.sh",
      }),
    });
    const response = await SELF.fetch(url);
    expect(await response.json()).toEqual(
      expect.objectContaining({
        "😄": {
          count: 3,
        },
      })
    );
    await SELF.fetch(url, {
      method: "POST",
      body: JSON.stringify({
        emoji: "😄",
        action: "decrement",
        userId: "jesse-abuser@jesse.sh",
      }),
    });
    const response2 = await SELF.fetch(url);
    expect(await response2.json()).toEqual(
      expect.objectContaining({
        "😄": {
          count: 3,
        },
      })
    );
  });
});
