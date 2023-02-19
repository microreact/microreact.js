/* eslint-disable no-throw-literal */

import axios from "axios";

export function apiRequest(request) {
  return (
    axios.request(request)
      .then((res) => res.data)
      .catch((error) => {
        console.error(error);
        throw {
          error,
          code: error?.response?.status,
          status: error?.response?.statusText,
          message: error?.response?.data,
        };
      })
  );
}
