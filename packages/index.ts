import { App, Plugin } from "vue";

import "./styles/index.scss";
import ColorPicker from "./ColorPicker.vue";
import type { ColorPickerProps } from "./ColorPicker.vue";

const ColorPickers: Plugin = {
  install: (app: App) => {
    app.component(ColorPicker.name, ColorPicker);
    app.component("Vue3" + ColorPicker.name, ColorPicker);
  },
};

export { Color } from "./utils/color";

export type { ColorFormat } from "./utils/color";

export { ColorPicker, type ColorPickerProps };

export default ColorPickers;
