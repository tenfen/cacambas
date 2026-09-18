import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faSearch, faTrash, faBan, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import UserController from '../../controllers/UserController';
import ConfirmModal from '../../modals/Confirm/ConfirmModal';
import './UserManagement.scss';

const ACCOUNT_STATUS_LABELS = {
  trial: 'Em teste grátis',
  active: 'Ativo',
  pending_payment: 'Pagamento pendente',
  suspended: 'Inativo',
  cancelled: 'Cancelado',
};

/*
 * Quem está em teste grátis tem acesso igual a quem está ativo —
 * conta como "ligado" pra fins de badge/botão de ativar-inativar.
 */
const isAccountLive = (accountStatus) =>
  accountStatus === 'active' || accountStatus === 'trial';

function formatData(data) {
  if (!data) return '-';
  return new Date(data).toLocaleDateString('pt-BR');
}

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [toToggle, setToToggle] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await UserController.getAllUsers();

      if (response.status === 200) {
        setUsers(response.content || []);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleDeleteUser = async () => {
    if (!toDelete) return;

    setLoading(true);
    try {
      const response = await UserController.deleteUser(toDelete.userId);

      if (response.status === 200) {
        setUsers(users.filter((u) => u.userId !== toDelete.userId));
      } else {
        alert('Erro ao excluir usuário');
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Erro ao excluir usuário');
    } finally {
      setLoading(false);
      setToDelete(null);
    }
  };

  const handleToggleStatus = async () => {
    if (!toToggle) return;

    const novoStatus = isAccountLive(toToggle.accountStatus) ? 'suspended' : 'active';

    setLoading(true);
    try {
      const response = await UserController.updateStatus(toToggle.userId, novoStatus);

      if (response.status === 200) {
        setUsers(
          users.map((u) =>
            u.userId === toToggle.userId
              ? { ...u, accountStatus: novoStatus, userActive: novoStatus === 'active' }
              : u
          )
        );
      } else {
        alert('Erro ao atualizar status do usuário');
      }
    } catch (error) {
      console.error('Erro ao atualizar status do usuário:', error);
      alert('Erro ao atualizar status do usuário');
    } finally {
      setLoading(false);
      setToToggle(null);
    }
  };

  const filteredUsers = users.filter((u) =>
    `${u.userName} ${u.userLastname} ${u.userEmail} ${u.userPhone || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const vaiAtivar = !isAccountLive(toToggle?.accountStatus);

  return (
    <>
      <div className="user-management">
        <div className="user-management--header">
          <div className="header-content">
            <div className="header-title">
              <FontAwesomeIcon icon={faUsers} className="header-icon" />
              <div>
                <h2>Usuários</h2>
                <p>Gerencie o acesso dos donos de negócio cadastrados na plataforma</p>
              </div>
            </div>
          </div>
        </div>

        <div className="user-management--search">
          <div className="search-container">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por nome, email ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="user-management--content">
          <table className="users-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Papel</th>
                <th className="text-center">Válido até</th>
                <th className="text-center">Status</th>
                <th className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>
                    Carregando...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.userId}>
                    <td>
                      <div className="user-info">
                        <strong>{user.userName} {user.userLastname}</strong>
                        <span className="user-email">{user.userEmail}</span>
                      </div>
                    </td>
                    <td>{user.userPhone || '-'}</td>
                    <td>{user.userRole}</td>
                    <td className="text-center">
                      {formatData(
                        user.accountStatus === 'trial' ? user.trialEndsAt : user.currentPeriodEnd
                      )}
                    </td>
                    <td className="text-center">
                      <span
                        className={`badge ${
                          isAccountLive(user.accountStatus) ? 'badge-active' : 'badge-inactive'
                        }`}
                      >
                        {ACCOUNT_STATUS_LABELS[user.accountStatus] || user.accountStatus || '-'}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="action-buttons">
                        <button
                          className={`btn-action ${
                            isAccountLive(user.accountStatus) ? 'btn-danger' : 'btn-success'
                          }`}
                          onClick={() => setToToggle(user)}
                          title={isAccountLive(user.accountStatus) ? 'Inativar' : 'Ativar'}
                        >
                          <FontAwesomeIcon
                            icon={isAccountLive(user.accountStatus) ? faBan : faCheckCircle}
                          />
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => setToDelete(user)}
                          title="Excluir Usuário"
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
      </div>

      <ConfirmModal
        isOpen={!!toDelete}
        title="Excluir usuário"
        content={`Tem certeza que deseja excluir o usuário "${toDelete?.userName} ${toDelete?.userLastname}"? Esta ação não pode ser desfeita e todos os dados do usuário serão permanentemente removidos.`}
        onConfirm={handleDeleteUser}
        onCancel={() => setToDelete(null)}
      />

      <ConfirmModal
        isOpen={!!toToggle}
        variant={vaiAtivar ? 'confirm' : 'delete'}
        confirmLabel={vaiAtivar ? 'Ativar' : 'Inativar'}
        title={vaiAtivar ? 'Ativar usuário' : 'Inativar usuário'}
        content={
          vaiAtivar
            ? `Confirma a reativação de "${toToggle?.userName} ${toToggle?.userLastname}"? A conta volta a ter acesso ao sistema.`
            : `Confirma a inativação de "${toToggle?.userName} ${toToggle?.userLastname}"? A conta perde o acesso ao sistema até ser reativada.`
        }
        onConfirm={handleToggleStatus}
        onCancel={() => setToToggle(null)}
      />
    </>
  );
};

export default UserManagement;
