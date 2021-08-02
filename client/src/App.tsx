import * as React from "react";
import {
  ChakraProvider,
  Box,
  VStack,
  Grid,
  theme,
  Heading,
} from "@chakra-ui/react";
import ColorModeSwitcher from "./ColorModeSwitcher";

const App: React.FC = () => (
  <ChakraProvider theme={theme}>
    <Box textAlign="center" fontSize="xl">
      <Grid minH="100vh" p={3}>
        <ColorModeSwitcher justifySelf="flex-end" />
        <VStack spacing={8}>
          <Heading size="xl">Welcome to NextAvailableRead.</Heading>
        </VStack>
      </Grid>
    </Box>
  </ChakraProvider>
);

export default App;
