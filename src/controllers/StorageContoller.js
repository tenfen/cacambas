import API from "helpers/API"

export const StorageController = {
  getAllStorages() {
    return API.request("/storage/all")
  },
}
