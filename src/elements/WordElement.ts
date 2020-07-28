import { Element, Rectangle, IVisualElement, ICommonOptions } from '@sgratzl/chartjs-esm-facade';

export interface IWorldElementOptions extends ICommonOptions {}

export interface IWorldElementProps {
  x: number;
  y: number;
}

export class WorldElement extends Element<IWorldElementProps, IWorldElementOptions> implements IVisualElement {
  static readonly id = 'word';
  static readonly defaults = /* #__PURE__ */ Object.assign({}, Rectangle.defaults, {
    backgroundColor: '#efefef',
  });

  inRange(mouseX: number, mouseY: number) {
    return false;
  }

  inXRange(mouseX: number) {
    return this.inRange(mouseX, Number.NaN);
  }

  inYRange(mouseY: number) {
    return this.inRange(Number.NaN, mouseY);
  }

  getCenterPoint() {
    return this.getProps();
  }

  tooltipPosition() {
    return this.getCenterPoint();
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    const options = this.options;
    const props = this.getProps([]);

    ctx.restore();
  }
}
