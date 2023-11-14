# colorpicker

A very beautiful color picker, supports input and output of multiple color formats, and supports gradient color selection.

[Live Demo](https://github.com/haixin-fang/vue3-color-picker/)

[中文文档](https://github.com/haixin-fang/vue3-color-picker/blob/main/README.ZH-cn.md)

![vue3-color-picker](src/assets/example.jpg)

## Installation

```
yarn add starfish-colorpicker
```

OR

```
npm install starfish-colorpicker
```

## How to use

### The first step is global registration

```
import Vue3ColorPicker from "starfish-colorpicker";
import "starfish-colorpicker/style.css";

createApp(App)
  .use(router)
  .use(Vue3ColorPicker)
  .mount("#app");
```

OR

```vue3
import { ColorPicker } from "starfish-colorpicker";
import "starfish-colorpicker/style.css";

export default defineComponent({
components: { ColorPicker },
});
```

### Usage

```vue3
<template>
  <div>
     <color-picker v-model:pureColor="pureColor" v-model:gradientColor="gradientColor"/>
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

[Live Demo](https://haixin-fang.github.io/vue3-color-picker/)
