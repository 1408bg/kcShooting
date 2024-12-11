/** @typedef {'ANDROID' | 'IOS' | 'WEB'} Platform */

class Canvas {
  /** @type {HTMLCanvasElement} */
  #root;
  /** @type {Platform} */
  #platform;
  /** @type {Set} */
  #knots;

  constructor({root = false, useDefaultStyle = true, initHTMLStyle = false, useFullScreen = false}) {
    this.#root = root;
    this.#platform = (() => {
      const ua = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) return 'IOS';
      if (/android|wv/.test(ua)) return 'ANDROID';
      return 'WEB';
    })();
    if (useDefaultStyle) {
      root.style.position = 'relative';
      root.style.overflow = 'hidden';
      root.style.userSelect = 'none';
      root.oncontextmenu = ()=>false;
    }
    if (initHTMLStyle) {
      const style = document.createElement('style');
      style.innerHTML = '* { margin: 0; padding: 0; overflow: hidden; }';
      document.head.appendChild(style);
    }
    if (useFullScreen) {
      const dpr = window.devicePixelRatio || 1;
      root.width = window.innerWidth * dpr;
      root.height = window.innerHeight * dpr;
    }
    this.#knots = new Set();
  }

  get width() { return this.#root.width; }
  get height() { return this.#root.height; }
  get platform() { return this.#platform; }

  addKnot(knot) {
    this.#knots.add(knot);
  }

  removeKnot(knot) {
    this.#knots.delete(knot);
  }

  getDrawLoop() {
    return (function *() {
      const canvas = this.#root;
      const ctx = canvas.getContext('2d');
      while (true) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.#knots.forEach((knot) => {
          knot.draw(ctx);
        });
        yield null;
      }
    }).bind(this);
  }
}

export { Canvas };