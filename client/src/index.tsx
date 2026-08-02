import {
  ColorModeScript,
  ChakraProvider,
  extendTheme,
  ChakraTheme,
} from "@chakra-ui/react";
import * as React from "react";
import ReactDOM from "react-dom";
import { StepsStyleConfig as Steps } from "chakra-ui-steps";
import App from "./App";

type BrowserProcess = {
  env: Record<string, string | undefined>;
};

declare global {
  interface Window {
    process?: BrowserProcess;
  }
}

if (!window.process) {
  window.process = { env: {} };
}

const theme: ChakraTheme = extendTheme({
  components: {
    Steps,
  },
  colors: {
    nextAvailableReadBlue: {
      50: "#EBF8FE",
      200: "#87CDE5",
      500: "#458EB2",
      600: "#2B7B99",
    },
  },
}) as ChakraTheme;

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.render(
  <React.StrictMode>
    <ColorModeScript />
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
  rootElement
);
