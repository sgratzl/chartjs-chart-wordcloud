import {
  Element,
  IVisualElement,
  defaults,
  IFontSpec,
  toFont,
  ScriptableAndArrayOptions,
  getHoverColor,
} from '@sgratzl/chartjs-esm-facade';

export interface IWordElementOptions extends IFontSpec {
  rotate: number;
  rotationSteps: number;
  minRotation: number;
  maxRotation: number;
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
  scale: number;
  text: string;
}

export class WordElement extends Element<IWordElementProps, IWordElementOptions> implements IVisualElement {
  static readonly id = 'word';
  static readonly defaults = /* #__PURE__ */ {
    // rotate: 0,
    minRotation: -90,
    maxRotation: 0,
    rotationSteps: 2,
    padding: 1,
    weight: 'normal',
    size: (ctx) => {
      const v = ctx.dataPoint.y;
      return v;
    },
    hoverColor: getHoverColor(defaults.color),
  } as Partial<ScriptableAndArrayOptions<IWordElementOptions>>;

  static readonly defaultRoutes = {
    color: 'font.color',
    family: 'font.family',
  };

  static computeRotation(o: IWordElementOptions, rnd: () => number) {
    if (o.rotationSteps <= 1) {
      return 0;
    }
    if (o.minRotation === o.maxRotation) {
      return o.minRotation;
    }
    const base = Math.min(o.rotationSteps, Math.floor(rnd() * o.rotationSteps)) / (o.rotationSteps - 1);
    const range = o.maxRotation - o.minRotation;
    return o.minRotation + base * range;
  }

  inRange(mouseX: number, mouseY: number) {
    const p = this.getProps(['x', 'y', 'width', 'height', 'scale']);
    if (p.scale <= 0) {
      return false;
    }
    const x = Number.isNaN(mouseX) ? p.x : mouseX;
    const y = Number.isNaN(mouseY) ? p.y : mouseY;
    return x >= p.x - p.width / 2 && x <= p.x + p.width / 2 && y >= p.y - p.height / 2 && y <= p.y + p.height / 2;
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
    const options = this.options;
    const props = this.getProps(['x', 'y', 'width', 'height', 'text', 'scale']);
    if (props.scale <= 0) {
      return;
    }
    ctx.save();
    const f = toFont(
      Object.assign({}, options, {
        size: options.size * props.scale,
      })
    );
    ctx.font = f.string;
    ctx.fillStyle = f.color;
    ctx.textAlign = 'center';
    // ctx.textBaseline = 'top';
    ctx.translate(props.x, props.y);
    // ctx.strokeRect(-props.width / 2, -props.height / 2, props.width, props.height);
    ctx.rotate((options.rotate / 180) * Math.PI);
    if (f.strokeStyle) {
      ctx.strokeStyle = f.strokeStyle;
      ctx.strokeText(props.text, 0, 0);
    }
    ctx.fillText(props.text, 0, 0);

    ctx.restore();
  }
}
