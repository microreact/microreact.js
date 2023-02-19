import apiRequest from "../api-request";

export function create(apiUrl, accessToken, json) {
  return apiRequest({
    method: "post",
    baseURL: apiUrl,
    url: "/projects/create/",
    data: json,
    headers: {
      "access-token": accessToken,
    },
  });
}
