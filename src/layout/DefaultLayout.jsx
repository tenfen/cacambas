import React from "react"
import { Outlet } from "react-router-dom"

import Footer from "../components/footer/Footer"
import Sidebar from "../components/Sidebar/Sidebar"

import Loading from "../components/Loading/Loading"

import LoadingContext from "../contexts/LoadingContext"

export function DefaultLayout() {
  const [loading, setLoading] = React.useState(false)
  const [loadingMessages, setLoadingMessages] = React.useState([])
  const [loadingAction, setLoadingAction] = React.useState(null)

  return (
    <LoadingContext.Provider value={{ loading, setLoading, loadingMessages, setLoadingMessages, loadingAction, setLoadingAction }}>
      <div className="content">
        <Sidebar />
        <div className="main-content">
          <div className="content-wrapper">
            <Outlet />
          </div>
          <Footer />
          {loading && <Loading messages={loadingMessages} action={loadingAction} />}
        </div>
      </div>
    </LoadingContext.Provider>
  )
}
