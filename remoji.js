export const remoji = { init };

const styles = () => `
  .remoji {
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
`;

export function init() {
  const style = document.createElement("style");
  style.innerHTML = styles();
  document.head.appendChild(style);
  const containers = document.querySelectorAll("[data-remoji]");
  Array.from(containers).map((container) => {
    container.appendChild(element());
  });

  addEventListener("click", (e) => {
    const allOptions = document.querySelectorAll(".remoji-options");
    Array.from(allOptions).map((options) => (options.style.display = "none"));
    if (e.target.classList.contains("remoji-add")) {
      const options = e.target.parentNode.querySelector(".remoji-options");
      options.style.display = "flex";
      return;
    }
    if (e.target.parentNode?.classList?.contains?.("remoji-options")) {
      // save it
    }
  });
}

export function element() {
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
  return container;
}
