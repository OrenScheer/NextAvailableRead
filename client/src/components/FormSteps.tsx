import * as React from "react";
import { Dispatch, ReactElement, SetStateAction } from "react";

import {
  Box,
  Button,
  Code,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import { QuestionOutlineIcon } from "@chakra-ui/icons";
import { Step, Steps, useSteps } from "chakra-ui-steps";
import { LibraryOption, Shelf } from "../types";
import ShelfSelector from "./ShelfSelector";
import CustomSelect from "./Select";
import libraries from "../libraries";

type FormStepsProps = {
  userID: string;
  setUserID: Dispatch<SetStateAction<string>>;
  shelf: Shelf | undefined;
  setShelf: Dispatch<SetStateAction<Shelf | undefined>>;
  librarySelection: LibraryOption;
  setLibrarySelection: Dispatch<SetStateAction<LibraryOption>>;
  libraryPrefix: string;
  setLibraryPrefix: Dispatch<SetStateAction<string>>;
  numberOfBooks: number;
  setNumberOfBooks: Dispatch<SetStateAction<number>>;
  findBooks: () => void;
};

const FormSteps = ({
  userID,
  setUserID,
  shelf,
  setShelf,
  librarySelection,
  setLibrarySelection,
  libraryPrefix,
  setLibraryPrefix,
  numberOfBooks,
  setNumberOfBooks,
  findBooks,
}: FormStepsProps): ReactElement => {
  const { nextStep, prevStep, activeStep } = useSteps({
    initialStep: 0,
  });
  const tooltipCode = useColorModeValue("gray", "black");

  const userIDStep = (
    <FormControl id="userID">
      <FormLabel d="flex" alignItems="center">
        Goodreads user ID
        <Tooltip
          hasArrow
          placement="top"
          label={
            <Text>
              Find the number in the URL of your Goodreads profile, following{" "}
              <Code colorScheme={tooltipCode}>/user/show/</Code>.
            </Text>
          }
        >
          <QuestionOutlineIcon ml={2} mt="3px" />
        </Tooltip>
      </FormLabel>
      <NumberInput
        onChange={(valueAsString: string) => setUserID(valueAsString)}
        value={userID}
      >
        <NumberInputField />
      </NumberInput>
      <FormHelperText>Your Goodreads profile must be public.</FormHelperText>
    </FormControl>
  );

  const librarySelectStep = (
    <Box width="300px" textAlign="left">
      <CustomSelect
        options={libraries}
        width="300px"
        value={librarySelection}
        onChange={(newValue: { label: string; value: string }) => {
          setLibrarySelection(newValue);
          setLibraryPrefix(newValue.value);
        }}
        placeholder="Select or type a library"
      />
    </Box>
  );

  const numberOfBooksStep = (
    <FormControl id="numberOfBooks">
      <NumberInput
        defaultValue={1}
        min={1}
        max={shelf ? shelf.numberOfBooks : 1}
        value={numberOfBooks}
        onChange={(_, valueAsNumber) => setNumberOfBooks(valueAsNumber)}
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
    { label: "Select an account", content: userIDStep },
    {
      label: "Select a shelf",
      content: <ShelfSelector userID={userID} setShelf={setShelf} />,
    },
    { label: "Select a library", content: librarySelectStep },
    { label: "Select the number of books", content: numberOfBooksStep },
  ];

  const validate = (): boolean => {
    if (activeStep === 0) {
      return !!userID;
    }
    if (activeStep === 1) {
      return !!shelf;
    }
    if (activeStep === 2) {
      if (shelf && numberOfBooks > shelf.numberOfBooks) {
        setNumberOfBooks(shelf.numberOfBooks);
      }
      return !!librarySelection && !!libraryPrefix;
    }
    if (activeStep === 3) {
      return !!numberOfBooks && !!shelf && numberOfBooks <= shelf.numberOfBooks;
    }
    return true;
  };

  const advance = () => {
    if (validate()) {
      nextStep();
      if (activeStep === steps.length - 1 && shelf) {
        findBooks();
      }
    }
  };

  return (
    <Flex direction="column" pos={{ md: "sticky" }} top="100px" mb={3}>
      <Steps activeStep={activeStep} mb={4} orientation="vertical">
        {steps.map(({ label, content: stepContent }) => (
          <Step label={label} key={label}>
            <Flex minH="100px">
              <>
                <Flex
                  direction="column"
                  maxW="300px"
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      advance();
                    }
                  }}
                >
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
                      onClick={advance}
                      isDisabled={activeStep >= steps.length}
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
      {activeStep === steps.length && (
        <Flex>
          <Button
            onClick={prevStep}
            mr={4}
            isDisabled={activeStep <= 0}
            colorScheme="teal"
            variant="outline"
          >
            Previous step
          </Button>
        </Flex>
      )}
    </Flex>
  );
};

export default FormSteps;
