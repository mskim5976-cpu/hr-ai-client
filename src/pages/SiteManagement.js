import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Plus, Edit2, Trash2, X, Users, Calendar, Clock, MapPin } from 'lucide-react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';

// Skeleton 컴포넌트
const SkeletonRow = ({ cols = 7 }) => (
  <tr>
    {[...Array(cols)].map((_, i) => (
      <td key={i}><div className="skeleton" style={{ width: `${60 + Math.random() * 30}%`, height: 16, borderRadius: 4 }} /></td>
    ))}
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

  // Skeleton 로딩 UI
  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">파견관리</h1>
        </div>
        <div className="bento-card">
          <div className="bento-card-header">
            <div className="skeleton" style={{ width: 150, height: 24, borderRadius: 6 }} />
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
          <h1 className="page-title">파견관리</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>파견 사이트와 인력 배정을 관리하세요</p>
        </div>
        <button className="btn btn-primary btn-hover-lift" onClick={openAddModal}>
          <Plus size={18} /> 사이트 등록
        </button>
      </div>

      {/* 파견 사이트 목록 */}
      <div className="bento-card card-enter stagger-1" style={{ marginBottom: 20 }}>
        <div className="bento-card-header">
          <div className="bento-card-icon">
            <Building2 size={20} />
          </div>
          <h2 className="bento-card-title">파견 사이트</h2>
          <span className="badge-modern badge-primary" style={{ marginLeft: 'auto' }}>
            {sites.length}개
          </span>
        </div>

        {sites.length > 0 ? (
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
                {sites.map((site, index) => (
                  <tr key={site.id} className="table-row-hover" style={{ animationDelay: `${index * 0.03}s` }}>
                    <td>
                      <strong>{site.name}</strong>
                      <br />
                      <small style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <MapPin size={12} /> {site.address || '-'}
                      </small>
                    </td>
                    <td>
                      {site.contact_person || '-'}
                      <br />
                      <small style={{ color: 'var(--text-secondary)' }}>{site.contact_phone}</small>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={14} style={{ color: 'var(--text-secondary)' }} />
                        <span>
                          {site.contract_start?.split('T')[0]} ~<br />
                          {site.contract_end?.split('T')[0]}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge-modern badge-info">{site.contract_type || '-'}</span>
                    </td>
                    <td>
                      <span className="badge-modern badge-with-dot badge-primary">{site.employee_count || 0}명</span>
                    </td>
                    <td>
                      <span className={`badge-modern badge-with-dot ${site.status === '진행중' ? 'badge-success' : site.status === '종료' ? 'badge-danger' : 'badge-warning'}`}>
                        {site.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-sm btn-success btn-hover-lift" onClick={() => openAssignModal(site.id)} title="인원 배정">
                          <Users size={14} />
                        </button>
                        <button className="btn btn-sm btn-secondary btn-hover-lift" onClick={() => openEditModal(site)} title="수정">
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-sm btn-danger btn-hover-lift" onClick={() => deleteSite(site.id)} title="삭제">
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
            icon={Building2}
            title="등록된 사이트가 없습니다"
            description="상단의 '사이트 등록' 버튼을 클릭하여 새 사이트를 추가하세요"
          />
        )}
      </div>

      {/* 현재 파견 현황 */}
      <div className="bento-card card-enter stagger-2" style={{ marginBottom: 20 }}>
        <div className="bento-card-header">
          <div className="bento-card-icon success">
            <Users size={20} />
          </div>
          <h2 className="bento-card-title">현재 파견 현황</h2>
          <span className="badge-modern badge-success" style={{ marginLeft: 'auto' }}>
            {assignments.length}명 파견중
          </span>
        </div>

        {assignments.length > 0 ? (
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
                {assignments.map((assign, index) => (
                  <tr key={assign.id} className="table-row-hover" style={{ animationDelay: `${index * 0.03}s` }}>
                    <td>
                      <strong>{assign.employee_name}</strong>
                      <br />
                      <small style={{ color: 'var(--text-secondary)' }}>{assign.applied_part} / {assign.position}</small>
                    </td>
                    <td>
                      <span className="badge-modern badge-info">{assign.site_name}</span>
                    </td>
                    <td>
                      {assign.start_date?.split('T')[0]} ~<br />
                      {assign.end_date?.split('T')[0] || '미정'}
                    </td>
                    <td><strong>{formatCurrency(assign.monthly_rate)}</strong></td>
                    <td>
                      <button className="btn btn-sm btn-danger btn-hover-lift" onClick={() => endAssignment(assign.id)}>
                        파견 종료
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="파견중인 인력이 없습니다"
            description="사이트에서 '인원 배정' 버튼을 클릭하여 인력을 배정하세요"
          />
        )}
      </div>

      {/* 파견 기록 */}
      <div className="bento-card card-enter stagger-3">
        <div className="bento-card-header">
          <div className="bento-card-icon" style={{ opacity: 0.6 }}>
            <Calendar size={20} />
          </div>
          <h2 className="bento-card-title" style={{ opacity: 0.8 }}>파견 기록</h2>
          <span className="badge-modern" style={{ marginLeft: 'auto', background: 'var(--gray-200)', color: 'var(--text-secondary)' }}>
            {assignmentHistory.length}건
          </span>
        </div>

        {assignmentHistory.length > 0 ? (
          <div className="table-container" style={{ opacity: 0.8 }}>
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
                      <small style={{ color: 'var(--text-secondary)' }}>{assign.applied_part} / {assign.position}</small>
                    </td>
                    <td>{assign.site_name}</td>
                    <td>
                      {assign.start_date?.split('T')[0]} ~<br />
                      {assign.end_date?.split('T')[0] || '-'}
                    </td>
                    <td>{formatCurrency(assign.monthly_rate)}</td>
                    <td>
                      <span className="badge-modern" style={{ background: 'var(--gray-200)', color: 'var(--text-secondary)' }}>종료</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="파견 기록이 없습니다"
            description="종료된 파견 기록이 여기에 표시됩니다"
          />
        )}
      </div>

      {/* 사이트 등록/수정 모달 */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-modern" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
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
                <div className="form-group-modern">
                  <label className="form-label">고객사명 *</label>
                  <input
                    type="text"
                    className="form-control-modern"
                    value={siteForm.name}
                    onChange={(e) => setSiteForm({ ...siteForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group-modern">
                  <label className="form-label">계약형태</label>
                  <select
                    className="form-control-modern"
                    value={siteForm.contract_type}
                    onChange={(e) => setSiteForm({ ...siteForm, contract_type: e.target.value })}
                  >
                    <option value="파견">파견</option>
                    <option value="도급">도급</option>
                    <option value="프리랜서">프리랜서</option>
                  </select>
                </div>
              </div>

              <div className="form-group-modern">
                <label className="form-label">주소</label>
                <input
                  type="text"
                  className="form-control-modern"
                  value={siteForm.address}
                  onChange={(e) => setSiteForm({ ...siteForm, address: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group-modern">
                  <label className="form-label">담당자</label>
                  <input
                    type="text"
                    className="form-control-modern"
                    value={siteForm.contact_person}
                    onChange={(e) => setSiteForm({ ...siteForm, contact_person: e.target.value })}
                  />
                </div>
                <div className="form-group-modern">
                  <label className="form-label">연락처</label>
                  <input
                    type="text"
                    className="form-control-modern"
                    value={siteForm.contact_phone}
                    onChange={(e) => setSiteForm({ ...siteForm, contact_phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group-modern">
                  <label className="form-label">계약 시작일</label>
                  <input
                    type="date"
                    className="form-control-modern"
                    value={siteForm.contract_start}
                    onChange={(e) => setSiteForm({ ...siteForm, contract_start: e.target.value })}
                  />
                </div>
                <div className="form-group-modern">
                  <label className="form-label">계약 종료일</label>
                  <input
                    type="date"
                    className="form-control-modern"
                    value={siteForm.contract_end}
                    onChange={(e) => setSiteForm({ ...siteForm, contract_end: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group-modern">
                  <label className="form-label">계약금액</label>
                  <input
                    type="number"
                    className="form-control-modern"
                    value={siteForm.contract_amount}
                    onChange={(e) => setSiteForm({ ...siteForm, contract_amount: e.target.value })}
                    placeholder="원"
                  />
                </div>
                <div className="form-group-modern">
                  <label className="form-label">상태</label>
                  <select
                    className="form-control-modern"
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
              <button className="btn btn-secondary btn-hover-lift" onClick={() => setIsModalOpen(false)}>
                취소
              </button>
              <button className="btn btn-primary btn-hover-lift" onClick={saveSite}>
                {editingSite ? '수정' : '등록'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 인원 배정 모달 */}
      {isAssignModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAssignModalOpen(false)}>
          <div className="modal-modern" onClick={(e) => e.stopPropagation()}>
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
              <div className="form-group-modern">
                <label className="form-label">파견 인력 *</label>
                <select
                  className="form-control-modern"
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
                  <small style={{ color: 'var(--danger)', marginTop: 4, display: 'block' }}>대기 상태의 인력이 없습니다</small>
                )}
              </div>

              <div className="form-row">
                <div className="form-group-modern">
                  <label className="form-label">파견 시작일</label>
                  <input
                    type="date"
                    className="form-control-modern"
                    value={newAssignment.start_date}
                    onChange={(e) => setNewAssignment({ ...newAssignment, start_date: e.target.value })}
                  />
                </div>
                <div className="form-group-modern">
                  <label className="form-label">파견 종료일</label>
                  <input
                    type="date"
                    className="form-control-modern"
                    value={newAssignment.end_date}
                    onChange={(e) => setNewAssignment({ ...newAssignment, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group-modern">
                <label className="form-label">월 단가</label>
                <input
                  type="number"
                  className="form-control-modern"
                  value={newAssignment.monthly_rate}
                  onChange={(e) => setNewAssignment({ ...newAssignment, monthly_rate: e.target.value })}
                  placeholder="원"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary btn-hover-lift" onClick={() => setIsAssignModalOpen(false)}>
                취소
              </button>
              <button
                className="btn btn-primary btn-hover-lift"
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
