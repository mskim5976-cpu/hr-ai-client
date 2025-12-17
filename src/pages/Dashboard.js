import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserCheck, Clock, Building2, AlertTriangle, TrendingUp, TrendingDown, BarChart3, PieChartIcon, UserPlus, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';

// 상태별 색상 (badge 색상과 동일)
const STATUS_COLORS = {
  '파견중': '#22C55E',
  '대기': '#F59E0B',
  '재직': '#3B82F6',
  '퇴사': '#EF4444',
};

// 사이트 이름으로 색상 가져오기
const getSiteColor = (siteName) => {
  if (!siteName) return '#3B82F6';
  const name = siteName.toUpperCase();
  if (name.includes('삼성') || name.includes('SAMSUNG') || name.includes('SDS')) return '#3B82F6';
  if (name.includes('LG') || name.includes('CNS')) return '#DB2777';
  if (name.includes('SK')) return '#EF4444';
  return '#6366F1';
};

// Skeleton 컴포넌트들
const SkeletonStat = () => (
  <div className="stat-card-enhanced">
    <div className="stat-header">
      <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 12 }} />
    </div>
    <div className="skeleton skeleton-title" style={{ width: '40%', marginTop: 16 }} />
    <div className="skeleton skeleton-text short" style={{ marginTop: 8 }} />
  </div>
);

