class Vector {
  constructor({x, y}) {
    this.x = x;
    this.y = y;
  }

  static get zero() { return new Vector({x: 0, y: 0}); }

  copy() {
    return new Vector({x: this.x, y: this.y});
  }

  increase({x = 0, y = 0}) {
    this.x += x;
    this.y += y;
    return this;
  }

  decrease({x = 0, y = 0}) {
    this.x -= x;
    this.y -= y;
    return this;
  }

  set(vector) {
    this.x = vector.x;
    this.y = vector.y;
    return this;
  }

  distance(vector) {
    return Math.sqrt((this.x - vector.x) ** 2 + (this.y - vector.y) ** 2);
  }

  equals(vector) {
    return this.x === vector.x && this.y === vector.y;
  }

  angle(vector) {
    return Math.atan2(vector.y - this.y, vector.x - this.x);
  }

  moveByAngle(angle, distance) {
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    this.x += dx;
    this.y += dy;
    return this;
  }

  magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  normalize() {
    const mag = this.magnitude();
    return mag === 0 ? this.copy() : new Vector({ x: this.x / mag, y: this.y / mag });
  }

  dotProduct(vector) {
    return this.x * vector.x + this.y * vector.y;
  }

  negate() {
    this.x = -this.x;
    this.y = -this.y;
    return this;
  }

  scale(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  divide(scalar) {
    this.x /= scalar;
    this.y /= scalar;
    return this;
  }

  crossProduct(vector) {
    return this.x * vector.y - this.y * vector.x;
  }

  add(vector) {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  }

  subtract(vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    return this;
  }

  toString() {
    return `Vector(x: ${this.x}, y: ${this.y})`;
  }
}

export { Vector };