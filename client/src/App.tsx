import * as React from "react";
import { useEffect, useState } from "react";

import {
  Box,
  Divider,
  Flex,
  Heading,
  IconButton,
  Link,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

import { FaBook, FaGithub } from "react-icons/fa";
import axios from "axios";
import { Book, Shelf } from "./types";
import ColorModeSwitcher from "./components/ColorModeSwitcher";
import BookList from "./components/BookList";
import FormSteps from "./components/FormSteps";
import BugReportPopover from "./components/BugReportPopover";
import { API_URL_PREFIX, COLOR_SCHEME, BASE_URL } from "./constants";

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
  const footerText = useColorModeValue(
    "rgb(113, 128, 150)",
    "rgba(255, 255, 255, 0.48)"
  );
  const accentColor = useColorModeValue(
    `${COLOR_SCHEME}.500`,
    `${COLOR_SCHEME}.200`
  );

  const findBooks = () => {
    setBooks(createDummyBooksArray(numberOfBooks));
    setAreBooksLoaded(createDummyLoadedArray(numberOfBooks));
    setIsBookListVisible(true);
    setIsDoneFinding(false);
    setIsError(false);
    const events = new EventSource(
      `${API_URL_PREFIX}/books?url=${encodeURI(
        shelf?.url as string
      )}&numberOfBooksOnShelf=${encodeURI(
        shelf?.numberOfBooks.toString() as string
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
      if (data.toLowerCase().includes("done here")) {
        events.close();
        setIsDoneFinding(true);
      } else if (data.toLowerCase().includes("error")) {
        events.close();
        setIsError(true);
        setIsDoneFinding(true);
      } else if (!data.toLowerCase().includes("goodreads found")) {
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
        if (numberOfBooksReceived >= numberOfBooks) {
          setIsDoneFinding(true);
        }
      }
    };
  };

  useEffect(() => {
    axios
      .get(`${API_URL_PREFIX}/landing`)
      .then(() => {})
      .catch(() => {});
  }, []);

  return (
    <Flex
      textAlign="center"
      fontSize="xl"
      pb={8}
      direction="column"
      alignItems="center"
      bg={bg}
      position="relative"
      minHeight="100vh"
    >
      <Flex
        direction="column"
        alignItems="center"
        width="100%"
        pb="48px"
        mr={{ base: 9, md: 0 }}
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
            <Heading display="flex" alignItems="center" color={accentColor}>
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
            isDoneFinding={isDoneFinding}
          />
          <BookList
            books={books}
            isVisible={isBookListVisible}
            isLoaded={areBooksLoaded}
            isDoneFinding={isDoneFinding}
            isError={isError}
            findBooks={findBooks}
          />
        </Flex>
      </Flex>
      <Box
        as="footer"
        position="absolute"
        bottom="0"
        height="48px"
        width="100%"
        px={8}
        mb={2}
      >
        <Divider mb={2} />
        <Flex justifyContent="space-between" alignItems="center">
          <Flex alignItems="center">
            <Link
              href="https://github.com/orenscheer/nextavailableread"
              isExternal
            >
              <IconButton
                aria-label="NextAvailableRead GitHub"
                icon={<FaGithub style={{ color: footerText }} />}
                variant="ghost"
                size="sm"
              />
            </Link>
            <Text fontSize="sm" fontWeight={600} color={footerText}>
              Created by{" "}
              <Link href={`https://${BASE_URL}`} isExternal color={accentColor}>
                Oren Scheer
              </Link>
            </Text>
          </Flex>
          <BugReportPopover footerTextColor={footerText} />
        </Flex>
      </Box>
    </Flex>
  );
};

export default App;
