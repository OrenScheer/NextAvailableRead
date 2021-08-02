import * as React from "react";
import {
  Box,
  Heading,
  Flex,
  Button,
  Input,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { Step, Steps, useSteps } from "chakra-ui-steps";

import { ChangeEvent, useEffect, useState } from "react";
import ColorModeSwitcher from "./ColorModeSwitcher";
import ShelfSelector from "./components/ShelfSelector";

const App: React.FC = () => {
  const { nextStep, prevStep, setStep, reset, activeStep } = useSteps({
    initialStep: 0,
  });

  const [userID, setUserID] = useState("");
  const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
    setUserID(event.target.value);

  const stepOne = (
    <FormControl id="userID">
      <FormLabel>Goodreads user ID</FormLabel>
      <Input onChange={handleChange} value={userID} />
    </FormControl>
  );

  const steps = [
    { label: "Step 1", content: stepOne },
    { label: "Step 2", content: <ShelfSelector userID={userID} /> },
    { label: "Step 3", content: stepOne },
  ];

  return (
    <Box
      textAlign="center"
      fontSize="xl"
      p={3}
      d="flex"
      flexDir="column"
      alignItems="center"
    >
      <Flex width="100%" justifyContent="space-between" mb={5}>
        <Heading>NextAvailableRead</Heading>
        <ColorModeSwitcher />
      </Flex>
      <Steps activeStep={activeStep} mb={3} height="100%">
        {steps.map(({ label, content: stepContent }) => (
          <Step label={label} key={label}>
            {stepContent}
          </Step>
        ))}
      </Steps>
      <Flex mt={4}>
        <Button
          onClick={prevStep}
          mr={4}
          isDisabled={activeStep <= 0}
          colorScheme="teal"
          variant="outline"
        >
          Previous step
        </Button>
        <Button
          onClick={nextStep}
          isDisabled={activeStep >= 3}
          colorScheme="teal"
          variant="solid"
        >
          Next step
        </Button>
      </Flex>
    </Box>
  );
};

export default App;
