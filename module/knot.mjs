import { Vector } from "./vector.mjs";
import { Color } from "./color.mjs";

class ColorKnot {
  constructor({ x = 0, y = 0, width = 0, height = 0, color = Color.fromHex('#000000'), opacity = 1, position = false }) {
    this.position = position ? position : new Vector({ x: x, y: y });
    this.width = width;
    this.height = height;
    this.color = color;
    this.opacity = opacity;
  }

  draw(ctx, dx = 0, dy = 0) {
    ctx.fillStyle = this.color.toString();
    ctx.globalAlpha = this.opacity;
    ctx.fillRect(this.position.x + dx, this.position.y + dy, this.width, this.height);
  }

  intersects(other) {
    return this.position.x < other.position.x + other.width &&
           this.position.x + this.width > other.position.x &&
           this.position.y < other.position.y + other.height &&
           this.position.y + this.height > other.position.y;
  }
}

class TextKnot {
  constructor({ x = 0, y = 0, maxWidth = undefined, text = '', color = Color.fromHex('#000000'), opacity = 1, position = false, fontSize = 5 }) {
    this.position = position ? position : new Vector({ x: x, y: y });
    this.text = text;
    this.color = color;
    this.fontSize = fontSize;
    this.opacity = opacity;
    this.maxWidth = maxWidth;
  }

  draw(ctx, dx = 0, dy = 0) {
    ctx.fillStyle = this.color.toString();
    ctx.globalAlpha = this.opacity;
    ctx.font = `${this.fontSize}px Arial`;
    ctx.fillText(this.text, this.position.x + dx, this.position.y + dy, this.maxWidth);
  }

  intersects(other) {
    const width = this.maxWidth || this.text.length * this.fontSize * 0.6;
    const height = this.fontSize;
    return this.position.x < other.position.x + other.width &&
           this.position.x + width > other.position.x &&
           this.position.y < other.position.y + other.height &&
           this.position.y + height > other.position.y;
  }
}

class BorderKnot {
  constructor({ x = 0, y = 0, width = 0, height = 0, color = Color.fromHex('#000000'), opacity = 1, borderWidth = 1, position = false }) {
    this.position = position ? position : new Vector({ x: x, y: y });
    this.width = width;
    this.height = height;
    this.color = color;
    this.opacity = opacity;
    this.borderWidth = borderWidth;
  }

  draw(ctx, dx = 0, dy = 0) {
    ctx.strokeStyle = this.color.toString();
    ctx.globalAlpha = this.opacity;
    ctx.lineWidth = this.borderWidth;
    ctx.strokeRect(this.position.x + dx, this.position.y + dy, this.width, this.height);
  }

  intersects(other) {
    const thisOuter = {
      x: this.position.x - this.borderWidth / 2,
      y: this.position.y - this.borderWidth / 2,
      width: this.width + this.borderWidth,
      height: this.height + this.borderWidth
    };

    const otherOuter = {
      x: other.position.x - (other.borderWidth || 0) / 2,
      y: other.position.y - (other.borderWidth || 0) / 2,
      width: other.width + (other.borderWidth || 0),
      height: other.height + (other.borderWidth || 0)
    };

    return thisOuter.x < otherOuter.x + otherOuter.width &&
           thisOuter.x + thisOuter.width > otherOuter.x &&
           thisOuter.y < otherOuter.y + otherOuter.height &&
           thisOuter.y + thisOuter.height > otherOuter.y;
  }
}

export { ColorKnot, TextKnot, BorderKnot };
