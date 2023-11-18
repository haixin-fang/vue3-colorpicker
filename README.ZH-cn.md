# colorpickers

非常漂亮的一款拾色器,支持多种颜色格式的输入输出,支持渐变色选择。

该仓库是在vue3-colorpicker基础上创建的,为什么没有fork, 原仓库已不更新, 如果fork后在github上就搜索不到该仓库,为了帮助更多的人,减少重复造轮子, 所以重新创建了单独仓库

### 新特性

- 支持多点渐变
- 渐变绑定的数据是linear-gradient字符串,不满足个性化需求,提供了渐变底层数据,可以使用gradientData数据双向绑定或者gradientDataChange方法获取
- 支持线性或经向渐变按钮自定义展示,通过 gradientType: "linear | radial | both" 控制
- 修复透明度输入框有小数问题
- 文档支持事件打印,可直观看数据结构和事件方法
- 可长期维护

[在线 demo 演示](https://haixin-fang.github.io/colorpicker/)

[English](https://github.com/haixin-fang/colorpicker/blob/main/README.md)

## 安装

```
yarn add colorpickers -S
```

或者

```
npm install colorpickers -S 
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
