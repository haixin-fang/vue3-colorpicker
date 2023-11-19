<template>
  <div class="vc-display">
    <div class="vc-current-color" v-if="isSupported" @click="open">
      <!-- <div class="color-cube" :style="getBgColorStyle"></div> -->
      <svg
        role="img"
        aria-label="colorpicker"
        focusable="false"
        data-icon="colorpicker"
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="gd_design_icon gd_design_icon-colorpicker"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M15.5314 4.65249C16.6694 3.51448 18.5145 3.51448 19.6525 4.65249C20.7905 5.7905 20.7905 7.63558 19.6525 8.77359L16.3651 12.061L17.8128 13.5087L16.8618 14.4597L15.4141 13.012L7.7735 20.6526C7.59799 20.8281 7.34012 20.8926 7.1027 20.8205L7.10183 20.8203L7.0942 20.8181C7.08596 20.8157 7.07199 20.8118 7.0527 20.8067C7.01409 20.7964 6.95436 20.7813 6.87673 20.7643C6.72103 20.7301 6.49582 20.6883 6.22625 20.6605C5.67988 20.604 4.98878 20.6086 4.332 20.8178C4.07704 20.899 3.79821 20.8213 3.62195 20.62C3.4457 20.4187 3.40556 20.1321 3.51974 19.8901C3.76831 19.3633 3.78212 18.7214 3.70747 18.1587C3.67122 17.8854 3.61663 17.6496 3.57135 17.4832C3.54882 17.4004 3.52889 17.3359 3.51521 17.2937C3.50839 17.2727 3.50314 17.2573 3.49995 17.2481L3.49704 17.2398C3.40634 16.9937 3.46691 16.7169 3.6524 16.5315L11.2611 8.92276L9.68871 7.35038L10.6397 6.39936L12.2121 7.97174L15.5314 4.65249ZM12.2169 9.86903L14.4582 12.0658L7.08953 19.4345C6.90072 19.3953 6.65289 19.3524 6.3645 19.3226C5.99352 19.2843 5.5433 19.2663 5.05859 19.3109C5.11737 18.8242 5.09099 18.3606 5.04074 17.9818C4.99969 17.6724 4.94043 17.4028 4.88733 17.1986L12.2169 9.86903Z"
          fill="currentColor"
        />
      </svg>
    </div>
    <div class="vc-current-color vc-transparent" v-else>
      <div class="color-cube" :style="getBgColorStyle"></div>
    </div>
    <template v-if="inputType === 'hex'">
      <div style="display: flex; flex: 1; gap: 4px; height: 100%">
        <div class="vc-color-input">
          <input :value="state.hex" @input="onInputChange" />
        </div>
        <div class="vc-alpha-input" v-if="!disableAlpha">
          <input
            class="vc-alpha-input__inner"
            :value="parseInt(state.alpha)"
            @input="onAlphaBlur"
          />
        </div>
      </div>
    </template>
    <template v-else-if="state.rgba">
      <div style="display: flex; flex: 1; gap: 4px; height: 100%">
        <div class="vc-rgb-input" v-for="(v, i) in state.rgba" :key="i">
          <div>
            <input :value="v.toFixed(2)" @input="(e) => onInputChange(e, i)" />
          </div>
          <div>{{ ["R", "G", "B", "A"][i] }}</div>
        </div>
      </div>
    </template>

    <div class="vc-input-toggle" @click="onInputTypeChange"></div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref } from "vue";
