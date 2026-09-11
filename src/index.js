import React from "react"
import ReactDOM from "react-dom/client"

// Font Awesome
import { fas } from "@fortawesome/free-solid-svg-icons"
import { far } from "@fortawesome/free-regular-svg-icons"
import { fab } from "@fortawesome/free-brands-svg-icons"
import { library } from "@fortawesome/fontawesome-svg-core"

import App from "./App"
import reportWebVitals from "./reportWebVitals"

import "./styles/global.scss"
import "bootstrap/dist/css/bootstrap.min.css"

library.add(fas, far, fab)

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(<App />)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
