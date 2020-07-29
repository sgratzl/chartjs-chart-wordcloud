import { Element, IVisualElement, IFontSpec, toFont, ScriptableAndArrayOptions } from '@sgratzl/chartjs-esm-facade';

export interface IWordElementOptions extends IFontSpec {
  rotate: number;
  padding: number;
}

export interface IWordElementHoverOptions {
  hoverColor: string;
}

export interface IWordElementProps {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
}

function rotatePoint(x: number, y: number, center: { x: number; y: number }, angle: number) {
  if (angle === 0) {
    return { x, y };
  }
  const dx = x - center.x;
  const dy = y - center.y;
  const s = Math.sin(angle);
  const c = Math.cos(angle);
  return {
    x: dx * c - dy * s + center.x,
    y: dx * s + dy * c + center.y,
  };
}

export class WordElement extends Element<IWordElementProps, IWordElementOptions> implements IVisualElement {
  static readonly id = 'word';
  static readonly defaults = /* #__PURE__ */ {
    // rotate: () => Math.floor(Math.random() * 2) * 90,
    rotate: 0,
    padding: 5,
    weight: 'normal',
    size: (ctx) => {
      const v = ctx.dataPoint.y;
      return v;
    },
  } as Partial<ScriptableAndArrayOptions<IWordElementOptions>>;

  inRange(mouseX: number, mouseY: number) {
    const p = this.getProps(['x', 'y', 'width', 'height']);
    const x = Number.isNaN(mouseX) ? p.x : mouseX;
    const y = Number.isNaN(mouseY) ? p.y : mouseY;
    const rotatedPoint = rotatePoint(x, y, p, this.options.rotate);
    return (
      rotatedPoint.x >= p.x - p.width / 2 &&
      rotatedPoint.x <= p.x + p.width / 2 &&
      rotatedPoint.y >= p.y - p.height / 2 &&
      rotatedPoint.y <= p.y + p.height / 2
    );
  }

  inXRange(mouseX: number) {
    return this.inRange(mouseX, Number.NaN);
  }

  inYRange(mouseY: number) {
    return this.inRange(Number.NaN, mouseY);
  }

  getCenterPoint() {
    return this.getProps(['x', 'y']);
  }

  tooltipPosition() {
    return this.getCenterPoint();
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    const options = this.options;
    const props = this.getProps(['x', 'y', 'text']);
    const f = toFont(options);
    ctx.font = f.string;
    ctx.fillStyle = f.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.translate(props.x, props.y);
    ctx.rotate(options.rotate);
    if (f.strokeStyle) {
      ctx.strokeStyle = f.strokeStyle;
      ctx.strokeText(props.text, 0, 0);
    }
    ctx.fillText(props.text, 0, 0);

    ctx.restore();
  }
}
