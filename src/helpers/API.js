import axios from "axios"
import { getSessionItem, removeSessionItem } from "./StorageTools"

const version = "/v1"

/**
 * Componente funcional para auxiliar no envio e recebimento de dados via API
 * Utilizada a biblioteca (Axios) para realizar as requisições
 */
const API = {
  /**
   * Método responsável por ralizar um determinada requisição
   * @param url           Rota (endpoint) da requisição
   * @param params        Parametros da requisição
   * @param method        Metodo da requisição
   * @param headers       Cabeçalhos da requisição
   * @param timeout       Tempo de conexão
   * @returns {*}
   */
  request(url, params, method = "GET", headers = { "Content-Type": "application/json" }, timeout = 30000) {
    // Definindo as configurações da requisição
    let config = {
      // Endereço da API
      baseURL: process.env.REACT_APP_API_HOST,

      // Rota da requisição
      // Se a URL já começa com /v1 ou /v2, não adiciona o version prefix
      url: (url.startsWith('/v1') || url.startsWith('/v2')) ? url : version + url,

      // Método da requisição
      method: method,

      // Cabeçalho da requisição
      headers: {
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
      },

      // Tempo para execução (10s)
      timeout: timeout,

      withCredentials: false,
    }

    // Juntando os dados de cabeçalhos
    // Aqui é utilizado o operador "Spread"
    config.headers = { ...config.headers, ...headers }

    // Anexa o token de sessão, quando existir, para autenticar a requisição
    const authToken = getSessionItem("authToken", true)

    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`
    }

    // Verificando se foi informado parametros para a requiição
    // Caso o método seja GET coloca os parametros na URL
    if (!!params) {
      if (method === "GET") {
        config.params = params
      } else {
        config.data = params
      }
    }

    // console.log(config)

    // Executando a requisição
    return axios
      .request(config)
      .then((response) => {
        // Verificando se no objeto retornado existe o item "data"
        if (!!response.data.status && !!response.data.message) {
          return response.data
        }

        return { status: response.status, content: response.data }
      })
      .catch((error) => {
        if (error.response) {
          /*
           * Token ausente/expirado/inválido numa rota protegida — limpa a
           * sessão local para forçar um novo login em vez de deixar a
           * aplicação presa num estado autenticado que o backend já rejeitou.
           */
          if (error.response.status === 401 && authToken) {
            removeSessionItem("authToken")
            removeSessionItem("user")
            window.location.href = "/"
          }

          return {
            status: error.response.status,
            message: error.response.data?.message,
            content: error.response.data,
          }
        }

        return {
          status: 500,
          message: "Ocorreu um erro de comunicação com o servidor. Favor tente mais tarde!",
        }
      })
  },
}

export default API
