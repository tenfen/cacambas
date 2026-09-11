import { ClientAPI } from "../api/ClientAPI"
export function getAllDevices() {
  try {
    const response = ClientAPI
    if (response.status === 200) {
      return response.content
    }
    return []
  } catch (error) {
    return []
  }
}
