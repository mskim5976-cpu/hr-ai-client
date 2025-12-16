import React, { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Edit2, Trash2, X } from 'lucide-react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';

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

      // 기존 스킬 파싱하여 selectedSkills 설정
      if (data.skills) {
        const skillNames = data.skills.split(',').map(s => s.trim());
        const empSkills = skills
          .filter(s => skillNames.includes(s.name))
          .map(s => ({ id: s.id, level: '중급' }));
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
      await fetch(`${API}/api/employees/${selectedEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...selectedEmployee,
          skills: selectedSkills
        }),
      });
      setIsModalOpen(false);
      fetchEmployees();
    } catch (error) {
      console.error('Failed to update employee:', error);
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
      '재직': 'badge-primary',
      '퇴사': 'badge-danger',
    };
    return badges[status] || 'badge-primary';
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">인사현황</h1>
      </div>

      {/* 검색 및 필터 */}
      <div className="card">
        <form onSubmit={handleSearch} className="search-bar">
          <div className="search-input" style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
              type="text"
              className="form-control"
              placeholder="이름, 이메일, 연락처로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <button type="submit" className="btn btn-primary">검색</button>
        </form>

        <div className="filter-group">
          <button
            className={`filter-btn ${statusFilter === '' ? 'active' : ''}`}
            onClick={() => setStatusFilter('')}
          >
            전체
          </button>
          <button
            className={`filter-btn ${statusFilter === '파견중' ? 'active' : ''}`}
            onClick={() => setStatusFilter('파견중')}
          >
            파견중
          </button>
          <button
            className={`filter-btn ${statusFilter === '대기' ? 'active' : ''}`}
            onClick={() => setStatusFilter('대기')}
          >
            대기
          </button>
          <button
            className={`filter-btn ${statusFilter === '재직' ? 'active' : ''}`}
            onClick={() => setStatusFilter('재직')}
          >
            재직
          </button>
          <button
            className={`filter-btn ${statusFilter === '퇴사' ? 'active' : ''}`}
            onClick={() => setStatusFilter('퇴사')}
          >
            퇴사
          </button>
        </div>
      </div>

      {/* 직원 목록 */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">인력 목록</h2>
          <span style={{ color: '#666' }}>총 {employees.length}명</span>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : (
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
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td><strong>{emp.name}</strong></td>
                    <td>{emp.phone || '-'}</td>
                    <td>{emp.email || '-'}</td>
                    <td>{emp.applied_part || '-'}</td>
                    <td>{emp.position || '-'}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(emp.status)}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-sm btn-secondary" onClick={() => viewEmployee(emp.id)}>
                          <Eye size={14} />
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => deleteEmployee(emp.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                      등록된 인력이 없습니다
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 상세/수정 모달 */}
      {isModalOpen && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
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
                <div className="form-group">
                  <label className="form-label">이름</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedEmployee.name || ''}
                    onChange={(e) => setSelectedEmployee({ ...selectedEmployee, name: e.target.value })}
                    disabled={!isEditMode}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">연락처</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedEmployee.phone || ''}
                    onChange={(e) => setSelectedEmployee({ ...selectedEmployee, phone: e.target.value })}
                    disabled={!isEditMode}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">이메일</label>
                <input
                  type="email"
                  className="form-control"
                  value={selectedEmployee.email || ''}
                  onChange={(e) => setSelectedEmployee({ ...selectedEmployee, email: e.target.value })}
                  disabled={!isEditMode}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">나이</label>
                  <input
                    type="number"
                    className="form-control"
                    value={selectedEmployee.age || ''}
                    onChange={(e) => setSelectedEmployee({ ...selectedEmployee, age: e.target.value })}
                    disabled={!isEditMode}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">지원파트</label>
                  <select
                    className="form-control"
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

              <div className="form-group">
                <label className="form-label">주소</label>
                <input
                  type="text"
                  className="form-control"
                  value={selectedEmployee.address || ''}
                  onChange={(e) => setSelectedEmployee({ ...selectedEmployee, address: e.target.value })}
                  disabled={!isEditMode}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">직급</label>
                  <select
                    className="form-control"
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
                <div className="form-group">
                  <label className="form-label">상태</label>
                  <select
                    className="form-control"
                    value={selectedEmployee.status || ''}
                    onChange={(e) => setSelectedEmployee({ ...selectedEmployee, status: e.target.value })}
                    disabled={!isEditMode}
                  >
                    <option value="대기">대기</option>
                    <option value="파견중">파견중</option>
                    <option value="재직">재직</option>
                    <option value="퇴사">퇴사</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">기술역량</label>
                {isEditMode ? (
                  <div>
                    {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                      <div key={category} style={{ marginBottom: '12px' }}>
                        <small style={{ color: '#666', fontWeight: 'bold' }}>{category}</small>
                        <div className="checkbox-group" style={{ marginTop: '6px' }}>
                          {categorySkills.map((skill) => {
                            const isSelected = selectedSkills.find(s => s.id === skill.id);
                            return (
                              <div
                                key={skill.id}
                                className={`checkbox-item ${isSelected ? 'selected' : ''}`}
                                onClick={() => toggleSkill(skill.id)}
                              >
                                {skill.name}
                                {isSelected && (
                                  <select
                                    value={isSelected.level}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => updateSkillLevel(skill.id, e.target.value)}
                                    style={{
                                      marginLeft: '8px',
                                      padding: '2px 6px',
                                      fontSize: '12px',
                                      border: '1px solid rgba(255,255,255,0.3)',
                                      background: 'white',
                                      color: '#333',
                                      borderRadius: '4px',
                                      cursor: 'pointer'
                                    }}
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
                  <div className="skill-tags">
                    {selectedEmployee.skills ? (
                      selectedEmployee.skills.split(',').map((skill, idx) => (
                        <span key={idx} className="skill-tag">{skill.trim()}</span>
                      ))
                    ) : (
                      <span style={{ color: '#999' }}>등록된 기술역량이 없습니다</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              {isEditMode ? (
                <>
                  <button className="btn btn-secondary" onClick={() => setIsEditMode(false)}>
                    취소
                  </button>
                  <button className="btn btn-primary" onClick={updateEmployee}>
                    저장
                  </button>
                </>
              ) : (
                <button className="btn btn-primary" onClick={() => setIsEditMode(true)}>
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
