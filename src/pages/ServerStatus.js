import React, { useState, useEffect, useCallback } from 'react';
import { Server, Plus, Edit2, Trash2, X, RefreshCw, Activity } from 'lucide-react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const ServerStatus = () => {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServer, setEditingServer] = useState(null);
  const [refreshingId, setRefreshingId] = useState(null);

  const [serverForm, setServerForm] = useState({
    name: '',
    ip_address: '',
    os: '',
    purpose: '',
    cpu: '',
    memory: '',
    disk: '',
    status: '운영중',
  });

  const fetchServers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/servers`);
      const data = await res.json();
      setServers(data);
    } catch (error) {
      console.error('Failed to fetch servers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  const checkServerStatus = async (id) => {
    setRefreshingId(id);
    try {
      const res = await fetch(`${API}/api/servers/${id}/status`);
      const data = await res.json();

      setServers(prev =>
        prev.map(server =>
          server.id === id ? { ...server, ping: data.ping } : server
        )
      );
    } catch (error) {
      console.error('Failed to check status:', error);
    } finally {
      setRefreshingId(null);
    }
  };

  const checkAllServers = async () => {
    for (const server of servers) {
      await checkServerStatus(server.id);
    }
  };

  const openAddModal = () => {
    setServerForm({
      name: '',
      ip_address: '',
      os: '',
      purpose: '',
      cpu: '',
      memory: '',
      disk: '',
      status: '운영중',
    });
    setEditingServer(null);
    setIsModalOpen(true);
  };

  const openEditModal = (server) => {
    setServerForm({
      name: server.name,
      ip_address: server.ip_address || '',
      os: server.os || '',
      purpose: server.purpose || '',
      cpu: server.cpu || '',
      memory: server.memory || '',
      disk: server.disk || '',
      status: server.status || '운영중',
    });
    setEditingServer(server);
    setIsModalOpen(true);
  };

  const saveServer = async () => {
    try {
      const method = editingServer ? 'PUT' : 'POST';
      const url = editingServer
        ? `${API}/api/servers/${editingServer.id}`
        : `${API}/api/servers`;

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverForm),
      });

      setIsModalOpen(false);
      fetchServers();
    } catch (error) {
      console.error('Failed to save server:', error);
    }
  };

  const deleteServer = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await fetch(`${API}/api/servers/${id}`, { method: 'DELETE' });
      fetchServers();
    } catch (error) {
      console.error('Failed to delete server:', error);
    }
  };

  const getStatusDot = (status, ping) => {
    if (ping?.alive === false) return 'offline';
    if (status === '점검중') return 'maintenance';
    if (status === '중지') return 'offline';
    return 'online';
  };

  const getStatusText = (status, ping) => {
    if (ping?.alive === false) return '응답없음';
    if (ping?.alive === true) return `정상 (${ping.latency}ms)`;
    return status;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">시스템관리</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={checkAllServers}>
            <RefreshCw size={18} /> 전체 상태 확인
          </button>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={18} /> 서버 등록
          </button>
        </div>
      </div>

      {/* 서버 상태 요약 */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <Server size={28} />
          </div>
          <div className="stat-content">
            <h3>{servers.length}</h3>
            <p>전체 서버</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <Activity size={28} />
          </div>
          <div className="stat-content">
            <h3>{servers.filter(s => s.status === '운영중').length}</h3>
            <p>운영중</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <RefreshCw size={28} />
          </div>
          <div className="stat-content">
            <h3>{servers.filter(s => s.status === '점검중').length}</h3>
            <p>점검중</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon danger">
            <Server size={28} />
          </div>
          <div className="stat-content">
            <h3>{servers.filter(s => s.status === '중지').length}</h3>
            <p>중지</p>
          </div>
        </div>
      </div>

      {/* 서버 목록 */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">서버 목록</h2>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>서버명</th>
                <th>IP 주소</th>
                <th>OS</th>
                <th>용도</th>
                <th>사양</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {servers.map((server) => (
                <tr key={server.id}>
                  <td><strong>{server.name}</strong></td>
                  <td style={{ fontFamily: 'monospace' }}>{server.ip_address || '-'}</td>
                  <td>{server.os || '-'}</td>
                  <td>{server.purpose || '-'}</td>
                  <td>
                    <small style={{ color: '#666' }}>
                      {server.cpu && <span>CPU: {server.cpu}<br /></span>}
                      {server.memory && <span>RAM: {server.memory}<br /></span>}
                      {server.disk && <span>Disk: {server.disk}</span>}
                    </small>
                  </td>
                  <td>
                    <div className="status-indicator">
                      <span className={`status-dot ${getStatusDot(server.status, server.ping)}`}></span>
                      <span>{getStatusText(server.status, server.ping)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => checkServerStatus(server.id)}
                        disabled={refreshingId === server.id}
                        title="상태 확인"
                      >
                        <RefreshCw size={14} className={refreshingId === server.id ? 'spinning' : ''} />
                      </button>
                      <button className="btn btn-sm btn-secondary" onClick={() => openEditModal(server)}>
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => deleteServer(server.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {servers.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                    등록된 서버가 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 서버 등록/수정 모달 */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                <Server size={20} style={{ marginRight: '8px' }} />
                {editingServer ? '서버 수정' : '서버 등록'}
              </h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">서버명 *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={serverForm.name}
                    onChange={(e) => setServerForm({ ...serverForm, name: e.target.value })}
                    placeholder="예: Web-Server-01"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">IP 주소</label>
                  <input
                    type="text"
                    className="form-control"
                    value={serverForm.ip_address}
                    onChange={(e) => setServerForm({ ...serverForm, ip_address: e.target.value })}
                    placeholder="예: 192.168.1.100"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">운영체제</label>
                  <input
                    type="text"
                    className="form-control"
                    value={serverForm.os}
                    onChange={(e) => setServerForm({ ...serverForm, os: e.target.value })}
                    placeholder="예: Ubuntu 22.04"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">용도</label>
                  <input
                    type="text"
                    className="form-control"
                    value={serverForm.purpose}
                    onChange={(e) => setServerForm({ ...serverForm, purpose: e.target.value })}
                    placeholder="예: 웹서버, DB서버"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">CPU</label>
                  <input
                    type="text"
                    className="form-control"
                    value={serverForm.cpu}
                    onChange={(e) => setServerForm({ ...serverForm, cpu: e.target.value })}
                    placeholder="예: Intel Xeon 8 Core"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">메모리</label>
                  <input
                    type="text"
                    className="form-control"
                    value={serverForm.memory}
                    onChange={(e) => setServerForm({ ...serverForm, memory: e.target.value })}
                    placeholder="예: 16GB"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">디스크</label>
                  <input
                    type="text"
                    className="form-control"
                    value={serverForm.disk}
                    onChange={(e) => setServerForm({ ...serverForm, disk: e.target.value })}
                    placeholder="예: 500GB SSD"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">상태</label>
                  <select
                    className="form-control"
                    value={serverForm.status}
                    onChange={(e) => setServerForm({ ...serverForm, status: e.target.value })}
                  >
                    <option value="운영중">운영중</option>
                    <option value="점검중">점검중</option>
                    <option value="중지">중지</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                취소
              </button>
              <button className="btn btn-primary" onClick={saveServer}>
                {editingServer ? '수정' : '등록'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .spinning {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ServerStatus;
