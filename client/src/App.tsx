import * as React from "react";

import {
  Box,
  Heading,
  Flex,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useColorModeValue,
  Tooltip,
  Code,
  Text,
} from "@chakra-ui/react";
import { Step, Steps, useSteps } from "chakra-ui-steps";
import { useState } from "react";

import { FaBook } from "react-icons/fa";
import { QuestionOutlineIcon } from "@chakra-ui/icons";
import { Book, Shelf } from "./types";

import ColorModeSwitcher from "./components/ColorModeSwitcher";
import ShelfSelector from "./components/ShelfSelector";
import BookList from "./components/BookList";
import libraries from "./libraries";
import CustomSelect from "./components/Select";
import FormSteps from "./components/FormSteps";

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

  const [userID, setUserID] = useState("");
  const [shelf, setShelf] = useState<Shelf>();
  const [librarySelection, setLibrarySelection] = useState<{
    label: string;
    value: string;
  }>({ label: "", value: "" });
  const [libraryPrefix, setLibraryPrefix] = useState("");
  const [numberOfBooks, setNumberOfBooks] = useState(1);

  const [books, setBooks] = useState<Book[]>([]);
  const [isBookListVisible, setIsBookListVisible] = useState(false);
  const [areBooksLoaded, setAreBooksLoaded] = useState<boolean[]>([]);
  const [isDoneFinding, setIsDoneFinding] = useState(false);
  const [isError, setIsError] = useState(false);
  const bg = useColorModeValue("white", "gray.800");

  const findBooks = () => {
    setBooks(createDummyBooksArray(numberOfBooks));
    setAreBooksLoaded(createDummyLoadedArray(numberOfBooks));
    setIsBookListVisible(true);
    setIsDoneFinding(false);
    setIsError(false);
    const events = new EventSource(
      `/books?url=${encodeURI(shelf!.url)}&numberOfBooksOnShelf=${encodeURI(
        shelf!.numberOfBooks.toString()
      )}&numberOfBooksRequested=${encodeURI(numberOfBooks.toString())}
        &biblioCommonsPrefix=${libraryPrefix}`
    );
    let numberOfBooksReceived = 0;
    events.onmessage = (event: MessageEvent) => {
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
        setIsDoneFinding(true);
      } else if (data.toLowerCase().includes("error")) {
        events.close();
        setIsError(true);
        setIsDoneFinding(true);
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
        console.log("received");
        numberOfBooksReceived += 1;
      }
    };
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
        <FormSteps
          userID={userID}
          setUserID={setUserID}
          shelf={shelf}
          setShelf={setShelf}
          librarySelection={librarySelection}
          setLibrarySelection={setLibrarySelection}
          libraryPrefix={libraryPrefix}
          setLibraryPrefix={setLibraryPrefix}
          numberOfBooks={numberOfBooks}
          setNumberOfBooks={setNumberOfBooks}
          findBooks={findBooks}
        />
        <BookList
          books={books}
          isVisible={isBookListVisible}
          isLoaded={areBooksLoaded}
          isDoneFinding={isDoneFinding}
          isError={isError}
        />
      </Flex>
    </Box>
  );
};

export default App;
