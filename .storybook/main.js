const path = require("path");
module.exports = {
  async viteFinal(config, {
    configType
  }) {
    if (configType === "DEVELOPMENT") {
      // customize the Vite config here
      config.server.port = 6001;
      config.server.https = false;
      config.server.host = true;
      config.server.hmr = {
        port: 443,
        protocol: "ws"
      };
    } else {
      config.base = "/vue3-color-picker/";
    }
    // return the customized config
    return config;
  },
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-links", "@storybook/addon-docs", "@storybook/addon-essentials"],
  framework: {
    name: "@storybook/vue3-vite",
    options: {}
  },
  docs: {
    autodocs: true
  }
};