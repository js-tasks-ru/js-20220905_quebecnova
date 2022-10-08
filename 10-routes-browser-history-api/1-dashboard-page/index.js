import RangePicker from "./components/range-picker/src/index.js";
import SortableTable from "./components/sortable-table/src/index.js";
import ColumnChart from "./components/column-chart/src/index.js";
import header from "./bestsellers-header.js";

import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru/";

export default class Page {
  get HTMLTemplate() {
    return `
    <div class="dashboard">
      <div class="content__top-panel">
        <h2 class="page-title">Dashboard</h2>
        <!-- RangePicker component -->
        <div data-element="rangePicker"></div>
      </div>
      <div data-element="chartsRoot" class="dashboard__charts">
        <!-- column-chart components -->
        <div data-element="ordersChart" class="dashboard__chart_orders"></div>
        <div data-element="salesChart" class="dashboard__chart_sales"></div>
        <div data-element="customersChart" class="dashboard__chart_customers"></div>
      </div>

      <h3 class="block-title">Best sellers</h3>

      <div data-element="sortableTable">
        <!-- sortable-table component -->
      </div>
    </div>
    `;
  }

  async renderSortableTable() {
    const sortableTableInst = new SortableTable(header, {
      url: "api/rest/products",
    });

    this.subElements.sortableTable.append(sortableTableInst.element);
  }

  async renderRangePicker() {
    const rangePickerInst = new RangePicker({
      from: new Date(2019, 9, 2),
      to: new Date(2019, 10, 5),
    });

    this.subElements.rangePicker.append(rangePickerInst.element);
  }

  async renderColumnChart() {
    const getRange = () => {
      const now = new Date();
      const to = new Date();
      const from = new Date(now.setMonth(now.getMonth() - 1));

      return { from, to };
    };

    const { from, to } = getRange();

    const ordersChartInst = new ColumnChart({
      url: "api/dashboard/orders",
      range: {
        from,
        to,
      },
      label: "orders",
      link: "#",
    });

    const salesChartInst = new ColumnChart({
      url: "api/dashboard/sales",
      range: {
        from,
        to,
      },
      label: "sales",
      formatHeading: (data) => `$${data}`,
    });

    const customersChartInst = new ColumnChart({
      url: "api/dashboard/customers",
      range: {
        from,
        to,
      },
      label: "customers",
    });

    const { ordersChart, salesChart, customersChart } = this.subElements;

    ordersChart.append(ordersChartInst.element);
    salesChart.append(salesChartInst.element);
    customersChart.append(customersChartInst.element);
  }

  async render() {
    const element = document.createElement("div");

    element.innerHTML = this.HTMLTemplate;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    await this.renderColumnChart();
    await this.renderRangePicker();
    await this.renderSortableTable();
    return this.element;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll("[data-element]");

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initEventListeners() {
    document.addEventListener("pointerdown", this.handleClick);
  }

  removeEventListeners() {
    document.removeEventListener("pointerdown", this.handleClick);
    document.removeEventListener("pointermove", this.moveItem);
    document.removeEventListener("pointerup", this.dropItem);
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
