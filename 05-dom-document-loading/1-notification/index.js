export default class NotificationMessage {
  constructor(msg = "", { duration = 0, type = "error" } = {}) {
    this.msg = msg;
    this.duration = duration;
    this.type = type;

    this.createElement();
  }

  get HTMLTemplate() {
    return `
        <div 
            class="notification ${this.type}"
            style="--value:${this.duration / 1000}s"
        >
            <div class="timer"></div>
                <div class="inner-wrapper">
                <div class="notification-header">${this.type}</div>
                <div class="notification-body">
                    ${this.msg}
                </div>
            </div>
        </div>
    `;
  }

  checkNotification() {
    if (NotificationMessage.element) {
      this.remove();
      if (NotificationMessage.timeout) {
        clearTimeout(NotificationMessage.timeout);
      }
    }
  }

  createElement() {
    this.checkNotification();

    const element = document.createElement("div");
    element.innerHTML = this.HTMLTemplate;
    this.element = NotificationMessage.element = element.firstElementChild;
  }

  show(e = document.body) {
    e.append(NotificationMessage.element);

    NotificationMessage.timeout = setTimeout(() => {
      this.remove();
    }, this.duration);
  }

  remove() {
    NotificationMessage.element.remove();
  }

  destroy() {
    this.remove();
  }
}
