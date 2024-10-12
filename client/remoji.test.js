import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { remoji } from "./remoji";

const resetDOM = () => {
  document.head.innerHTML = "";
  document.body.innerHTML = "";
};

const mount = () => {
  document.body.innerHTML = "<div data-remoji-id='test'></div>";
  remoji.init();
};

const $ = (selector) => document.querySelector(selector);

const mockFetchResponseOnce = (response) => {
  globalThis.fetch = vi.fn(() => ({
    then: (callback) =>
      callback({
        json: async () => response,
      }),
  }));
};

const postRequest = (payload) => {
  return [
    `https://remoji.jshawl.workers.dev/localhost%3A3000/test`,
    {
      body: JSON.stringify(payload),
      method: "POST",
    },
  ];
};

vi.stubGlobal("crypto", { randomUUID: vi.fn(() => "abc-def-ghi-jkl") });

describe("remoji", () => {
  describe(".init()", () => {
    beforeEach(() => {
      resetDOM();
      mockFetchResponseOnce({});
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

    it("allows users to specify their own options/reactions", () => {
      document.body.innerHTML = "<div data-remoji-id='a'></div>";
      const emojis = ["🤌", "🙌"];
      remoji.init({
        emojis,
      });
      const domEmojis = Array.from(
        document.body.querySelectorAll("[data-remoji-emoji]")
      ).map((element) => element.getAttribute("data-remoji-emoji"));
      expect(domEmojis).toStrictEqual(emojis);
    });

    it("ignores non-allow-listed emoji reactions", async () => {
      mockFetchResponseOnce({ "🥦": { count: 1 } });
      mount();
      await vi.waitFor(() => $(".remoji-reaction"));
      expect(document.body.innerHTML).not.toMatch("🥦");
    });

    it("has an apiUrl option", () => {
      document.body.innerHTML = "<div data-remoji-id='a'></div>";
      const host = crypto.randomUUID();
      remoji.init({
        apiUrl: `https://${host}.com`,
      });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`https://${host}.com`)
      );
    });

    it("has an orgId option", async () => {
      mockFetchResponseOnce({ "😄": { count: 1 } });
      document.body.innerHTML = "<div data-remoji-id='a'></div>";
      const remojis = remoji.init({
        orgId: "acme corp, inc.",
      });
      expect(remojis.map((remoji) => remoji.orgId)).toStrictEqual([
        "acme%20corp%2C%20inc.",
      ]);
      await vi.waitFor(() => $(".remoji-reaction"));
      $(".remoji-add").click();
      const option = $(".remoji-options [data-remoji-emoji='😄']");
      option.click();
      const payload = postRequest({
        action: "increment",
        emoji: "😄",
        userId: "abc-def-ghi-jkl",
      })[1];
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "https://remoji.jshawl.workers.dev/acme%20corp%2C%20inc./a",
        payload
      );
    });

    describe("userId option", () => {
      beforeEach(() => {
        document.body.innerHTML = "<div data-remoji-id='a'></div>";
      });

      afterEach(() => {
        localStorage.removeItem("remoji-user-id");
      });

      it("uses the provided userId", () => {
        const remojis = remoji.init({
          userId: "zyx-wvu-tsr-qpo",
        });
        expect(remojis.map((remoji) => remoji.userId)).toStrictEqual([
          "zyx-wvu-tsr-qpo",
        ]);
      });

      it("generates a userId", () => {
        const remojis = remoji.init();
        expect(remojis.map((remoji) => remoji.userId)).toStrictEqual([
          "abc-def-ghi-jkl",
        ]);
        expect(localStorage.getItem("remoji-user-id")).toBe("abc-def-ghi-jkl");
      });

      it("reuses a previously generated userId", () => {
        localStorage.setItem("remoji-user-id", "mno-pqr-stu-vwx");
        const remojis = remoji.init();
        expect(remojis.map((remoji) => remoji.userId)).toStrictEqual([
          "mno-pqr-stu-vwx",
        ]);
      });

      it("prefers the userId option over localStorage", () => {
        localStorage.setItem("remoji-user-id", "mno-pqr-stu-vwx");
        const remojis = remoji.init({
          userId: "xxx-xxx-xxx-xxx",
        });
        expect(remojis.map((remoji) => remoji.userId)).toStrictEqual([
          "xxx-xxx-xxx-xxx",
        ]);
      });
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
        resetDOM();
        localStorage.removeItem("remoji-reactions");
      });
      it("creates a reaction", async () => {
        mockFetchResponseOnce({ "🚀": { count: 1 } });
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
        expect(globalThis.fetch).toHaveBeenCalledWith(
          ...postRequest({
            action: "increment",
            emoji: "❤️",
            userId: "abc-def-ghi-jkl",
          })
        );
        expect($(".remoji-reaction[data-remoji-emoji='❤️']").innerHTML).toMatch(
          "1"
        );
        expect(localStorage.getItem("remoji-reactions")).toBe('["😄","❤️"]');
      });

      it("increments a reaction", async () => {
        const count = Math.floor(Math.random() * 10) + 1;
        mockFetchResponseOnce({
          "😄": { count },
        });
        mount();
        await vi.waitFor(() => $(".remoji-reaction"));
        $(".remoji-add").click();
        const option = $(".remoji-options [data-remoji-emoji='😄']");
        expect($(".remoji-reaction[data-remoji-emoji='😄']").innerHTML).toMatch(
          count
        );
        option.click();
        expect(globalThis.fetch).toHaveBeenCalledWith(
          ...postRequest({
            action: "increment",
            emoji: "😄",
            userId: "abc-def-ghi-jkl",
          })
        );
        expect($(".remoji-reaction[data-remoji-emoji='😄']").innerHTML).toMatch(
          count + 1
        );
      });

      it("decrements a reaction", async () => {
        const count = Math.floor(Math.random() * 10) + 2;
        localStorage.setItem("remoji-reactions", '["😄"]');
        mockFetchResponseOnce({
          "😄": { count },
        });
        mount();
        await vi.waitFor(() => $(".remoji-reaction"));
        $(".remoji-add").click();
        const option = $(".remoji-options [data-remoji-emoji='😄']");
        expect($(".remoji-reaction[data-remoji-emoji='😄']").innerHTML).toMatch(
          count
        );
        option.click();
        expect(globalThis.fetch).toHaveBeenCalledWith(
          ...postRequest({
            action: "decrement",
            emoji: "😄",
            userId: "abc-def-ghi-jkl",
          })
        );
        expect($(".remoji-reaction[data-remoji-emoji='😄']").innerHTML).toMatch(
          count - 1
        );
      });

      it("removes a reaction", async () => {
        const count = 1;
        localStorage.setItem("remoji-reactions", '["😄"]');
        mockFetchResponseOnce({
          "😄": { count },
        });
        mount();
        await vi.waitFor(() => $(".remoji-reaction"));
        $(".remoji-add").click();
        const option = $(".remoji-options [data-remoji-emoji='😄']");
        expect($('.remoji-reaction[data-remoji-emoji="😄"]').innerHTML).toMatch(
          count
        );
        localStorage.setItem("remoji-reactions", '["😄"]');
        option.click();
        expect(globalThis.fetch).toHaveBeenCalledWith(
          ...postRequest({
            action: "decrement",
            emoji: "😄",
            userId: "abc-def-ghi-jkl",
          })
        );
        expect(localStorage.getItem("remoji-reactions")).toBe("[]");
        expect($(".remoji-reaction[data-remoji-emoji='😄']")).toBeFalsy();
      });
    });

    describe("clicking on .remoji-reaction", () => {
      it("increments a reaction", async () => {
        const count = Math.floor(Math.random() * 10) + 1;
        mockFetchResponseOnce({
          "😄": { count },
        });
        mount();
        await vi.waitFor(() => $(".remoji-reaction"));
        $(".remoji-add").click();
        const reaction = $(".remoji-reaction[data-remoji-emoji='😄']");
        reaction.click();
        expect(globalThis.fetch).toHaveBeenCalledWith(
          ...postRequest({
            action: "increment",
            emoji: "😄",
            userId: "abc-def-ghi-jkl",
          })
        );
        expect($(`.remoji-reaction[data-remoji-emoji='😄']`).innerHTML).toMatch(
          count + 1
        );
      });

      it("decrements a reaction", async () => {
        const count = Math.floor(Math.random() * 10) + 2;
        localStorage.setItem("remoji-reactions", '["😄"]');
        mockFetchResponseOnce({
          "😄": { count },
        });
        mount();
        await vi.waitFor(() => $(".remoji-reaction"));
        $(".remoji-add").click();
        const reaction = $(".remoji-reaction[data-remoji-emoji='😄']");
        reaction.click();
        expect(globalThis.fetch).toHaveBeenCalledWith(
          ...postRequest({
            action: "decrement",
            emoji: "😄",
            userId: "abc-def-ghi-jkl",
          })
        );
        expect($(`.remoji-reaction[data-remoji-emoji='😄']`).innerHTML).toMatch(
          count - 1
        );
      });

      it("removes a reaction", async () => {
        const count = 1;
        localStorage.setItem("remoji-reactions", '["😄"]');
        mockFetchResponseOnce({
          "😄": { count },
        });
        mount();
        await vi.waitFor(() => $(".remoji-reaction"));
        $(".remoji-add").click();
        const reaction = $(".remoji-reaction[data-remoji-emoji='😄']");
        reaction.click();
        expect(globalThis.fetch).toHaveBeenCalledWith(
          ...postRequest({
            action: "decrement",
            emoji: "😄",
            userId: "abc-def-ghi-jkl",
          })
        );
        expect($(`.remoji-reaction[data-remoji-emoji='😄']`)).toBeFalsy();
      });
    });
  });
});
