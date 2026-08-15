import type { Preview } from "@storybook/nextjs-vite"

import "../app/globals.css"

const preview: Preview = {
  parameters: {
    a11y: {
      test: "error",
    },
    controls: {
      expanded: true,
    },
    layout: "centered",
  },
}

export default preview
