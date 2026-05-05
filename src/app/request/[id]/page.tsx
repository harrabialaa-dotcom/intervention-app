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

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (!req) return <div className="container"><p>Request not found.</p></div>;

  const roles = [
    { id: 'N1', label: 'N+1 Manager', email: req.n1Email },
    { id: 'HSE', label: 'HSE Department', email: 'khalifa.lassoued@valeo.com' },
    { id: 'RH', label: 'HR Department', email: 'sonia.rouatbi@valeo.com' },
    { id: 'Direction', label: 'Plant Director', email: 'bilel.belhaj-amor@valeo.com' },
  ];

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.875rem' }}>Intervention Details</h2>
        <button onClick={() => router.back()} className="btn" style={{ border: '1px solid var(--border-color)', background: 'white', color: 'var(--text-main)' }}>← Back</button>
      </div>

      <div className="card">
        <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--primary-color)', fontSize: '1.25rem' }}>General Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.95rem' }}>
          <div><strong style={{ color: 'var(--text-secondary)' }}>Subcontractor:</strong><br/> {req.subcontractor}</div>
          <div><strong style={{ color: 'var(--text-secondary)' }}>Section/Service:</strong><br/> {req.section}</div>
          <div><strong style={{ color: 'var(--text-secondary)' }}>Date:</strong><br/> {req.date}</div>
          <div><strong style={{ color: 'var(--text-secondary)' }}>Time:</strong><br/> {req.time}</div>
          <div style={{ gridColumn: '1 / -1' }}><strong style={{ color: 'var(--text-secondary)' }}>Accompanying Person:</strong><br/> {req.accompanying || 'None'}</div>
          <div style={{ gridColumn: '1 / -1' }}><strong style={{ color: 'var(--text-secondary)' }}>Reason:</strong><br/> {req.reason}</div>
        </div>
      </div>

      <h3 style={{ marginBottom: '1rem', marginTop: '2rem', fontSize: '1.25rem' }}>Approval Workflow</h3>
      
      {errorMsg && (
        <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: 'var(--danger-color)', borderRadius: 'var(--radius)', border: '1px solid #fca5a5', marginBottom: '1.5rem' }}>
          {errorMsg}
        </div>
      )}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {roles.map(role => {
          const approval = req.approvals[role.id as keyof typeof req.approvals];
          const isApproved = approval?.status === 'Approved';
          
          return (
            <div key={role.id} className="card" style={{ marginBottom: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1.5rem' }}>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>{role.label}</h4>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {role.email}
                  {isApproved && <span style={{ display: 'block', color: 'var(--success-color)', marginTop: '0.25rem', fontWeight: 500 }}>Approved on {new Date(approval.approvedAt!).toLocaleString()}</span>}
                </p>
              </div>
              <div>
                {isApproved ? (
                  <span className="badge badge-approved" style={{ padding: '0.6rem 1.2rem', fontSize: '0.875rem' }}>✓ Approved</span>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      placeholder="Secret PIN" 
                      className="form-input" 
                      style={{ width: '130px' }}
                      value={codes[role.id] || ''}
                      onChange={e => setCodes({...codes, [role.id]: e.target.value})}
                    />
                    <button 
                      onClick={() => handleApprove(role.id)} 
                      className="btn btn-primary"
                      disabled={approving === role.id || !codes[role.id]}
                    >
                      {approving === role.id ? 'Verifying...' : 'Validate'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {req.status === 'Approved' && (
        <div className="card" style={{ marginTop: '2rem', backgroundColor: '#ecfdf5', borderColor: '#a7f3d0', textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ color: 'var(--success-color)', margin: 0, fontSize: '1.5rem' }}>🎉 Intervention Fully Approved</h2>
          <p style={{ color: '#047857', margin: '0.5rem 0 0 0' }}>The official authorization PDF has been sent to the requester's email.</p>
        </div>
      )}
    </div>
  );
}
