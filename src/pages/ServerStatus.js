import React, { useState, useEffect, useCallback } from 'react';
import { Server, Plus, Edit2, Trash2, X, RefreshCw, Activity, Cpu, HardDrive, Wifi } from 'lucide-react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';

// Skeleton 컴포넌트
const SkeletonStat = () => (
  <div className="stat-card-enhanced">
    <div className="stat-header">
      <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 12 }} />
    </div>
    <div className="skeleton skeleton-title" style={{ width: '40%', marginTop: 16 }} />
    <div className="skeleton skeleton-text short" style={{ marginTop: 8 }} />
  </div>
);

const SkeletonRow = () => (
  <tr>
    <td><div className="skeleton" style={{ width: '60%', height: 16, borderRadius: 4 }} /></td>
    <td><div className="skeleton" style={{ width: '80%', height: 16, borderRadius: 4 }} /></td>
    <td><div className="skeleton" style={{ width: '50%', height: 16, borderRadius: 4 }} /></td>
    <td><div className="skeleton" style={{ width: '40%', height: 16, borderRadius: 4 }} /></td>
    <td><div className="skeleton" style={{ width: '70%', height: 16, borderRadius: 4 }} /></td>
    <td><div className="skeleton" style={{ width: 60, height: 24, borderRadius: 12 }} /></td>
    <td><div className="skeleton" style={{ width: 80, height: 24, borderRadius: 6 }} /></td>
    <td><div className="skeleton" style={{ width: 80, height: 28, borderRadius: 6 }} /></td>
  </tr>
);

// Empty State 컴포넌트
const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="empty-state">
    <div className="empty-state-icon">
      <Icon size={32} />
    </div>
    <h3 className="empty-state-title">{title}</h3>
    <p className="empty-state-description">{description}</p>
  </div>
);

