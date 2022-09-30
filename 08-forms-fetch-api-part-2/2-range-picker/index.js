export default class RangePicker {
  subElements = {};
  firstSelect = true;
  firstOpen = "";

  constructor({ from = new Date(), to = new Date() } = {}) {
    this.choosenDate = from;
    this.from = from;
    this.to = to;

    this.render();
  }

  get dayOfWeeksHTMLTemplate() {
    return `
      <div>Пн</div>
      <div>Вт</div>
      <div>Ср</div>
      <div>Чт</div>
      <div>Пт</div>
      <div>Сб</div>
      <div>Вс</div>
    `;
  }

  getDateSelected(dayDate = new Date()) {
    if (dayDate.getTime() === this.from?.getTime()) {
      return "rangepicker__selected-from";
    }
    if (dayDate > this.from && dayDate < this.to) {
      return "rangepicker__selected-between";
    }
    if (dayDate.getTime() === this.to?.getTime()) {
      return "rangepicker__selected-to";
    }
    return "";
  }

  getDateGridHTMLTemplate(date = new Date()) {
    const lastDayOfMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    ).getDate();
    const grid = [];
    for (let day = 1; day <= lastDayOfMonth; day++) {
      const dayDate = new Date(date.getFullYear(), date.getMonth(), day);
      const style =
        day === 1 ? `style="--start-from: ${dayDate.getDay()}"` : "";
      const dateSelected = this.getDateSelected(dayDate);

      const rangePickerCell = `
        <button 
          type="button" 
          class="rangepicker__cell ${dateSelected}" 
          data-value="${dayDate.toDateString()}"
          ${style}
        >
          ${day}
        </button>`;

      grid.push(rangePickerCell);
    }
    return grid.join("");
  }

  getCalendarHTMLTemplate(date = new Date()) {
    const monthName = date.toLocaleString("ru", {
      month: "long",
    });

    return `
      <div class="rangepicker__calendar">
        <div class="rangepicker__month-indicator">
          <time datetime="${monthName}">${monthName}</time>
        </div>
      <div class="rangepicker__day-of-week">
        ${this.dayOfWeeksHTMLTemplate}
      </div>
        <div class="rangepicker__date-grid">
          ${this.getDateGridHTMLTemplate(date)}
        </div>
      </div>
    `;
  }

  get selectorHTMLTemplate() {
    const nextMonthDate = new Date(
      this.choosenDate.getFullYear(),
      this.choosenDate.getMonth() + 1
    );
    return `
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      ${this.getCalendarHTMLTemplate(this.choosenDate)}
      ${this.getCalendarHTMLTemplate(nextMonthDate)}
    `;
  }

  get inputHTMLTemplate() {
    return `
        <span data-element="from">${this.from.toLocaleDateString()}</span>
        -
        <span data-element="to">${this.to.toLocaleDateString()}</span>
    `;
  }

  get HTMLTemplate() {
    return `
      <div class="rangepicker">
        <div class="rangepicker__input" data-element="input">
          ${this.inputHTMLTemplate}
        </div>
        <div class="rangepicker__selector" data-element="selector">${
          this.firstOpen && this.selectorHTMLTemplate
        }</div>
      </div>
    `;
  }

  handleClick = (event) => {
    const outRangePicker = !this.element.contains(event.target);
    const rangePickerInput = event.target.closest(".rangepicker__input");
    const rangePickerCell = event.target.closest(".rangepicker__cell");
    const leftArrow = event.target.closest(
      ".rangepicker__selector-control-left"
    );
    const rightArrow = event.target.closest(
      ".rangepicker__selector-control-right"
    );

    if (outRangePicker) {
      this.element.classList.remove("rangepicker_open");
    }
    if (rangePickerInput) {
      this.openCalendar();
    }
    if (rangePickerCell) {
      this.setRange(rangePickerCell.dataset.value);
    }
    if (leftArrow) {
      this.changeMonth("prev");
    }
    if (rightArrow) {
      this.changeMonth("next");
    }
  };

  openCalendar() {
    if (!this.firstOpen) {
      this.firstOpen = true;
      const { selector } = this.subElements;
      selector.innerHTML = this.selectorHTMLTemplate;
    }
    this.element.classList.toggle("rangepicker_open");
  }

  setRange(date = new Date()) {
    if (this.firstSelect) {
      this.resetRange();
      this.from = new Date(date);
      this.element
        ?.querySelector(`[data-value="${date}"]`)
        ?.classList.add("rangepicker__selected-from");
      this.firstSelect = false;
      return;
    }

    this.to = new Date(date);

    if (this.to < this.from) {
      this.revertRange();
    }

    this.firstSelect = true;
    this.update();

    const dateSelectEvent = new Event("date-select", { bubbles: true });
    this.element.dispatchEvent(dateSelectEvent);
  }

  revertRange() {
    const copy = this.to;
    this.to = this.from;
    this.from = copy;
  }

  resetRange() {
    this.from = new Date(0);
    this.to = new Date(0);
    const { selector } = this.subElements;
    selector.innerHTML = this.selectorHTMLTemplate;
  }

  changeMonth(direction) {
    const directionConvert = {
      prev: -1,
      next: 1,
    };

    this.choosenDate = new Date(
      this.choosenDate.getFullYear(),
      this.choosenDate.getMonth() + directionConvert[direction]
    );

    const { selector } = this.subElements;
    selector.innerHTML = this.selectorHTMLTemplate;
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.HTMLTemplate;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    this.initEventListeners();
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

  initEventListeners() {
    document.addEventListener("click", this.handleClick);
  }

  removeEventListeners() {
    document.removeEventListener("click", this.handleClick);
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
