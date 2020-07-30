/// <reference types="jest" />
import { WordCloudController, IWordCloudControllerConfiguration } from './WordCloudController';
import { registry } from '@sgratzl/chartjs-esm-facade';
import { WordElement } from '../elements';
import matchChart from '../__tests__/matchChart';

describe('venn', () => {
  beforeAll(() => {
    registry.addControllers(WordCloudController);
    registry.addElements(WordElement);
  });
  test('default', () => {
    const words = ['Hello', 'world', 'normally', 'you', 'want', 'more', 'words', 'than', 'this'];
    const data = {
      labels: words,
      datasets: [
        {
          label: '',
          data: words.map(() => 10 + Math.random() * 90),
        },
      ],
    };
    return matchChart<number, string, IWordCloudControllerConfiguration<number, string>>(
      {
        type: WordCloudController.id,
        data,
        options: {},
      },
      1000,
      500
    );
  });
});
