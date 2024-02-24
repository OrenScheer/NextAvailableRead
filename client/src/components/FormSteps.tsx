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
} from "@chakra-ui/react";
import { Step, Steps, useSteps } from "chakra-ui-steps";
import { Select } from "chakra-react-select";
import { LibraryOption, Shelf } from "../types";
import ShelfSelector from "./ShelfSelector";
import libraries from "../libraries";
import { COLOR_SCHEME } from "../constants";

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
  isDoneFinding: boolean;
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
  isDoneFinding,
}: FormStepsProps): ReactElement => {
  const { nextStep, prevStep, activeStep } = useSteps({
    initialStep: 0,
  });

  const userIDStep = (
    <FormControl id="userID">
      <FormLabel display="flex" alignItems="center">
        Goodreads user ID
      </FormLabel>
      <NumberInput
        onChange={(valueAsString: string) => setUserID(valueAsString)}
        value={userID}
      >
        <NumberInputField />
      </NumberInput>
      <FormHelperText textAlign="left">
        Find the ID in the URL of your Goodreads profile, following{" "}
        <Code>/user/show/</Code>. <br />
        <br />
        Your profile must be public.
      </FormHelperText>
    </FormControl>
  );

  const librarySelectStep = (
    <Box width="300px" textAlign="left">
      <Select
        options={libraries}
        value={librarySelection}
        onChange={(newValue: LibraryOption | null) => {
          if (newValue) {
            setLibrarySelection(newValue);
            setLibraryPrefix(newValue.value);
          }
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
    <Flex direction="column" pos={{ md: "sticky" }} top="100px">
      <Steps
        activeStep={activeStep}
        orientation="vertical"
        colorScheme={COLOR_SCHEME}
      >
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
                      colorScheme={COLOR_SCHEME}
                      variant="outline"
                    >
                      Previous step
                    </Button>
                    <Button
                      onClick={advance}
                      isDisabled={activeStep >= steps.length}
                      colorScheme={COLOR_SCHEME}
                      variant="solid"
                    >
                      {activeStep === steps.length - 1
                        ? "Find books"
                        : "Next step"}
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
            colorScheme={COLOR_SCHEME}
            variant="outline"
          >
            Previous step
          </Button>
          <Button
            onClick={findBooks}
            isDisabled={!isDoneFinding}
            colorScheme={COLOR_SCHEME}
            variant="solid"
          >
            Retry
          </Button>
        </Flex>
      )}
    </Flex>
  );
};

export default FormSteps;
