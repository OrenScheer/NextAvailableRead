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
import { ReactElement } from "react";
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
        width="75%"
      >
        <Box width="75%">
          <Flex direction="column">
            <Skeleton
              isLoaded={isLoaded}
              height={!isLoaded ? "30px" : "100%"}
              width="100%"
            >
              <Heading size="md" align="left">
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
          width="75%"
          flexWrap={{ base: "wrap", "2xl": "nowrap" }}
          direction="row"
          mt={2}
        >
          <Skeleton
            isLoaded={isLoaded}
            me={4}
            width="130px"
            height="40px"
            mb={{ base: "2" }}
          >
            <Link href={book.goodreadsUrl} isExternal>
              <Button leftIcon={<FaGoodreads />} width="130px">
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

type BookListProps = {
  books: Book[];
  isVisible: boolean;
  isLoaded: boolean[];
};

const BookList = ({
  books,
  isVisible,
  isLoaded,
}: BookListProps): ReactElement => (
  <>
    {isVisible && (
      <Flex direction="column" width="70%">
        <SimpleGrid columns={[1, 1, 1, 1, 2]} spacing={4}>
          {books.map((book, index) => (
            <BookCard book={book} isLoaded={isLoaded[index]} />
          ))}
        </SimpleGrid>
      </Flex>
    )}
  </>
);

export default BookList;
