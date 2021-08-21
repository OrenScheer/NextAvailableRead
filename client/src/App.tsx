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
  Select,
} from "@chakra-ui/react";
import { Step, Steps, useSteps } from "chakra-ui-steps";
import { ChangeEvent, useState } from "react";
import { FaBook } from "react-icons/fa";
import { Book, Shelf } from "./types";

import ColorModeSwitcher from "./components/ColorModeSwitcher";
import ShelfSelector from "./components/ShelfSelector";
import BookList from "./components/BookList";
import libraries from "./libraries";

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

const createDummyLoadedArray = (numberOfBooks: number): boolean[] => {
  const loaded: boolean[] = [];
  for (let i = 0; i < numberOfBooks; i += 1) {
    loaded.push(false);
  }
  return loaded;
};

const App: React.FC = () => {
  const { nextStep, prevStep, activeStep } = useSteps({
    initialStep: 0,
  });

  const [shelf, setShelf] = useState<Shelf>();
  const [books, setBooks] = useState<Book[]>([]);
  const [libraryPrefix, setLibraryPrefix] = useState("");
  const [isBookListVisible, setIsBookListVisible] = useState(false);
  const [areBooksLoaded, setAreBooksLoaded] = useState<boolean[]>([]);
  const [numberOfBooks, setNumberOfBooks] = useState("1");
  const bg = useColorModeValue("white", "gray.800");
  const [userID, setUserID] = useState("");
  const handleChange = (valueAsString: string) => setUserID(valueAsString);

  const stepOne = (
    <FormControl id="userID">
      <FormLabel>Goodreads user ID</FormLabel>
      <NumberInput onChange={handleChange} value={userID}>
        <NumberInputField />
      </NumberInput>
      <FormHelperText>
        Your Goodreads profile must be set to public.
      </FormHelperText>
    </FormControl>
  );

  const stepThree = (
    <Select
      value={libraryPrefix}
      onChange={(value) => setLibraryPrefix(value.target.value)}
    >
      {libraries.map((library: string[]) => (
        <option value={library[1]}>{library[0]}</option>
      ))}
    </Select>
  );

  const stepFour = (
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
    { label: "Select a library", content: stepThree },
    { label: "Select the number of books", content: stepFour },
  ];

  const advance = () => {
    nextStep();
    if (activeStep === steps.length - 1 && shelf) {
      setBooks(createDummyBooksArray(parseInt(numberOfBooks, 10)));
      setAreBooksLoaded(createDummyLoadedArray(parseInt(numberOfBooks, 10)));
      setIsBookListVisible(true);
      /* axios
        .post<Book[]>("http://localhost:5309/books", {
          url: shelf?.url,
          numberOfBooksOnShelf: shelf?.numberOfBooks,
          numberOfBooksRequested: parseInt(numberOfBooks, 10),
        })
        .then((res) => {
          setBooks(res.data);
          setIsBookListLoaded(true);
        })
        .catch((err) => console.log(err)); */
      const events = new EventSource(
        `/books?url=${encodeURI(shelf.url)}&numberOfBooksOnShelf=${encodeURI(
          shelf.numberOfBooks.toString()
        )}&numberOfBooksRequested=${encodeURI(numberOfBooks)}
        &biblioCommonsPrefix=${libraryPrefix}`
      );
      let numberOfBooksReceived = 0;
      events.onmessage = (event: MessageEvent<string>) => {
        let data: string;
        if (event instanceof MessageEvent) {
          data = event.data as string;
        } else {
          return;
        }
        if (data.toLowerCase().includes("goodreads found")) {
          console.log("Shelves scanned.");
        } else if (data.toLowerCase().includes("done here")) {
          events.close();
        } else {
          const newBook: Book = JSON.parse(data) as Book;
          setBooks((oldBooks) =>
            oldBooks.map((book, index) => {
              if (index === numberOfBooksReceived) {
                return newBook;
              }
              return book;
            })
          );
          setAreBooksLoaded((oldAreBooksLoaded) =>
            oldAreBooksLoaded.map((loaded, index) => {
              if (index === numberOfBooksReceived) {
                return true;
              }
              return loaded;
            })
          );
          numberOfBooksReceived += 1;
        }
      };
    }
  };

  return (
    <Box
      textAlign="center"
      fontSize="xl"
      pb={8}
      d="flex"
      flexDir="column"
      alignItems="center"
      bg={bg}
    >
      <Flex bg={bg} width="100%" zIndex="9" pos="sticky" top="0">
        <Flex
          width="100%"
          justifyContent="space-between"
          pt={6}
          pb={6}
          px={8}
          height="100px"
          alignItems="flex-end"
        >
          <Heading d="flex" alignItems="center" color="#38B2AC">
            <FaBook style={{ marginRight: "10px" }} />
            NextAvailableRead
          </Heading>
          <ColorModeSwitcher zIndex="9" />
        </Flex>
      </Flex>
      <Flex
        width="100%"
        px={8}
        justifyContent="space-between"
        alignItems="flex-start"
        direction={{ base: "column", md: "row" }}
      >
        <Flex direction="column" pos={{ md: "sticky" }} top="100px" mb={3}>
          <Steps activeStep={activeStep} mb={4} orientation="vertical">
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
        <BookList
          books={books}
          isVisible={isBookListVisible}
          isLoaded={areBooksLoaded}
        />
      </Flex>
    </Box>
  );
};

export default App;
