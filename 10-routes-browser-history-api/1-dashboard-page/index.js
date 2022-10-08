import RangePicker from "./components/range-picker/src/index.js";
import SortableTable from "./components/sortable-table/src/index.js";
import ColumnChart from "./components/column-chart/src/index.js";
import header from "./bestsellers-header.js";

import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru/";

export default class Page {
  range = {
    to: new Date(),
    from: new Date(new Date().setMonth(new Date().getMonth() - 1))
  }

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
    this.sortableTableInst = new SortableTable(header, {
      url: "api/dashboard/bestsellers"
    });

    const {from, to} = this.range;

    const data = await this.loadBestSellersData(from, to);
    this.sortableTableInst.renderRows(data);  

    this.subElements.sortableTable.append(this.sortableTableInst.element);
  }

  async renderRangePicker() {
    this.rangePickerInst = new RangePicker(this.range);

    this.subElements.rangePicker.append(this.rangePickerInst.element);
  }

  async renderColumnChart() {

    this.ordersChartInst = new ColumnChart({
      url: "api/dashboard/orders",
      range: this.range,
      label: "orders",
      link: "#",
    });

    this.salesChartInst = new ColumnChart({
      url: "api/dashboard/sales",
      range: this.range,
      label: "sales",
      formatHeading: (data) => `$${data}`,
    });

    this.customersChartInst = new ColumnChart({
      url: "api/dashboard/customers",
      range: this.range,
      label: "customers",
    });

    const { ordersChart, salesChart, customersChart } = this.subElements;

    ordersChart.append(this.ordersChartInst.element);
    salesChart.append(this.salesChartInst.element);
    customersChart.append(this.customersChartInst.element);
  }
  
  async loadBestSellersData(from, to, start = '1', end = '20') {
    const url = new URL('api/dashboard/bestsellers', BACKEND_URL);

    url.searchParams.set('from', from);
    url.searchParams.set('to', to);
    url.searchParams.set('_start', start);
    url.searchParams.set('_end', end);

    this.sortableTableInst.element.classList.add('sortable-table_loading');

    const data = await fetchJson(url.toString());

    this.sortableTableInst.element.classList.remove('sortable-table_loading');

    return data;
  }

  handleDateChange = async (event) => {
    const progressBar = document.querySelector('.progress-bar');
    progressBar.style.display = 'block';

    const {from, to} = event.detail;

    this.ordersChartInst.update(from, to);
    this.salesChartInst.update(from, to);
    this.customersChartInst.update(from, to);
    
    const bestSellersData = await this.loadBestSellersData(from, to);
    this.sortableTableInst.renderRows(bestSellersData);

    progressBar.style.display = 'none';
  }

  async render() {
    const element = document.createElement("div");

    element.innerHTML = this.HTMLTemplate;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    const progressBar = document.querySelector('.progress-bar');
    progressBar.style.display = 'block';

    await this.renderColumnChart();
    await this.renderRangePicker();
    await this.renderSortableTable();

    this.initEventListeners();

    progressBar.style.display = 'none';
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
    this.element.addEventListener('date-select', this.handleDateChange);
  }

  removeEventListeners() {
    this.element.removeEventListener('date-select', this.handleDateChange);
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
