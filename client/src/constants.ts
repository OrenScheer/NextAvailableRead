const API_URL_PREFIX =
  process.env.NODE_ENV === "production"
    ? "https://nextavailableread-backend.herokuapp.com"
    : "";
const COLOR_SCHEME = "nextAvailableReadBlue";

export { API_URL_PREFIX, COLOR_SCHEME };
