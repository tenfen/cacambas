import API from "helpers/API"

export const ProcessorController = {
  createProcessor: (processor) => {
    return API.request("/processor", processor, "POST")
  },

  updateProcessor: (processorId, content) => {
    return API.request(`/processor/${processorId}`, content, "PUT")
  },

  getAllProcessors() {
    return API.request("/processor/all")
  },
}
