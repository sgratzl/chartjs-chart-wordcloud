import {
  Chart,
  DatasetController,
  UpdateMode,
  ChartItem,
  ScriptableAndArrayOptions,
  IControllerDatasetOptions,
  ICommonHoverOptions,
  IChartDataset,
  IChartConfiguration,
  toFont,
} from '@sgratzl/chartjs-esm-facade';
import layout from 'd3-cloud';
import seedrandom from 'seedrandom';
import { WordElement, IWordElementOptions, IWordElementProps } from '../elements';
import patchController from './patchController';

interface ICloudWord extends IWordElementProps {
  options: IWordElementOptions;
  index: number;
}

export class WordCloudController extends DatasetController<WordElement> {
  static readonly id = 'wordCloud';

  static readonly defaults = {
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
    dataElementOptions: [
      'color',
      'family',
      'size',
      'style',
      'weight',
      'strokeStyle',
      'rotate',
      'minRotation',
      'maxRotation',
      'rotationSteps',
      'hoverColor',
      'hoverSize',
      'hoverWeight',
      'hoverStyle',
    ],
  };

  private readonly wordLayout = layout<ICloudWord>()
    .text((d) => d.text)
    .padding((d) => d.options.padding)
    .rotate((d) => d.options.rotate)
    .font((d) => d.options.family)
    .fontSize((d) => d.options.size)
    .fontStyle((d) => d.options.style)
    .fontWeight((d) => d.options.weight!);

  rand: () => number = Math.random;

  update(mode: UpdateMode) {
    super.update(mode);
    this.rand = seedrandom(this.chart.id);
    const meta = this._cachedMeta;

    const elems = ((meta.data || []) as unknown) as WordElement[];
    this.updateElements(elems, 0, mode);
  }

  updateElements(elems: WordElement[], start: number, mode: UpdateMode) {
    this.wordLayout.stop();
    const xScale = this._cachedMeta.xScale as { left: number; right: number };
    const yScale = this._cachedMeta.yScale as { top: number; bottom: number };

    const w = xScale.right - xScale.left;
    const h = yScale.bottom - yScale.top;
    const labels = this.chart.data.labels;

    const words: ICloudWord[] = [];
    for (let i = 0; i < elems.length; i++) {
      const index = start + i;
      const o = (this.resolveDataElementOptions(index, mode) as unknown) as IWordElementOptions;
      if (o.rotate == null) {
        o.rotate = WordElement.computeRotation(o, this.rand);
      }
      const properties: ICloudWord = {
        options: Object.assign({}, toFont(o), o),
        x: this._cachedMeta.xScale!.getPixelForDecimal(0.5)!,
        y: this._cachedMeta.yScale!.getPixelForDecimal(0.5)!,
        width: 10,
        height: 10,
        scale: 1,
        index,
        text: labels[index],
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
              return run(factor * 1.2, tries - 1);
            } else {
              console.warn('cannot fit all text elements in three tries');
            }
          }
          const wb = bounds[1].x - bounds[0].x;
          const hb = bounds[1].y - bounds[0].y;
          const scale = ((this as any)._config as IWordCloudControllerDataset).fit ? Math.min(w / wb, h / hb) : 1;
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

  draw() {
    const elements = this._cachedMeta.data;
    const ctx = this.chart.ctx;
    elements.forEach((elem) => elem.draw(ctx));
  }

  getLabelAndValue(index: number) {
    const r = super.getLabelAndValue(index);
    const labels = this.chart.data.labels;
    r.label = labels[index];
    return r;
  }
}

export interface IWordCloudControllerDatasetOptions
  extends IControllerDatasetOptions,
    ScriptableAndArrayOptions<IWordElementOptions>,
    ScriptableAndArrayOptions<ICommonHoverOptions> {
  fit: boolean;
}

export type IWordCloudControllerDataset<T = number> = IChartDataset<T, IWordCloudControllerDatasetOptions>;

export type IWordCloudControllerConfiguration<T = number, L = string> = IChartConfiguration<
  'wordCloud',
  T,
  L,
  IWordCloudControllerDataset<T>
>;

export class WordCloudChart<T = number, L = string> extends Chart<T, L, IWordCloudControllerConfiguration<T, L>> {
  static readonly id = WordCloudController.id;

  constructor(item: ChartItem, config: Omit<IWordCloudControllerConfiguration<T, L>, 'type'>) {
    super(item, patchController('wordCloud', config, WordCloudController, WordElement));
  }
}
