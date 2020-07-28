/// <reference types="jest" />
import { WordCloudController, IWordCloudControllerConfiguration } from './WordCloudController';
import { extractSets, ISet } from '../data';
import { registry } from '@sgratzl/chartjs-esm-facade';
import { WorldElement } from '../elements';
import matchChart from '../__tests__/matchChart';

describe('venn', () => {
  beforeAll(() => {
    registry.addControllers(WordCloudController);
    registry.addElements(WorldElement);
  });
  test('default', () => {
    const data = extractSets(
      [
        { label: '', values: ['alex', 'casey', 'drew', 'hunter'] },
        { label: '', values: ['casey', 'drew', 'jade'] },
        { label: '', values: ['drew', 'glen', 'jade'] },
      ],
      {
        label: 'Sports',
      }
    );
    expect(data.labels).toHaveLength(7);
    return matchChart<ISet<string>, string, IWordCloudControllerConfiguration<ISet<string>, string>>(
      {
        type: WordCloudController.id as 'venn',
        data,
        options: {},
      },
      1000,
      500
    );
  });
});
