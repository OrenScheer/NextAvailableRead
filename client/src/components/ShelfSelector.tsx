import { ChangeEvent, ReactElement, useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import * as React from "react";
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
  setShelf: React.Dispatch<any>;
};

const ShelfSelector = ({ userID, setShelf }: ShelfProps): ReactElement => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [error, setError] = useState(false);
  const [selectedShelfUrl, setSelectedShelfUrl] = useState<string>();

  useEffect(() => {
    axios
      .get(`http://localhost:5309/users/${userID}/shelves`)
      .then((res: AxiosResponse<Shelf[]>) => {
        setShelves(res.data);
      })
      .catch((err) => {
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
            setShelf(shelves.find((shelf) => shelf.url === nextValue));
          }}
        >
          <Stack direction="column">
            {shelves.map(({ _id, url, numberOfBooks }) => (
              <Radio
                value={url}
                key={_id}
                size="lg"
                colorScheme="teal"
                isDisabled={numberOfBooks < 1}
              >
                {`${_id} - ${numberOfBooks} books`}
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
          width="300px"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            We could not retrieve your shelves.
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            Please go back and try again.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default ShelfSelector;
