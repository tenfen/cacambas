import API from "helpers/API";

const CacambaController = {
  getAll: (userId) => {
    return API.request("/bucket/all", { userId }, "GET");
  },

  getById: (bucketId) => {
    return API.request(`/bucket/${bucketId}`, {}, "GET");
  },

  create: (data) => {
    return API.request("/bucket", data, "POST");
  },

  update: (bucketId, data) => {
    return API.request(`/bucket/${bucketId}`, data, "PUT");
  },

  remove: (bucketId) => {
    return API.request(`/bucket/delete/${bucketId}`, {}, "DELETE");
  },
};

export default CacambaController;
