# colorpicker

A very beautiful color picker, supports input and output of multiple color formats, and supports gradient color selection. 

[Live Demo](https://github.com/haixin-fang/colorpicker/)

[中文文档](https://github.com/haixin-fang/colorpicker/blob/main/README.ZH-cn.md)

![colorpickers](src/assets/example.jpg)

## Installation

```
yarn add colorpickers
```

OR

```
npm install colorpickers
```

## How to use

### The first step is global registration

```
import ColorPickers from "colorpickers";
import "colorpickers/style.css";

createApp(App)
  .use(router)
  .use(ColorPickers)
  .mount("#app");
```

OR

```vue3
import { ColorPicker } from "colorpickers";
import "colorpickers/style.css";

export default defineComponent({
components: { ColorPicker },
});
```

### Usage

```vue3
<template>
  <div>
     <color-picker v-model:pureColor="pureColor" v-model:gradientColor="gradientColor" v-model="gradientData"/>
  </div>
</template>
<script lang="ts">
  import { ref } from "vue";
  import { ColorInputWithoutInstance } from "tinycolor2";

  export default defineComponent({
     setup() {
       const pureColor = ref<ColorInputWithoutInstance>("red");
       const gradientColor = ref("linear-gradient(0deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 100%)");
       const gradientData = ref({});

       return { pureColor, gradientColor,gradientData }
     }
  });
</script>

```

[Live Demo](https://haixin-fang.github.io/colorpickers/)
