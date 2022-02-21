import {
  AnimationOptions,
  Chart,
  DatasetController,
  UpdateMode,
  ChartItem,
  ScriptableAndArrayOptions,
  ControllerDatasetOptions,
  CommonHoverOptions,
  ChartConfiguration,
  ScriptableContext,
  VisualElement,
} from 'chart.js';
import { toFont } from 'chart.js/helpers';
import layout from 'd3-cloud';
import { WordElement, IWordElementOptions, IWordElementProps } from '../elements';
import patchController from './patchController';

function rnd(seed: string | number = Date.now()) {
  // Adapted from http://indiegamr.com/generate-repeatable-random-numbers-in-js/
  let s = typeof seed === 'number' ? seed : Array.from(seed).reduce((acc, v) => acc + v.charCodeAt(0), 0);
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

interface ICloudWord extends IWordElementProps {
  options: IWordElementOptions;
  index: number;
}

export class WordCloudController extends DatasetController<'wordCloud', WordElement> {
  static readonly id = 'wordCloud';

  static readonly defaults = {
    datasets: {
      fit: true,
      animation: {
        colors: {
          properties: ['color', 'strokeStyle'],
        },
        numbers: {
          properties: ['x', 'y', 'size', 'rotate'],
        },
      },
    },
    maintainAspectRatio: false,
    dataElementType: WordElement.id,
  };

  static readonly overrides = {
    scales: {
      x: {
        type: 'linear',
        min: -1,
        max: 1,
        display: false,
      },
      y: {
        type: 'linear',
        min: -1,
        max: 1,
        display: false,
      },
    },
  };

  private readonly wordLayout = layout<ICloudWord>()
    .text((d) => d.text)
    .padding((d) => d.options.padding)
    .rotate((d) => d.options.rotate)
    .font((d) => d.options.family)
    .fontSize((d) => d.options.size)
    .fontStyle((d) => d.options.style)
    .fontWeight((d) => d.options.weight ?? 1);

  rand: () => number = Math.random;

  update(mode: UpdateMode): void {
    super.update(mode);
    this.rand = rnd(this.chart.id);
    const meta = this._cachedMeta;

    const elems = (meta.data || []) as unknown as WordElement[];
    this.updateElements(elems, 0, elems.length, mode);
  }

  updateElements(elems: WordElement[], start: number, count: number, mode: UpdateMode): void {
    this.wordLayout.stop();
    const xScale = this._cachedMeta.xScale as { left: number; right: number };
    const yScale = this._cachedMeta.yScale as { top: number; bottom: number };

    const w = xScale.right - xScale.left;
    const h = yScale.bottom - yScale.top;
    const labels = this.chart.data.labels as string[];

    const words: (ICloudWord & Record<string, unknown>)[] = [];
    for (let i = start; i < start + count; i += 1) {
      const o = this.resolveDataElementOptions(i, mode) as unknown as IWordElementOptions;
      if (o.rotate == null) {
        o.rotate = WordElement.computeRotation(o, this.rand);
      }
      const properties: ICloudWord & Record<string, unknown> = {
        options: { ...toFont(o), ...o },
        x: this._cachedMeta.xScale?.getPixelForDecimal(0.5) ?? 0,
        y: this._cachedMeta.yScale?.getPixelForDecimal(0.5) ?? 0,
        width: 10,
        height: 10,
        scale: 1,
        index: i,
        text: labels[i],
      };
      words.push(properties);
    }
    if (mode === 'reset') {
      words.forEach((tag) => {
        this.updateElement(elems[tag.index], tag.index, tag, mode);
      });
      return;
    }
    // syncish since no time limit is set
    this.wordLayout.random(this.rand).words(words);

    const run = (factor = 1, tries = 3): void => {
      this.wordLayout
        .size([w * factor, h * factor])
        .on('end', (tags, bounds) => {
          if (tags.length < labels.length) {
            if (tries > 0) {
              // try again with a factor of 1.2
              run(factor * 1.2, tries - 1);
              return;
            }
            // eslint-disable-next-line no-console
            console.warn('cannot fit all text elements in three tries');
          }
          const wb = bounds[1].x - bounds[0].x;
          const hb = bounds[1].y - bounds[0].y;

          const dsOptions = (this as any).options as IWordCloudControllerDatasetOptions;
          const scale = dsOptions.fit ? Math.min(w / wb, h / hb) : 1;
          const indices = new Set(labels.map((_, i) => i));
          tags.forEach((tag) => {
            indices.delete(tag.index);
            this.updateElement(
              elems[tag.index],
              tag.index,
              {
                options: tag.options,
                scale,
                x: xScale.left + scale * tag.x + w / 2,
                y: yScale.top + scale * tag.y + h / 2,
                width: scale * tag.width,
                height: scale * tag.height,
                text: tag.text,
              },
              mode
            );
          });
          // hide rest
          indices.forEach((i) => this.updateElement(elems[i], i, { scale: 0 }, mode));
        })
        .start();
    };
    run();
  }

  draw(): void {
    const elements = this._cachedMeta.data as unknown as VisualElement[];
    const { ctx } = this.chart;
    elements.forEach((elem) => elem.draw(ctx));
  }

  getLabelAndValue(index: number): { label: string; value: any } {
    const r = super.getLabelAndValue(index);
    const labels = this.chart.data.labels as string[];
    r.label = labels[index];
    return r;
  }
}

export interface IWordCloudControllerDatasetOptions
  extends ControllerDatasetOptions,
    ScriptableAndArrayOptions<IWordElementOptions, ScriptableContext<'wordCloud'>>,
    ScriptableAndArrayOptions<CommonHoverOptions, ScriptableContext<'wordCloud'>>,
    AnimationOptions<'wordCloud'> {
  /**
   * whether to fit the word cloud to the map, by scaling to the actual bounds
   * @default true
   */
  fit: boolean;
}

declare module 'chart.js' {
  interface ChartTypeRegistry {
    wordCloud: {
      chartOptions: CoreChartOptions<'wordCloud'>;
      datasetOptions: IWordCloudControllerDatasetOptions;
      defaultDataPoint: number[];
      metaExtensions: Record<string, never>;
      parsedDataType: { x: number };
      scales: keyof CartesianScaleTypeRegistry;
    };
  }
}

export class WordCloudChart<DATA extends unknown[] = number[], LABEL = string> extends Chart<'wordCloud', DATA, LABEL> {
  static id = WordCloudController.id;

  constructor(item: ChartItem, config: Omit<ChartConfiguration<'wordCloud', DATA, LABEL>, 'type'>) {
    super(item, patchController('wordCloud', config, WordCloudController, WordElement));
  }
}
