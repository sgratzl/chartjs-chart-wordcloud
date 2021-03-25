import { registry } from 'chart.js';
import { WordCloudController } from './controllers';
import { WordElement } from './elements';

export * from '.';

registry.addControllers(WordCloudController);
registry.addElements(WordElement);
