import API from "helpers/API"

/**
 * Controlador de dispositivos
 */

const UserController = {
  getUserById: (userId) => {
    return API.request(`/user/one/${userId}`, {}, "GET")
  },

  getAllUsers: () => {
    return API.request("/user/all", {}, "GET")
  },

  autenthicate(login={}){
    return API.request("/auth/autenthicate", login, "POST");
  },

  createUser(user={}){
    return API.request("/user/createUser", user, "POST");
  },

  updateProfile(data={}){
    return API.request("/user/updateProfile", data, "PUT");
  },

  requestPasswordReset(userEmail){
    return API.request("/user/requestPasswordReset", { userEmail }, "POST");
  },

  resetPassword({ token, newPassword, confirmNewPassword }){
    return API.request("/user/resetPassword", { token, newPassword, confirmNewPassword }, "PUT");
  },

  updateStatus(userId, accountStatus){
    return API.request(`/user/${userId}/status`, { accountStatus }, "PUT");
  },

  deleteUser(userId){
    return API.request(`/user/${userId}`, {}, "DELETE");
  },

};
export default UserController;