---
title: Stroke
---

# Stroke

<script setup>
import {stroke} from './basic';
</script>

## Word Cloud

<div style="height: 500px; max-height: 500px">
  <WordCloudChart
    :options="stroke.options"
    :data="stroke.data"
  />
</div>

### Code

:::code-group

<<< ./basic.ts#stroke [config]

<<< ./basic.ts#data [data]

:::
