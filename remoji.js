class Remoji {
  constructor(element, id) {
    this.element = element;
    this.id = id;
    if (!this.id) {
      throw new Error("data-remoji-id attribute missing!");
    }
    this.load();
    element.addEventListener("click", (e) => {
      if (e.target.classList.contains("remoji-add")) {
        const options = element.querySelector(".remoji-options");
        options.style.display = "flex";
        return;
      }

      if (
        e.target.classList.contains("remoji-option") ||
        e.target.classList.contains("remoji-reaction")
      ) {
        const emoji = e.target.getAttribute("data-remoji-emoji");
        const self = e.target.getAttribute("data-remoji-self");
        this.update(emoji, self);
        return;
      }
    });
  }
  update(reaction, self) {
    if (self === "true") {
      this.data.reactions[reaction].count--;
      this.data.reactions[reaction].self = false;
      if (this.data.reactions[reaction].count === 0) {
        delete this.data.reactions[reaction];
      }
    } else {
      this.data.reactions ??= {};
      this.data.reactions[reaction] ??= { count: 0 };
      this.data.reactions[reaction].self = true;
      this.data.reactions[reaction].count++;
    }
    this.render();
  }
  load() {
    // eventually from an API
    // but also merging w/ local storage for unauthenticated reactions
    this.data = JSON.parse(localStorage.getItem("remoji") || "{}");

    this.render();
  }
  render() {
    const reactions = this.element.querySelector(".remoji-reactions");
    reactions.innerHTML = "";
    for (let r in this.data.reactions) {
      const reaction = document.createElement("div");
      reaction.classList.add("remoji-reaction");
      reaction.setAttribute("data-remoji-emoji", r);
      reaction.innerHTML = `${r} ${this.data.reactions[r].count}`;
      reaction.setAttribute("data-remoji-self", !!this.data.reactions[r].self);
      reactions.append(reaction);
    }
    const options = this.element.querySelectorAll(".remoji-option");
    Array.from(options).forEach((option) => {
      if (this.data.reactions?.[option.innerHTML]?.self) {
        option.setAttribute("data-remoji-self", true);
      } else {
        option.setAttribute("data-remoji-self", false);
      }
    });
  }
}

export const remoji = { init };

const styles = () => `
  .remoji {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    position: relative;
  }
  .remoji-add {
    background: #eee;
    border-radius: 100%;
    display: inline-block;
    font-size: 2rem;
    height: 2rem;
    line-height: 2rem;
  }
  .remoji-add:hover {
    background: #ddd;
    cursor: pointer;
  }
  .remoji-options {
    border: 1px solid #ccc;
    border-radius: 6px;
    display: none;
    font-size: 1.25rem;
    gap: 2px;
    margin-top: 0.5rem;
    padding: 3px;
    position: absolute;
    top: 100%;
  }
  .remoji-option {
    border-radius: 3px;
    display: inline-block;
    padding: 0.5rem;
    text-align: center;
    width: 1.5rem;
  }
  .remoji-option:hover,
  .remoji-option[data-remoji-self="true"] {
    background-color: #eee;
    cursor: pointer;
  }
  .remoji-reactions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .remoji-reaction {
    border: 1px solid #eee;
    border-radius: 1rem;
    padding: 0.125rem 0.5rem;
    font-family: sans-serif;
    cursor: pointer
  }
  .remoji-reaction[data-remoji-self="true"]{
    background: azure;
    border-color: skyblue;
  }
`;

function init() {
  const style = document.createElement("style");
  style.innerHTML = styles();
  document.head.appendChild(style);
  const containers = document.querySelectorAll("[data-remoji-id]");
  addEventListener("click", (e) => {
    if (e.target.classList.contains("remoji-add")) {
      return;
    }
    const allOptions = document.querySelectorAll(".remoji-options");
    Array.from(allOptions).map((options) => (options.style.display = "none"));
  });
  Array.from(containers).map((container) => {
    const el = element();
    const id = container.getAttribute("data-remoji-id");
    new Remoji(el, id);
    container.appendChild(el);
  });
}

function element() {
  const emojiOptions = ["👍", "😄", "❤️", "🚀", "👀"];
  const container = document.createElement("div");
  container.classList.add("remoji");
  const options = document.createElement("div");
  options.classList.add("remoji-options");
  options.innerHTML = emojiOptions
    .map(
      (option) =>
        `<span class="remoji-option" data-remoji-emoji="${option}">${option}</span>`
    )
    .join("");
  container.appendChild(options);
  const add = document.createElement("div");
  add.classList.add("remoji-add");
  add.innerHTML = "☺";
  container.appendChild(add);
  const reactions = document.createElement("div");
  reactions.classList.add("remoji-reactions");
  container.append(reactions);
  return container;
}
