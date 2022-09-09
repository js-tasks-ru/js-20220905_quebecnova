export default class ColumnChart {
  element;
  chartHeight = 50;

  constructor({
    data = [],
    value = 0,
    label = "",
    link = "",
    formatHeading = () => value,
  } = {}) {
    this.data = data;
    this.value = value;
    this.label = label;
    this.link = link;
    this.formattedHeading = formatHeading(
      new Intl.NumberFormat("en").format(value)
    );

    this.renderChart();
  }

  get HTMLTemplate() {
    return `
      <div class='column-chart column-chart_loading'>
        <div class='column-chart__title'>
          Total ${this.label}
          ${this.link && this.renderLink()}
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
    let chartContainer = "";
    for (const value of this.data) {
      const precent = ((value / maxValue) * 100).toFixed(0) + "%";
      chartContainer += `
        <div 
          style='--value: ${Math.floor(value * scale)}'
          data-tooltip='${precent}'
        ></div>
      `;
    }
    return chartContainer;
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