const SkeletonChart = () => (
  <div className="bento-card">
    <div className="skeleton skeleton-title" style={{ width: '30%', marginBottom: 24 }} />
    <div className="skeleton" style={{ width: '100%', height: 250, borderRadius: 12 }} />
  </div>
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

// 모던 Tooltip 스타일
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(8px)',
        padding: '12px 16px',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
      }}>
        <p style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color || '#94A3B8', fontSize: 13 }}>
            {entry.name}: <strong style={{ color: '#fff' }}>{entry.value}명</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

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

  // 로딩 시 Skeleton UI
  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">대시보드</h1>
        </div>
        <div className="bento-grid">
          <div className="bento-sm"><SkeletonStat /></div>
          <div className="bento-sm"><SkeletonStat /></div>
          <div className="bento-sm"><SkeletonStat /></div>
          <div className="bento-sm"><SkeletonStat /></div>
          <div className="bento-lg"><SkeletonChart /></div>
          <div className="bento-lg"><SkeletonChart /></div>
        </div>
      </div>
    );
  }

  const statusData = stats?.statusCounts ? [
    { name: '파견중', value: stats.statusCounts['파견중'] || 0, color: STATUS_COLORS['파견중'] },
    { name: '대기', value: stats.statusCounts['대기'] || 0, color: STATUS_COLORS['대기'] },
    { name: '재직', value: stats.statusCounts['재직'] || 0, color: STATUS_COLORS['재직'] },
    { name: '퇴사', value: stats.statusCounts['퇴사'] || 0, color: STATUS_COLORS['퇴사'] },
  ].filter(item => item.value > 0) : [];

  // 사이트 데이터에 색상 추가
  const siteDataWithColors = stats?.siteStats?.map(site => ({
    ...site,
    fill: getSiteColor(site.site_name)
  })) || [];

  // 통계 카드 데이터
  const statCards = [
    {
      icon: Users,
      value: stats?.total || 0,
      label: '전체 인원',
      color: 'primary',
      gradient: 'gradient-blue',
      trend: null,
    },
    {
      icon: UserCheck,
      value: stats?.statusCounts?.['파견중'] || 0,
      label: '파견중',
      color: 'success',
      gradient: 'gradient-green',
      trend: stats?.statusCounts?.['파견중'] > 0 ? 'up' : null,
    },
    {
      icon: Clock,
      value: stats?.statusCounts?.['대기'] || 0,
      label: '대기',
      color: 'warning',
      gradient: 'gradient-amber',
      trend: null,
    },
    {
      icon: Building2,
      value: stats?.siteStats?.length || 0,
      label: '파견 사이트',
      color: 'info',
      gradient: 'gradient-cyan',
      trend: null,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">대시보드</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>IT 인력 현황을 한눈에 확인하세요</p>
      </div>

      {/* Bento Grid 레이아웃 */}
      <div className="bento-grid">
        {/* 통계 카드 4개 */}
        {statCards.map((card, index) => (
          <div key={index} className="bento-sm">
            <div className={`stat-card-enhanced ${card.gradient} card-enter stagger-${index + 1}`}>
              <div className="stat-header">
                <div className={`stat-icon-enhanced ${card.color}`}>
                  <card.icon size={24} />
                </div>
                {card.trend && (
                  <div className={`stat-trend ${card.trend}`}>
                    {card.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span>{card.trend === 'up' ? '+' : '-'}2%</span>
                  </div>
                )}
              </div>
              <h3 className="stat-value">{card.value}</h3>
              <p className="stat-label">{card.label}</p>
            </div>
          </div>
        ))}

        {/* 파견 사이트별 인원 차트 - Large */}
        <div className="bento-lg">
          <div className="bento-card gradient-primary card-enter stagger-5">
            <div className="bento-card-header">
              <div className="bento-card-icon">
                <BarChart3 size={20} />
              </div>
              <h2 className="bento-card-title">파견 사이트별 인원</h2>
            </div>
            <div className="chart-container-modern">
              {siteDataWithColors.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={siteDataWithColors} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
                    <XAxis
                      dataKey="site_name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748B', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748B', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="employee_count" name="인원 수" radius={[8, 8, 0, 0]}>
                      {siteDataWithColors.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  icon={Building2}
                  title="파견 데이터 없음"
                  description="아직 파견 배정된 인력이 없습니다"
                />
              )}
            </div>
          </div>
        </div>

        {/* 인원 상태 분포 - Large */}
        <div className="bento-lg">
          <div className="bento-card gradient-success card-enter stagger-6">
            <div className="bento-card-header">
              <div className="bento-card-icon">
                <PieChartIcon size={20} />
              </div>
              <h2 className="bento-card-title">인원 상태 분포</h2>
            </div>
            <div className="chart-container-modern">
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
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  icon={Users}
                  title="인원 데이터 없음"
                  description="등록된 인원이 없습니다"
                />
              )}
            </div>
          </div>
        </div>

        {/* 최근 등록 인력 - Wide */}
        <div className="bento-wide">
          <div className="bento-card gradient-info card-enter stagger-7">
            <div className="bento-card-header">
              <div className="bento-card-icon">
                <UserPlus size={20} />
              </div>
              <h2 className="bento-card-title">최근 등록 인력</h2>
            </div>
            <div className="table-container">
              {stats?.recentEmployees?.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>이름</th>
                      <th>지원파트</th>
                      <th>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentEmployees.map((emp) => (
                      <tr key={emp.id}>
                        <td><strong>{emp.name}</strong></td>
                        <td>{emp.applied_part || '-'}</td>
                        <td>
                          <span className={`badge-modern badge-with-dot ${
                            emp.status === '파견중' ? 'badge-success' :
                            emp.status === '대기' ? 'badge-warning' :
                            emp.status === '퇴사' ? 'badge-danger' : 'badge-primary'
                          }`}>
                            {emp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <EmptyState
                  icon={UserPlus}
                  title="등록된 인력 없음"
                  description="아직 등록된 인력이 없습니다"
                />
              )}
            </div>
          </div>
        </div>

        {/* 계약 만료 예정 - Wide */}
        <div className="bento-wide">
          <div className="bento-card gradient-warning card-enter stagger-8">
            <div className="bento-card-header">
              <div className="bento-card-icon warning">
                <AlertTriangle size={20} />
              </div>
              <h2 className="bento-card-title">계약 만료 예정 (30일 이내)</h2>
            </div>
            {stats?.expiringContracts?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stats.expiringContracts.map((contract, idx) => (
                  <div key={idx} className={`alert-card-modern ${contract.days_left <= 7 ? 'alert-danger' : 'alert-warning'}`}>
                    <AlertTriangle size={18} />
                    <div style={{ flex: 1 }}>
                      <strong>{contract.name}</strong>
                      <p style={{ fontSize: '13px', marginTop: '4px', color: 'var(--text-secondary)' }}>
                        만료일: {contract.contract_end}
                      </p>
                    </div>
                    <span className={`badge-modern ${contract.days_left <= 7 ? 'badge-danger' : 'badge-warning'}`}>
                      {contract.days_left}일 남음
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="만료 예정 계약 없음"
                description="30일 이내 만료 예정 계약이 없습니다"
              />
            )}
          </div>
        </div>

        {/* 파견 만료 예정 인력 - Full Width */}
        <div className="bento-full">
          <div className="bento-card gradient-info card-enter stagger-9">
            <div className="bento-card-header">
              <div className="bento-card-icon info">
                <Calendar size={20} />
              </div>
              <h2 className="bento-card-title">파견 만료 예정 인력 (30일 이내)</h2>
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
                          <small style={{ color: 'var(--text-secondary)' }}>{assign.applied_part || '-'}</small>
                        </td>
                        <td>{assign.site_name}</td>
                        <td>{assign.end_date?.split('T')[0]}</td>
                        <td>
                          <span className={`badge-modern badge-with-dot ${assign.days_left <= 7 ? 'badge-danger' : 'badge-warning'}`}>
                            {assign.days_left}일 남음
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="파견 만료 예정 없음"
                description="30일 이내 파견 만료 예정 인력이 없습니다"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
