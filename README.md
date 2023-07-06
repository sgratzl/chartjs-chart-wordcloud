# Chart.js Word Clouds

[![NPM Package][npm-image]][npm-url] [![Github Actions][github-actions-image]][github-actions-url]

Chart.js module for charting word or tag clouds. Adding new chart type: `wordCloud`.

![word cloud example](https://user-images.githubusercontent.com/4129778/88903326-cbb55a80-d253-11ea-9fb3-ecca1e1ef67f.png)

## Related Plugins

Check out also my other chart.js plugins:

- [chartjs-chart-boxplot](https://github.com/sgratzl/chartjs-chart-boxplot) for rendering boxplots and violin plots
- [chartjs-chart-error-bars](https://github.com/sgratzl/chartjs-chart-error-bars) for rendering errors bars to bars and line charts
- [chartjs-chart-geo](https://github.com/sgratzl/chartjs-chart-geo) for rendering map, bubble maps, and choropleth charts
- [chartjs-chart-graph](https://github.com/sgratzl/chartjs-chart-graph) for rendering graphs, trees, and networks
- [chartjs-chart-pcp](https://github.com/sgratzl/chartjs-chart-pcp) for rendering parallel coordinate plots
- [chartjs-chart-venn](https://github.com/sgratzl/chartjs-chart-venn) for rendering venn and euler diagrams
- [chartjs-plugin-hierarchical](https://github.com/sgratzl/chartjs-plugin-hierarchical) for rendering hierarchical categorical axes which can be expanded and collapsed

## Install

```bash
npm install --save chart.js chartjs-chart-wordcloud
```

## Usage

see [Examples](https://www.sgratzl.com/chartjs-chart-wordcloud/examples/)

or at this [![Open in CodePen][codepen]](https://codepen.io/sgratzl/pen/WNwzYgy)

## Word Cloud

### Data Structure

```ts
const config = {
  type: 'wordCloud',
  data: {
    // text
    labels: ['Hello', 'world', 'normally', 'you', 'want', 'more', 'words', 'than', 'this'],
    datasets: [
      {
        label: 'DS',
        // size in pixel
        data: [90, 80, 70, 60, 50, 40, 30, 20, 10],
      },
    ],
  },
  options: {},
};
```

### Styling of elements

A word has the basic FontSpec styling options (family, color, ...). In addition it has several options regarding rotating the text.

Controller options:

https://github.com/sgratzl/chartjs-chart-wordcloud/blob/14ac8327c2209c0d8f89fdd6cd86d2b2d7daedce/src/controllers/WordCloudController.ts#L184-L193

Word element options:

https://github.com/sgratzl/chartjs-chart-wordcloud/blob/14ac8327c2209c0d8f89fdd6cd86d2b2d7daedce/src/elements/WordElement.ts#L3-L29

## ESM and Tree Shaking

The ESM build of the library supports tree shaking thus having no side effects. As a consequence the chart.js library won't be automatically manipulated nor new controllers automatically registered. One has to manually import and register them.

Variant A:

```js
import { Chart } from 'chart.js';
import { WordCloudController, WordElement } from 'chartjs-chart-wordcloud';

Chart.register(WordCloudController, WordElement);
...

new Chart(ctx, {
  type: WordCloudController.id,
  data: [...],
});
```

Variant B:

```js
import { WordCloudChart } from 'chartjs-chart-wordcloud';

new WordCloudChart(ctx, {
  data: [...],
});
```

## Development Environment

```sh
npm i -g yarn
yarn install
yarn sdks vscode
```

### Common commands

```sh
yarn compile
yarn test
yarn lint
yarn fix
yarn build
yarn docs
```

[mit-image]: https://img.shields.io/badge/License-MIT-yellow.svg
[mit-url]: https://opensource.org/licenses/MIT
[npm-image]: https://badge.fury.io/js/chartjs-chart-wordcloud.svg
[npm-url]: https://npmjs.org/package/chartjs-chart-wordcloud
[github-actions-image]: https://github.com/sgratzl/chartjs-chart-wordcloud/workflows/ci/badge.svg
[github-actions-url]: https://github.com/sgratzl/chartjs-chart-wordcloud/actions
[codepen]: https://img.shields.io/badge/CodePen-open-blue?logo=codepen
