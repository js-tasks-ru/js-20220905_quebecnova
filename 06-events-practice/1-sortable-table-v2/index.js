export default class SortableTable {
  isSortLocally = true;

  constructor(headersConfig, { data = [], sorted = {} } = {}) {
    this.headersConfig = headersConfig;
    this.data = [...data];
    this.sorted = sorted;

    this.render();
    this.sort(sorted.id, sorted.order);
  }

  sort(fieldValue, orderValue) {
    if (this.isSortLocally) {
      this.sortOnClient(fieldValue, orderValue);
    } else {
      this.sortOnServer();
    }

    this.update();
  }

  sortOnServer() {}

  sortOnClient(fieldValue, orderValue) {
    const sortingField = this.element.querySelector(
      `[data-id='${fieldValue}']`
    );

    let direction;
    if (orderValue === "asc") {
      direction = 1;
      sortingField.dataset.order = orderValue;
    }
    if (orderValue === "desc") {
      direction = -1;
      sortingField.dataset.order = orderValue;
    }

    this.data.sort((a, b) => {
      if (typeof a[fieldValue] === "number") {
        return direction * (a[fieldValue] - b[fieldValue]);
      }
      if (typeof a[fieldValue] === "string") {
        return (
          direction *
          a[fieldValue].localeCompare(b[fieldValue], ["ru", "en"], {
            caseFirst: "upper",
          })
        );
      }
    });
  }

  renderProductCells(product) {
    return this.headersConfig
      .map((data) => {
        return data.template
          ? data.template()
          : `<div class="sortable-table__cell">${product[data.id]}</div>`;
      })
      .join("");
  }

  renderProducts() {
    return this.data
      .map((product) => {
        return `
          <a href="/products/${product.id}" class="sortable-table__row">
            ${this.renderProductCells(product)}
          </a>
        `;
      })
      .join("");
  }

  get arrowHTMLTemplate() {
    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;
  }

  renderHeader() {
    return this.headersConfig
      .map((cell) => {
        return `
        <div 
          class="sortable-table__cell" 
          data-id="${cell.id}" 
          data-sortable="${cell.sortable}"
          data-order=""
        >
          <span>${cell.title}</span>
          ${cell.sortable ? this.arrowHTMLTemplate : ""}
        </div>
      `;
      })
      .join("");
  }

  get HTMLTemplate() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.renderHeader()}
          </div>
        </div>
        <div data-element="body" class="sortable-table__body">
          ${this.renderProducts()}
        </div>
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
          <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
            <div>
              <p>No products satisfies your filter criteria</p>
              <button type="button" class="button-primary-outline">Reset all filters</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    if (this.element) this.remove();
    const element = document.createElement("div");
    element.innerHTML = this.HTMLTemplate;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
    this.initEventListeners();
  }

  validateSort(e) {
    const target = e.target.closest(".sortable-table__cell");
    if (target?.dataset?.sortable === "true") {
      const order = target.dataset.order === "asc" ? "asc" : "desc";
      this.sort(target.dataset.id, order);
    }
  }

  initEventListeners() {
    const bindedValidateSort = this.validateSort.bind(this);
    document.addEventListener("pointerdown", bindedValidateSort);
    this.removeEventListeners = () => {
      document.removeEventListener("pointerdown", bindedValidateSort);
    };
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

  update() {
    this.element.innerHTML = this.HTMLTemplate;
    this.subElements = this.getSubElements();
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
