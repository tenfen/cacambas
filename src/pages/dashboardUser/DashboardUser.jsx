import React, { useContext, useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChartLine, faSackDollar } from "@fortawesome/free-solid-svg-icons"
import CacambaController from "controllers/CacambaController"
import ClienteController from "controllers/ClienteController"
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

function DashboardUser() {
  const { user } = useContext(AuthContext)
  const userId = user?.userLogged?.userId

  const [cacambasList, setCacambasList] = useState([])
  const [clientesList, setClientesList] = useState([])
  const [statsLoading, setStatsLoading] = useState(true)

  const [revenueData, setRevenueData] = useState([])
  const [revenueLoading, setRevenueLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState("")

  useEffect(() => {
    if (!userId) return

    loadStats()
    loadRevenue()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const loadStats = async () => {
    try {
      const [cacambasRes, clientesRes] = await Promise.all([
        CacambaController.getAll(userId),
        ClienteController.getAll(userId),
      ])

      if (cacambasRes.status === 200) {
        setCacambasList(cacambasRes.content || [])
      }

      if (clientesRes.status === 200) {
        setClientesList(clientesRes.content || [])
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

  const totalCacambas = cacambasList.length
  const cacambasDisponiveis = cacambasList.filter((c) => c.bucketStatus === "disponivel").length
  const clientesAtivos = clientesList.filter((c) => c.clienteActive).length

  const mesSelecionado = revenueData.find((r) => r.month === selectedMonth)

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
            <p className="empty-state">
              Nenhuma receita registrada ainda — ela aparece aqui assim que você
              marcar uma caçamba como recolhida em Clientes.
            </p>
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
