import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Plus, Edit2, Trash2, X, Users, Calendar } from 'lucide-react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const SiteManagement = () => {
  const [sites, setSites] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [newAssignment, setNewAssignment] = useState({
    employee_id: '',
    site_id: '',
    start_date: '',
    end_date: '',
    monthly_rate: '',
  });

  const [siteForm, setSiteForm] = useState({
    name: '',
    address: '',
    contact_person: '',
    contact_phone: '',
    contract_start: '',
    contract_end: '',
    contract_amount: '',
    contract_type: '파견',
    status: '진행중',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sitesRes, assignmentsRes, historyRes, employeesRes] = await Promise.all([
        fetch(`${API}/api/sites`),
        fetch(`${API}/api/assignments?status=진행중`),
        fetch(`${API}/api/assignments?status=종료`),
        fetch(`${API}/api/employees?status=대기`),
      ]);

      setSites(await sitesRes.json());
      setAssignments(await assignmentsRes.json());
      setAssignmentHistory(await historyRes.json());
      setEmployees(await employeesRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openAddModal = () => {
    setSiteForm({
      name: '',
      address: '',
      contact_person: '',
      contact_phone: '',
      contract_start: '',
      contract_end: '',
      contract_amount: '',
      contract_type: '파견',
      status: '진행중',
    });
    setEditingSite(null);
    setIsModalOpen(true);
  };

  const openEditModal = (site) => {
    setSiteForm({
      name: site.name,
      address: site.address || '',
      contact_person: site.contact_person || '',
      contact_phone: site.contact_phone || '',
      contract_start: site.contract_start?.split('T')[0] || '',
      contract_end: site.contract_end?.split('T')[0] || '',
      contract_amount: site.contract_amount || '',
      contract_type: site.contract_type || '파견',
      status: site.status || '진행중',
    });
    setEditingSite(site);
    setIsModalOpen(true);
  };

  const saveSite = async () => {
    try {
      const method = editingSite ? 'PUT' : 'POST';
      const url = editingSite
        ? `${API}/api/sites/${editingSite.id}`
        : `${API}/api/sites`;

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteForm),
      });

      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save site:', error);
    }
  };

  const deleteSite = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await fetch(`${API}/api/sites/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Failed to delete site:', error);
    }
  };

  const openAssignModal = (siteId) => {
    setNewAssignment({
      employee_id: '',
      site_id: siteId,
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      monthly_rate: '',
    });
    setIsAssignModalOpen(true);
  };

  const createAssignment = async () => {
    try {
      await fetch(`${API}/api/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAssignment),
      });

      setIsAssignModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to create assignment:', error);
    }
  };

  const endAssignment = async (id) => {
    if (!window.confirm('파견을 종료하시겠습니까?')) return;

    try {
      await fetch(`${API}/api/assignments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: '종료',
          end_date: new Date().toISOString().split('T')[0],
        }),
      });
      fetchData();
    } catch (error) {
      console.error('Failed to end assignment:', error);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
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
        <h1 className="page-title">파견관리</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} /> 사이트 등록
        </button>
      </div>

      {/* 파견 사이트 목록 */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">파견 사이트 ({sites.length})</h2>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>고객사</th>
                <th>담당자</th>
                <th>계약기간</th>
                <th>계약형태</th>
                <th>파견인원</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((site) => (
                <tr key={site.id}>
                  <td>
                    <strong>{site.name}</strong>
                    <br />
                    <small style={{ color: '#999' }}>{site.address}</small>
                  </td>
                  <td>
                    {site.contact_person || '-'}
                    <br />
                    <small style={{ color: '#999' }}>{site.contact_phone}</small>
                  </td>
                  <td>
                    {site.contract_start?.split('T')[0]} ~<br />
                    {site.contract_end?.split('T')[0]}
                  </td>
                  <td>{site.contract_type || '-'}</td>
                  <td>
                    <span className="badge badge-info">{site.employee_count || 0}명</span>
                  </td>
                  <td>
                    <span className={`badge ${site.status === '진행중' ? 'badge-success' : 'badge-danger'}`}>
                      {site.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-sm btn-success" onClick={() => openAssignModal(site.id)} title="인원 배정">
                        <Users size={14} />
                      </button>
                      <button className="btn btn-sm btn-secondary" onClick={() => openEditModal(site)}>
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => deleteSite(site.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sites.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                    등록된 사이트가 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 현재 파견 현황 */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">현재 파견 현황</h2>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>인력</th>
                <th>파견 사이트</th>
                <th>파견 기간</th>
                <th>월 단가</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assign) => (
                <tr key={assign.id}>
                  <td>
                    <strong>{assign.employee_name}</strong>
                    <br />
                    <small style={{ color: '#999' }}>{assign.applied_part} / {assign.position}</small>
                  </td>
                  <td>{assign.site_name}</td>
                  <td>
                    {assign.start_date?.split('T')[0]} ~<br />
                    {assign.end_date?.split('T')[0] || '미정'}
                  </td>
                  <td>{formatCurrency(assign.monthly_rate)}</td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => endAssignment(assign.id)}>
                      파견 종료
                    </button>
                  </td>
                </tr>
              ))}
              {assignments.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                    현재 파견중인 인력이 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 파견 기록 */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">파견 기록 ({assignmentHistory.length})</h2>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>인력</th>
                <th>파견 사이트</th>
                <th>파견 기간</th>
                <th>월 단가</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {assignmentHistory.map((assign) => (
                <tr key={assign.id} style={{ opacity: 0.7 }}>
                  <td>
                    <strong>{assign.employee_name}</strong>
                    <br />
                    <small style={{ color: '#999' }}>{assign.applied_part} / {assign.position}</small>
                  </td>
                  <td>{assign.site_name}</td>
                  <td>
                    {assign.start_date?.split('T')[0]} ~<br />
                    {assign.end_date?.split('T')[0] || '-'}
                  </td>
                  <td>{formatCurrency(assign.monthly_rate)}</td>
                  <td>
                    <span className="badge badge-secondary">종료</span>
                  </td>
                </tr>
              ))}
              {assignmentHistory.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                    파견 기록이 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 사이트 등록/수정 모달 */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                <Building2 size={20} style={{ marginRight: '8px' }} />
                {editingSite ? '사이트 수정' : '사이트 등록'}
              </h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">고객사명 *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={siteForm.name}
                    onChange={(e) => setSiteForm({ ...siteForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">계약형태</label>
                  <select
                    className="form-control"
                    value={siteForm.contract_type}
                    onChange={(e) => setSiteForm({ ...siteForm, contract_type: e.target.value })}
                  >
                    <option value="파견">파견</option>
                    <option value="도급">도급</option>
                    <option value="프리랜서">프리랜서</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">주소</label>
                <input
                  type="text"
                  className="form-control"
                  value={siteForm.address}
                  onChange={(e) => setSiteForm({ ...siteForm, address: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">담당자</label>
                  <input
                    type="text"
                    className="form-control"
                    value={siteForm.contact_person}
                    onChange={(e) => setSiteForm({ ...siteForm, contact_person: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">연락처</label>
                  <input
                    type="text"
                    className="form-control"
                    value={siteForm.contact_phone}
                    onChange={(e) => setSiteForm({ ...siteForm, contact_phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">계약 시작일</label>
                  <input
                    type="date"
                    className="form-control"
                    value={siteForm.contract_start}
                    onChange={(e) => setSiteForm({ ...siteForm, contract_start: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">계약 종료일</label>
                  <input
                    type="date"
                    className="form-control"
                    value={siteForm.contract_end}
                    onChange={(e) => setSiteForm({ ...siteForm, contract_end: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">계약금액</label>
                  <input
                    type="number"
                    className="form-control"
                    value={siteForm.contract_amount}
                    onChange={(e) => setSiteForm({ ...siteForm, contract_amount: e.target.value })}
                    placeholder="원"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">상태</label>
                  <select
                    className="form-control"
                    value={siteForm.status}
                    onChange={(e) => setSiteForm({ ...siteForm, status: e.target.value })}
                  >
                    <option value="진행중">진행중</option>
                    <option value="종료">종료</option>
                    <option value="대기">대기</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                취소
              </button>
              <button className="btn btn-primary" onClick={saveSite}>
                {editingSite ? '수정' : '등록'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 인원 배정 모달 */}
      {isAssignModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAssignModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <Calendar size={20} style={{ marginRight: '8px' }} />
                파견 배정
              </h3>
              <button className="modal-close" onClick={() => setIsAssignModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">파견 인력 *</label>
                <select
                  className="form-control"
                  value={newAssignment.employee_id}
                  onChange={(e) => setNewAssignment({ ...newAssignment, employee_id: e.target.value })}
                >
                  <option value="">선택하세요</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.applied_part || '미지정'} / {emp.position || '미지정'})
                    </option>
                  ))}
                </select>
                {employees.length === 0 && (
                  <small style={{ color: '#dc3545' }}>대기 상태의 인력이 없습니다</small>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">파견 시작일</label>
                  <input
                    type="date"
                    className="form-control"
                    value={newAssignment.start_date}
                    onChange={(e) => setNewAssignment({ ...newAssignment, start_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">파견 종료일</label>
                  <input
                    type="date"
                    className="form-control"
                    value={newAssignment.end_date}
                    onChange={(e) => setNewAssignment({ ...newAssignment, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">월 단가</label>
                <input
                  type="number"
                  className="form-control"
                  value={newAssignment.monthly_rate}
                  onChange={(e) => setNewAssignment({ ...newAssignment, monthly_rate: e.target.value })}
                  placeholder="원"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsAssignModalOpen(false)}>
                취소
              </button>
              <button
                className="btn btn-primary"
                onClick={createAssignment}
                disabled={!newAssignment.employee_id}
              >
                배정
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteManagement;
