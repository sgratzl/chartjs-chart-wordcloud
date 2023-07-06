import { Element, FontSpec, VisualElement, ScriptableAndArrayOptions, ScriptableContext, ChartType } from 'chart.js';
import { toFont } from 'chart.js/helpers';

export interface IWordElementOptions extends FontSpec, Record<string, unknown> {
  color: string;
  /**
   * CanvasContext2D.strokeStyle config for rendering a stroke around the text
   * @default undefined
   */
  strokeStyle: string;
  /**
   * rotation of the word
   * @default undefined then it will be randomly derived given the other constraints
   */
  rotate: number;
  /**
   * number of rotation steps between min and max rotation
   * @default 2
   */
  rotationSteps: number;
  /**
   * angle in degree for the min rotation
   * @default -90
   */
  minRotation: number;
  /**
   * angle in degree for the max rotation
   * @default 0
   */
  maxRotation: number;
  /**
   * padding around each word while doing the layout
   * @default 1
   */
  padding: number;
}

export interface IWordElementHoverOptions {
  /**
   * hover variant of color
   */
  hoverColor: string;
  /**
   * hover variant of size
   */
  hoverSize: FontSpec['size'];
  /**
   * hover variant of style
   */
  hoverStyle: FontSpec['style'];
  /**
   * hover variant of weight
   */
  hoverWeight: FontSpec['weight'];
  /**
   * hover variant of stroke style
   * @default undefined
   */
  hoverStrokeStyle: string;
}

export interface IWordElementProps {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  text: string;
}

export class WordElement extends Element<IWordElementProps, IWordElementOptions> implements VisualElement {
  /**
   * @internal
   */
  static readonly id = 'word';

  /**
   * @internal
   */
  static readonly defaults: any = /* #__PURE__ */ {
    // rotate: 0,
    minRotation: -90,
    maxRotation: 0,
    rotationSteps: 2,
    padding: 1,
    strokeStyle: undefined,
    size: (ctx) => {
      const v = (ctx.parsed as unknown as { y: number }).y;
      return v;
    },
    hoverColor: '#ababab',
  } as Partial<ScriptableAndArrayOptions<IWordElementOptions, ScriptableContext<'wordCloud'>>>;

  /**
   * @internal
   */
  static readonly defaultRoutes = {
    color: 'color',
    family: 'font.family',
    style: 'font.style',
    weight: 'font.weight',
    lineHeight: 'font.lineHeight',
  };

  /**
   * @internal
   */
  static computeRotation(o: IWordElementOptions, rnd: () => number): number {
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

  /**
   * @internal
   */
  inRange(mouseX: number, mouseY: number): boolean {
    const p = this.getProps(['x', 'y', 'width', 'height', 'scale']);
    if (p.scale <= 0) {
      return false;
    }
    const x = Number.isNaN(mouseX) ? p.x : mouseX;
    const y = Number.isNaN(mouseY) ? p.y : mouseY;
    return x >= p.x - p.width / 2 && x <= p.x + p.width / 2 && y >= p.y - p.height / 2 && y <= p.y + p.height / 2;
  }

  /**
   * @internal
   */
  inXRange(mouseX: number): boolean {
    return this.inRange(mouseX, Number.NaN);
  }

  /**
   * @internal
   */
  inYRange(mouseY: number): boolean {
    return this.inRange(Number.NaN, mouseY);
  }

  /**
   * @internal
   */
  getCenterPoint(): { x: number; y: number } {
    return this.getProps(['x', 'y']);
  }

  /**
   * @internal
   */
  tooltipPosition(): { x: number; y: number } {
    return this.getCenterPoint();
  }

  /**
   * @internal
   */
  draw(ctx: CanvasRenderingContext2D): void {
    const { options } = this;
    const props = this.getProps(['x', 'y', 'width', 'height', 'text', 'scale']);
    if (props.scale <= 0) {
      return;
    }
    ctx.save();
    const f = toFont({ ...options, size: options.size * props.scale });
    ctx.font = f.string;
    ctx.fillStyle = options.color;
    ctx.textAlign = 'center';
    // ctx.textBaseline = 'top';
    ctx.translate(props.x, props.y);
    // ctx.strokeRect(-props.width / 2, -props.height / 2, props.width, props.height);
    ctx.rotate((options.rotate / 180) * Math.PI);
    if (options.strokeStyle) {
      ctx.strokeStyle = options.strokeStyle;
      ctx.strokeText(props.text, 0, 0);
    }
    ctx.fillText(props.text, 0, 0);

    ctx.restore();
  }
}

declare module 'chart.js' {
  export interface ElementOptionsByType<TType extends ChartType> {
    word: ScriptableAndArrayOptions<IWordElementOptions & IWordElementHoverOptions, ScriptableContext<TType>>;
  }
}
