import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class ColumnChart {
  element;
  chartHeight = 50;
  data = [];
  subElements = {};
  dataValues = [];

  constructor({
    url,
    range = {
      from: Date.now(),
      to: Date.now(),
    },
    label = "",
    link = "",
    formatHeading = (value) => value,
  } = {}) {
    this.url = new URL(url, BACKEND_URL);
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;

    this.render();
  }

  get HTMLTemplate() {
    return `
        <div class='column-chart column-chart_loading'>
          <div class='column-chart__title'>
            Total ${this.label}
            ${this.renderLink()}
          </div>
          <div class='column-chart__container'>
            <div data-element='header' class='column-chart__header'>${this.renderHeader()}</div>
            <div data-element='body' class='column-chart__chart'>
              ${this.renderValues()}
            </div>
          </div>
        </div>
      `;
  }

  async getData() {
    this.element?.classList?.add("column-chart_loading");

    const urlWithParams = new URL(this.url);
    urlWithParams.searchParams.set("from", this.range.from.toISOString());
    urlWithParams.searchParams.set("to", this.range.to.toISOString());

    const data = await fetchJson(urlWithParams);
    this.dataValues = Object.values(data);

    if (this.dataValues.length) {
      this.element?.classList?.remove("column-chart_loading");
    }
    return data;
  }

  renderLink() {
    if (!this.link) return "";
    return `
        <a class='column-chart__link' href=${this.link}>
          View all
        </a>
      `;
  }

  renderHeader() {
    const headerValue = this.dataValues.reduce(
      (prev, curr) => (prev += parseInt(curr)),
      0
    );
    return this.formatHeading(headerValue);
  }

  renderValues() {
    const maxValue = Math.max(...this.dataValues);
    const scale = this.chartHeight / maxValue;
    return this.dataValues
      .map((value) => {
        const precent = ((value / maxValue) * 100).toFixed(0) + "%";
        return `
          <div 
            style='--value: ${Math.floor(value * scale)}'
            data-tooltip='${precent}'
          ></div>
        `;
      })
      .join("");
  }

  renderChart() {
    const { body, header } = this.subElements;
    body.innerHTML = this.renderValues();
    header.innerHTML = this.renderHeader();
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.HTMLTemplate;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    this.getData().then((data) => {
      this.data = data;
      this.renderChart();
    });
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

  async update(from, to) {
    this.range.from = from;
    this.range.to = to;
    this.data = await this.getData();
    this.renderChart();
    return this.data;
  }

  destroy() {
    this.remove();
  }

  remove() {
    this.element?.remove();
  }
}
