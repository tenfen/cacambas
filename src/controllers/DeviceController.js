import API from "helpers/API"
import { formatFloat } from "helpers/MethodTools"

export const DeviceController = {
  createDevice: (content) => {
    console.log('content do create------------------', content)
    const params = {
      ...content,
      devicePrice: Object.keys(content.devicePrice).reduce((acc, categoryKey) => {
        const category = content.devicePrice[categoryKey];
        acc[categoryKey] = {
          ...category,
          medValue: formatFloat(category.medValue),
          minValue: formatFloat(category.minValue || 0),  // Garantindo que 'minValue' seja 0 caso não tenha valor
          maxValue: formatFloat(category.maxValue || 0),  // Garantindo que 'maxValue' seja 0 caso não tenha valor
        };
        return acc;
      }, {}),
    }

    return API.request("/device", params, "POST")
  },

  updateDevice: (deviceId, content) => {
    const params = {
      ...content,
      devicePrice: Object.keys(content.devicePrice).reduce((acc, categoryKey) => {
        const category = content.devicePrice[categoryKey];
        acc[categoryKey] = {
          ...category,
          medValue: formatFloat(category.medValue),
          minValue: formatFloat(category.minValue || 0),  // Garantindo que 'minValue' seja 0 caso não tenha valor
          maxValue: formatFloat(category.maxValue || 0),  // Garantindo que 'maxValue' seja 0 caso não tenha valor
        };
        return acc;
      }, {}),
    }
    return API.request(`/device/${deviceId}`, params, "PUT")
  },

  deleteDevice: (deviceId) => {
    return API.request(`/device/delete/${deviceId}`, null, "DELETE")
  },

  getOneDevice: (deviceId) => {
    return API.request(`/device/one/${deviceId}`)
  },

  getAllDevices: () => {
    return API.request("/device/all")
  },
}
