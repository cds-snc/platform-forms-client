import axios from "axios";

/**
 * Get the current CSRF Token from the server
 * @returns string, csrf token
 */
export async function getCsrfToken() {
  return axios.get("/api/auth/csrf").then((response) => {
    return response.data.csrfToken;
  });
}
