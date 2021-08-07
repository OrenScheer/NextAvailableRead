import * as React from "react";
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
} from "@chakra-ui/react";
import { FaBookOpen, FaGoodreads, FaStar, VscLibrary } from "react-icons/all";
import { ReactElement, useState } from "react";
import { Book } from "../types";

type BookCardProps = {
  book: Book;
};

const BookCard = ({ book }: BookCardProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  setTimeout(() => setIsLoaded(true), 4000);
  return (
    <Box
      py={5}
      pl={5}
      pr={0}
      shadow="sm"
      borderWidth="1px"
      width="100%"
      height="225px"
    >
      <Flex height="100%" justifyContent="space-between">
        <Skeleton isLoaded={isLoaded} maxW="120px">
          <Image src={book.imageUrl} height="100%" maxW="120px" />
        </Skeleton>
        <Flex
          direction="column"
          alignItems="center"
          justifyContent="space-between"
          width="75%"
        >
          <Box width="75%">
            <Flex direction="column">
              <Skeleton isLoaded={isLoaded}>
                <Heading size="md" align="left">
                  {book.title}
                </Heading>
              </Skeleton>
              <Skeleton isLoaded={isLoaded} mt={1}>
                <Text align="left" fontSize="md">
                  {book.author}
                </Text>
              </Skeleton>
            </Flex>
          </Box>
          <Flex direction="column" width="75%">
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
            <Flex
              direction="row"
              alignItems="center"
              justifyContent="flex-start"
            >
              <SkeletonCircle isLoaded={isLoaded} size="18px" mr="10px">
                <FaBookOpen size="18px" style={{ marginRight: "10px" }} />
              </SkeletonCircle>
              <SkeletonText isLoaded={isLoaded} noOfLines={1}>
                <Text fontSize="sm">{`${book.pageCount} p.`}</Text>
              </SkeletonText>
            </Flex>
          </Flex>
          <Flex direction="row" alignItems="flex-start" width="75%">
            <Skeleton isLoaded={isLoaded} me={4} width="130px" height="40px">
              <Link href={book.goodreadsUrl} isExternal>
                <Button leftIcon={<FaGoodreads />} width="130px" me={4}>
                  Goodreads
                </Button>
              </Link>
            </Skeleton>
            <Skeleton isLoaded={isLoaded} width="130px" height="40px">
              <Link href={book.libraryUrl} isExternal>
                <Button leftIcon={<VscLibrary />} width="130px">
                  Library
                </Button>
              </Link>
            </Skeleton>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};

type BookListProps = {
  books: Book[];
};

const BookList = ({ books }: BookListProps): ReactElement => (
  <SimpleGrid columns={2} spacing={4} width="70%">
    {books.map((book) => (
      <BookCard book={book} />
    ))}
  </SimpleGrid>
);

export default BookList;
