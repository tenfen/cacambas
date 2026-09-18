import React, { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChartLine, faSackDollar } from "@fortawesome/free-solid-svg-icons"
import UserController from "controllers/UserController"
import PaymentController from "controllers/PaymentController"
import "./Dashboard.scss"

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

function formatMonthLabel(monthStr) {
  const [year, month] = monthStr.split("-")
  return `${MESES[parseInt(month, 10) - 1]}/${year}`
}

function formatCurrency(value) {
  return `R$ ${Number(value || 0).toFixed(2).replace(".", ",")}`
}

function Dashboard() {
  const [usersList, setUsersList] = useState([])
  const [usersLoading, setUsersLoading] = useState(true)

  const [revenueData, setRevenueData] = useState([])
  const [revenueLoading, setRevenueLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState("")

  useEffect(() => {
    loadUsersList()
    loadRevenue()
  }, [])

  const loadUsersList = async () => {
    try {
      const response = await UserController.getAllUsers()
      if (response.status === 200) {
        setUsersList(response.content || [])
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
    } finally {
      setUsersLoading(false)
    }
  }

  const loadRevenue = async () => {
    try {
      const response = await PaymentController.getRevenueSummary()
      if (response.status === 200) {
        const data = response.content || []
        setRevenueData(data)
        if (data.length > 0) {
          setSelectedMonth(data[0].month)
        }
      }
    } catch (error) {
      console.error("Erro ao carregar receita:", error)
    } finally {
      setRevenueLoading(false)
    }
  }

  const isUserActive = (user) =>
    user.userActive === true || user.accountStatus === "active"

  const totalAtivos = usersList.filter(isUserActive).length

  const mesSelecionado = revenueData.find((r) => r.month === selectedMonth)

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <FontAwesomeIcon icon={faChartLine} className="header-icon" />
            <div>
              <h1>Dashboard</h1>
              <p>Visão geral dos usuários da plataforma</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card purple">
          <div className="stat-content">
            <h3 className="stat-value">{usersLoading ? "..." : usersList.length}</h3>
            <p className="stat-title">Usuários Cadastrados</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-content">
            <h3 className="stat-value">{usersLoading ? "..." : totalAtivos}</h3>
            <p className="stat-title">Usuários Ativos</p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-content">
            <h3 className="stat-value">{usersLoading ? "..." : usersList.length - totalAtivos}</h3>
            <p className="stat-title">Usuários Inativos</p>
          </div>
        </div>
      </div>

      <div className="dashboard-revenue-section">
        <div className="revenue-card">
          <div className="section-header">
            <h3>
              <FontAwesomeIcon icon={faSackDollar} /> Receita mensal
            </h3>

            {revenueData.length > 0 && (
              <select
                className="revenue-month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {revenueData.map((r) => (
                  <option key={r.month} value={r.month}>
                    {formatMonthLabel(r.month)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {revenueLoading ? (
            <p className="empty-state">Carregando...</p>
          ) : revenueData.length === 0 ? (
            <p className="empty-state">Nenhuma receita registrada ainda.</p>
          ) : (
            <div className="revenue-summary">
              <div className="revenue-total">{formatCurrency(mesSelecionado?.total)}</div>
              <div className="revenue-count">
                {mesSelecionado?.count || 0} pagamento{mesSelecionado?.count === 1 ? "" : "s"} aprovado{mesSelecionado?.count === 1 ? "" : "s"}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-users-section">
        <div className="users-card">
          <div className="section-header">
            <h3>Usuários Cadastrados</h3>
            <span className="badge">{usersList.length}</span>
          </div>
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th className="center-text">Papel</th>
                  <th className="center-text">Status</th>
                  <th className="center-text">Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  <tr>
                    <td colSpan="5" className="empty-state">Carregando...</td>
                  </tr>
                ) : usersList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">Nenhum usuário cadastrado</td>
                  </tr>
                ) : (
                  usersList.map((usuario) => (
                    <tr key={usuario.userId}>
                      <td>{usuario.userName} {usuario.userLastname}</td>
                      <td>{usuario.userEmail}</td>
                      <td className="center-text">{usuario.userRole}</td>
                      <td className="center-text">
                        <span className={`badge ${isUserActive(usuario) ? "badge-active" : "badge-inactive"}`}>
                          {isUserActive(usuario) ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="center-text">
                        {usuario.createdAt ? new Date(usuario.createdAt).toLocaleDateString("pt-BR") : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
