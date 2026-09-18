import React from "react"
import { Link, useLocation } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faChartLine,
  faArrowRightFromBracket,
  faBars,
  faTimes,
  faUsers,
  faDumpster,
  faAddressBook,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons"
import AuthContext from "contexts/AuthContext"
import { isUserRole } from "helpers/role"
import { removeSessionItem } from "helpers/StorageTools"
import "./Sidebar.scss"

const ADMIN_MENU_ITEMS = [
  { path: "/", icon: faChartLine, label: "Dashboard" },
  { path: "/users", icon: faUsers, label: "Usuários" },
]

const USER_MENU_ITEMS = [
  { path: "/", icon: faChartLine, label: "Dashboard" },
  { path: "/cacambas", icon: faDumpster, label: "Caçambas" },
  { path: "/clientes", icon: faAddressBook, label: "Clientes" },
  { path: "/perfil", icon: faUserCircle, label: "Meu Perfil" },
]

export default function Sidebar() {
  const { user, setUser } = React.useContext(AuthContext)
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const papelUser = isUserRole(user?.userLogged?.userRole)
  const menuItems = papelUser ? USER_MENU_ITEMS : ADMIN_MENU_ITEMS

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* Botão Hamburger Mobile */}
      <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
        <FontAwesomeIcon icon={faBars} />
      </button>

      {/* Overlay/Backdrop */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu} />
      )}

      {/* Sidebar */}
      <nav className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Botão fechar dentro do menu mobile */}
        <button className="mobile-menu-close" onClick={closeMobileMenu}>
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <div className="sidebar-header">
          <h2 className="sidebar-logo">Cacambix</h2>
          <p className="sidebar-subtitle">{papelUser ? "Minha Conta" : "Admin Panel"}</p>
        </div>

        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.path} className={isActive(item.path) ? "active" : ""}>
              <Link to={item.path} onClick={closeMobileMenu}>
                <div className="menu-icon">
                  <FontAwesomeIcon icon={item.icon} />
                </div>
                <span className="menu-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <li>
            <label
              onClick={() => {
                removeSessionItem("authToken");
                removeSessionItem("user");
                setUser(null);
                closeMobileMenu();
              }}
              className="logout-btn"
            >
              <div className="menu-icon">
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
              </div>
              <span className="menu-label">Sair</span>
            </label>
          </li>
        </div>
      </nav>
    </>
  )
}
