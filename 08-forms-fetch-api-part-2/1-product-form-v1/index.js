import escapeHtml from "./utils/escape-html.js";
import fetchJson from "./utils/fetch-json.js";

const IMGUR_CLIENT_ID = "28aaa2e823b03b1";
const IMGUR_URL = "https://api.imgur.com/3/image";
const BACKEND_URL = "https://course-js.javascript.ru";
const CATEGORIES_ENDPOINT = "api/rest/categories";
const PRODUCTS_ENDPOINT = "api/rest/products";

export default class ProductForm {
  imgurURL = new URL(IMGUR_URL);
  product = {};
  subElements = {};

  constructor(productId) {
    this.productId = productId;
    this.isUpdatingProduct = !!productId;
  }

  async getData() {
    try {
      const categoriesURL = new URL(CATEGORIES_ENDPOINT, BACKEND_URL);
      categoriesURL.searchParams.append("_sort", "weight");
      categoriesURL.searchParams.append("_refs", "subcategory");
      this.categories = await fetchJson(categoriesURL);

      if (this.isUpdatingProduct) {
        const productURL = new URL(PRODUCTS_ENDPOINT, BACKEND_URL);
        productURL.searchParams.append("id", this.productId);
        const products = await fetchJson(productURL);
        this.product = products[0];
      }
    } catch (error) {
      this.isUpdatingProduct = false;
      console.error(error);
    }
  }

  setStatus() {
    const { status } = this.subElements;
    const option = this.product.status === 1 ? 0 : 1;
    status.children[option].setAttribute("selected", "selected");
  }

  setSubCategory() {
    const { categories } = this.subElements;
    const category = categories.querySelector(
      `[data-subcategory=${this.product.subcategory}]`
    );
    category.setAttribute("selected", "selected");
  }

  get categoriesHTMLTemplate() {
    return this.categories
      .map((category) => {
        return category.subcategories
          .map((subcategory) => {
            return `
              <option 
                value="${category.id}-i-${subcategory.id}"
                data-subcategory=${subcategory.id}
              >
                ${category.title} > ${subcategory.title}
              </option>
          `;
          })
          .join("");
      })
      .join("");
  }

  getImageHTMLTemplate(image) {
    return `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${image.url}">
        <input type="hidden" name="source" value="${image.source}">
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
          <span>${image.source}</span>
        </span>
        <button type="button" name='deleteImage'>
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>
    `;
  }

  get imagesHTMLTemplate() {
    return this.product.images
      .map((image) => {
        return this.getImageHTMLTemplate(image);
      })
      .join("");
  }

