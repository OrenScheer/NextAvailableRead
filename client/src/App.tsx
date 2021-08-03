import * as React from "react";
import {
  Box,
  Heading,
  Flex,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { Step, Steps, useSteps } from "chakra-ui-steps";
import { ChangeEvent, useState } from "react";
import { Shelf } from "./types";

import ColorModeSwitcher from "./ColorModeSwitcher";
import ShelfSelector from "./components/ShelfSelector";

const App: React.FC = () => {
  const { nextStep, prevStep, setStep, reset, activeStep } = useSteps({
    initialStep: 0,
  });

  const [shelf, setShelf] = useState<Shelf>();

  const [userID, setUserID] = useState("");
  const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
    setUserID(event.target.value);

  const stepOne = (
    <FormControl id="userID">
      <FormLabel>Goodreads user ID</FormLabel>
      <Input onChange={handleChange} value={userID} />
      <FormHelperText>
        Your Goodreads profile must be set to public.
      </FormHelperText>
    </FormControl>
  );

  const stepThree = (
    <FormControl id="numberOfBooks">
      <FormLabel>Number of books</FormLabel>
      <NumberInput
        defaultValue={1}
        min={1}
        max={shelf ? shelf.numberOfBooks : 1}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </FormControl>
  );

  const steps = [
    { label: "Select an account", content: stepOne },
    {
      label: "Select a shelf",
      content: <ShelfSelector userID={userID} setShelf={setShelf} />,
    },
    { label: "Select the number of books", content: stepThree },
  ];

  return (
    <Box
      textAlign="center"
      fontSize="xl"
      p={8}
      d="flex"
      flexDir="column"
      alignItems="center"
    >
      <Flex width="100%" justifyContent="space-between" mb={5}>
        <Heading>NextAvailableRead</Heading>
        <ColorModeSwitcher />
      </Flex>
      <Flex justifyContent="space-between" direction="column" width="100%">
        <Steps activeStep={activeStep} mb={8} orientation="vertical">
          {steps.map(({ label, content: stepContent }) => (
            <Step label={label} key={label}>
              <Flex minH="100px">
                <>
                  <Flex direction="column">
                    {stepContent}
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
                  </Flex>
                </>
              </Flex>
            </Step>
          ))}
        </Steps>
      </Flex>
    </Box>
  );
};

export default App;
