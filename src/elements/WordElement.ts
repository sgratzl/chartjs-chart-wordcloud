import { Element, FontSpec, VisualElement, ScriptableAndArrayOptions, ScriptableContext, ChartType } from 'chart.js';
import { toFont } from 'chart.js/helpers';

export interface IWordElementOptions extends FontSpec, Record<string, unknown> {
  color: CanvasRenderingContext2D['fillStyle'];
  /**
   * CanvasContext2D.strokeStyle config for rendering a stroke around the text
   * @default undefined
   */
  strokeStyle: CanvasRenderingContext2D['strokeStyle'];
  /**
   * CanvasContext2D.lineWith for stroke
   * @default undefined
   */
  strokeWidth?: CanvasRenderingContext2D['lineWidth'];
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
  hoverColor: CanvasRenderingContext2D['fillStyle'];
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
  hoverStrokeStyle: CanvasRenderingContext2D['strokeStyle'];
  /**
   * hover variant of stroke width
   * @default undefined
   */
  hoverStrokeWidth?: CanvasRenderingContext2D['lineWidth'];
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
  static readonly id = 'word';

  /**
   * @hidden
   */
  static readonly defaults: any = /* #__PURE__ */ {
    // rotate: 0,
    minRotation: -90,
    maxRotation: 0,
    rotationSteps: 2,
    padding: 1,
    strokeStyle: undefined,
    strokeWidth: undefined,
    size: (ctx) => {
      const v = (ctx.parsed as unknown as { y: number }).y;
      return v;
    },
    hoverColor: '#ababab',
  } as Partial<ScriptableAndArrayOptions<IWordElementOptions, ScriptableContext<'wordCloud'>>>;

  /**
   * @hidden
   */
  static readonly defaultRoutes = /* #__PURE__ */ {
    color: 'color',
    family: 'font.family',
    style: 'font.style',
    weight: 'font.weight',
    lineHeight: 'font.lineHeight',
  };

  /**
   * @hidden
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
   * @hidden
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
   * @hidden
   */
  inXRange(mouseX: number): boolean {
    return this.inRange(mouseX, Number.NaN);
  }

  /**
   * @hidden
   */
  inYRange(mouseY: number): boolean {
    return this.inRange(Number.NaN, mouseY);
  }

  /**
   * @hidden
   */
  getCenterPoint(): { x: number; y: number } {
    return this.getProps(['x', 'y']);
  }

  /**
   * @hidden
   */
  tooltipPosition(): { x: number; y: number } {
    return this.getCenterPoint();
  }

  /**
   * @hidden
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
      if (options.strokeWidth != null) {
        ctx.lineWidth = options.strokeWidth;
      }
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
