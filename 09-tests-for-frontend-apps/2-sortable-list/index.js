export default class SortableList {
  subElements = {};
  offset = 450;
  html = document.querySelector("html");
  shifts = {
    x: 0,
    y: 0,
  };

  constructor({ items = [] } = {}) {
    this.items = items;

    this.render();
  }

  get HTMLTemplate() {
    return `
      <ul class='sortable-list' data-element='itemList'></ul>
    `;
  }

  addPlaceholder() {
    this.placeholder = document.createElement("div");
    this.placeholder.classList.add("sortable-list__placeholder");
    this.placeholder.classList.add("sortable-list__item");
    this.placeholder.style.background = "transparent";
    return this.placeholder;
  }

  getDroppedArea(event) {
    this.draggedItem.style.display = "none";
    const droppedArea = document.elementFromPoint(event.pageX, event.pageY);
    this.draggedItem.style.display = "block";
    return droppedArea;
  }

  setCoords(event) {
    this.draggedItem.style.top = event.clientY - this.shifts.y + "px";
    this.draggedItem.style.left = event.clientX - this.shifts.x + "px";
  }

  setShifts(event) {
    this.shifts.x = event.clientX - this.draggedItem.getBoundingClientRect().x;
    this.shifts.y = event.clientY - this.draggedItem.getBoundingClientRect().y;
  }

  dragStart(event) {
    this.setShifts(event);
    this.setCoords(event);
    this.draggedItem.classList.add("sortable-list__item_dragging");
    this.draggedItem.before(this.addPlaceholder());
    document.addEventListener("pointermove", this.moveItem);
    document.addEventListener("pointerup", this.dropItem);
  }

  moveItem = (event) => {
    this.setCoords(event);

    const droppedArea = this.getDroppedArea(event);
    if (droppedArea?.classList.contains("sortable-list__item")) {
      droppedArea.before(this.placeholder);
    } else {
      this.element.append(this.placeholder);
    }
  };

  dropItem = (event) => {
    this.placeholder.replaceWith(this.draggedItem);
    this.draggedItem.classList.remove("sortable-list__item_dragging");
    this.draggedItem.style = "";
    this.removePlaceholder();
    document.removeEventListener("pointermove", this.moveItem);
    document.removeEventListener("pointerup", this.dropItem);
  };

  handleClick = (event) => {
    const onGrab = event.target.closest("[data-grab-handle]");
    const onDelete = event.target.closest("[data-delete-handle]");
    if (onGrab) {
      event.preventDefault();
      this.draggedItem = onGrab.closest("li");
      this.dragStart(event);
    }
    if (onDelete) {
      event.preventDefault();
      const deletedItem = onDelete.closest("li");
      this.items = this.items.filter((item) => item !== deletedItem);
      deletedItem.remove();
    }
  };

  renderItems() {
    this.items.forEach((item) => {
      item.classList.add("sortable-list__item");
      this.element.append(item);
    });
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.HTMLTemplate;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
    this.renderItems();

    this.initEventListeners();
  }

  getSubElements() {
    const subElements = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      subElements[name] = subElement;
    }
    return subElements;
  }

  initEventListeners() {
    document.addEventListener("pointerdown", this.handleClick);
  }

  removeEventListeners() {
    document.removeEventListener("pointerdown", this.handleClick);
    document.removeEventListener("pointermove", this.moveItem);
    document.removeEventListener("pointerup", this.dropItem);
  }

  update() {}

  removePlaceholder() {
    this.placeholder.remove();
  }

  remove() {
    this.element?.remove();
    this.removeEventListeners();
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
  }
}
