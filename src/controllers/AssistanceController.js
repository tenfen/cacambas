import API from "helpers/API"

const AssistanceController = {
  createAssistance: (assistance) => {
    return API.request("/assistance", assistance, "POST")
  },

  updateAssistance: (assistanceId, content) => {
    return API.request(`/assistance/${assistanceId}`, content, "PUT")
  },

  deleteAssistance: (assistanceId) => {
    return API.request(`/assistance/delete/${assistanceId}`, null, "DELETE")
  },

  getAssistances: (filter) => {
    return API.request("/assistance/prox", filter)
  },

  getAllAssistances: (filter) => {
    return API.request("/assistance/all", filter)
  },

  getOneAssistance: (assistanceId) => {
    return API.request(`/assistance/one/${assistanceId}`)
  },
}

export default AssistanceController