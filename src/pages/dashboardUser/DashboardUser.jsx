import React, { useContext, useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChartLine, faSackDollar } from "@fortawesome/free-solid-svg-icons"
import CacambaController from "controllers/CacambaController"
import ClienteController from "controllers/ClienteController"
import UserController from "controllers/UserController"
import AuthContext from "contexts/AuthContext"
import "../dashboard/Dashboard.scss"

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

function getMonthKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

function getMonthRange(startDate, endDate = new Date()) {
  const start = /^\d{4}-\d{2}$/.test(String(startDate))
    ? new Date(Number(String(startDate).slice(0, 4)), Number(String(startDate).slice(5, 7)) - 1, 1)
    : new Date(startDate)
  if (Number.isNaN(start.getTime())) return [getMonthKey(endDate)]

  const month = new Date(start.getFullYear(), start.getMonth(), 1)
  const lastMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
  const months = []

  while (month <= lastMonth) {
    months.push(getMonthKey(month))
    month.setMonth(month.getMonth() + 1)
  }

  return months.reverse()
}

function DashboardUser() {
  const { user } = useContext(AuthContext)
  const userLogged = user?.userLogged || {}
  const userId = userLogged.userId

  const [cacambasList, setCacambasList] = useState([])
  const [clientesList, setClientesList] = useState([])
  const [statsLoading, setStatsLoading] = useState(true)

  const [revenueData, setRevenueData] = useState([])
  const [revenueLoading, setRevenueLoading] = useState(true)
  const [accountCreatedAt, setAccountCreatedAt] = useState(
    userLogged.createdAt || userLogged.created_at || ""
  )
  const [selectedMonth, setSelectedMonth] = useState(() => getMonthKey(new Date()))

  useEffect(() => {
    if (!userId) return

    loadStats()
    loadRevenue()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const loadStats = async () => {
    try {
      const requests = [
        CacambaController.getAll(userId),
        ClienteController.getAll(userId),
      ]

      if (!accountCreatedAt) {
        requests.push(UserController.getUserById(userId))
      }

      const [cacambasRes, clientesRes, userRes] = await Promise.all(requests)

      if (cacambasRes.status === 200) {
        setCacambasList(cacambasRes.content || [])
      }

      if (clientesRes.status === 200) {
        setClientesList(clientesRes.content || [])
      }

      if (userRes?.status === 200) {
        const createdAt =
          userRes.content?.createdAt ||
          userRes.content?.created_at ||
          userRes.content?.user?.createdAt ||
          userRes.content?.user?.created_at

        if (createdAt) setAccountCreatedAt(createdAt)
      }
    } catch (error) {
      console.error("Erro ao carregar dados do painel:", error)
    } finally {
      setStatsLoading(false)
    }
  }

  const loadRevenue = async () => {
    try {
      const response = await ClienteController.getRevenue(userId)
      if (response.status === 200) {
        const data = response.content || []
        setRevenueData(data)
      }
    } catch (error) {
      console.error("Erro ao carregar receita:", error)
    } finally {
      setRevenueLoading(false)
    }
  }

  const totalCacambas = cacambasList.length
  const cacambasDisponiveis = cacambasList.filter((c) => c.bucketStatus === "disponivel").length
  const clientesAtivos = clientesList.filter((c) => c.clienteActive).length
  const firstRevenueMonth = revenueData
    .map((item) => item.month)
    .filter(Boolean)
    .sort()[0]
  const months = getMonthRange(accountCreatedAt || firstRevenueMonth || new Date())
  const mesSelecionado = revenueData.find((r) => r.month === selectedMonth) || {
    total: 0,
    count: 0,
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <FontAwesomeIcon icon={faChartLine} className="header-icon" />
            <div>
              <h1>Dashboard</h1>
              <p>Visão geral do seu negócio</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card purple">
          <div className="stat-content">
            <h3 className="stat-value">{statsLoading ? "..." : totalCacambas}</h3>
            <p className="stat-title">Caçambas Cadastradas</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-content">
            <h3 className="stat-value">{statsLoading ? "..." : cacambasDisponiveis}</h3>
            <p className="stat-title">Caçambas Disponíveis</p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-content">
            <h3 className="stat-value">{statsLoading ? "..." : clientesAtivos}</h3>
            <p className="stat-title">Clientes Ativos</p>
          </div>
        </div>
      </div>

      <div className="dashboard-revenue-section">
        <div className="revenue-card">
          <div className="section-header">
            <h3>
              <FontAwesomeIcon icon={faSackDollar} /> Receita mensal
            </h3>

            <select
              className="revenue-month-select"
              value={months.includes(selectedMonth) ? selectedMonth : months[0]}
              onChange={(e) => setSelectedMonth(e.target.value)}
              disabled={revenueLoading}
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {formatMonthLabel(month)}
                </option>
              ))}
            </select>
          </div>

          {revenueLoading ? (
            <p className="empty-state">Carregando...</p>
          ) : (
            <div className="revenue-summary">
              <div className="revenue-total">{formatCurrency(mesSelecionado?.total)}</div>
              <div className="revenue-count">
                {mesSelecionado?.count || 0} {mesSelecionado?.count === 1 ? "aluguel concluído" : "aluguéis concluídos"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardUser
