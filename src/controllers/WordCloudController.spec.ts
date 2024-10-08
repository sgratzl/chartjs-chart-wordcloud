import { LinearScale, registry } from 'chart.js';
import { WordCloudController } from './WordCloudController';
import { WordElement } from '../elements';
import createChart from '../__tests__/createChart';
import { describe, beforeAll, test } from 'vitest';
describe('default', () => {
  beforeAll(() => {
    registry.addControllers(WordCloudController);
    registry.addElements(WordElement);
    registry.addScales(LinearScale);
  });
  test('default', () => {
    const words = ['Hello', 'world', 'normally', 'you', 'want', 'more', 'words', 'than', 'this'];
    const data = {
      labels: words,
      datasets: [
        {
          label: '',
          data: words.map((_, i) => 10 + (i / words.length) * 90),
          randomRotationSeed: 'x',
        },
      ],
    };
    const chart = createChart(
      {
        type: WordCloudController.id,
        data,
        options: {},
      },
      1000,
      500
    );

    return chart.toMatchImageSnapshot({
      failureThreshold: 1.85,
      failureThresholdType: 'percent',
    });
  });
});
