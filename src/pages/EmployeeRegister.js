import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Check } from 'lucide-react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const EmployeeRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    age: '',
    birth_date: '',
    address: '',
    applied_part: '',
    position: '',
    hire_date: '',
  });
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
    fetchSkills();
  }, [fetchSkills]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('이름은 필수입니다.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          skills: selectedSkills
        }),
      });

      const data = await res.json();
      if (data.id) {
        setSuccess(true);
        setFormData({
          name: '',
          phone: '',
          email: '',
          age: '',
          birth_date: '',
          address: '',
          applied_part: '',
          position: '',
          hire_date: '',
        });
        setSelectedSkills([]);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert(data.message || '등록 실패');
      }
    } catch (error) {
      alert('등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 스킬을 카테고리별로 그룹화
  const skillsByCategory = skills.reduce((acc, skill) => {
    const category = skill.category || '기타';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">인사등록</h1>
      </div>

      {success && (
        <div className="alert-card" style={{ background: 'rgba(40, 167, 69, 0.1)', borderLeftColor: '#28a745', marginBottom: '24px' }}>
          <Check size={20} color="#28a745" />
          <span>인력이 성공적으로 등록되었습니다!</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">기본 정보</h2>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">이름 *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-control"
                placeholder="이름을 입력하세요"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">연락처</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-control"
                placeholder="010-0000-0000"
              />
            </div>

            <div className="form-group">
              <label className="form-label">이메일</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">나이</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="form-control"
                placeholder="나이"
              />
            </div>

            <div className="form-group">
              <label className="form-label">생년월일</label>
              <input
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">입사일</label>
              <input
                type="date"
                name="hire_date"
                value={formData.hire_date}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">주소</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="form-control"
              placeholder="주소를 입력하세요"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">지원파트</label>
              <select
                name="applied_part"
                value={formData.applied_part}
                onChange={handleChange}
                className="form-control"
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

            <div className="form-group">
              <label className="form-label">직급</label>
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="form-control"
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
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">기술역량</h2>
          </div>

          {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
            <div key={category} style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '12px', color: '#666', fontSize: '14px' }}>{category}</h4>
              <div className="checkbox-group">
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
                            padding: '2px 4px',
                            fontSize: '12px',
                            border: 'none',
                            background: 'rgba(255,255,255,0.2)',
                            color: 'inherit',
                            borderRadius: '4px'
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

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => {
            setFormData({
              name: '',
              phone: '',
              email: '',
              age: '',
              birth_date: '',
              address: '',
              applied_part: '',
              position: '',
              hire_date: '',
            });
            setSelectedSkills([]);
          }}>
            초기화
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <UserPlus size={18} />
            {loading ? '등록 중...' : '인력 등록'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeRegister;
