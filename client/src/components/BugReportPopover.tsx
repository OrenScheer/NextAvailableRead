import * as React from "react";
import { ReactElement, useRef, useState } from "react";

import {
  Alert,
  AlertIcon,
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Input,
  Popover,
  PopoverArrow,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Select,
  Stack,
  Textarea,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";

const bugTypes = [
  "Books not loading",
  "Library link leads to wrong page",
  "Other",
] as const;

type BugType = typeof bugTypes[number];

type BugReportPopoverProps = {
  footerTextColor: string;
  apiUrlPrefix: string;
};

const BugReportPopover = ({
  footerTextColor,
  apiUrlPrefix,
}: BugReportPopoverProps): ReactElement => {
  const [chosenBugType, setChosenBugType] = useState<BugType>(bugTypes[0]);
  const [bookTitle, setBookTitle] = useState<string>("");
  const [bookAuthor, setBookAuthor] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const { onOpen, onClose, isOpen } = useDisclosure();
  const firstFieldRef = useRef(null);

  const clearFields = () => {
    setChosenBugType(bugTypes[0]);
    setBookTitle("");
    setBookAuthor("");
    setDescription("");
  };
  const toast = useToast();

  return (
    <Popover
      initialFocusRef={firstFieldRef}
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
    >
      <PopoverTrigger>
        <Button size="sm" variant="ghost" color={footerTextColor}>
          Report a bug
        </Button>
      </PopoverTrigger>
      <PopoverContent textAlign="left" mr={8} p={5} width="328px">
        <PopoverArrow />
        <PopoverCloseButton />
        <form
          id="bug-report"
          onSubmit={(e) => {
            e.preventDefault();
            setIsSubmitting(true);
            axios
              .post(`${apiUrlPrefix}/bugreport`, {
                type: chosenBugType,
                bookTitle,
                bookAuthor,
                description,
              })
              .then(() => {
                setIsError(false);
                clearFields();
                onClose();
                toast({
                  title: "Bug report submitted.",
                  description:
                    "Thank you very much. It will be looked at shortly!",
                  status: "success",
                  isClosable: true,
                  position: "bottom-right",
                });
              })
              .catch(() => {
                setIsError(true);
              })
              .finally(() => {
                setIsSubmitting(false);
              });
          }}
        >
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Type</FormLabel>
              <Select
                value={chosenBugType}
                onChange={(event) =>
                  setChosenBugType(event.target.value as BugType)
                }
                ref={firstFieldRef}
              >
                {bugTypes.map((bug) => (
                  <option value={bug} label={bug} />
                ))}
              </Select>
            </FormControl>
            {chosenBugType === "Library link leads to wrong page" && (
              <>
                <FormControl isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input
                    value={bookTitle}
                    onChange={(event) => setBookTitle(event.target.value)}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Author</FormLabel>
                  <Input
                    value={bookAuthor}
                    onChange={(event) => setBookAuthor(event.target.value)}
                  />
                </FormControl>
              </>
            )}
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </FormControl>
            <ButtonGroup d="flex" justifyContent="flex-end">
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  clearFields();
                  setIsError(false);
                }}
              >
                Cancel
              </Button>
              <Button
                colorScheme="teal"
                type="submit"
                isLoading={isSubmitting}
                loadingText="Submitting"
              >
                Submit
              </Button>
            </ButtonGroup>
            {isError && (
              <Alert status="error" fontSize="sm">
                <AlertIcon />
                There was an error. Please try again.
              </Alert>
            )}
          </Stack>
        </form>
      </PopoverContent>
    </Popover>
  );
};

export default BugReportPopover;