const ServerStatus = () => {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServer, setEditingServer] = useState(null);
  const [refreshingId, setRefreshingId] = useState(null);
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);

  const [serverForm, setServerForm] = useState({
    name: '',
    ip_address: '',
    os: '',
    purpose: '',
    cpu: '',
    memory: '',
    disk: '',
    status: '운영중',
    ports: '',
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
          server.id === id ? { ...server, ping: data.ping, portStatus: data.portStatus } : server
        )
      );
    } catch (error) {
      console.error('Failed to check status:', error);
    } finally {
      setRefreshingId(null);
    }
  };

  const checkAllServers = async () => {
    setIsRefreshingAll(true);
    for (const server of servers) {
      await checkServerStatus(server.id);
    }
    setIsRefreshingAll(false);
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
      ports: '',
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
      ports: server.ports || '',
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

  // 통계 데이터
  const stats = {
    total: servers.length,
    running: servers.filter(s => s.status === '운영중').length,
    maintenance: servers.filter(s => s.status === '점검중').length,
    stopped: servers.filter(s => s.status === '중지').length,
  };

  // Skeleton 로딩 UI
  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">시스템관리</h1>
        </div>
        <div className="bento-grid">
          <div className="bento-sm"><SkeletonStat /></div>
          <div className="bento-sm"><SkeletonStat /></div>
          <div className="bento-sm"><SkeletonStat /></div>
          <div className="bento-sm"><SkeletonStat /></div>
        </div>
        <div className="bento-card" style={{ marginTop: 20 }}>
          <div className="bento-card-header">
            <div className="skeleton" style={{ width: 150, height: 24, borderRadius: 6 }} />
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
                  <th>포트 상태</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">시스템관리</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>서버 상태를 모니터링하고 관리하세요</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className={`btn btn-secondary btn-hover-lift ${isRefreshingAll ? 'refreshing' : ''}`}
            onClick={checkAllServers}
            disabled={isRefreshingAll}
          >
            <RefreshCw size={18} className={isRefreshingAll ? 'spinning' : ''} />
            전체 상태 확인
          </button>
          <button className="btn btn-primary btn-hover-lift" onClick={openAddModal}>
            <Plus size={18} /> 서버 등록
          </button>
        </div>
      </div>

      {/* 서버 상태 요약 - Bento Grid */}
      <div className="bento-grid" style={{ marginBottom: 20 }}>
        <div className="bento-sm">
          <div className="stat-card-enhanced card-enter stagger-1">
            <div className="stat-header">
              <div className="stat-icon-enhanced primary">
                <Server size={24} />
              </div>
            </div>
            <h3 className="stat-value">{stats.total}</h3>
            <p className="stat-label">전체 서버</p>
          </div>
        </div>

        <div className="bento-sm">
          <div className="stat-card-enhanced card-enter stagger-2">
            <div className="stat-header">
              <div className="stat-icon-enhanced success">
                <Activity size={24} />
              </div>
              {stats.running > 0 && <div className="live-pulse"></div>}
            </div>
            <h3 className="stat-value">{stats.running}</h3>
            <p className="stat-label">운영중</p>
          </div>
        </div>

        <div className="bento-sm">
          <div className="stat-card-enhanced card-enter stagger-3">
            <div className="stat-header">
              <div className="stat-icon-enhanced warning">
                <RefreshCw size={24} />
              </div>
            </div>
            <h3 className="stat-value">{stats.maintenance}</h3>
            <p className="stat-label">점검중</p>
          </div>
        </div>

        <div className="bento-sm">
          <div className="stat-card-enhanced card-enter stagger-4">
            <div className="stat-header">
              <div className="stat-icon-enhanced danger">
                <Server size={24} />
              </div>
            </div>
            <h3 className="stat-value">{stats.stopped}</h3>
            <p className="stat-label">중지</p>
          </div>
        </div>
      </div>

      {/* 서버 목록 */}
      <div className="bento-card card-enter stagger-5">
        <div className="bento-card-header">
          <div className="bento-card-icon">
            <HardDrive size={20} />
          </div>
          <h2 className="bento-card-title">서버 목록</h2>
          <span className="badge-modern badge-primary" style={{ marginLeft: 'auto' }}>
            {servers.length}대
          </span>
        </div>

        {servers.length > 0 ? (
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
                  <th>포트 상태</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {servers.map((server, index) => (
                  <tr key={server.id} className="table-row-hover" style={{ animationDelay: `${index * 0.03}s` }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Server size={16} style={{ color: 'var(--primary)' }} />
                        <strong>{server.name}</strong>
                      </div>
                    </td>
                    <td>
                      <code style={{
                        fontFamily: 'monospace',
                        background: 'var(--gray-100)',
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 13
                      }}>
                        {server.ip_address || '-'}
                      </code>
                    </td>
                    <td>{server.os || '-'}</td>
                    <td>
                      <span className="badge-modern badge-info">{server.purpose || '-'}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {server.cpu && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                            <Cpu size={12} /> {server.cpu}
                          </div>
                        )}
                        {server.memory && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                            <HardDrive size={12} /> RAM: {server.memory}
                          </div>
                        )}
                        {server.disk && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <HardDrive size={12} /> Disk: {server.disk}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="status-indicator-modern">
                        <span className={`status-dot-modern ${getStatusDot(server.status, server.ping)}`}></span>
                        <span>{getStatusText(server.status, server.ping)}</span>
                      </div>
                    </td>
                    <td>
                      {server.portStatus && server.portStatus.length > 0 ? (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {server.portStatus.map((p, idx) => (
                            <span
                              key={idx}
                              className={`port-badge ${p.open ? 'port-open' : 'port-closed'}`}
                            >
                              <Wifi size={10} />
                              {p.port}: {p.open ? 'OPEN' : 'CLOSED'}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          {server.ports ? '상태 확인 필요' : '-'}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-secondary btn-hover-lift"
                          onClick={() => checkServerStatus(server.id)}
                          disabled={refreshingId === server.id}
                          title="상태 확인"
                        >
                          <RefreshCw size={14} className={refreshingId === server.id ? 'spinning' : ''} />
                        </button>
                        <button className="btn btn-sm btn-secondary btn-hover-lift" onClick={() => openEditModal(server)} title="수정">
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-sm btn-danger btn-hover-lift" onClick={() => deleteServer(server.id)} title="삭제">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Server}
            title="등록된 서버가 없습니다"
            description="상단의 '서버 등록' 버튼을 클릭하여 새 서버를 추가하세요"
          />
        )}
      </div>

      {/* 서버 등록/수정 모달 */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-modern" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
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
                <div className="form-group-modern">
                  <label className="form-label">서버명 *</label>
                  <input
                    type="text"
                    className="form-control-modern"
                    value={serverForm.name}
                    onChange={(e) => setServerForm({ ...serverForm, name: e.target.value })}
                    placeholder="예: Web-Server-01"
                  />
                </div>
                <div className="form-group-modern">
                  <label className="form-label">IP 주소</label>
                  <input
                    type="text"
                    className="form-control-modern"
                    value={serverForm.ip_address}
                    onChange={(e) => setServerForm({ ...serverForm, ip_address: e.target.value })}
                    placeholder="예: 192.168.1.100"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group-modern">
                  <label className="form-label">운영체제</label>
                  <input
                    type="text"
                    className="form-control-modern"
                    value={serverForm.os}
                    onChange={(e) => setServerForm({ ...serverForm, os: e.target.value })}
                    placeholder="예: Ubuntu 22.04"
                  />
                </div>
                <div className="form-group-modern">
                  <label className="form-label">용도</label>
                  <input
                    type="text"
                    className="form-control-modern"
                    value={serverForm.purpose}
                    onChange={(e) => setServerForm({ ...serverForm, purpose: e.target.value })}
                    placeholder="예: 웹서버, DB서버"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group-modern">
                  <label className="form-label">CPU</label>
                  <input
                    type="text"
                    className="form-control-modern"
                    value={serverForm.cpu}
                    onChange={(e) => setServerForm({ ...serverForm, cpu: e.target.value })}
                    placeholder="예: Intel Xeon 8 Core"
                  />
                </div>
                <div className="form-group-modern">
                  <label className="form-label">메모리</label>
                  <input
                    type="text"
                    className="form-control-modern"
                    value={serverForm.memory}
                    onChange={(e) => setServerForm({ ...serverForm, memory: e.target.value })}
                    placeholder="예: 16GB"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group-modern">
                  <label className="form-label">디스크</label>
                  <input
                    type="text"
                    className="form-control-modern"
                    value={serverForm.disk}
                    onChange={(e) => setServerForm({ ...serverForm, disk: e.target.value })}
                    placeholder="예: 500GB SSD"
                  />
                </div>
                <div className="form-group-modern">
                  <label className="form-label">상태</label>
                  <select
                    className="form-control-modern"
                    value={serverForm.status}
                    onChange={(e) => setServerForm({ ...serverForm, status: e.target.value })}
                  >
                    <option value="운영중">운영중</option>
                    <option value="점검중">점검중</option>
                    <option value="중지">중지</option>
                  </select>
                </div>
              </div>

              <div className="form-group-modern">
                <label className="form-label">모니터링 포트</label>
                <input
                  type="text"
                  className="form-control-modern"
                  value={serverForm.ports}
                  onChange={(e) => setServerForm({ ...serverForm, ports: e.target.value })}
                  placeholder="예: 80,443,3306 (쉼표로 구분)"
                />
                <small style={{ color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                  체크할 포트를 쉼표로 구분하여 입력하세요
                </small>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary btn-hover-lift" onClick={() => setIsModalOpen(false)}>
                취소
              </button>
              <button className="btn btn-primary btn-hover-lift" onClick={saveServer}>
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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .live-pulse {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 8px;
          height: 8px;
          background: var(--success);
          border-radius: 50%;
          animation: live-pulse 2s ease-in-out infinite;
        }
        @keyframes live-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        .status-indicator-modern {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .status-dot-modern {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
        }
        .status-dot-modern.online {
          background: var(--success);
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
        }
        .status-dot-modern.offline {
          background: var(--danger);
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
        }
        .status-dot-modern.maintenance {
          background: var(--warning);
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
        }
        .port-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-family: monospace;
          font-weight: 600;
        }
        .port-badge.port-open {
          background: rgba(34, 197, 94, 0.1);
          color: var(--success);
          border: 1px solid rgba(34, 197, 94, 0.3);
        }
        .port-badge.port-closed {
          background: rgba(239, 68, 68, 0.1);
          color: var(--danger);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .stat-card-enhanced {
          position: relative;
        }
      `}</style>
    </div>
  );
};

export default ServerStatus;
