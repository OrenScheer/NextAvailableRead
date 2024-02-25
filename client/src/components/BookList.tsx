import * as React from "react";
import { ReactElement } from "react";

import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Image,
  Flex,
  Button,
  Link,
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Alert,
} from "@chakra-ui/react";
import { FaBookOpen, FaGoodreads, FaStar, VscLibrary } from "react-icons/all";
import { Book } from "../types";
import BookFallback from "../images/BookFallback.png";

type BookCardProps = {
  book: Book;
  isLoaded: boolean;
};

const BookCard = ({ book, isLoaded }: BookCardProps) => (
  <Box
    py={5}
    pl={5}
    pr={0}
    shadow="sm"
    borderWidth="1px"
    width="100%"
    minWidth="350px"
    height={{ base: "100%", md: "225px" }}
  >
    <Flex height="100%" justifyContent="space-between">
      <Skeleton isLoaded={isLoaded} maxW="120px" width="120px">
        <Image
          src={book.imageUrl}
          height="100%"
          maxW="120px"
          fallbackSrc={BookFallback}
        />
      </Skeleton>
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="space-between"
        width={{ base: "80%", md: "90%", "2xl": "80%" }}
        height="100%"
      >
        <Box width={{ base: "80%", md: "90%", "2xl": "80%" }}>
          <Flex direction="column">
            <Skeleton
              isLoaded={isLoaded}
              height={!isLoaded ? "30px" : "100%"}
              width="100%"
            >
              <Heading size="md" textAlign="left">
                {book.title}
              </Heading>
            </Skeleton>
            <Skeleton isLoaded={isLoaded} mt={1} height="30px" width="100%">
              <Text align="left" fontSize="md">
                {book.author}
              </Text>
            </Skeleton>
          </Flex>
        </Box>
        <Flex
          direction="column"
          width={{ base: "80%", md: "90%", "2xl": "80%" }}
        >
          <Flex
            direction="row"
            alignItems="center"
            justifyContent="flex-start"
            mb={1}
          >
            <SkeletonCircle isLoaded={isLoaded} size="18px" mr="10px">
              <FaStar size="18px" style={{ marginRight: "10px" }} />
            </SkeletonCircle>
            <SkeletonText isLoaded={isLoaded} noOfLines={1}>
              <Text fontSize="sm">{book.rating}</Text>
            </SkeletonText>
          </Flex>
          <Flex direction="row" alignItems="center" justifyContent="flex-start">
            <SkeletonCircle isLoaded={isLoaded} size="18px" mr="10px">
              <FaBookOpen size="18px" style={{ marginRight: "10px" }} />
            </SkeletonCircle>
            <SkeletonText isLoaded={isLoaded} noOfLines={1}>
              <Text fontSize="sm">{`${book.pageCount} p.`}</Text>
            </SkeletonText>
          </Flex>
        </Flex>
        <Flex
          alignItems="flex-start"
          width={{ base: "80%", md: "90%", "2xl": "80%" }}
          flexWrap={{ base: "wrap", "2xl": "nowrap" }}
          direction="row"
          mt={2}
        >
          <Skeleton
            isLoaded={isLoaded}
            me={4}
            width={{ base: "130px", lg: "115px", "2xl": "130px" }}
            height="40px"
            mb={{ base: "2", md: "0" }}
          >
            <Link href={book.goodreadsUrl} isExternal>
              <Button
                leftIcon={<FaGoodreads />}
                width={{ base: "130px", lg: "115px", "2xl": "130px" }}
              >
                Goodreads
              </Button>
            </Link>
          </Skeleton>
          <Skeleton
            isLoaded={isLoaded}
            width={{ base: "130px", lg: "115px", "2xl": "130px" }}
            height="40px"
          >
            <Link href={book.libraryUrl} isExternal>
              <Button
                leftIcon={<VscLibrary />}
                width={{ base: "130px", lg: "115px", "2xl": "130px" }}
              >
                Library
              </Button>
            </Link>
          </Skeleton>
        </Flex>
      </Flex>
    </Flex>
  </Box>
);

type BookListProps = {
  books: Book[];
  isVisible: boolean;
  isLoaded: boolean[];
  isDoneFinding: boolean;
  isError: boolean;
  findBooks: () => void;
};

const BookList = ({
  books,
  isVisible,
  isLoaded,
  isDoneFinding,
  isError,
  findBooks,
}: BookListProps): ReactElement => {
  const notEnoughBooksAvailable = isDoneFinding && isLoaded.includes(false);
  const otherError = isError && !isLoaded.includes(true);
  const firstNotFoundBookIndex = isLoaded.indexOf(false);

  let gridContents;

  if (isVisible) {
    if (notEnoughBooksAvailable) {
      gridContents = (
        <>
          {books.slice(0, firstNotFoundBookIndex).map((book, index) => (
            <BookCard book={book} isLoaded={isLoaded[index]} />
          ))}
          <Box
            shadow="sm"
            borderWidth="1px"
            width="100%"
            minWidth="350px"
            height={{ base: "100%", md: "225px" }}
          >
            <Alert
              status="error"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              height="100%"
            >
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1} fontSize="xl">
                You have no more available books.
              </AlertTitle>
              <AlertDescription fontSize="lg">
                Please try adding more books to your Goodreads shelf.
              </AlertDescription>
            </Alert>
          </Box>
        </>
      );
    } else if (!otherError) {
      gridContents = books.map((book, index) => (
        <BookCard book={book} isLoaded={isLoaded[index]} />
      ));
    }
  }

  return (
    <>
      <Flex
        direction="column"
        width={{ base: "100%", md: "70%" }}
        mt={{ base: 4, md: 0 }}
      >
        {otherError ? (
          <Box
            shadow="sm"
            borderWidth="1px"
            width="100%"
            height={{ base: "100%", md: "225px" }}
          >
            <Alert
              status="error"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              width="100%"
              height="100%"
            >
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1} fontSize="2xl">
                There was an unexpected error.
              </AlertTitle>
              <Button
                onClick={findBooks}
                colorScheme="red"
                variant="solid"
                mt={4}
              >
                Retry
              </Button>
            </Alert>
          </Box>
        ) : (
          <SimpleGrid columns={[1, 1, 1, 1, 2]} spacing={4}>
            {gridContents}
          </SimpleGrid>
        )}
      </Flex>
    </>
  );
};

export default BookList;
