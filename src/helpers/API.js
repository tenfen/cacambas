import axios from "axios"

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
      url: version + url,

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
