import apiRequest from "../api-request";

export function update(apiUrl, accessToken, projectId, json) {
  return apiRequest({
    method: "post",
    baseURL: apiUrl,
    url: "/projects/update/",
    data: json,
    params: { project: projectId },
    headers: {
      "access-token": accessToken,
    },
  });
}
