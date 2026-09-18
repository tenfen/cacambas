import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAlert } from "react-alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressBook, faEdit, faTrash, faRoute, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

import Button from "components/button/Button";
import Search from "components/search/Search";
import ConfirmModal from "modals/Confirm/ConfirmModal";

import ClienteController from "../../controllers/ClienteController";
import CacambaController from "../../controllers/CacambaController";
import AuthContext from "contexts/AuthContext";
import LoadingContext from "../../contexts/LoadingContext";

import "./ClienteList.scss";

export default function ClienteList() {
  const navigate = useNavigate();
  const alert = useAlert();
  const { user } = useContext(AuthContext);
  const { setLoading } = useContext(LoadingContext);
  const userId = user?.userLogged?.userId;

  const [clientes, setClientes] = useState([]);
  const [cacambasPorId, setCacambasPorId] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [toRecolher, setToRecolher] = useState(null);

  useEffect(() => {
    loadClientes();
    loadCacambas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadClientes = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await ClienteController.getAll(userId);
      if (response.status === 200) {
        setClientes(response.content || []);
      }
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      alert.error("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  };

  const loadCacambas = async () => {
    if (!userId) return;

    try {
      const response = await CacambaController.getAll(userId);
      if (response.status === 200) {
        const mapa = {};
        (response.content || []).forEach((cacamba) => {
          mapa[cacamba.bucketId] = cacamba;
        });
        setCacambasPorId(mapa);
      }
    } catch (error) {
      console.error("Erro ao carregar caçambas:", error);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;

    setLoading(true);
    try {
      const response = await ClienteController.remove(toDelete.clienteId);
      if (response.status === 200) {
        alert.success("Cliente excluído com sucesso!");
        setClientes(clientes.filter((c) => c.clienteId !== toDelete.clienteId));
      } else {
        alert.error("Erro ao excluir cliente");
      }
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      alert.error("Erro ao excluir cliente");
    } finally {
      setLoading(false);
      setToDelete(null);
    }
  };

  const handleMarcarRecolhida = async () => {
    if (!toRecolher) return;

    setLoading(true);
    try {
      const response = await ClienteController.recolher(toRecolher.clienteId, userId);

      if (response.status === 200) {
        alert.success("Caçamba liberada — já pode ser alocada a outro cliente.");
        setClientes(
          clientes.map((c) =>
            c.clienteId === toRecolher.clienteId
              ? { ...c, bucketId: null, clienteActive: false }
              : c
          )
        );
      } else {
        alert.error("Erro ao marcar caçamba como recolhida");
      }
    } catch (error) {
      console.error("Erro ao marcar caçamba como recolhida:", error);
      alert.error("Erro ao marcar caçamba como recolhida");
    } finally {
      setLoading(false);
      setToRecolher(null);
    }
  };

  const formatData = (data) => {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR");
  };

  const rotaUrl = (cliente) => {
    if (cliente.clienteLatitude && cliente.clienteLongitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${cliente.clienteLatitude},${cliente.clienteLongitude}`;
    }

    const endereco = [
      cliente.clienteAddressName,
      cliente.clienteAddressNumber,
      cliente.clienteAddressNeighborhood,
      cliente.clienteAddressCity,
      cliente.clienteAddressState,
    ]
      .filter(Boolean)
      .join(", ");

    if (!endereco) return null;

    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(endereco)}`;
  };

  const filteredClientes = clientes
    .filter((c) =>
      `${c.clienteNome} ${c.clienteTelefone || ""} ${c.clienteDocumento || ""}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    /*
     * Quem ainda depende de ser recolhido (ativo) sempre vem antes de
     * quem já foi recolhido (inativo). Dentro de cada grupo, a data de
     * retirada mais próxima aparece primeiro; sem data marcada, vai
     * pro fim do grupo.
     */
    .sort((a, b) => {
      if (a.clienteActive !== b.clienteActive) {
        return a.clienteActive ? -1 : 1;
      }

      if (!a.clienteDataSaida && !b.clienteDataSaida) return 0;
      if (!a.clienteDataSaida) return 1;
      if (!b.clienteDataSaida) return -1;
      return new Date(a.clienteDataSaida) - new Date(b.clienteDataSaida);
    });

  return (
    <section className="cliente-list">
      <div className="cliente-list-header">
        <div className="header-content">
          <div className="header-title">
            <FontAwesomeIcon icon={faAddressBook} className="header-icon" />
            <div>
              <h1>Clientes</h1>
              <p>Gerencie os seus clientes</p>
            </div>
          </div>
          <Button onClick={() => navigate("/clientes/novo")}>
            <span>+</span> Adicionar Cliente
          </Button>
        </div>
        <Search
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nome, telefone ou documento..."
        />
      </div>

      <div className="cliente-table">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>CPF/CNPJ</th>
              <th>Cidade</th>
              <th>Caçamba</th>
              <th>Retirada</th>
              <th className="center-text">Status</th>
              <th className="center-text">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredClientes.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">
                  Nenhum cliente cadastrado
                </td>
              </tr>
            ) : (
              filteredClientes.map((cliente) => (
                <tr key={cliente.clienteId}>
                  <td>{cliente.clienteNome}</td>
                  <td>{cliente.clienteTelefone}</td>
                  <td>{cliente.clienteDocumento || "-"}</td>
                  <td>{cliente.clienteAddressCity || "-"}</td>
                  <td>
                    {cliente.bucketId && cacambasPorId[cliente.bucketId]
                      ? `${cacambasPorId[cliente.bucketId].bucketName}${
                          cacambasPorId[cliente.bucketId].bucketNumber
                            ? ` (${cacambasPorId[cliente.bucketId].bucketNumber})`
                            : ""
                        }`
                      : "-"}
                  </td>
                  <td>{formatData(cliente.clienteDataSaida)}</td>
                  <td className="center-text">
                    <span className={`badge ${cliente.clienteActive ? "badge-active" : "badge-inactive"}`}>
                      {cliente.clienteActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="center-text">
                    <div className="actions">
                      {rotaUrl(cliente) && (
                        <a
                          className="action-btn action-route"
                          href={rotaUrl(cliente)}
                          target="_blank"
                          rel="noreferrer"
                          title="Traçar rota até o cliente"
                        >
                          <FontAwesomeIcon icon={faRoute} />
                        </a>
                      )}
                      {cliente.bucketId && (
                        <button
                          className="action-btn action-recolher"
                          onClick={() => setToRecolher(cliente)}
                          title="Marcar caçamba como recolhida"
                        >
                          <FontAwesomeIcon icon={faCheckCircle} />
                        </button>
                      )}
                      <button
                        className="action-btn action-edit"
                        onClick={() => navigate(`/clientes/editar/${cliente.clienteId}`)}
                        title="Editar"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className="action-btn action-delete"
                        onClick={() => setToDelete(cliente)}
                        title="Excluir"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={!!toDelete}
        title="Excluir cliente"
        content={`Tem certeza que deseja excluir o cliente "${toDelete?.clienteNome}"?`}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />

      <ConfirmModal
        isOpen={!!toRecolher}
        variant="confirm"
        confirmLabel="Confirmar"
        title="Marcar como recolhida"
        content={`Confirma que a caçamba de "${toRecolher?.clienteNome}" já foi recolhida? Ela ficará disponível para ser alocada a outro cliente.`}
        onConfirm={handleMarcarRecolhida}
        onCancel={() => setToRecolher(null)}
      />
    </section>
  );
}
