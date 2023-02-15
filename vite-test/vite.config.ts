import { defineConfig, Plugin } from "vite";

import plugins from "vite-web-sdk/plugins";

export default defineConfig({
    build: {
         //minify: false,
    },

    plugins: [
        plugins.withEmotion(),
    ],
})
