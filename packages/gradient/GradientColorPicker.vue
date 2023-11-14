<template>
  <div class="vc-gradient-picker">
    <div class="vc-gradient-picker__header">
      <div >
        <div
          v-show="pickerType === 'fk' && advancePanelShow"
          class="back"
          style="cursor: pointer"
          @click="onBack"
        ></div>
      </div>

      <div class="vc-gradient__types" v-if="getGradientTypes.length == 2">
        <div
          class="vc-gradient__type"
          :class="{ active: state.type === typeItem }"
          v-for="typeItem in getGradientTypes"
          :key="typeItem"
          @click="onTypeChange"
        >
          {{ lang ? lang[typeItem] : typeItem }}
        </div>
      </div>
    </div>
    <div class="vc-gradient-picker__body">
      <div class="vc-color-range" ref="colorRangeRef">
        <div class="vc-color-range__container" ref="refColorBar">
          <div class="vc-background" :style="gradientBg" @click="handlePotBar"></div>
          <div class="vc-gradient__stop__container">
            <div
              class="vc-gradient__stop"
              v-for="(item, index) in colors"
              :key="index"
              :class="{
                'vc-gradient__stop--current': index == state.selectIndex,
              }"
              ref="startGradientRef"
              :style="{ left: `calc(${item.pst + '%'} - 8px)` }"
              @mousedown="sliderPotDown(index, $event)"
              @click="clickGColorPot(index)"
            >
              <span class="vc-gradient__stop--inner"></span>
            </div>
          </div>
        </div>
      </div>
      <div class="vc-picker-degree-input vc-degree-input">
        <div class="vc-degree-input__control">
          <input :value="state.angle" @blur="onDegreeBlur" />deg
        </div>
        <div class="vc-degree-input__panel">
          <div class="vc-degree-input__disk">
            <Angle v-model:angle="state.angle" :size="40" @change="onDegreeChange" />
          </div>
        </div>
      </div>
    </div>
    <Board v-if="advancePanelShow" :color="currentColor" @change="onBoardChange" />
    <Hue v-if="advancePanelShow" :color="currentColor" @change="onHueChange" />
    <Palette v-if="!advancePanelShow" @change="onCompactChange" />
    <Lightness v-if="!advancePanelShow" :color="currentColor" @change="onLightChange" />
    <Alpha v-if="!disableAlpha" :color="currentColor" @change="onAlphaChange" />
    <Display :color="currentColor" :disable-alpha="disableAlpha" @change="onDisplayChange" />
    <History
      v-if="!disableHistory"
      :round="roundHistory"
      :colors="historyColors"
      @change="onCompactChange"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject, reactive, ref, watch } from "vue";
import propTypes from "vue-types";
import {
  tryOnMounted,
  useDebounceFn,
  useLocalStorage,
  whenever,
  useEventListener,
  useCloned,
} from "@vueuse/core";
import { DOMUtils } from "@aesoper/normal-utils";
import tinycolor from "tinycolor2";
import ColorScale from "color-scales";

import Alpha from "../common/Alpha.vue";
import Palette from "../common/Palette.vue";
import Board from "../common/Board.vue";
import Hue from "../common/Hue.vue";
import Lightness from "../common/Lightness.vue";
import History from "../common/History.vue";
import Display from "../common/Display.vue";
import { Color, HistoryColorKey, MAX_STORAGE_LENGTH } from "../utils/color";
import { ColorPickerProvider, ColorPickerProviderKey } from "../utils/type";
import Angle from "../angle/Angle";
function cloneDeep(target: any) {
  let result: any;
  if (Array.isArray(target)) {
    result = [];
    target.forEach((item) => {
      result.push(cloneDeep(item));
    });
  } else if (typeof target === "object" && target !== null) {
    result = {};
    for (const key in target) {
      if (Object.hasOwnProperty.call(target, key)) {
        result[key] = cloneDeep(target[key]);
      }
    }
  } else {
    result = target;
  }
  return result;
}

