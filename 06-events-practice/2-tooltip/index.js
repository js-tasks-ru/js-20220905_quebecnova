class Tooltip {
  static tooltip = null;
  element;

  constructor() {
    if (!Tooltip.tooltip) {
      Tooltip.tooltip = this;
    } else {
      return Tooltip.tooltip;
    }
  }

  initialize() {
    document.addEventListener("pointerover", this.showTooltip);
    document.addEventListener("pointerout", this.removeTooltip);
  }

  showTooltip = (e) => {
    const isTooltipTarget = e.target.closest("[data-tooltip]");
    if (!isTooltipTarget) return;

    document.body.addEventListener("pointermove", this.changeTooltipPosition);

    this.render(e.target.dataset.tooltip);
  };

  changeTooltipPosition = (e) => {
    const y = e.clientY;
    const x = e.clientX;
    this.element.style.top = y + 20 + "px";
    this.element.style.left = x + 10 + "px";
  };

  render(tooltip) {
    this.element = document.createElement("div");
    this.element.innerHTML = tooltip;
    this.element.classList.add("tooltip");
    document.body.append(this.element);
  }

  removeTooltip = () => {
    this.remove();
    this.element = null;
    document.body.removeEventListener(
      "pointermove",
      this.changeTooltipPosition
    );
  };

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    document.removeEventListener("poniterover", this.showTooltip);
    document.removeEventListener("pointerout", this.removeTooltip);
  }
}

export default Tooltip;
