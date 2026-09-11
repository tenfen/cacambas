import React from "react"
import { Outlet } from "react-router-dom"

import Footer from "../components/footer/Footer"
import Header from "../components/header/Header"
import Sidebar from "../components/Sidebar/Sidebar"

import Loading from "../components/Loading/Loading"

import LoadingContext from "../contexts/LoadingContext"

export function DefaultLayout() {
  const [loading, setLoading] = React.useState(false)

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      <Header />
      <div className="content">
        <Sidebar />
        <div className="main-content">
          <Outlet />
          <Footer />
          {loading && <Loading />}
        </div>
      </div>
    </LoadingContext.Provider>
  )
}
