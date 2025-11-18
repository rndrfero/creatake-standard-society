const path = require("path");
const pluginVue = require("@vitejs/plugin-vue");

module.exports = {
  plugins: [pluginVue()],
  build: {
    cssCodeSplit: true,
    lib: {
      entry: path.resolve(__dirname, "lib/index.js"),
      name: "ct.extensions.standard-society",
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue",
        },
      },
    },
  },
};
