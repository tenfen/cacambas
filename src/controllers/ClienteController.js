import API from "helpers/API";

const ClienteController = {
  getAll: (userId) => {
    return API.request("/cliente/all", { userId }, "GET");
  },

  getById: (clienteId) => {
    return API.request(`/cliente/${clienteId}`, {}, "GET");
  },

  create: (data) => {
    return API.request("/cliente", data, "POST");
  },

  update: (clienteId, data) => {
    return API.request(`/cliente/${clienteId}`, data, "PUT");
  },

  remove: (clienteId) => {
    return API.request(`/cliente/${clienteId}`, {}, "DELETE");
  },

  recolher: (clienteId, userId) => {
    return API.request(`/cliente/${clienteId}/recolher`, { userId }, "PUT");
  },

  getRevenue: (userId) => {
    return API.request("/cliente/revenue", { userId }, "GET");
  },
};

export default ClienteController;
