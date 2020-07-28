import { WordCloudController } from './controllers';
import { registry } from '@sgratzl/chartjs-esm-facade';
import { WorldElement } from './elements';

export * from '.';

registry.addControllers(WordCloudController);
registry.addElements(WorldElement);