function keepDecimal(numStr: string, num = 2) {
  const reg = new RegExp(`^\\d+(?:\\.\\d{0,${num}})?`, "g");
  return !numStr.match(reg) ? "" : numStr.match(reg);
}
export default defineComponent({
  name: "GradientColorPicker",
  components: { Angle, Display, Alpha, Palette, Board, Hue, Lightness, History },
  props: {
    angle: propTypes.number.def(0),
    type: propTypes.oneOf(["linear", "radial"]).def("linear"),
    disableHistory: propTypes.bool.def(false),
    roundHistory: propTypes.bool.def(false),
    disableAlpha: propTypes.bool.def(false),
    pickerType: propTypes.oneOf(["fk", "chrome"]).def("fk"),
    colors: propTypes.array.def([]),
    colorStops: propTypes.array.def([]),
    gradientType: propTypes.oneOf(["both", "liner", "radial"]).def("both"),
  },
  emits: [
    "update:startColor",
    "update:endColor",
    "update:angle",
    "gradientChange",
    "advanceChange",
    "angleChange",
    "typeChange",
  ],
  setup(props, { emit }) {
    const state: any = reactive({
      angle: props.angle,
      type: props.gradientType == "both" ? props.type : props.gradientType,
      // rgba
      colors: props.colors,
      colorStops: props.colorStops,
      selectIndex: 0,
      movePst: {
        x: 0,
        y: 0,
      },
      pageX: 0,
      pageY: 0,
      mouseStartPst: {
        x: 0,
        y: 0,
      },
      startMovePst: 0,
    });
    let isSelectBoxMouseDown = false;

    const parent = inject<ColorPickerProvider>(ColorPickerProviderKey);

    const advancePanelShow = ref<boolean>(props.pickerType === "chrome");

    // Ref
    const startGradientRef = ref<HTMLElement>();
    const stopGradientRef = ref<HTMLElement>();
    const colorRangeRef = ref<HTMLElement>();
    const refColorBar = ref<HTMLElement>();
    watch(
      () => [props.angle],
      (val: any[]) => {
        state.angle = val[0];
      }
    );

    watch(
      () => props.type,
      (val: any) => {
        state.type = val;
      }
    );

    const currentColor: any = computed({
      get: () => {
        return state.colors[state.selectIndex];
      },
      set: (v) => {
        state.colors[state.selectIndex] = v;
      },
    });

    const gradientBg = computed(() => {
      const colors = cloneDeep(state.colors)
        .sort((a: any, b: any) => a.pst - b.pst)
        .map((item: any) => {
          return `${item.toRgbString()} ${keepDecimal(String(item.pst) || "", 5)}%`;
        });
      let background = `background:linear-gradient(${state.angle}deg, ${colors.join(",")})`;
      if (state.type === "radial") {
        background = `background: radial-gradient(circle,  ${colors.join(",")})`;
      }
      return background;
    });

    const getGradientTypes = computed(() => {
      if (props.gradientType == "both") {
        return ["linear", "radial"];
      }
      return [];
    });

    const handleEleMouseMove = (e: MouseEvent) => {
      if (!isSelectBoxMouseDown) return;
      state.movePst.x = e.pageX - state.mouseStartPst.x;
      state.movePst.y = e.pageY - state.mouseStartPst.y;
      state.pageX = e.pageX;
      state.pageY = e.pageY;
      sliderMove();
    };
    const sliderMove = () => {
      if (refColorBar.value) {
        const barWidth = refColorBar.value.getBoundingClientRect().width;
        let distRatio = ((state.startMovePst * barWidth) / 100 + state.movePst.x) / barWidth;
        if (distRatio > 1) {
          distRatio = 1;
        } else if (distRatio < 0) {
          distRatio = 0;
        }
        state.colors[state.selectIndex].pst = Math.round(distRatio * 100);
        emit("gradientChange", state.colors);
      }
    };
    const handleEleMouseUp = (e: MouseEvent) => {
      isSelectBoxMouseDown = false;
      sliderDone();
    };
    const sliderDone = () => {
      resetDraggle();
    };
    const resetDraggle = () => {
      isSelectBoxMouseDown = false;
      state.mouseStartPst = { x: 0, y: 0 };
      state.movePst.x = 0;
      state.movePst.y = 0;
    };
    const bindEventsDoc = () => {
      useEventListener(document.body, "mousemove", handleEleMouseMove);
      useEventListener(document.body, "mouseup", handleEleMouseUp);
    };

    const clickGColorPot = (index: Number) => {
      if (state.selectIndex === index) return;
      state.selectIndex = index;
    };
    const sliderStart = () => {
      state.startMovePst = state.colors[state.selectIndex].pst;
    };
    const sliderPotDown = (index: Number, $event: MouseEvent) => {
      bindEventsDoc();
      const e: MouseEvent = $event;
      clickGColorPot(index);
      isSelectBoxMouseDown = true;
      state.mouseStartPst.x = e.pageX;
      state.mouseStartPst.y = e.pageY;
      sliderStart();
    };

    const handlePotBar = (e: MouseEvent) => {
      if (refColorBar.value) {
        const barBounding = refColorBar.value.getBoundingClientRect();
        const barLeft = barBounding.left;
        const colorPotDist = e.pageX - barLeft;
        const value = cloneDeep(state.colors);
        // 渐变条stopColors;
        const rangColors = value
          .sort((a: any, b: any) => a.pst - b.pst)
          .map((item: any) => {
            return item.toHexString();
          });

        // 初始化色条Range，用来取渐变色值
        const colorScale = new ColorScale(0, barBounding.width, rangColors);
        const colorPotHex = colorScale.getColor(colorPotDist).toHexString();
        const colorPotPst = (100 * colorPotDist) / barBounding.width;
        const addPot = new Color(colorPotHex);
        addPot.pst = colorPotPst;
        state.colors.push(addPot);
        // 增加后默认选中
        state.selectIndex = state.colors.length - 1;
        emit("gradientChange", state.colors);
      }
    };

    const onDegreeBlur = (evt: FocusEvent) => {
      const target = evt.target as HTMLInputElement;
      const degree = parseInt(target.value.replace("°", ""));
      if (!isNaN(degree)) {
        state.angle = degree % 360;
      }
      emit("update:angle", state.angle);
      emit("angleChange", state.angle);
    };

    const onDegreeChange = (angle: number) => {
      state.angle = angle;
      emit("update:angle", state.angle);
      emit("angleChange", state.angle);
    };

    const onCompactChange = (color: string) => {
      if (color === "advance") {
        advancePanelShow.value = true;
        emit("advanceChange", true);
      } else {
        currentColor.value.hex = color;
        emit("advanceChange", false);
      }
      doColorChange();
    };

    const onAlphaChange = (alpha: number) => {
      currentColor.value.alpha = alpha;
      doColorChange();
    };

    const onHueChange = (hue: number) => {
      currentColor.value.hue = hue;
      doColorChange();
    };

    const onBoardChange = (saturation: number, brightness: number) => {
      currentColor.value.saturation = saturation;
      currentColor.value.brightness = brightness;
      doColorChange();
    };

    const onLightChange = (light: number) => {
      currentColor.value.lightness = light;
      doColorChange();
    };

    const onDisplayChange = () => {
      doColorChange();
    };

    const doColorChange = () => {
      emit("gradientChange", state.colors);
    };

    const onBack = () => {
      advancePanelShow.value = false;
      emit("advanceChange", false);
    };

    const onTypeChange = () => {
      state.type = state.type === "linear" ? "radial" : "linear";
      emit("typeChange", state.type);
    };

    const historyColors = useLocalStorage<string[]>(HistoryColorKey, [], {});

    const updateColorHistoryFn = useDebounceFn(() => {
      if (props.disableHistory) {
        return;
      }
      const rgbString = currentColor.value.toRgbString();

      historyColors.value = historyColors.value.filter((value) => {
        return !tinycolor.equals(value, rgbString);
      });

      if (historyColors.value.includes(rgbString)) {
        return;
      }

      while (historyColors.value.length > MAX_STORAGE_LENGTH) {
        historyColors.value.pop();
      }

      historyColors.value.unshift(rgbString);
    }, 100);

    whenever(
      () => currentColor.value,
      () => {
        updateColorHistoryFn();
      },
      { deep: true }
    );

    return {
      handlePotBar,
      refColorBar,
      startGradientRef,
      stopGradientRef,
      colorRangeRef,
      state,
      currentColor,
      gradientBg,
      advancePanelShow,
      onDegreeBlur,
      onCompactChange,
      onAlphaChange,
      onHueChange,
      onBoardChange,
      onLightChange,
      historyColors,
      onBack,
      onDegreeChange,
      onDisplayChange,
      onTypeChange,
      lang: parent?.lang,
      sliderPotDown,
      clickGColorPot,
      getGradientTypes,
    };
  },
});
</script>

