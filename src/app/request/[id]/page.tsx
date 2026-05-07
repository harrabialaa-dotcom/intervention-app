'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Request } from '@/lib/db';

export default function RequestDetail(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const [req, setReq] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/requests')
      .then(res => res.json())
      .then((data: Request[]) => {
        const found = data.find(r => r.id === params.id);
        setReq(found || null);
        setLoading(false);
      });
  }, [params.id]);

  const handleApprove = async (role: string) => {
    setErrorMsg(null);
    setApproving(role);
    try {
      const res = await fetch(`/api/requests/${params.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, code: codes[role] }),
      });
      
      if (res.ok) {
        const updatedReq = await res.json();
        setReq(updatedReq);
        setCodes({...codes, [role]: ''});
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Approval failed');
      }
    } catch (err) {
      setErrorMsg('Network error');
    }
    setApproving(null);
  };

  if (loading) return (
    <div className="container">
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading request details...</p>
      </div>
    </div>
  );
  
  if (!req) return (
    <div className="container">
      <div className="empty-state">
        <div className="empty-content">
          <div className="empty-icon">🔍</div>
          <h3>Request not found</h3>
          <p>The requested intervention could not be found.</p>
        </div>
      </div>
    </div>
  );

  const isExpired = req.status !== 'Approved' && new Date(req.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000 < Date.now();
  const roles = [
    { id: 'N1', label: 'N+1 Manager', email: req.n1Email },
    { id: 'HSE', label: 'HSE Department', email: 'khalifa.lassoued@valeo.com' },
    { id: 'RH', label: 'HR Department', email: 'sonia.rouatbi@valeo.com' },
    { id: 'Direction', label: 'Plant Director', email: 'bilel.belhaj-amor@valeo.com' },
  ];

  if (isExpired) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-content">
            <div className="empty-icon">⌛</div>
            <h3>Intervention expired</h3>
            <p>This intervention request was not validated within 7 days and is no longer available in the interface.</p>
            <button onClick={() => router.push('/')} className="btn btn-primary">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container request-detail-container">
      <div className="page-header">
        <h2 className="page-title">Intervention Details</h2>
        <button onClick={() => router.back()} className="btn btn-secondary back-btn">
          ← Review dashboard
        </button>
      </div>

      <div className="card info-card">
        <h3 className="card-title">General Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Subcontractor:</span>
            <span className="info-value">{req.subcontractor}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Section/Service:</span>
            <span className="info-value">{req.section}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Date:</span>
            <span className="info-value">{req.date}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Time:</span>
            <span className="info-value">{req.time}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Status:</span>
            <span className={`badge ${req.status === 'Approved' ? 'badge-approved' : 'badge-pending'}`}>
              {req.status === 'Approved' ? '✓ Approved' : '⏳ Pending'}
            </span>
          </div>
          <div className="info-item full-width">
            <span className="info-label">Accompanying Person:</span>
            <span className="info-value">{req.accompanying || 'None'}</span>
          </div>
          <div className="info-item full-width">
            <span className="info-label">Reason:</span>
            <span className="info-value">{req.reason}</span>
          </div>
        </div>
      </div>

      <div className="workflow-section">
        <h3 className="section-title">Approval Workflow</h3>
        
        {errorMsg && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {errorMsg}
          </div>
        )}

        <div className="approval-cards">
          {roles.map(role => {
            const approval = req.approvals[role.id as keyof typeof req.approvals];
            const isApproved = approval?.status === 'Approved';
            
            return (
              <div key={role.id} className={`approval-card ${isApproved ? 'approved' : 'pending'}`}>
                <div className="approval-info">
                  <h4 className="role-title">{role.label}</h4>
                  <p className="role-email">{role.email}</p>
                  {isApproved && (
                    <p className="approval-date">
                      ✓ Approved on {new Date(approval.approvedAt!).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="approval-actions">
                  {isApproved ? (
                    <span className="badge badge-approved">✓ Approved</span>
                  ) : (
                    <div className="approval-form">
                      <input 
                        type="text" 
                        placeholder="Secret PIN" 
                        className="form-input pin-input"
                        value={codes[role.id] || ''}
                        onChange={e => setCodes({...codes, [role.id]: e.target.value})}
                      />
                      <button 
                        onClick={() => handleApprove(role.id)} 
                        className="btn btn-primary validate-btn"
                        disabled={approving === role.id || !codes[role.id]}
                      >
                        {approving === role.id ? (
                          <>
                            <div className="btn-spinner"></div>
                            Verifying...
                          </>
                        ) : (
                          'Validate'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {req.status === 'Approved' && (
        <div className="success-card">
          <div className="success-content">
            <div className="success-icon">🎉</div>
            <h2>Intervention Fully Approved</h2>
            <p>The official authorization PDF has been sent to the requester's email.</p>
          </div>
        </div>
      )}
    </div>
  );
}