import propTypes from "vue-types";
import { Color } from "../utils/color";
import { whenever, useDebounceFn, useEyeDropper } from "@vueuse/core";
import tinycolor from "tinycolor2";
export default defineComponent({
  name: "Display",
  props: {
    color: propTypes.instanceOf(Color),
    disableAlpha: propTypes.bool.def(false),
  },
  emits: ["update:color", "change"],
  setup(props, { emit }) {
    const inputType = ref<"hex" | "rgba">("hex");
    const state = reactive<any>({
      color: props.color,
      hex: props.color?.hex,
      alpha: props.color?.alpha + "%",
      rgba: props.color?.RGB,
      previewBgColor: props.color?.toRgbString(),
    });

    const { isSupported, open, sRGBHex } = useEyeDropper();

    const getBgColorStyle = computed(() => {
      return {
        background: state.previewBgColor,
      };
    });

    const onInputTypeChange = () => {
      inputType.value = inputType.value === "rgba" ? "hex" : "rgba";
    };

    const onAlphaBlur = useDebounceFn((event) => {
      if (!event.target.value) {
        return;
      }

      let opacity = parseInt(event.target.value.replace("%", ""));

      if (opacity > 100) {
        event.target.value = "100%";
        opacity = 100;
      }

      if (opacity < 0) {
        event.target.value = "0%";
        opacity = 0;
      }

      if (isNaN(opacity)) {
        event.target.value = "100%";
        opacity = 100;
      }

      if (!isNaN(opacity) && state.color) {
        state.color.alpha = opacity;
      }
      emit("update:color", state.color);
      emit("change", state.color);
    }, 300);

    const onInputChange = useDebounceFn((event, key?: number) => {
      console.log(event.target.value);
      if (!event.target.value) {
        return;
      }

      if (inputType.value === "hex") {
        const _hex = event.target.value.replace("#", "");
        if (tinycolor(_hex).isValid() && state.color) {
          state.color.hex = _hex;
        }
      } else if (key !== undefined && state.rgba && state.color) {
        if (event.target.value < 0) {
          event.target.value = 0;
        }

        if (key === 3 && event.target.value > 1) {
          event.target.value = 1;
        }

        if (key < 3 && event.target.value > 255) {
          event.target.value = 255;
        }

        state.rgba[key] = Number(event.target.value);
        const [r, g, b, a] = state.rgba;
        state.color.hex = tinycolor({ r, g, b }).toHex();
        state.color.alpha = Math.floor(a * 100);
      }

      emit("update:color", state.color);
      emit("change", state.color);
    }, 300);

    whenever(
      () => props.color,
      (value: Color) => {
        if (value) {
          state.color = value;
          state.alpha = Math.floor(state.color.alpha) + "%";
          state.hex = state.color.hex;
          state.rgba = state.color.RGB;
        }
      },
      { deep: true }
    );

    whenever(
      () => state.color,
      () => {
        if (state.color) {
          state.previewBgColor = state.color.toRgbString();
        }
      },
      { deep: true }
    );

    whenever(
      () => sRGBHex.value,
      () => {
        if (sRGBHex.value) {
          state.color.hex = sRGBHex.value;
          emit("update:color", state.color);
          emit("change", state.color);
        }
      }
    );

    return {
      state,
      getBgColorStyle,
      inputType,
      onInputTypeChange,
      onAlphaBlur,
      onInputChange,
      isSupported,
      open,
    };
  },
});
</script>

<style lang="scss" scoped>
$backGroundColor: rgba(200, 200, 200, 0.25);
$color: #666;

.vc-display {
  height: 28px;
  display: flex;
  align-items: center;
  gap: 8px;

  .vc-current-color {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background-color: #f1f2f4;
    border-radius: 6px;
    cursor: pointer;
    &:hover {
      background-color: #e8eaec;
    }
    svg {
      width: 1em;
      height: 1em;
      font-size: 20px;
    }
    // width: 50px;
    // height: 100%;
    // box-shadow: 3px 0 5px #00000014;
    // border-radius: 2px;
    // position: relative;
    // cursor: pointer;
    // overflow: hidden;
    // display: inline-block;
    // vertical-align: middle;

    // &.vc-transparent {
    //   background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==);
    //   background-repeat: repeat;
    // }

    // .color-cube {
    //   width: 100%;
    //   height: 100%;
    // }
  }

  .vc-color-input {
    height: 100%;
    flex: 1;
    flex-shrink: 0;
    box-sizing: border-box;
    position: relative;

    input {
      padding: 0;
      border: 0;
      outline: none;
      cursor: pointer;
      font-size: 14px;
      text-align: center;
      box-sizing: border-box;
      background-color: $backGroundColor;
      color: $color;
      border-radius: 2px;
      height: 100%;
      width: 100%;
    }
  }

  .vc-rgb-input {
    flex: 1;
    font-size: 12px;
    color: $color;
    text-align: center;

    input {
      padding: 4px 0;
      margin-bottom: 2px;
      border: 0;
      outline: none;
      cursor: pointer;
      font-size: 14px;
      text-align: center;
      background-color: $backGroundColor;
      color: $color;
      border-radius: 2px;
      width: 100%;
    }
  }

  .vc-alpha-input {
    width: 56px;
    height: 100%;
    border: none;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-pack: center;
    justify-content: center;
    -ms-flex-align: center;
    align-items: center;
    border-radius: 2px;
    font-size: 14px;

    > input {
      width: 100%;
      height: 100%;
      padding: 0;
      text-align: center;
      background-color: $backGroundColor;
      color: $color;
      font-size: inherit;
    }

    &__inner {
      padding: 10px 16px;
      border-radius: 4px;
      color: #000;
      font-size: 14px;
      line-height: 20px;
      outline: none;
      border: none;
      display: block;
      box-sizing: border-box;
      cursor: pointer;
    }
  }

  .vc-input-toggle {
    height: 10px;
    width: 8px;
    padding: 4px;
    cursor: pointer;

    &:hover {
      background-color: #efefef;
    }

    &::before {
      content: "";
      display: block;
      border-bottom: 4px solid #888;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      margin-bottom: 2px;
    }

    &::after {
      content: "";
      display: block;
      border-top: 4px solid #888;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
    }
  }
}
</style>
