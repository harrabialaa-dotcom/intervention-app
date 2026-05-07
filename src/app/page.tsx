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
      <div className="dashboard-header">
        <h2 className="dashboard-title">Dashboard</h2>
        <Link href="/create" className="btn btn-primary">
          <span>+</span> New Request
        </Link>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading requests...</p>
          </div>
        ) : (
          <div className="table-container">
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
                    <td className="subcontractor-cell">{req.subcontractor}</td>
                    <td>{req.section}</td>
                    <td>{req.date}</td>
                    <td>
                      <span className={`badge ${req.status === 'Approved' ? 'badge-approved' : 'badge-pending'}`}>
                        {req.status === 'Approved' ? '✓ Approved' : '⏳ Pending'}
                      </span>
                    </td>
                    <td>
                      <Link href={`/request/${req.id}`} className="action-link">
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="empty-state">
                      <div className="empty-content">
                        <div className="empty-icon">📋</div>
                        <h3>No requests found</h3>
                        <p>Create a new request to get started with the authorization process.</p>
                      </div>
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
