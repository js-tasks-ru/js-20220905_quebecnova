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
    this.formattedHeading = formatHeading(value);

    this.renderChart();
  }

  renderLink() {
    return `
      <a class='column-chart__link' href=${this.link}>
        View all
      </a>
    `;
  }

  renderValues() {
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
    const isLoading = !this.data.length;
    this.element = document.createElement("div");
    this.element.className = `column-chart ${
      isLoading ? "column-chart_loading" : ""
    }`;
    this.element.innerHTML = `
        <div class='column-chart__title'>
          Total ${this.label}
          ${this.link && this.renderLink()}
        </div>
        <div class='column-chart__container'>
          <div class='column-chart__header'>${this.formattedHeading}</div>
          <div class='column-chart__chart'>
            ${!isLoading ? this.renderValues() : ""}
          </div>
        </div>
    `;
  }

  update(data) {
    this.data = data;
    this.renderChart();
  }

  destroy() {
    this.remove();
  }

  remove() {
    this.element.remove();
  }
}
