import API from "helpers/API"

const DamageController = {
  createDamage: (damage) => {
    return API.request("/damage", damage, "POST")
  },

  updateDamage: (damageId, content) => {
    return API.request(`/damage/${damageId}`, content, "PUT")
  },

  associationDamage: (damageId, content) => {
    return API.request(`/damage/association/${damageId}`, content, "POST")
  },

  deleteDamage: (damageId) => {
    return API.request(`/damage/one/${damageId}`, null, "DELETE")
  },

  getOneDamage: (damageId) => {
    return API.request(`/damage/one/${damageId}`)
  },

  getAllDamages: (filter) => {
    return API.request("/damage/all", filter)
  },
}

export default DamageController
