import React, { useState, useRef } from 'react';
import { FileText, Download, RefreshCw, Users, Building2, AlertTriangle, Calendar } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const AIReport = () => {
  const [report, setReport] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const reportRef = useRef(null);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!reportRef.current) return;

    try {
      const canvas = await html2canvas(reportRef.current, {
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

      const today = new Date().toISOString().split('T')[0];
      pdf.save(`인력현황보고서_${today}.pdf`);
    } catch (err) {
      console.error('PDF 생성 오류:', err);
      alert('PDF 생성 중 오류가 발생했습니다.');
    }
  };

  // 마크다운 스타일 텍스트를 HTML로 간단히 변환
  const formatReport = (text) => {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^### (.*$)/gm, '<h3 style="margin-top: 20px; margin-bottom: 10px; color: var(--text-primary); font-size: 16px;">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 style="margin-top: 24px; margin-bottom: 12px; color: var(--text-primary); font-size: 18px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 style="margin-top: 0; margin-bottom: 16px; color: var(--text-primary); font-size: 22px;">$1</h1>')
      .replace(/^- (.*$)/gm, '<li style="margin-left: 20px; margin-bottom: 6px;">$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li style="margin-left: 20px; margin-bottom: 6px; list-style-type: decimal;">$1</li>')
      .replace(/\n\n/g, '</p><p style="margin-bottom: 12px; line-height: 1.7;">')
      .replace(/\n/g, '<br/>');
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
              onClick={downloadPDF}
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
        <div className="bento-card card-enter stagger-6" ref={reportRef}>
          <div className="bento-card-header">
            <div className="bento-card-icon info">
              <FileText size={20} />
            </div>
            <h2 className="bento-card-title">인력현황요약보고서</h2>
            <span style={{
              marginLeft: 'auto',
              fontSize: 13,
              color: 'var(--text-secondary)'
            }}>
              생성일시: {new Date().toLocaleString('ko-KR')}
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
        <div className="bento-card card-enter">
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
