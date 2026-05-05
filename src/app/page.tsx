'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Request } from '@/lib/db';

export default function Home() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/requests')
      .then(res => res.json())
      .then(data => {
        setRequests(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.875rem' }}>Dashboard</h2>
        <Link href="/create" className="btn btn-primary">
          + New Request
        </Link>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center' }}>Loading...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Subcontractor</th>
                  <th>Section</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id}>
                    <td style={{ fontWeight: 500 }}>{req.subcontractor}</td>
                    <td>{req.section}</td>
                    <td>{req.date}</td>
                    <td>
                      <span className={`badge ${req.status === 'Approved' ? 'badge-approved' : 'badge-pending'}`}>
                        {req.status === 'Approved' ? '✓ Approved' : '⏳ Pending'}
                      </span>
                    </td>
                    <td>
                      <Link href={`/request/${req.id}`} style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none' }}>
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                      No requests found. Create a new one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
