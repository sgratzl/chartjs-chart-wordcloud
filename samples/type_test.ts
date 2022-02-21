import { Chart } from 'chart.js';
import { WordCloudController, WordElement } from '../build';

Chart.register(WordCloudController, WordElement);

const ctx = document.querySelector('canvas').getContext('2d');

const chart = new Chart(ctx, {
  type: 'wordCloud',
  data: {
    // text
    labels: ['Hello', 'world', 'normally', 'you', 'want', 'more', 'words', 'than', 'this'],
    datasets: [
      {
        label: 'DS',
        maxRotation: 90,
        // size in pixel
        data: [90, 80, 70, 60, 50, 40, 30, 20, 10],
      },
    ],
  },
  options: {
    elements: {
      word: {
        maxRotation: 90,
      },
    },
  },
});
