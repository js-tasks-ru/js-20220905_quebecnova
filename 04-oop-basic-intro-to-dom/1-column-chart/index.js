export default class ColumnChart {
  element;
  chartHeight = 50;

  constructor({
    data = [],
    value = 0,
    label = "",
    link = "",
    formatHeading = null,
  } = {}) {
    this.data = data;
    this.value = this.formatValue(value.toString());
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;

    this.renderChart();
  }

  formatValue(value) {
    let formattedValue = "";
    let i = 0;
    for (const char of value) {
      i++;
      if (i >= 4) {
        formattedValue += `,${char}`;
        i = 0;
        continue;
      }
      formattedValue += char;
    }
    return formattedValue;
  }

  renderLink(chartTitle) {
    const chartTitleLink = document.createElement("a");
    chartTitleLink.classList.add("column-chart__link");
    chartTitleLink.setAttribute("href", this.link);
    chartTitleLink.innerHTML = "View all";
    chartTitle.append(chartTitleLink);
  }

  renderValues(chartValuesContainer) {
    const chartValues = [];
    const maxValue = Math.max(...this.data);

    this.data.forEach((value) => {
      const precent = ((value / maxValue) * 100).toFixed(0) + "%";
      const scale = this.chartHeight / maxValue;
      const chartValue = document.createElement("div");
      chartValue.setAttribute("style", `--value: ${Math.floor(value * scale)}`);
      chartValue.setAttribute("data-tooltip", precent);
      chartValues.push(chartValue);
    });

    chartValuesContainer.append(...chartValues);
  }

  renderChart() {
    const chart = document.createElement("div");
    const chartTitle = document.createElement("div");
    const chartContainer = document.createElement("div");
    const chartValuesContainer = document.createElement("div");
    const chartHeader = document.createElement("div");
    chart.classList.add("column-chart");
    chartTitle.classList.add("column-chart__title");
    chartContainer.classList.add("column-chart__container");
    chartValuesContainer.classList.add("column-chart__chart");
    chartHeader.classList.add("column-chart__header");
    chartHeader.innerHTML = this.value;
    chartContainer.append(chartHeader, chartValuesContainer);
    chartTitle.append("Total " + this.label);
    if (this.formatHeading) {
      chartHeader.innerHTML = this.formatHeading(this.value);
    }
    if (this.link) {
      this.renderLink(chartTitle);
    }
    if (!this.data.length) {
      chart.classList.add("column-chart_loading");
    }
    this.renderValues(chartValuesContainer);
    chart.append(chartTitle, chartContainer);
    this.element = chart;
  }

  update(data) {
    this.data = data;
    this.renderChart()
  }

  destroy() {
    this.data = [];
    this.element = null;
    this.formatHeading = null;
    this.label = "";
    this.link = "";
    this.value = 0;
  }

  remove() {
    this.element = null;
  }
}
