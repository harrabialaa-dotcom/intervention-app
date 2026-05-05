'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateRequest() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subcontractor: '',
    section: '',
    date: '',
    time: '',
    accompanying: '',
    reason: '',
    demandeurEmail: '',
    n1Email: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (res.ok) {
      router.push('/');
    } else {
      alert('Failed to create request');
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <h2 style={{ marginBottom: '2rem', fontSize: '1.875rem' }}>New Involvement Request</h2>
      
      <form onSubmit={handleSubmit} className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Subcontractor / External Body *</label>
            <input required type="text" className="form-input" value={formData.subcontractor} onChange={e => setFormData({...formData, subcontractor: e.target.value})} />
          </div>
          
          <div className="form-group">
            <label className="form-label">Section / Service *</label>
            <input required type="text" className="form-input" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} />
          </div>

          <div className="form-group">
            <label className="form-label">Date *</label>
            <input required type="date" className="form-input" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>

          <div className="form-group">
            <label className="form-label">Time *</label>
            <input required type="text" className="form-input" placeholder="e.g. 08:00 - 17:00" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
          </div>

          <div className="form-group">
            <label className="form-label">Accompanying Person (Optional)</label>
            <input type="text" className="form-input" value={formData.accompanying} onChange={e => setFormData({...formData, accompanying: e.target.value})} />
          </div>

          <div className="form-group">
            <label className="form-label">Reason for Intervention *</label>
            <input required type="text" className="form-input" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', fontSize: '1.25rem' }}>Workflow Emails</h3>
          </div>

          <div className="form-group">
            <label className="form-label">Requester Email (To receive final PDF) *</label>
            <input required type="email" className="form-input" value={formData.demandeurEmail} onChange={e => setFormData({...formData, demandeurEmail: e.target.value})} />
          </div>

          <div className="form-group">
            <label className="form-label">N+1 Manager Email (To start approval) *</label>
            <input required type="email" className="form-input" value={formData.n1Email} onChange={e => setFormData({...formData, n1Email: e.target.value})} />
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button type="button" onClick={() => router.back()} className="btn" style={{ background: '#e2e8f0', color: 'var(--text-main)' }}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}
