import API from "helpers/API"

/**
 * Controlador de dispositivos
 */

const UserController = {
    getUser(userId) {
        return API.request(`/user/one/${userId}`, {});
    },

    autenthicate(login={}){
        return API.request("/auth/autenthicate", login, "POST");
    }

};
export default UserController;