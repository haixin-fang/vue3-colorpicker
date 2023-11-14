# colorpicker

非常漂亮的一款拾色器,支持多种颜色格式的输入输出,支持渐变色选择。

该仓库是在vue3-colorpicker基础上创建的,为什么没有fork, 原仓库已不更新, 如果fork后在github上就搜索不到该仓库,为了帮助更多的人,减少重复造轮子, 所以重新创建了单独仓库

[在线 demo 演示](https://haixin-fang.github.io/vue3-color-picker/)

[English](https://github.com/haixin-fang/vue3-color-picker/blob/main/README.md)

## 安装

```
yarn add vue3-color-picker -S
```

或者

```
npm install vue3-color-picker -S 
```

## 如何使用

### 第一步全局注册

```
import Vue3ColorPicker from "vue3-color-picker";
import "vue3-color-picker/style.css";

createApp(App)
  .use(router)
  .use(Vue3ColorPicker)
  .mount("#app");
```

或者局部注册

```vue3
import { ColorPicker } from "vue3-color-picker";
import "vue3-color-picker/style.css";

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

具体文档请参考 [在线 demo 演示](https://haixin-fang.github.io/vue3-color-picker/)

案例代码在 src/stories 目录下
