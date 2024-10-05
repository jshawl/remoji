import { beforeEach, describe, expect, it, vi } from "vitest";
import { remoji } from "./remoji";

const resetDOM = () => {
  document.head.innerHTML = "";
  document.body.innerHTML = "";
};

const mount = () => {
  document.body.innerHTML = "<div data-remoji-id='a'></div>";
  remoji.init();
};

const $ = (selector) => document.querySelector(selector);

describe("remoji", () => {
  describe(".init()", () => {
    beforeEach(() => {
      resetDOM();
    });

    it("appends styles to the DOM", () => {
      expect(document.head.querySelector("style")).toBeFalsy();
      mount();
      expect(document.head.querySelector("style")).toBeTruthy();
    });

    it("renders a UI for elements with a data-remoji attribute", () => {
      expect(document.body.querySelector(".remoji")).toBeFalsy();
      mount();
      expect(document.body.querySelectorAll(".remoji").length).toBe(1);
    });

    it("renders a UI for multiple elements with a data-remoji attribute", () => {
      expect(document.body.querySelector(".remoji")).toBeFalsy();
      document.body.innerHTML =
        "<div data-remoji-id='a'></div><div data-remoji-id='b'></div>";
      remoji.init();
      expect(document.body.querySelectorAll(".remoji").length).toBe(2);
    });

    it("throws if data-remoji-id is falsy", () => {
      document.body.innerHTML = "<div data-remoji-id></div>";
      expect(() => remoji.init()).toThrowError(
        "data-remoji-id attribute missing!"
      );
    });
  });

  describe("clicking on .remoji-add", () => {
    beforeEach(() => {
      resetDOM();
    });

    it("shows remoji options", () => {
      mount();
      const options = $(".remoji-options");
      expect(window.getComputedStyle(options).display).toBe("none");
      $(".remoji-add").click();
      expect(window.getComputedStyle(options).display).toBe("flex");
    });

    describe("clicking on .remoji-option", () => {
      beforeEach(() => {
        localStorage.removeItem("remoji-reactions");
      });
      it.only("creates a reaction", async () => {
        globalThis.fetch = vi.fn(() => ({
          then: (cb) => cb({ json: async () => {} }),
        }));
        mount();
        await vi.waitFor(() => $(".remoji-reaction"));
        $(".remoji-add").click();
        const option = $(".remoji-options [data-remoji-emoji='😄']");
        expect($(".remoji-reaction[data-remoji-emoji='😄']")).toBeFalsy();
        option.click();
        expect($(".remoji-reaction[data-remoji-emoji='😄']")).toBeTruthy();
        expect($(".remoji-reaction[data-remoji-emoji='😄']").innerHTML).toMatch(
          "1"
        );
        expect(localStorage.getItem("remoji-reactions")).toBe('["😄"]');
        const otherOption = $(".remoji-options [data-remoji-emoji='❤️']");
        otherOption.click();
        expect($(".remoji-reaction[data-remoji-emoji='❤️']").innerHTML).toMatch(
          "1"
        );
        expect(localStorage.getItem("remoji-reactions")).toBe('["😄","❤️"]');
      });

      it("increments a reaction", () => {
        const data = {
          reactions: {
            "😄": { count: Math.floor(Math.random() * 10) + 1, self: false },
          },
        };
        localStorage.setItem("remoji", JSON.stringify(data));
        mount();
        $(".remoji-add").click();
        const option = $(".remoji-options [data-remoji-emoji='😄']");
        expect($(".remoji-reaction[data-remoji-emoji='😄']").innerHTML).toMatch(
          data.reactions["😄"].count
        );
        option.click();
        expect($(".remoji-reaction[data-remoji-emoji='😄']").innerHTML).toMatch(
          data.reactions["😄"].count + 1
        );
      });

      it("decrements a reaction", () => {
        const data = {
          reactions: {
            "😄": { count: Math.floor(Math.random() * 10) + 2, self: true },
          },
        };
        localStorage.setItem("remoji", JSON.stringify(data));
        mount();
        $(".remoji-add").click();
        const option = $(".remoji-options [data-remoji-emoji='😄']");
        expect($(".remoji-reaction[data-remoji-emoji='😄']").innerHTML).toMatch(
          data.reactions["😄"].count
        );
        option.click();
        expect($(".remoji-reaction[data-remoji-emoji='😄']").innerHTML).toMatch(
          data.reactions["😄"].count - 1
        );
      });

      it("removes a reaction", () => {
        const data = {
          reactions: {
            "😄": { count: 1, self: true },
          },
        };
        localStorage.setItem("remoji", JSON.stringify(data));
        mount();
        $(".remoji-add").click();
        const option = $(".remoji-options [data-remoji-emoji='😄']");
        expect($(".remoji-reaction[data-remoji-emoji='😄']").innerHTML).toMatch(
          data.reactions["😄"].count
        );
        localStorage.setItem("remoji-reactions", '["😄"]');
        option.click();
        expect(localStorage.getItem("remoji-reactions")).toBe("[]");
        expect($(".remoji-reaction[data-remoji-emoji='😄']")).toBeFalsy();
      });
    });

    describe("clicking on .remoji-reaction", () => {
      it("increments a reaction", () => {
        const data = {
          reactions: {
            "😄": { count: Math.floor(Math.random() * 10) + 1, self: false },
          },
        };
        localStorage.setItem("remoji", JSON.stringify(data));
        mount();
        $(".remoji-add").click();
        const reaction = $(".remoji-reaction[data-remoji-emoji='😄']");
        reaction.click();
        expect($(`.remoji-reaction[data-remoji-emoji='😄']`).innerHTML).toMatch(
          data.reactions["😄"].count + 1
        );
      });

      it("decrements a reaction", () => {
        const data = {
          reactions: {
            "😄": { count: Math.floor(Math.random() * 10) + 2, self: true },
          },
        };
        localStorage.setItem("remoji", JSON.stringify(data));
        mount();
        $(".remoji-add").click();
        const reaction = $(".remoji-reaction[data-remoji-emoji='😄']");
        reaction.click();
        expect($(`.remoji-reaction[data-remoji-emoji='😄']`).innerHTML).toMatch(
          data.reactions["😄"].count - 1
        );
      });

      it("removes a reaction", () => {
        const data = {
          reactions: {
            "😄": { count: 1, self: true },
          },
        };
        localStorage.setItem("remoji", JSON.stringify(data));
        mount();
        $(".remoji-add").click();
        const reaction = $(".remoji-reaction[data-remoji-emoji='😄']");
        reaction.click();
        expect($(`.remoji-reaction[data-remoji-emoji='😄']`)).toBeFalsy();
      });
    });
  });
});
