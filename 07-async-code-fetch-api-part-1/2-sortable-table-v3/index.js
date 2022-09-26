import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class SortableTable {
  subElements = {};
  cardHeight = 83.3;
  howMuchCardsFitsInWindow = window.innerHeight / this.cardHeight;

  constructor(
    headersConfig,
    { data = [], sorted, isSortLocally = false, url = "" } = {}
  ) {
    this.headersConfig = headersConfig;
    this.data = [...data];
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.baseURL = new URL(url, BACKEND_URL);

    this.render();
  }

  isTableLoading() {
    const { table } = this.subElements;
    return table.classList.contains("sortable-table_loading");
  }

  renderArrowInOrder(id, order) {
    const allSortingFields = this.element.querySelectorAll("[data-id]");
    allSortingFields.forEach((field) => (field.dataset.order = ""));

    const sortingField = this.element.querySelector(`[data-id='${id}']`);
    sortingField.dataset.order = order;
  }

  validateSort = (event) => {
    if (this.isTableLoading()) return;
    const target = event.target.closest(".sortable-table__cell");
    if (target?.dataset?.sortable === "true") {
      const order = target.dataset.order === "desc" ? "asc" : "desc";
      this.sort(target.dataset.id, order);
    }
  };

  async sort(id, order) {
    console.log(this.isSortLocally);
    this.isSortLocally
      ? this.sortOnClient(id, order)
      : await this.sortOnServer(id, order);

    this.renderArrowInOrder(id, order);
    this.updateProducts();
  }

  sortOnClient(id, order) {
    let direction;
    if (order === "asc") {
      direction = 1;
    } else if (order === "desc") {
      direction = -1;
    } else {
      throw new Error(`not valid order: ${order}`);
    }

    this.data.sort((a, b) => {
      if (typeof a[id] === "number") {
        return direction * (a[id] - b[id]);
      }
      if (typeof a[id] === "string") {
        return (
          direction *
          a[id].localeCompare(b[id], ["ru", "en"], {
            caseFirst: "upper",
          })
        );
      }
    });
  }

  async sortOnServer(id, order) {
    const newSortURL = this.getDataURL({
      id,
      order,
    });

    this.data = await this.fetchDataAndHandleLoading(newSortURL);
  }

  getDataURL({
    id = "title",
    order = "asc",
    start = 0,
    end = this.data.length,
  } = {}) {
    const newDataURL = new URL(this.baseURL);

    newDataURL.searchParams.append("_embed", "subcategory.category");
    newDataURL.searchParams.append("_sort", id);
    newDataURL.searchParams.append("_order", order);
    newDataURL.searchParams.append("_start", start);
    newDataURL.searchParams.append("_end", end);

    return newDataURL;
  }

  async getData({
    id = "title",
    order = "asc",
    start = 0,
    end = this.data.length,
  } = {}) {
    if (this.isTableLoading()) return;

    const newDataURL = this.getDataURL({
      id,
      order,
      start,
      end,
    });

    return await this.fetchDataAndHandleLoading(newDataURL);
  }

  async fetchDataAndHandleLoading(URL = "") {
    const { table } = this.subElements;
    table.classList.add("sortable-table_loading");

    const data = await fetchJson(URL);
    table.classList.remove("sortable-table_loading");
    return data;
  }

  addProducts = () => {
    if (this.isTableLoading()) return;
    const windowRelativeBottom =
      document.documentElement.getBoundingClientRect().bottom;

    if (!(windowRelativeBottom < document.documentElement.clientHeight + 100))
      return;

    const end = this.data.length + this.howMuchCardsFitsInWindow;
    this.getData({ start: 0, end }).then((data) => {
      this.renderArrowInOrder("title", "asc");
      this.data = data;
      this.updateProducts();
    });
  };

  renderProductCells(product) {
    return this.headersConfig
      .map((data) => {
        return data.template
          ? data.template(product[data.id])
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

  async render() {
    if (this.element) this.remove();

    const element = document.createElement("div");
    element.innerHTML = this.HTMLTemplate;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    this.initEventListeners();

    this.data = await this.getData({
      id: this.sorted?.id,
      order: this.sorted?.order,
      start: 0,
      end: this.howMuchCardsFitsInWindow,
    });

    this.renderArrowInOrder("title", "asc");
    this.updateProducts();
  }

  initEventListeners() {
    document.addEventListener("pointerdown", this.validateSort);
    document.addEventListener("scroll", this.addProducts);
  }

  removeEventListeners = () => {
    document.removeEventListener("pointerdown", this.validateSort);
    document.removeEventListener("scroll", this.addProducts);
  };

  getSubElements() {
    const subElements = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      subElements[name] = subElement;
    }
    return subElements;
  }

  get arrowHTMLTemplate() {
    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;
  }

  get HTMLTemplate() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div data-element='table' class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.renderHeader()}
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

  updateProducts() {
    const { body, table } = this.subElements;

    if (!this.data?.length) {
      table.classList.add("sortable-table_empty");
      return;
    } else {
      table.classList.remove("sortable-table_empty");
    }

    body.innerHTML = this.renderProducts();
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
