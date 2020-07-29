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
}

export class WordCloudController extends DatasetController<WordElement> {
  static readonly id: string = 'wordCloud';

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
    },
    dataElementType: WordElement.id,
    dataElementOptions: ['color', 'family', 'size', 'style', 'weight', 'strokeStyle', 'rotate', 'hoverColor'],
  };

  private readonly wordLayout = layout<ICloudWord>()
    .text((d) => d.text)
    .padding((d) => d.options.padding)
    .rotate((d) => d.options.rotate)
    .font((d) => d.options.family)
    .fontSize((d) => d.options.size)
    .fontStyle((d) => d.options.style)
    .fontWeight((d) => d.options.weight!);

  update(mode: UpdateMode) {
    super.update(mode);
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
      const properties: ICloudWord = {
        options: Object.assign({}, toFont(o), o),
        x: this._cachedMeta.xScale!.getValueForPixel(0)!,
        y: this._cachedMeta.yScale!.getValueForPixel(0)!,
        width: 10,
        height: 10,
        text: labels[index],
      };
      words.push(properties);
    }
    // syncish since no time limit is set
    this.wordLayout
      .random(seedrandom(this.chart.id))
      .words(words)
      .size([w, h])
      .on('end', (tags, bounds) => {
        const wb = bounds[1].x - bounds[0].x;
        const hb = bounds[1].y - bounds[0].y;
        const scale = ((this as any)._config as IWordCloudControllerDataset).fit ? Math.min(w / wb, h / hb) : 1;
        tags.forEach((tag, i) => {
          tag.options.size = scale * tag.options.size;
          this.updateElement(
            elems[i],
            i,
            {
              options: tag.options,
              x: xScale.left + scale * tag.x + w / 2,
              y: yScale.top + scale * tag.y + h / 2,
              width: scale * tag.width,
              height: scale * tag.height,
              text: tag.text,
            },
            mode
          );
        });
      })
      .start();
  }

  draw() {
    const elements = this._cachedMeta.data;
    const ctx = this.chart.ctx;
    elements.forEach((elem) => elem.draw(ctx));
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
