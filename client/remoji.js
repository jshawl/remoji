class Remoji {
  constructor({ element, id, emojis, apiUrl, userId }) {
    this.element = element;
    this.id = id;
    this.emojis = emojis;
    this.userId = userId;
    const org = window.location.host;
    const baseUrl = apiUrl || `https://remoji.jshawl.workers.dev`;
    this.apiUrl = `${baseUrl}/${org}/${this.id}`;
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
  update(emoji, self) {
    const reactions = JSON.parse(
      localStorage.getItem("remoji-reactions") ?? "[]"
    );
    let action;
    if (self === "true") {
      action = "decrement";
      this.data.reactions[emoji].count--;
      this.data.reactions[emoji].self = false;
      reactions.splice(reactions.indexOf(emoji), 1);
      if (this.data.reactions[emoji].count === 0) {
        delete this.data.reactions[emoji];
      }
    } else {
      action = "increment";
      this.data.reactions ??= {};
      this.data.reactions[emoji] ??= { count: 0 };
      this.data.reactions[emoji].self = true;
      this.data.reactions[emoji].count++;
      reactions.push(emoji);
    }
    fetch(this.apiUrl, {
      method: "POST",
      body: JSON.stringify({
        action,
        emoji,
        userId: this.userId,
      }),
    });
    localStorage.setItem("remoji-reactions", JSON.stringify(reactions));
    this.render();
  }
  load() {
    fetch(this.apiUrl).then(async (response) => {
      const data = await response.json();
      this.data = { reactions: {} };
      for (let d in data) {
        if (this.emojis.includes(d)) {
          this.data.reactions[d] = data[d];
        }
      }
      const reactions = JSON.parse(
        localStorage.getItem("remoji-reactions") || "[]"
      );
      reactions.forEach((reaction) => {
        this.data.reactions[reaction] ??= { count: 1 };
        this.data.reactions[reaction].self = true;
      });
      this.render();
    });
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
    font-family: serif;
    text-align: center;
    line-height: 2rem;
    height: 2rem;
    width: 2rem;
  }
  .remoji-add:hover {
    background: #ddd;
    cursor: pointer;
  }
  .remoji-options {
    background-color: #fff;
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

function init(options = {}) {
  options.emojis ??= ["👍", "😄", "❤️", "🚀", "👀"];
  options.userId =
    options.userId ||
    localStorage.getItem("remoji-user-id") ||
    crypto.randomUUID();
  localStorage.setItem("remoji-user-id", options.userId);
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
  return Array.from(containers).map((container) => {
    const el = element(options.emojis);
    const id = container.getAttribute("data-remoji-id");
    const remoji = new Remoji({ element: el, id, ...options });
    container.appendChild(el);
    return remoji;
  });
}

function element(emojis) {
  const container = document.createElement("div");
  container.classList.add("remoji");
  const options = document.createElement("div");
  options.classList.add("remoji-options");
  options.innerHTML = emojis
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

export const remoji = { init };
