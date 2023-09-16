import Theme from 'vitepress/theme';
import { createTypedChart } from 'vue-chartjs';
import { Tooltip, LinearScale } from 'chart.js';
import { WordCloudController, WordElement } from '../../../src';

export default {
  ...Theme,
  enhanceApp({ app }) {
    app.component(
      'WordCloudChart',
      createTypedChart('wordCloud', [Tooltip, LinearScale, WordCloudController, WordElement])
    );
  },
};
