import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FileText, Download, RefreshCw, Users, Building2, AlertTriangle, Calendar, History, Eye } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const AIReport = () => {
  const [report, setReport] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const reportRef = useRef(null);

  // 보고서 기록 조회
  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/ai/reports`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // 보고서 저장
  const saveReport = async (content) => {
    try {
      const now = new Date();
      const dateStr = now.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\. /g, '-').replace('.', '');
      const timeStr = now.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(':', '시') + '분';

      const title = `인력현황요약보고서_${dateStr}_${timeStr}`;

      await fetch(`${API}/api/ai/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });

      fetchHistory();
    } catch (err) {
      console.error('Failed to save report:', err);
    }
  };

  // 보고서 생성
  const generateReport = async () => {
    setLoading(true);
    setError(null);
    setSelectedReport(null);
    try {
      const res = await fetch(`${API}/api/ai/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error('보고서 생성에 실패했습니다.');
      }

      const data = await res.json();
      setReport(data.report);
      setStats(data.stats);

      // 보고서 자동 저장
      await saveReport(data.report);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 기록에서 보고서 보기
  const viewReport = async (id) => {
    try {
      const res = await fetch(`${API}/api/ai/reports/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedReport(data);
        setReport(data.content);
        setStats(null);
      }
    } catch (err) {
      console.error('Failed to fetch report:', err);
    }
  };

  // PDF 다운로드
  const downloadPDF = async (reportContent, title) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = formatReport(reportContent || report);
    tempDiv.style.padding = '40px';
    tempDiv.style.background = '#fff';
    tempDiv.style.width = '800px';
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);

    try {
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      const filename = title || `인력현황보고서_${new Date().toISOString().split('T')[0]}`;
      pdf.save(`${filename}.pdf`);
    } catch (err) {
      console.error('PDF 생성 오류:', err);
      alert('PDF 생성 중 오류가 발생했습니다.');
    } finally {
      document.body.removeChild(tempDiv);
    }
  };

  // 기록에서 PDF 다운로드
  const downloadHistoryPDF = async (id, title) => {
    try {
      const res = await fetch(`${API}/api/ai/reports/${id}`);
      if (res.ok) {
        const data = await res.json();
        await downloadPDF(data.content, title);
      }
    } catch (err) {
      console.error('Failed to download PDF:', err);
    }
  };

  // 섹션별 그라데이션 색상
  const sectionStyles = [
    { icon: '📊', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', light: 'linear-gradient(135deg, #667eea15, #764ba210)' },
    { icon: '📈', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', light: 'linear-gradient(135deg, #11998e15, #38ef7d10)' },
    { icon: '⚠️', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', light: 'linear-gradient(135deg, #f093fb15, #f5576c10)' },
    { icon: '💡', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', light: 'linear-gradient(135deg, #4facfe15, #00f2fe10)' },
  ];

  // 마크다운 스타일 텍스트를 모던한 카드형 HTML로 변환
  const formatReport = (text) => {
    if (!text) return '';

    // 섹션별로 분리
    const sections = text.split(/(?=^\*\*\d+\.|^### \d+\.)/gm).filter(s => s.trim());

    let html = sections.map(section => {
      // 섹션 제목 매칭 (볼드 또는 H3)
      const titleMatch = section.match(/^(?:\*\*(\d+)\. (.*?)\*\*|### (\d+)\. (.*))/m);

      if (titleMatch) {
        const num = titleMatch[1] || titleMatch[3];
        const title = titleMatch[2] || titleMatch[4];
        const idx = (parseInt(num) - 1) % sectionStyles.length;
        const style = sectionStyles[idx];

        // 제목 제거한 본문
        let content = section.replace(/^(?:\*\*\d+\. .*?\*\*|### \d+\. .*)/m, '').trim();

        // 본문 포맷팅 (본문 20px, 행간 축소)
        content = content
          // 리스트 아이템 (키:값 형태)
          .replace(/^- \*\*(.*?)\*\*:?\s*(.*$)/gm, `<div style="display: flex; align-items: flex-start; gap: 10px; margin: 4px 0; padding-left: 62px;"><span style="color: #4338ca; font-weight: 700; font-size: 20px;">$1</span><span style="color: #334155; font-weight: 600; font-size: 20px;">$2</span></div>`)
          // 일반 리스트 아이템
          .replace(/^- (.*$)/gm, `<div style="display: flex; align-items: flex-start; gap: 8px; margin: 4px 0; padding-left: 62px;"><span style="color: #667eea; font-size: 20px;">•</span><span style="color: #1e293b; font-size: 20px; font-weight: 600; line-height: 1.4;">$1</span></div>`)
          // 숫자 리스트 (권고사항 등)
          .replace(/^(\d+)\. \*\*(.*?)\*\*(.*$)/gm, `<div style="display: flex; align-items: flex-start; gap: 10px; margin: 6px 0; padding-left: 62px;"><span style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; min-width: 28px; height: 28px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 800;">$1</span><div style="line-height: 1.3;"><strong style="color: #1e40af; font-weight: 700; font-size: 20px;">$2</strong><span style="color: #475569; font-weight: 600; font-size: 20px;">$3</span></div></div>`)
          // 나머지 볼드 텍스트
          .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #1e40af; font-weight: 700;">$1</strong>')
          // 줄바꿈
          .replace(/\n/g, '<br/>');

        return `
          <div style="background: ${style.light}; border: 1px solid rgba(100,100,100,0.1); border-radius: 16px; padding: 24px; margin: 20px 0; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 12px;">
              <div style="width: 48px; height: 48px; background: ${style.gradient}; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                ${style.icon}
              </div>
              <h2 style="margin: 0; color: #0f172a; font-size: 28px; font-weight: 800;">${num}. ${title}</h2>
            </div>
            <div style="color: #1e293b; font-size: 20px; font-weight: 600; line-height: 1.4; padding-left: 62px;">
              ${content}
            </div>
          </div>
        `;
      }

      // 제목 없는 섹션 (헤더 등)
      let content = section
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #1e40af; font-weight: 700;">$1</strong>')
        .replace(/\n/g, '<br/>');

      return `<div style="font-size: 20px; font-weight: 600; line-height: 1.4; margin-bottom: 16px; color: #1e293b;">${content}</div>`;
    }).join('');

    return `<div style="font-family: Pretendard, -apple-system, sans-serif;">${html}</div>`;
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">AI 보고서</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
          AI가 분석한 인력현황요약보고서를 생성합니다
        </p>
      </div>

      {/* 생성 버튼 영역 */}
      <div className="bento-card card-enter stagger-1" style={{ marginBottom: 20 }}>
        <div className="bento-card-header">
          <div className="bento-card-icon primary">
            <FileText size={20} />
          </div>
          <h2 className="bento-card-title">보고서 생성</h2>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={generateReport}
            disabled={loading}
            className="btn btn-primary btn-hover-lift"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="spin" />
                AI 분석 중...
              </>
            ) : (
              <>
                <FileText size={18} />
                AI 보고서 생성
              </>
            )}
          </button>

          {report && (
            <button
              onClick={() => downloadPDF(report)}
              className="btn btn-secondary btn-hover-lift"
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Download size={18} />
              PDF 다운로드
            </button>
          )}
        </div>

        {error && (
          <div style={{
            marginTop: 16,
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 8,
            color: '#EF4444',
          }}>
            {error}
          </div>
        )}
      </div>

      {/* 통계 요약 카드 */}
      {stats && (
        <div className="bento-grid" style={{ marginBottom: 20 }}>
          <div className="bento-sm">
            <div className="stat-card-enhanced gradient-blue card-enter stagger-2">
              <div className="stat-header">
                <div className="stat-icon-enhanced primary">
                  <Users size={24} />
                </div>
              </div>
              <h3 className="stat-value">{stats.total}</h3>
              <p className="stat-label">전체 인원</p>
            </div>
          </div>
          <div className="bento-sm">
            <div className="stat-card-enhanced gradient-green card-enter stagger-3">
              <div className="stat-header">
                <div className="stat-icon-enhanced success">
                  <Building2 size={24} />
                </div>
              </div>
              <h3 className="stat-value">{stats.siteStats?.length || 0}</h3>
              <p className="stat-label">파견 사이트</p>
            </div>
          </div>
          <div className="bento-sm">
            <div className="stat-card-enhanced gradient-amber card-enter stagger-4">
              <div className="stat-header">
                <div className="stat-icon-enhanced warning">
                  <AlertTriangle size={24} />
                </div>
              </div>
              <h3 className="stat-value">{stats.expiringContracts}</h3>
              <p className="stat-label">만료 예정 계약</p>
            </div>
          </div>
          <div className="bento-sm">
            <div className="stat-card-enhanced gradient-cyan card-enter stagger-5">
              <div className="stat-header">
                <div className="stat-icon-enhanced info">
                  <Calendar size={24} />
                </div>
              </div>
              <h3 className="stat-value">{stats.expiringAssignments}</h3>
              <p className="stat-label">만료 예정 파견</p>
            </div>
          </div>
        </div>
      )}

      {/* 보고서 내용 */}
      {report && (
        <div className="bento-card card-enter stagger-6" ref={reportRef} style={{ marginBottom: 20 }}>
          <div className="bento-card-header">
            <div className="bento-card-icon info">
              <FileText size={20} />
            </div>
            <h2 className="bento-card-title">
              {selectedReport ? selectedReport.title : '인력현황요약보고서'}
            </h2>
            <span style={{
              marginLeft: 'auto',
              fontSize: 13,
              color: 'var(--text-secondary)'
            }}>
              생성일시: {selectedReport
                ? new Date(selectedReport.generated_at).toLocaleString('ko-KR')
                : new Date().toLocaleString('ko-KR')}
            </span>
          </div>

          <div
            className="report-content"
            style={{
              padding: '20px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              lineHeight: 1.8,
              color: 'var(--text-primary)',
            }}
            dangerouslySetInnerHTML={{ __html: formatReport(report) }}
          />
        </div>
      )}

      {/* 로딩 중 스켈레톤 */}
      {loading && !report && (
        <div className="bento-card card-enter" style={{ marginBottom: 20 }}>
          <div className="bento-card-header">
            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 8 }} />
            <div className="skeleton" style={{ width: 150, height: 24, marginLeft: 12 }} />
          </div>
          <div style={{ marginTop: 20 }}>
            <div className="skeleton" style={{ width: '100%', height: 20, marginBottom: 12 }} />
            <div className="skeleton" style={{ width: '90%', height: 20, marginBottom: 12 }} />
            <div className="skeleton" style={{ width: '95%', height: 20, marginBottom: 12 }} />
            <div className="skeleton" style={{ width: '80%', height: 20, marginBottom: 12 }} />
            <div className="skeleton" style={{ width: '85%', height: 20 }} />
          </div>
        </div>
      )}

      {/* 보고서 생성 기록 */}
      <div className="bento-card card-enter stagger-7">
        <div className="bento-card-header">
          <div className="bento-card-icon success">
            <History size={20} />
          </div>
          <h2 className="bento-card-title">보고서 생성 기록</h2>
          <span className="badge-modern badge-primary" style={{ marginLeft: 'auto' }}>
            {history.length}건
          </span>
        </div>

        <div className="table-container">
          {history.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th style={{ width: 60 }}>순번</th>
                  <th style={{ width: 180 }}>생성일시</th>
                  <th>보고서명</th>
                  <th style={{ width: 180 }}>작업</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, index) => (
                  <tr key={item.id}>
                    <td style={{ textAlign: 'center' }}>{history.length - index}</td>
                    <td>{new Date(item.generated_at).toLocaleString('ko-KR')}</td>
                    <td><strong>{item.title}</strong></td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => viewReport(item.id)}
                          className="btn btn-sm"
                          style={{
                            padding: '6px 12px',
                            fontSize: 13,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 6,
                            cursor: 'pointer',
                          }}
                        >
                          <Eye size={14} />
                          보기
                        </button>
                        <button
                          onClick={() => downloadHistoryPDF(item.id, item.title)}
                          className="btn btn-sm"
                          style={{
                            padding: '6px 12px',
                            fontSize: 13,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            background: 'var(--primary)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                          }}
                        >
                          <Download size={14} />
                          PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{
              padding: 40,
              textAlign: 'center',
              color: 'var(--text-secondary)',
            }}>
              <History size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p>아직 생성된 보고서가 없습니다</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>AI 보고서 생성 버튼을 클릭하여 첫 보고서를 생성해보세요</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        .report-content h1,
        .report-content h2,
        .report-content h3 {
          color: var(--text-primary);
        }
        .report-content ul,
        .report-content ol {
          padding-left: 0;
          margin: 12px 0;
        }
        .report-content li {
          color: var(--text-primary);
        }
        .report-content p {
          margin-bottom: 12px;
        }
        .report-content strong {
          color: var(--primary);
        }
      `}</style>
    </div>
  );
};

export default AIReport;
