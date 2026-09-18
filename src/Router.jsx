import { useContext } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { DefaultLayout } from "./layout/DefaultLayout"
import AuthContext from "contexts/AuthContext"
import { isUserRole } from "helpers/role"

// Páginas do admin
import Dashboard from "./pages/dashboard/Dashboard"
import UserManagement from "./pages/users/UserManagement"

// Páginas do usuário (dono do negócio)
import DashboardUser from "./pages/dashboardUser/DashboardUser"
import CacambaList from "./pages/cacambas/CacambaList"
import CacambaForm from "./pages/cacambas/CacambaForm"
import ClienteList from "./pages/clientes/ClienteList"
import ClienteForm from "./pages/clientes/ClienteForm"
import PerfilUsuario from "./pages/perfil/PerfilUsuario"

export function Router() {
  const { user } = useContext(AuthContext)
  const isUser = isUserRole(user?.userLogged?.userRole)

  return (
    <Routes>
      <Route path="/" element={<DefaultLayout />}>
        {isUser ? (
          <>
            <Route index element={<DashboardUser />} />

            <Route path="/cacambas" element={<CacambaList />} />
            <Route path="/cacambas/novo" element={<CacambaForm />} />
            <Route path="/cacambas/editar/:id" element={<CacambaForm />} />

            <Route path="/clientes" element={<ClienteList />} />
            <Route path="/clientes/novo" element={<ClienteForm />} />
            <Route path="/clientes/editar/:id" element={<ClienteForm />} />

            <Route path="/perfil" element={<PerfilUsuario />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route index element={<Dashboard />} />

            <Route path="/users" element={<UserManagement />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Route>
    </Routes>
  )
}
