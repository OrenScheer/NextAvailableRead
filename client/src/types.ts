export type Shelf = {
  name: string;
  url: string;
  numberOfBooks: number;
};

export type Book = {
  title: string;
  author: string;
  pageCount: number;
  rating: number;
  goodreadsUrl: string;
  imageUrl: string;
  libraryUrl: string;
};

export type LibraryOption = {
  label: string;
  value: string;
};
