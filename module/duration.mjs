class Duration {
  constructor({ milisecond = 0, second = 0, minute = 0, hour = 0, day = 0 }) {
    this.value = milisecond
    + second * 1000
    + minute * 60 * 1000
    + hour * 60 * 60 * 1000
    + day * 24 * 60 * 60 * 1000;
  }

  static get zero() { return new Duration({milisecond: 0}); }
}

export { Duration };