<style lang="scss" scoped>
.vc-gradient-picker {
  position: relative;

  &__header {
    z-index: 999;
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .back {
      border: 2px solid rgba(150, 150, 150, 0.65);
      border-width: 0 1px 1px 0;
      display: inline-block;
      padding: 4px;
      margin-left: 2px;
      transform: rotate(135deg);
      margin-bottom: 20px;
    }
  }

  .vc-gradient__types {
    display: flex;
    background-color: rgba(200, 200, 200, 0.25);
    border-radius: 4px;
    overflow: hidden;

    .vc-gradient__type {
      padding: 4px 8px;
      color: #666;
      cursor: pointer;
      font-size: 12px;

      &.active {
        color: #000;
        background-color: rgba(200, 200, 200, 0.8);
      }
    }
  }

  &__body {
    margin-bottom: 12px;
    display: -ms-flexbox;
    display: flex;
    align-items: center;

    .vc-color-range {
      flex: 1;

      &__container {
        position: relative;
        height: 16px;
        border-radius: 5px;
        background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAJ0lEQVQoU2M8c/X2fwYkYKylgsxlYKSDgv///6O44ey1O6huoL0CAJgaKeXe+C99AAAAAElFTkSuQmCC)
          repeat;
        .vc-background {
          height: 100%;
          border-radius: 4px;
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
        }

        .vc-gradient__stop__container {
          position: absolute;
          width: 100%;
          top: 0;
          height: 100%;
          left: 8px;
          width: calc(100% - 16px);
          pointer-events: none;

          .vc-gradient__stop {
            position: absolute;
            top: 50%;
            width: 12px;
            height: 16px;
            overflow: hidden;
            border: 2px solid #fff;
            border-radius: 2px;
            cursor: pointer;
            box-shadow: 0 0 2px rgba(0, 0, 0, 0.35);
            transform: translateY(-50%);
            pointer-events: initial;
            // transform: translate(-9px, 0);

            &--inner {
              display: inline-block;
              height: 100%;
            }

            &--current {
              position: relative;
              z-index: 1;
              box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.2), 0 0 0 1.2px #2254f4;
            }
          }
        }
      }
    }

    .vc-degree-input {
      position: relative;
      z-index: 2;
      font-size: 12px;
      border-radius: 4px;

      &:hover {
        .vc-degree-input__panel {
          display: block;
        }
      }

      &__control {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 4px;
        background-color: rgba(200, 200, 200, 0.25);
        color: #666;

        input {
          max-width: 28px;
          text-align: center;
          border: none;
          outline: none;
          background-color: transparent;
          color: #666;
          font-size: inherit;
          overflow: visible;
        }
      }

      &__panel {
        display: none;
        z-index: 10;

        .vc-degree-input__disk {
          width: 64px;
          height: 64px;
          background-color: #f1f1f1;
          box-shadow: 0 0 2px rgba(0, 0, 0, 0.16), 0 1px 8px rgba(0, 0, 0, 0.06),
            0 4px 12px rgba(0, 0, 0, 0.08);
          border-radius: 4px;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          transform: translate(0, 0);
        }
      }
    }

    .vc-picker-degree-input {
      margin-left: 8px;
      width: 64px;
      height: 28px;
    }
  }
}
</style>
