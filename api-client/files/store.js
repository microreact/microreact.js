import apiRequest from "../api-request";

export function store(apiUrl, accessToken, fileInput) {
  return apiRequest({
    method: "post",
    baseURL: apiUrl,
    url: "/files/store/",
    data: fileInput,
  });
}
