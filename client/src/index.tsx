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

const theme: ChakraTheme = extendTheme({
  components: {
    Steps,
  },
}) as ChakraTheme;

ReactDOM.render(
  <React.StrictMode>
    <ColorModeScript />
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
