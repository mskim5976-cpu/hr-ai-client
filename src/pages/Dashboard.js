import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserCheck, Clock, Building2, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const COLORS = ['#1B3A6D', '#2E5090', '#4A90D9', '#5BA3E8', '#7BB8F0'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/dashboard/stats`);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const statusData = stats?.statusCounts ? [
    { name: '파견중', value: stats.statusCounts['파견중'] || 0 },
    { name: '대기', value: stats.statusCounts['대기'] || 0 },
    { name: '재직', value: stats.statusCounts['재직'] || 0 },
    { name: '퇴사', value: stats.statusCounts['퇴사'] || 0 },
  ].filter(item => item.value > 0) : [];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">대시보드</h1>
      </div>

      {/* 통계 카드 */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <Users size={28} />
          </div>
          <div className="stat-content">
            <h3>{stats?.total || 0}</h3>
            <p>전체 인원</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <UserCheck size={28} />
          </div>
          <div className="stat-content">
            <h3>{stats?.statusCounts?.['파견중'] || 0}</h3>
            <p>파견중</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <Clock size={28} />
          </div>
          <div className="stat-content">
            <h3>{stats?.statusCounts?.['대기'] || 0}</h3>
            <p>대기</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon info">
            <Building2 size={28} />
          </div>
          <div className="stat-content">
            <h3>{stats?.siteStats?.length || 0}</h3>
            <p>파견 사이트</p>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* 파견 사이트별 인원 차트 */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">파견 사이트별 인원</h2>
          </div>
          <div className="chart-container">
            {stats?.siteStats && stats.siteStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.siteStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="site_name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="employee_count" fill="#1B3A6D" name="인원 수" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="loading">
                <p style={{ color: '#999' }}>파견 데이터가 없습니다</p>
              </div>
            )}
          </div>
        </div>

        {/* 인원 상태 분포 */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">인원 상태 분포</h2>
          </div>
          <div className="chart-container">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="loading">
                <p style={{ color: '#999' }}>인원 데이터가 없습니다</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* 최근 등록 인력 */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">최근 등록 인력</h2>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>이름</th>
                  <th>지원파트</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentEmployees?.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.name}</td>
                    <td>{emp.applied_part || '-'}</td>
                    <td>
                      <span className={`badge ${
                        emp.status === '파견중' ? 'badge-success' :
                        emp.status === '대기' ? 'badge-warning' :
                        emp.status === '퇴사' ? 'badge-danger' : 'badge-primary'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!stats?.recentEmployees || stats.recentEmployees.length === 0) && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: '#999' }}>
                      등록된 인력이 없습니다
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 계약 만료 예정 */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">계약 만료 예정 (30일 이내)</h2>
          </div>
          {stats?.expiringContracts?.length > 0 ? (
            stats.expiringContracts.map((contract, idx) => (
              <div key={idx} className={`alert-card ${contract.days_left <= 7 ? 'alert-danger' : 'alert-warning'}`}>
                <AlertTriangle size={20} />
                <div>
                  <strong>{contract.name}</strong>
                  <p style={{ fontSize: '13px', marginTop: '4px' }}>
                    만료일: {contract.contract_end} ({contract.days_left}일 남음)
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#999', textAlign: 'center', padding: '40px' }}>
              30일 이내 만료 예정 계약이 없습니다
            </p>
          )}
        </div>
      </div>

      {/* 파견 만료 예정 인력 */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">파견 만료 예정 인력 (30일 이내)</h2>
        </div>
        {stats?.expiringAssignments?.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>인력</th>
                  <th>파견 사이트</th>
                  <th>만료일</th>
                  <th>남은 기간</th>
                </tr>
              </thead>
              <tbody>
                {stats.expiringAssignments.map((assign) => (
                  <tr key={assign.id}>
                    <td>
                      <strong>{assign.employee_name}</strong>
                      <br />
                      <small style={{ color: '#999' }}>{assign.applied_part || '-'}</small>
                    </td>
                    <td>{assign.site_name}</td>
                    <td>{assign.end_date?.split('T')[0]}</td>
                    <td>
                      <span className={`badge ${assign.days_left <= 7 ? 'badge-danger' : 'badge-warning'}`}>
                        {assign.days_left}일 남음
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#999', textAlign: 'center', padding: '40px' }}>
            30일 이내 파견 만료 예정 인력이 없습니다
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
