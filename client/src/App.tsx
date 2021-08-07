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
  useColorModeValue,
} from "@chakra-ui/react";
import { Step, Steps, useSteps } from "chakra-ui-steps";
import { ChangeEvent, useState } from "react";
import { FaBook } from "react-icons/fa";
import axios from "axios";
import { Book, Shelf } from "./types";

import ColorModeSwitcher from "./ColorModeSwitcher";
import ShelfSelector from "./components/ShelfSelector";
import BookList from "./components/BookList";

const dummyBook: Book = {
  title: "",
  author: "",
  pageCount: 0,
  rating: 0,
  goodreadsUrl: "",
  imageUrl: "",
  libraryUrl: "",
};

const createDummyBooksArray = (numberOfBooks: number): Book[] => {
  const books: Book[] = [];
  for (let i = 0; i < numberOfBooks; i += 1) {
    books.push(dummyBook);
  }
  return books;
};

const App: React.FC = () => {
  const { nextStep, prevStep, activeStep } = useSteps({
    initialStep: 0,
  });

  const [shelf, setShelf] = useState<Shelf>();
  const [books, setBooks] = useState<Book[]>([]);
  const [isBookListVisible, setIsBookListVisible] = useState(false);
  const [isBookListLoaded, setIsBookListLoaded] = useState(false);
  const [numberOfBooks, setNumberOfBooks] = useState("1");
  const bg = useColorModeValue("white", "gray.800");
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
        value={numberOfBooks}
        onChange={(valueString) => setNumberOfBooks(valueString)}
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

  const advance = () => {
    nextStep();
    if (activeStep === 2) {
      setBooks(createDummyBooksArray(parseInt(numberOfBooks, 10)));
      setIsBookListVisible(true);
      axios
        .post<Book[]>("http://localhost:5309/books", {
          url: shelf?.url,
          numberOfBooksOnShelf: shelf?.numberOfBooks,
          numberOfBooksRequested: parseInt(numberOfBooks, 10),
        })
        .then((res) => {
          setBooks(res.data);
          setIsBookListLoaded(true);
        })
        .catch((err) => console.log(err));
    }
  };

  return (
    <Box
      textAlign="center"
      fontSize="xl"
      px={8}
      pb={8}
      d="flex"
      flexDir="column"
      alignItems="center"
      bg={bg}
    >
      <Flex
        width="100%"
        justifyContent="space-between"
        pt={6}
        pb={6}
        pos="sticky"
        top="0"
        bg={bg}
        zIndex="9"
        height="100px"
      >
        <Heading d="flex" alignItems="center" color="#38B2AC">
          <FaBook style={{ marginRight: "10px" }} />
          NextAvailableRead
        </Heading>
        <ColorModeSwitcher />
      </Flex>
      <Flex
        direction="row"
        width="100%"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Steps
          activeStep={activeStep}
          mb={8}
          orientation="vertical"
          pos="sticky"
          top="100px"
        >
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
                        onClick={advance}
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
        <BookList
          books={books}
          isVisible={isBookListVisible}
          isLoaded={isBookListLoaded}
        />
      </Flex>
    </Box>
  );
};

export default App;
