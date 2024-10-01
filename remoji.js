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
    margin-top: 0.5rem;
    padding: 3px;
    position: absolute;
    top: 100%;
  }
  .remoji-options span {
    border-radius: 3px;
    display: inline-block;
    padding: 0.5rem;
    text-align: center;
    width: 1.5rem;
  }
  .remoji-options span:hover {
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
  }
`;

export function init() {
  const style = document.createElement("style");
  style.innerHTML = styles();
  document.head.appendChild(style);
  const containers = document.querySelectorAll("[data-remoji]");
  Array.from(containers).map((container) => {
    const data = JSON.parse(container.getAttribute("data-remoji") ?? "{}");
    container.appendChild(element(data));
  });

  addEventListener("click", (e) => {
    const allOptions = document.querySelectorAll(".remoji-options");
    Array.from(allOptions).map((options) => (options.style.display = "none"));
    if (e.target.classList.contains("remoji-add")) {
      const options = e.target.parentNode.querySelector(".remoji-options");
      options.style.display = "flex";
      return;
    }
  });
}

export function element(data) {
  const container = document.createElement("div");
  container.classList.add("remoji");
  const options = document.createElement("div");
  options.classList.add("remoji-options");
  options.innerHTML = `<span>👍</span>
        <span>😄</span>
        <span>🎉</span>
        <span>❤️</span>
        <span>🚀</span>
        <span>👀</span>`;
  container.appendChild(options);
  const add = document.createElement("div");
  add.classList.add("remoji-add");
  add.innerHTML = "☺";
  container.appendChild(add);
  const reactions = document.createElement("div");
  reactions.classList.add("remoji-reactions");
  for (const r in data.reactions) {
    const reaction = document.createElement("div");
    reaction.classList.add("remoji-reaction");
    reaction.innerHTML = `${r} 1`;
    reactions.append(reaction);
  }
  container.append(reactions);
  return container;
}
