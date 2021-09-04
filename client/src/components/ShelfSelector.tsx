import * as React from "react";
import {
  Dispatch,
  ReactElement,
  SetStateAction,
  useEffect,
  useState,
} from "react";

import axios, { AxiosResponse } from "axios";
import {
  Stack,
  Radio,
  RadioGroup,
  Spinner,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
} from "@chakra-ui/react";
import { Shelf } from "../types";

type ShelfProps = {
  userID: string;
  setShelf: Dispatch<SetStateAction<Shelf | undefined>>;
};

const ShelfSelector = ({ userID, setShelf }: ShelfProps): ReactElement => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [error, setError] = useState(false);
  const [selectedShelfUrl, setSelectedShelfUrl] = useState<string>();
  const apiUrlPrefix =
    process.env.NODE_ENV === "production"
      ? "https://nextavailableread-backend.herokuapp.com"
      : "";

  useEffect(() => {
    axios
      .get(`${apiUrlPrefix}/users/${userID}/shelves`)
      .then((res: AxiosResponse<Shelf[]>) => {
        setShelves(res.data);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setIsLoaded(true);
      });
  }, []);
  return (
    <>
      {isLoaded ? (
        <RadioGroup
          value={selectedShelfUrl}
          onChange={(nextValue: string) => {
            setSelectedShelfUrl(nextValue);
            setShelf(shelves.find((shelf) => shelf.url === nextValue) as Shelf);
          }}
        >
          <Stack direction="column">
            {shelves.map(({ name, url, numberOfBooks }) => (
              <Radio
                value={url}
                key={name}
                size="lg"
                colorScheme="teal"
                isDisabled={numberOfBooks < 1}
              >
                <Text d="flex" alignItems="center">
                  {`${name} - ${numberOfBooks} books`}
                </Text>
              </Radio>
            ))}
          </Stack>
        </RadioGroup>
      ) : (
        <Flex direction="column" alignItems="flex-start">
          <Spinner size="xl" color="teal" mb={5} />
          <Text>Getting shelves...</Text>
        </Flex>
      )}
      {error && (
        <Alert
          status="error"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
          width="100%"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            We could not retrieve your shelves.
          </AlertTitle>
          <AlertDescription fontSize="md">
            Please go back and try again.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default ShelfSelector;
