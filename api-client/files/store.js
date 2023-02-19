import apiRequest from "../api-request";

export function storeFile(apiUrl, fileInput) {
  return apiRequest({
    method: "post",
    baseURL: apiUrl,
    url: "/files/store/",
    data: fileInput,
  });
}
