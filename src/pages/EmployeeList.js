import React, { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Edit2, Trash2, X, Users, Filter } from 'lucide-react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';

// Skeleton 컴포넌트
const SkeletonRow = () => (
  <tr>
    <td><div className="skeleton" style={{ width: '60%', height: 16, borderRadius: 4 }} /></td>
    <td><div className="skeleton" style={{ width: '80%', height: 16, borderRadius: 4 }} /></td>
    <td><div className="skeleton" style={{ width: '70%', height: 16, borderRadius: 4 }} /></td>
    <td><div className="skeleton" style={{ width: '50%', height: 16, borderRadius: 4 }} /></td>
    <td><div className="skeleton" style={{ width: '40%', height: 16, borderRadius: 4 }} /></td>
    <td><div className="skeleton" style={{ width: 60, height: 24, borderRadius: 12 }} /></td>
    <td><div className="skeleton" style={{ width: 60, height: 28, borderRadius: 6 }} /></td>
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

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${API}/api/employees?`;
      if (statusFilter) url += `status=${statusFilter}&`;
      if (searchTerm) url += `search=${searchTerm}`;

      const res = await fetch(url);
      const data = await res.json();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  const fetchSkills = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/skills`);
      const data = await res.json();
      setSkills(data);
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
    fetchSkills();
  }, [fetchEmployees, fetchSkills]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEmployees();
  };

  const viewEmployee = async (id) => {
    try {
      const res = await fetch(`${API}/api/employees/${id}`);
      const data = await res.json();
      setSelectedEmployee(data);

      // 기존 스킬 파싱하여 selectedSkills 설정 (형식: "Node.js:중급,JavaScript:고급")
      if (data.skills) {
        const skillParts = data.skills.split(',').map(s => {
          const [name, level] = s.trim().split(':');
          return { name: name.trim(), level: level?.trim() || '중급' };
        });
        const empSkills = skillParts
          .map(sp => {
            const skill = skills.find(s => s.name === sp.name);
            return skill ? { id: skill.id, level: sp.level } : null;
          })
          .filter(Boolean);
        setSelectedSkills(empSkills);
      } else {
        setSelectedSkills([]);
      }

      setIsEditMode(false);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch employee:', error);
    }
  };

  const deleteEmployee = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await fetch(`${API}/api/employees/${id}`, { method: 'DELETE' });
      fetchEmployees();
    } catch (error) {
      console.error('Failed to delete employee:', error);
    }
  };

  const updateEmployee = async () => {
    try {
      // 상태(status), skills(문자열), department(조인 필드), id 등 불필요한 필드 제외
      const { status, skills: skillsStr, department, id, department_id, ...employeeData } = selectedEmployee;

      // 날짜 필드를 YYYY-MM-DD 형식으로 변환
      const formatDate = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
      };

      const updateData = {
        name: employeeData.name,
        phone: employeeData.phone,
        email: employeeData.email,
        age: employeeData.age,
        address: employeeData.address,
        applied_part: employeeData.applied_part,
        position: employeeData.position,
        hire_date: formatDate(employeeData.hire_date),
        birth_date: formatDate(employeeData.birth_date),
        status: selectedEmployee.status,  // 재직/퇴사 상태 변경 가능
        skills: selectedSkills
      };

      const res = await fetch(`${API}/api/employees/${selectedEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        alert('수정이 완료되었습니다.');
        setIsModalOpen(false);
        fetchEmployees();
      } else {
        const data = await res.json();
        alert(data.message || '수정 실패');
      }
    } catch (error) {
      console.error('Failed to update employee:', error);
      alert('수정 중 오류가 발생했습니다.');
    }
  };

  const toggleSkill = (skillId) => {
    setSelectedSkills(prev => {
      if (prev.find(s => s.id === skillId)) {
        return prev.filter(s => s.id !== skillId);
      } else {
        return [...prev, { id: skillId, level: '중급' }];
      }
    });
  };

  const updateSkillLevel = (skillId, level) => {
    setSelectedSkills(prev =>
      prev.map(s => s.id === skillId ? { ...s, level } : s)
    );
  };

  // 스킬을 카테고리별로 그룹화
  const skillsByCategory = skills.reduce((acc, skill) => {
    const category = skill.category || '기타';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {});

  const getStatusBadge = (status) => {
    const badges = {
      '파견중': 'badge-success',
      '대기': 'badge-warning',
      '재직': 'badge-purple',
      '퇴사': 'badge-danger',
    };
    return badges[status] || 'badge-purple';
  };

  const filterButtons = [
    { label: '전체', value: '', color: '#3B82F6' },
    { label: '파견중', value: '파견중', color: '#22C55E' },
    { label: '대기', value: '대기', color: '#F59E0B' },
    { label: '재직', value: '재직', color: '#8B5CF6' },
    { label: '퇴사', value: '퇴사', color: '#EF4444' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">인사현황</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>IT 인력 현황을 조회하고 관리하세요</p>
      </div>

      {/* 검색 및 필터 - Bento Card 스타일 */}
      <div className="bento-card card-enter stagger-1" style={{ marginBottom: 20 }}>
        <form onSubmit={handleSearch} className="search-bar-modern">
          <div className="search-input-modern">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="form-control-modern"
              placeholder="이름, 이메일, 연락처로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-hover-lift">검색</button>
        </form>

        <div className="filter-group-modern">
          <div className="filter-label">
            <Filter size={14} />
            <span>상태 필터</span>
          </div>
          <div className="filter-buttons">
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                className={`filter-btn-modern ${statusFilter === btn.value ? 'active' : ''}`}
                onClick={() => setStatusFilter(btn.value)}
                style={statusFilter === btn.value ? {
                  background: btn.color,
                  borderColor: btn.color,
                  color: '#fff',
                  boxShadow: `0 4px 12px ${btn.color}40`
                } : {}}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 직원 목록 - Bento Card 스타일 */}
      <div className="bento-card card-enter stagger-2">
        <div className="bento-card-header">
          <div className="bento-card-icon">
            <Users size={20} />
          </div>
          <h2 className="bento-card-title">인력 목록</h2>
          <span className="badge-modern badge-primary" style={{ marginLeft: 'auto' }}>
            총 {employees.length}명
          </span>
        </div>

        {loading ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>이름</th>
                  <th>연락처</th>
                  <th>이메일</th>
                  <th>지원파트</th>
                  <th>직급</th>
                  <th>상태</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
              </tbody>
            </table>
          </div>
        ) : employees.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>이름</th>
                  <th>연락처</th>
                  <th>이메일</th>
                  <th>지원파트</th>
                  <th>직급</th>
                  <th>상태</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, index) => (
                  <tr key={emp.id} className="table-row-hover" style={{ animationDelay: `${index * 0.03}s` }}>
                    <td><strong>{emp.name}</strong></td>
                    <td>{emp.phone || '-'}</td>
                    <td>{emp.email || '-'}</td>
                    <td>{emp.applied_part || '-'}</td>
                    <td>{emp.position || '-'}</td>
                    <td>
                      <span className={`badge-modern badge-with-dot ${getStatusBadge(emp.status)}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-secondary btn-hover-lift"
                          onClick={() => viewEmployee(emp.id)}
                          title="상세보기"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-danger btn-hover-lift"
                          onClick={() => deleteEmployee(emp.id)}
                          title="삭제"
                        >
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
            icon={Users}
            title="등록된 인력이 없습니다"
            description="새로운 인력을 등록하거나 검색 조건을 변경해보세요"
          />
        )}
      </div>

      {/* 상세/수정 모달 - Modern 스타일 */}
      {isModalOpen && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-modern" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {isEditMode ? '인력 정보 수정' : '인력 상세 정보'}
              </h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-row">
                <div className="form-group-modern">
                  <label className="form-label">이름</label>
                  <input
                    type="text"
                    className="form-control-modern"
                    value={selectedEmployee.name || ''}
                    onChange={(e) => setSelectedEmployee({ ...selectedEmployee, name: e.target.value })}
                    disabled={!isEditMode}
                  />
                </div>
                <div className="form-group-modern">
                  <label className="form-label">연락처</label>
                  <input
                    type="text"
                    className="form-control-modern"
                    value={selectedEmployee.phone || ''}
                    onChange={(e) => setSelectedEmployee({ ...selectedEmployee, phone: e.target.value })}
                    disabled={!isEditMode}
                  />
                </div>
              </div>

              <div className="form-group-modern">
                <label className="form-label">이메일</label>
                <input
                  type="email"
                  className="form-control-modern"
                  value={selectedEmployee.email || ''}
                  onChange={(e) => setSelectedEmployee({ ...selectedEmployee, email: e.target.value })}
                  disabled={!isEditMode}
                />
              </div>

              <div className="form-row">
                <div className="form-group-modern">
                  <label className="form-label">나이</label>
                  <input
                    type="number"
                    className="form-control-modern"
                    value={selectedEmployee.age || ''}
                    onChange={(e) => setSelectedEmployee({ ...selectedEmployee, age: e.target.value })}
                    disabled={!isEditMode}
                  />
                </div>
                <div className="form-group-modern">
                  <label className="form-label">지원파트</label>
                  <select
                    className="form-control-modern"
                    value={selectedEmployee.applied_part || ''}
                    onChange={(e) => setSelectedEmployee({ ...selectedEmployee, applied_part: e.target.value })}
                    disabled={!isEditMode}
                  >
                    <option value="">선택하세요</option>
                    <option value="Backend">Backend</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Fullstack">Fullstack</option>
                    <option value="DevOps">DevOps</option>
                    <option value="DBA">DBA</option>
                    <option value="QA">QA</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              <div className="form-group-modern">
                <label className="form-label">주소</label>
                <input
                  type="text"
                  className="form-control-modern"
                  value={selectedEmployee.address || ''}
                  onChange={(e) => setSelectedEmployee({ ...selectedEmployee, address: e.target.value })}
                  disabled={!isEditMode}
                />
              </div>

              <div className="form-row">
                <div className="form-group-modern">
                  <label className="form-label">직급</label>
                  <select
                    className="form-control-modern"
                    value={selectedEmployee.position || ''}
                    onChange={(e) => setSelectedEmployee({ ...selectedEmployee, position: e.target.value })}
                    disabled={!isEditMode}
                  >
                    <option value="">선택하세요</option>
                    <option value="인턴">인턴</option>
                    <option value="사원">사원</option>
                    <option value="주임">주임</option>
                    <option value="대리">대리</option>
                    <option value="과장">과장</option>
                    <option value="차장">차장</option>
                    <option value="부장">부장</option>
                  </select>
                </div>
                <div className="form-group-modern">
                  <label className="form-label">상태 <small style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(파견중 → 다른 상태 변경 시 파견 자동 종료)</small></label>
                  <select
                    className="form-control-modern"
                    value={selectedEmployee.status || ''}
                    onChange={(e) => setSelectedEmployee({ ...selectedEmployee, status: e.target.value })}
                    disabled={!isEditMode}
                  >
                    {/* 현재 상태가 파견중이면 표시만 (선택 불가) */}
                    {selectedEmployee.status === '파견중' && (
                      <option value="파견중" disabled>파견중 (아래에서 변경)</option>
                    )}
                    <option value="대기">대기</option>
                    <option value="재직">재직</option>
                    <option value="퇴사">퇴사</option>
                  </select>
                </div>
              </div>

              <div className="form-group-modern">
                <label className="form-label">기술역량</label>
                {isEditMode ? (
                  <div>
                    {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                      <div key={category} style={{ marginBottom: '16px' }}>
                        <small style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{category}</small>
                        <div className="checkbox-group-modern" style={{ marginTop: '8px' }}>
                          {categorySkills.map((skill) => {
                            const isSelected = selectedSkills.find(s => s.id === skill.id);
                            return (
                              <div
                                key={skill.id}
                                className={`checkbox-item-modern ${isSelected ? 'selected' : ''}`}
                                onClick={() => toggleSkill(skill.id)}
                              >
                                {skill.name}
                                {isSelected && (
                                  <select
                                    value={isSelected.level}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => updateSkillLevel(skill.id, e.target.value)}
                                    className="skill-level-select"
                                  >
                                    <option value="초급">초급</option>
                                    <option value="중급">중급</option>
                                    <option value="고급">고급</option>
                                  </select>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="skill-tags-modern">
                    {selectedEmployee.skills ? (
                      selectedEmployee.skills.split(',').map((skill, idx) => (
                        <span key={idx} className="skill-tag-modern">{skill.trim()}</span>
                      ))
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>등록된 기술역량이 없습니다</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              {isEditMode ? (
                <>
                  <button className="btn btn-secondary btn-hover-lift" onClick={() => setIsEditMode(false)}>
                    취소
                  </button>
                  <button className="btn btn-primary btn-hover-lift" onClick={updateEmployee}>
                    저장
                  </button>
                </>
              ) : (
                <button className="btn btn-primary btn-hover-lift" onClick={() => setIsEditMode(true)}>
                  <Edit2 size={16} /> 수정
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
