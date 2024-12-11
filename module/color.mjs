class Color {
  constructor({ r, g, b, a }) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  static get transparent() {
    return new Color({
      r: 0,
      g: 0,
      b: 0,
      a: 0
    });
  }

  static fromRGB({ r, g, b }) {
    return new Color({ r, g, b, a: 1 });
  }

  static fromHex(hex) {
    hex = hex.replace('#', '');
    let r, g, b, a = 1;

    if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else if (hex.length === 8) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
      a = parseInt(hex.substring(6, 8), 16) / 255;
    }

    return new Color({ r, g, b, a });
  }
  
  copy() {
    return new Color({
      r: this.r,
      g: this.g,
      b: this.b,
      a: this.a
    });
  }

  adjustAlpha(newAlpha) {
    this.a = newAlpha;
    return this;
  }

  lighten(amount) {
    this.r = Math.min(255, this.r + amount);
    this.g = Math.min(255, this.g + amount);
    this.b = Math.min(255, this.b + amount);
    this.a = this.a;
    return this;
  }
  
  darken(amount) {
    this.r = Math.max(0, this.r - amount);
    this.g = Math.max(0, this.g - amount);
    this.b = Math.max(0, this.b - amount);
    this.a = this.a;
    return this;
  }

  equals(color) {
    return this.r === color.r && this.g === color.g && this.b === color.b && this.a === color.a;
  }

  toHex() {
    const toHexComponent = (value) => value.toString(16).padStart(2, '0');
    return `#${toHexComponent(this.r)}${toHexComponent(this.g)}${toHexComponent(this.b)}${this.a < 1 ? toHexComponent(Math.round(this.a * 255)) : ''}`;
  }

  toString() {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
  }
}

export { Color };
