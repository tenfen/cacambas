import API from "helpers/API"

export const MemoryController = {
  getAllMemorires() {
    return API.request("/memory/all")
  },
}
