/// <reference types="jest" />
import { WordCloudController, IWordCloudControllerConfiguration } from './WordCloudController';
import { registry } from '@sgratzl/chartjs-esm-facade';
import { WordElement } from '../elements';
import matchChart from '../__tests__/matchChart';

describe('default', () => {
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
          data: words.map((_, i) => 10 + (i / words.length) * 90),
        },
      ],
    };
    matchChart<number, string, IWordCloudControllerConfiguration<number, string>>(
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
