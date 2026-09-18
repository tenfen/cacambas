import React from "react"

export default React.createContext({
  loading: null,
  setLoading: () => null,
  loadingMessages: [],
  setLoadingMessages: () => null,
  loadingAction: null,
  setLoadingAction: () => null,
})
