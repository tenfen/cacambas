import React from "react"

export default React.createContext({
  brands: [],
  processors: [],
  memories: [],
  storages: [],
  conections: [],
  setBrands: () => null,
  setProcessors: () => null,
  setMemories: () => null,
  setStorages: () => null,
  setConections: () => null,
})
