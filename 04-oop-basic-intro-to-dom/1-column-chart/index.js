export default class ColumnChart {
  element;
  chartHeight = 50;

  constructor({
    data = [],
    value = 0,
    label = "",
    link = "",
    formatHeading = (value) => value,
  } = {}) {
    this.data = data;
    this.value = value;
    this.label = label;
    this.link = link;
    this.formattedHeading = formatHeading(value);

    this.renderChart();
  }

  get HTMLTemplate() {
    return `
      <div class='column-chart column-chart_loading'>
        <div class='column-chart__title'>
          Total ${this.label}
          ${this.renderLink()}
        </div>
        <div class='column-chart__container'>
          <div class='column-chart__header'>${this.formattedHeading}</div>
          <div class='column-chart__chart'>
            ${this.renderValues()}
          </div>
        </div>
      </div>
    `;
  }

  renderLink() {
    if (!this.link) return "";
    return `
      <a class='column-chart__link' href=${this.link}>
        View all
      </a>
    `;
  }

  renderValues() {
    if (!this.data.length) return;
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;
    return this.data
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
    const element = document.createElement("div");
    element.innerHTML = this.HTMLTemplate;
    this.element = element.firstElementChild;

    if (this.data.length) {
      this.element.classList.remove("column-chart_loading");
    }
  }

  update(data) {
    this.data = data;
    this.renderChart();
  }

  destroy() {
    this.remove();
  }

  remove() {
    this.element?.remove();
  }
}
