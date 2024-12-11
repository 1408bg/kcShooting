import { Vector } from "./vector.mjs";

class Group {
  constructor({ x = 0, y = 0, position = false, children = [] }) {
    this.position = position ? position : new Vector({ x: x, y: y });
    this.children = children;
  }

  draw(ctx, dx = 0, dy = 0) {
    this.children.forEach((child) => {
      child.draw(ctx, this.position.x + dx, this.position.y + dy);
    });
  }
}

export { Group };