  get HTMLTemplate() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input required="" type="text" id='title' name="title" class="form-control" placeholder="Название товара" data-element='title'>
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required="" class="form-control" id='description' name="description" data-element="description" placeholder="Описание товара"></textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer">
            <ul class="sortable-list" data-element='imageList'></ul>
            </div>
            <button id='uploadImage' type="button" name="uploadImage" class="button-primary-outline" data-element="uploadImage"><span>Загрузить</span></button>
            <input type='file' hidden/>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select id='subcategory' class="form-control" name="subcategory" data-element='categories'>
              ${this.categoriesHTMLTemplate}
            </select>
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input id='price' required="" type="number" name="price" class="form-control" placeholder="100" data-element='price'>
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input required="" type="number" id='discount' name="discount" class="form-control" placeholder="0" data-element='discount'>
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input required="" type="number" class="form-control" id='quantity' name="quantity" placeholder="1" data-element='quantity'>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" id='status' name="status" data-element='status'>
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline" data-element='saveProduct' onclick='return false'>Добавить товар</button>
          </div>
        </form>
      </div>
    `;
  }

  renderProduct() {
    this.subElements.title.value = this.product.title;
    this.subElements.description.innerHTML = this.product.description;
    this.subElements.imageListContainer.innerHTML = this.imagesHTMLTemplate;
    this.setSubCategory();
    this.subElements.price.value = this.product.price;
    this.subElements.discount.value = this.product.discount;
    this.subElements.quantity.value = this.product.quantity;
    this.setStatus();
    this.subElements.saveProduct.innerHTML = "Сохранить товар";
  }

  async render() {
    await this.getData();

    const element = document.createElement("div");
    element.innerHTML = this.HTMLTemplate;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    if (this.isUpdatingProduct) this.renderProduct();

    this.initEventListeners();
    return this.element;
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

  getImages() {
    const { imageListContainer } = this.subElements;
    const imagesUl = imageListContainer.children;
    if (!imagesUl.length) return [];
    const images = [];

    for (const image of imagesUl) {
      const url = image.children[0].value;
      const source = image.children[1].value;
      images.push({ url, source });
    }

    return images;
  }

  getSubCategory() {
    const { categories } = this.subElements;
    const category = categories.querySelector("[selected='selected']");
    if (!category) {
      return categories.children[0].dataset.subcategory;
    }
    return category.dataset.subcategory;
  }

  getStatus() {
    const { status } = this.subElements;
    const choosenStatus = status.querySelector("[selected='selected']");
    if (!choosenStatus) {
      return 1;
    }
    return parseInt(choosenStatus.value);
  }

  uploadImage(element) {
    const hiddenUploadInput = element.nextElementSibling;
    hiddenUploadInput.click();
    hiddenUploadInput.addEventListener("change", async () => {
      try {
        const { uploadImage, imageListContainer } = this.subElements;

        const file = hiddenUploadInput.files[0];
        const formData = new FormData();
        formData.append("image", file);

        uploadImage.classList.add("is-loading");
        uploadImage.disabled = true;

        const result = await fetchJson(this.imgurURL, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
        });
        const imageDiv = document.createElement("div");

        const image = { url: result.data.link, source: file.name };
        imageDiv.innerHTML = this.getImageHTMLTemplate(image);

        imageListContainer.firstElementChild.append(imageDiv.firstElementChild);
        if (!this.product.images) {
          this.product.images = [image];
        } else {
          this.product.images.push(image);
        }

        uploadImage.classList.remove("is-loading");
        uploadImage.disabled = false;
      } catch (error) {
        console.error(error);
      }
    });
  }

  deleteImage(imageSource) {
    const { imageListContainer } = this.subElements;
    this.product.images = this.product.images.filter(
      (image) => image.source !== imageSource
    );
    const image = imageListContainer.querySelector(`[value='${imageSource}']`);
    image.parentNode.remove();
  }

  async save() {
    this.product.title = this.subElements.title.value;
    this.product.id = this.subElements.title.value;
    this.product.description = this.subElements.description.innerHTML;
    this.product.images = this.getImages();
    this.product.subcategory = this.getSubCategory();
    this.product.price = parseInt(this.subElements.price.value);
    this.product.discount = parseInt(this.subElements.discount.value);
    this.product.quantity = parseInt(this.subElements.quantity.value);
    this.product.status = this.getStatus();
    this.product.rating = null;

    if (this.isUpdatingProduct) {
      await this.updateProduct();
    } else {
      await this.createProduct();
    }
  }

  async createProduct() {
    try {
      const productURL = new URL(PRODUCTS_ENDPOINT, BACKEND_URL);
      await fetchJson(productURL, {
        method: "PATCH",
        body: JSON.stringify(this.product),
        headers: {
          "content-type": "application/json; charset=utf-8",
        },
      });
      this.element.dispatchEvent(
        new CustomEvent("product-saved", {
          bubbles: true,
        })
      );
    } catch (error) {
      console.error(error);
    }
  }

  async updateProduct() {
    try {
      const productURL = new URL(PRODUCTS_ENDPOINT, BACKEND_URL);
      await fetchJson(productURL, {
        method: "PUT",
        body: JSON.stringify(this.product),
        headers: {
          "content-type": "application/json; charset=utf-8",
        },
      });
      this.element.dispatchEvent(
        new CustomEvent("product-updated", { bubbles: true })
      );
    } catch (error) {
      console.error(error);
    }
  }

  handlePointer = (event) => {
    const uploadImage = event.target.closest('[name="uploadImage"]');
    const deleteImage = event.target.closest('[name="deleteImage"]');
    const saveProduct = event.target.closest('[name="save"]');
    if (uploadImage) {
      this.uploadImage(uploadImage);
    }
    if (deleteImage) {
      this.deleteImage(deleteImage.parentNode.children[1].value);
    }
    if (saveProduct) {
      this.save();
    }
  };

  initEventListeners() {
    const { description } = this.subElements;
    document.addEventListener("pointerdown", this.handlePointer);
    description.addEventListener(
      "input",
      (event) => (description.innerHTML = event.target.value)
    );
  }

  removeEventListeners() {
    document.removeEventListener("pointerdown", this.handlePointer);
  }

  update() {
    const { input, selector } = this.subElements;
    input.innerHTML = this.inputHTMLTemplate;
    selector.innerHTML = this.selectorHTMLTemplate;
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
