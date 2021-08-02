import { ReactElement, useEffect, useState } from "react";
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
} from "@chakra-ui/react";

type ShelfProps = {
  userID: string;
};

type Shelf = {
  name: string;
  url: string;
  numberOfBooks: number;
};

const ShelfSelector = ({ userID }: ShelfProps): ReactElement => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [error, setError] = useState(false);

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
  });
  return (
    <>
      {isLoaded ? (
        <RadioGroup>
          <Stack direction="column">
            {shelves.map(({ name, url, numberOfBooks }) => (
              <Radio
                value={url}
                size="lg"
                colorScheme="teal"
                isDisabled={numberOfBooks < 1}
              >
                {`${name} - ${numberOfBooks} books`}
              </Radio>
            ))}
          </Stack>
        </RadioGroup>
      ) : (
        <>
          <Spinner size="xl" color="teal" m={5} />
          <Text>Getting shelves...</Text>
        </>
      )}
      {error && (
        <Alert
          status="error"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
          width="400px"
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
