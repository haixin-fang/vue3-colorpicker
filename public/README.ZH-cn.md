# colorpicker

非常漂亮的一款拾色器,支持多种颜色格式的输入输出,支持多点渐变色选择。

[在线 demo 演示](https://haixin-fang.github.io/colorpickers/)

[English](https://github.com/haixin-fang/colorpickers/blob/main/README.md)

## 安装

```
yarn add colorpickers
```

或者

```
npm install colorpickers
```

## 如何使用

### 第一步全局注册

```
import ColorPickers from "colorpickers";
import "colorpickers/style.css";

createApp(App)
  .use(router)
  .use(ColorPickers)
  .mount("#app");
```

或者局部注册

```vue3
import { ColorPicker } from "colorpickers";
import "colorpickers/style.css";

export default defineComponent({
components: { ColorPicker },
});
```

### 使用组件

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

具体文档请参考 [在线 demo 演示](https://haixin-fang.github.io/colorpickers/)

案例代码在 src/stories 目录下
