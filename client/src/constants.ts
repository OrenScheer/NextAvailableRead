const API_URL_PREFIX =
  process.env.NODE_ENV === "production"
    ? "https://nextavailableread-backend.onrender.com"
    : "";
const COLOR_SCHEME = "nextAvailableReadBlue";
const BASE_URL = "orenscheer.com";
const USER_ID_STORAGE_KEY = "userID";

export { API_URL_PREFIX, COLOR_SCHEME, BASE_URL, USER_ID_STORAGE_KEY };
