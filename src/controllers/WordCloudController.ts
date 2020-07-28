import {
  Chart,
  DatasetController,
  BarController,
  UpdateMode,
  ChartItem,
  ScriptableAndArrayOptions,
  IControllerDatasetOptions,
  ICommonHoverOptions,
  IChartDataset,
  IChartConfiguration,
} from '@sgratzl/chartjs-esm-facade';
import { WorldElement, IWorldElementOptions, IWorldElementProps } from '../elements';
import patchController from './patchController';

export class WordCloudController extends DatasetController<WorldElement> {
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
    dataElementType: WorldElement.id,
    dataElementOptions: BarController.defaults.dataElementOptions,
  };

  update(mode: UpdateMode) {
    super.update(mode);
    const meta = this._cachedMeta;
    const elems = ((meta.data || []) as unknown) as WorldElement[];
    this.updateElements(elems, 0, mode);
  }

  protected computeLayout(size: IBoundingBox): IWordCloudLayout {
    const nSets = Math.log2(this._cachedMeta.data.length + 1);
    return layout(nSets, size);
  }

  updateElements(slices: WorldElement[], start: number, mode: UpdateMode) {
    const xScale = this._cachedMeta.xScale as { left: number; right: number };
    const yScale = this._cachedMeta.yScale as { top: number; bottom: number };

    const w = xScale.right - xScale.left;
    const h = yScale.bottom - yScale.top;

    const l = this.computeLayout({
      x: xScale.left,
      y: yScale.top,
      width: w,
      height: h,
    });
    (this._cachedMeta as any)._layout = l;
    (this._cachedMeta as any)._layoutFont = (xScale as any)._resolveTickFontOptions(0);

    const firstOpts = this.resolveDataElementOptions(start, mode);
    const sharedOptions = this.getSharedOptions(mode || 'normal', slices[start], firstOpts);
    const includeOptions = this.includeOptions(mode, sharedOptions);

    for (let i = 0; i < slices.length; i++) {
      const slice = slices[i];
      const index = start + i;
      const properties: IWorldElementProps & {
        options?: IWorldElementOptions;
      } = Object.assign({}, l.intersections[index]);
      if (includeOptions) {
        properties.options = (this.resolveDataElementOptions(index, mode) as unknown) as IWorldElementOptions;
      }
      this.updateElement(slice, index, properties as any, mode);
    }
    this.updateSharedOptions(sharedOptions, mode);
  }

  draw() {
    const elements = meta.data;

    const ctx = this.chart.ctx;
    elements.forEach((elem) => elem.draw(ctx));
  }
}

export interface IWordCloudControllerDatasetOptions
  extends IControllerDatasetOptions,
    ScriptableAndArrayOptions<IWorldElementOptions>,
    ScriptableAndArrayOptions<ICommonHoverOptions> {}

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
    super(item, patchController('wordCloud', config, WordCloudController, WorldElement));
  }
}
