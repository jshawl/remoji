import { describe, expect, it } from "vitest";
import { init } from "./remoji";

describe("remoji", () => {
  describe(".init()", () => {
    it("appends styles to the DOM", () => {
      expect(document.head.querySelector("style")).toBeFalsy();
      init();
      expect(document.head.querySelector("style")).toBeTruthy();
    });
  });
});
