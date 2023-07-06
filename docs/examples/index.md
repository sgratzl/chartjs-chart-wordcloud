---
title: Examples
---

# Examples

<script setup>
import {config} from './basic';
</script>

## Word Cloud

<div style="height: 500px; max-height: 500px">
  <WordCloudChart
    :options="config.options"
    :data="config.data"
  />
</div>

### Code

:::code-group

<<< ./basic.ts#config [config]

<<< ./basic.ts#data [data]

:::
