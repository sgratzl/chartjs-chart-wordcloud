---
title: Getting Started
---

Chart.js module for charting word or tag clouds. Adding new chart type: `wordCloud`.

![word cloud example](https://user-images.githubusercontent.com/4129778/88903326-cbb55a80-d253-11ea-9fb3-ecca1e1ef67f.png)

## Install

```sh
npm install chart.js chartjs-chart-wordcloud
```

## Usage

see [Examples](./examples/)

and [CodePen](https://codepen.io/sgratzl/pen/WNwzYgy)

## Configuration

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

Controller options: [IWordControllerOptions](/api/interfaces/IWordCloudControllerDatasetOptions.html)
Word element options: [IWordElementOptions](/api/interfaces/IWordElementOptions.html)
