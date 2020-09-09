import { WordCloudController } from './controllers';
import { registry } from 'chart.js';
import { WordElement } from './elements';

export * from '.';

registry.addControllers(WordCloudController);
registry.addElements(WordElement);
