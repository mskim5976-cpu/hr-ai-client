import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Check, User, Phone, Mail, Calendar, MapPin, Briefcase, Award } from 'lucide-react';

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
        <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>새로운 IT 인력을 등록하세요</p>
      </div>

      {success && (
        <div className="success-message card-enter" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 20px',
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: 12,
          marginBottom: 24,
          animation: 'success-slide 0.5s ease-out'
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Check size={20} color="#fff" />
          </div>
          <div>
            <strong style={{ color: 'var(--success)' }}>등록 완료</strong>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>인력이 성공적으로 등록되었습니다!</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* 기본 정보 */}
        <div className="bento-card card-enter stagger-1" style={{ marginBottom: 20 }}>
          <div className="bento-card-header">
            <div className="bento-card-icon">
              <User size={20} />
            </div>
            <h2 className="bento-card-title">기본 정보</h2>
          </div>

          <div className="form-row">
            <div className="form-group-modern">
              <label className="form-label">
                <User size={14} style={{ marginRight: 6 }} />
                이름 *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-control-modern"
                placeholder="이름을 입력하세요"
                required
              />
            </div>

            <div className="form-group-modern">
              <label className="form-label">
                <Phone size={14} style={{ marginRight: 6 }} />
                연락처
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-control-modern"
                placeholder="010-0000-0000"
              />
            </div>

            <div className="form-group-modern">
              <label className="form-label">
                <Mail size={14} style={{ marginRight: 6 }} />
                이메일
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control-modern"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group-modern">
              <label className="form-label">나이</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="form-control-modern"
                placeholder="나이"
              />
            </div>

            <div className="form-group-modern">
              <label className="form-label">
                <Calendar size={14} style={{ marginRight: 6 }} />
                생년월일
              </label>
              <input
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                className="form-control-modern"
              />
            </div>

            <div className="form-group-modern">
              <label className="form-label">
                <Calendar size={14} style={{ marginRight: 6 }} />
                입사일
              </label>
              <input
                type="date"
                name="hire_date"
                value={formData.hire_date}
                onChange={handleChange}
                className="form-control-modern"
              />
            </div>
          </div>

          <div className="form-group-modern">
            <label className="form-label">
              <MapPin size={14} style={{ marginRight: 6 }} />
              주소
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="form-control-modern"
              placeholder="주소를 입력하세요"
            />
          </div>
        </div>

        {/* 직무 정보 */}
        <div className="bento-card card-enter stagger-2" style={{ marginBottom: 20 }}>
          <div className="bento-card-header">
            <div className="bento-card-icon info">
              <Briefcase size={20} />
            </div>
            <h2 className="bento-card-title">직무 정보</h2>
          </div>

          <div className="form-row">
            <div className="form-group-modern">
              <label className="form-label">지원파트</label>
              <select
                name="applied_part"
                value={formData.applied_part}
                onChange={handleChange}
                className="form-control-modern"
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

            <div className="form-group-modern">
              <label className="form-label">직급</label>
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="form-control-modern"
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

        {/* 기술역량 */}
        <div className="bento-card card-enter stagger-3" style={{ marginBottom: 20 }}>
          <div className="bento-card-header">
            <div className="bento-card-icon success">
              <Award size={20} />
            </div>
            <h2 className="bento-card-title">기술역량</h2>
            {selectedSkills.length > 0 && (
              <span className="badge-modern badge-success" style={{ marginLeft: 'auto' }}>
                {selectedSkills.length}개 선택
              </span>
            )}
          </div>

          {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
            <div key={category} style={{ marginBottom: '24px' }}>
              <h4 style={{
                marginBottom: '12px',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: 'var(--primary)'
                }}></span>
                {category}
              </h4>
              <div className="checkbox-group-modern">
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

        {/* 버튼 */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-secondary btn-hover-lift"
            onClick={() => {
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
            }}
          >
            초기화
          </button>
          <button type="submit" className="btn btn-primary btn-hover-lift" disabled={loading}>
            <UserPlus size={18} />
            {loading ? '등록 중...' : '인력 등록'}
          </button>
        </div>
      </form>

      <style>{`
        @keyframes success-slide {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default EmployeeRegister;
