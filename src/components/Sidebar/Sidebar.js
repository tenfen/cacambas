import React from "react"

// Components
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHouseChimney, faMobile, faGear, faUser, faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons"

// Styles
import "./Sidebar.scss"
import { Link } from "react-router-dom"

// Contexts
import AuthContext from "contexts/AuthContext"

export default function Sidebar() {
  const { setUser } = React.useContext(AuthContext)

  return (
    <nav>
      <div className="filter" />
      <ul>
        <li>
          <Link to={`/`}>
            <div className="circle">
              <FontAwesomeIcon icon={faHouseChimney} color={"white"} />
            </div>
            Início
          </Link>
        </li>
        <li>
          <Link to={`/buckets`}>
            <div className="circle">
              <FontAwesomeIcon icon="list-check" color={"white"} />
            </div>
            Marcas
          </Link>
        </li>
        <li className="active">
          <Link to={`/devices`}>
            <div className="circle">
              <FontAwesomeIcon icon={faMobile} color={"white"} />
            </div>
            Aparelhos
          </Link>
        </li>
        <li className="active">
          <Link to={`/assistances`}>
            <div className="circle">
              <FontAwesomeIcon icon={faMobile} color={"white"} />
            </div>
            Assistências
          </Link>
        </li>
        <li>
          <Link to={`/damages`}>
            <div className="circle">
              <FontAwesomeIcon icon="list-check" color={"white"} />
            </div>
            Tipos de Danos
          </Link>
        </li>
        {/*<li>*/}
        {/*  <Link to={`/`}>*/}
        {/*    <div className="circle">*/}
        {/*      <FontAwesomeIcon icon={faGear} color={"white"} />*/}
        {/*    </div>*/}
        {/*    Configurações*/}
        {/*  </Link>*/}
        {/*</li>*/}
        {/*<li>*/}
        {/*  <Link to={`/`}>*/}
        {/*    <div className="circle">*/}
        {/*      <FontAwesomeIcon icon={faUser} color={"white"} />*/}
        {/*    </div>*/}
        {/*    Perfil*/}
        {/*  </Link>*/}
        {/*</li>*/}
        <li>
          <label onClick={() => setUser(null)}>
            <div className="circle">
              <FontAwesomeIcon icon={faArrowRightFromBracket} color={"white"} />
            </div>
            Sair
          </label>
        </li>
      </ul>
    </nav>
  )
}
