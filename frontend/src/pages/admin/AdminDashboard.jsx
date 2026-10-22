import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';

export default function AdminDashboard() {
    const [issues, setIssues] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [message, setMessage] = useState('');
    const [reportersIssue, setReportersIssue] = useState(null);
    const [reporters, setReporters] = useState([]);
    const [loadingReporters, setLoadingReporters] = useState(false);
    // Full-size image currently open in the verification lightbox (null = closed)
    const [lightboxUrl, setLightboxUrl] = useState(null);

    useEffect(() => {
        fetchAllIssues();
    }, []);

    const fetchAllIssues = async () => {
        try {
            const response = await api.get('/issues/all');
            // Sort so the newest issues appear at the top
            const sortedIssues = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setIssues(sortedIssues);
        } catch (error) {
            console.error("Failed to fetch issues", error);
        }
    };

    const handleViewReporters = async (issue) => {
        setReportersIssue(issue);
        setLoadingReporters(true);
        try {
            const response = await api.get(`/issues/${issue.id}/reporters`);
            setReporters(response.data);
        } catch (error) {
            console.error("Failed to fetch reporters", error);
        } finally {
            setLoadingReporters(false);
        }
    };

    const handleUpdateStatus = async (issueId, newStatus) => {
        try {
            // Sends request to /api/issues/{id}/status?status=RESOLVED
            await api.put(`/issues/${issueId}/status?status=${newStatus}`);
            
            setMessage(`Issue #${issueId} marked as ${newStatus}.`);
            setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
            
            // Update the UI locally without refreshing the page
            setIssues(issues.map(issue => 
                issue.id === issueId ? { ...issue, status: newStatus } : issue
            ));
        } catch (error) {
            setMessage('Failed to update status.');
        }
    };

    // Filter logic for the dropdown
    const filteredIssues = filter === 'ALL' 
        ? issues 
        : issues.filter(issue => issue.status === filter);

    return (
        <div className="container" style={{ marginTop: '2rem' }}>
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2>Civic Command Center</h2>
                    
                    <select 
                        className="form-control" 
                        style={{ width: '200px' }}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="ALL">All Issues</option>
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                    </select>
                </div>

                {message && (
                    <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px' }}>
                        {message}
                    </div>
                )}

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e1e8ed' }}>
                                <th style={{ padding: '1rem' }}>ID</th>
                                <th style={{ padding: '1rem' }}>Photo</th>
                                <th style={{ padding: '1rem' }}>Category</th>
                                <th style={{ padding: '1rem' }}>Description</th>
                                <th style={{ padding: '1rem' }}>Location</th>
                                <th style={{ padding: '1rem' }}>Reports</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                                <th style={{ padding: '1rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredIssues.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#7f8c8d' }}>
                                        No issues found.
                                    </td>
                                </tr>
                            ) : (
                                filteredIssues.map((issue) => (
                                    <tr key={issue.id} style={{ borderBottom: '1px solid #e1e8ed' }}>
                                        <td style={{ padding: '1rem', fontWeight: 'bold' }}>#{issue.id}</td>
                                        <td style={{ padding: '1rem' }}>
                                            {issue.imageUrl ? (
                                                <img
                                                    src={issue.imageUrl}
                                                    alt={`Complaint #${issue.id} evidence`}
                                                    onClick={() => setLightboxUrl(issue.imageUrl)}
                                                    style={{
                                                        width: '56px', height: '56px', objectFit: 'cover',
                                                        borderRadius: '4px', cursor: 'zoom-in',
                                                        border: '1px solid #e1e8ed'
                                                    }}
                                                />
                                            ) : (
                                                <span style={{ fontSize: '0.8rem', color: '#bdc3c7' }}>No photo</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem' }}>{issue.category}</td>
                                        <td style={{ padding: '1rem', maxWidth: '300px' }}>{issue.description}</td>
                                        <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                                            <a 
                                                href={`https://www.google.com/maps?q=${issue.lat},${issue.lng}`} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                style={{ color: '#3498db' }}
                                            >
                                                View Map
                                            </a>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <button
                                                type="button"
                                                onClick={() => handleViewReporters(issue)}
                                                style={{
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: '0.3rem 0.6rem',
                                                    borderRadius: '12px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: issue.reportCount > 1 ? 'bold' : 'normal',
                                                    backgroundColor: issue.reportCount > 1 ? '#ffe8cc' : '#f1f1f1',
                                                    color: issue.reportCount > 1 ? '#a35a00' : '#7f8c8d'
                                                }}
                                            >
                                                {issue.reportCount > 1 ? `🔥 ${issue.reportCount}` : '1'}
                                            </button>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ 
                                                padding: '0.3rem 0.6rem', 
                                                borderRadius: '12px', 
                                                fontSize: '0.8rem',
                                                backgroundColor: issue.status === 'RESOLVED' ? '#d4edda' 
                                                               : issue.status === 'IN_PROGRESS' ? '#cce5ff' 
                                                               : '#fff3cd',
                                                color: issue.status === 'RESOLVED' ? '#155724' 
                                                     : issue.status === 'IN_PROGRESS' ? '#004085' 
                                                     : '#856404'
                                            }}>
                                                {issue.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                            {issue.status === 'OPEN' && (
                                                <button 
                                                    className="btn" 
                                                    style={{ backgroundColor: '#f39c12', fontSize: '0.8rem' }}
                                                    onClick={() => handleUpdateStatus(issue.id, 'IN_PROGRESS')}
                                                >
                                                    Start Work
                                                </button>
                                            )}
                                            {issue.status !== 'RESOLVED' && (
                                                <button 
                                                    className="btn" 
                                                    style={{ backgroundColor: '#2ecc71', fontSize: '0.8rem' }}
                                                    onClick={() => handleUpdateStatus(issue.id, 'RESOLVED')}
                                                >
                                                    Resolve
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {reportersIssue && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px',
                        width: '90%', maxWidth: '560px', maxHeight: '80vh', overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3>Reporters for #{reportersIssue.id} — {reportersIssue.category}</h3>
                            <button
                                type="button"
                                className="btn btn-danger"
                                style={{ fontSize: '0.8rem' }}
                                onClick={() => { setReportersIssue(null); setReporters([]); }}
                            >
                                Close
                            </button>
                        </div>

                        {loadingReporters ? (
                            <p style={{ color: '#7f8c8d' }}>Loading...</p>
                        ) : reporters.length === 0 ? (
                            <p style={{ color: '#7f8c8d' }}>No reporter details found.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {reporters.map((r) => (
                                    <div key={r.id} style={{ display: 'flex', gap: '1rem', padding: '0.75rem', border: '1px solid #e1e8ed', borderRadius: '4px' }}>
                                        {r.imageUrl && (
                                            <img
                                                src={r.imageUrl}
                                                alt="Reporter evidence"
                                                onClick={() => setLightboxUrl(r.imageUrl)}
                                                style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0, cursor: 'zoom-in' }}
                                            />
                                        )}
                                        <div>
                                            <strong>{r.user?.name || 'Unknown citizen'}</strong>
                                            <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>{r.user?.email}</div>
                                            <small style={{ color: '#95a5a6' }}>
                                                Reported: {new Date(r.createdAt).toLocaleString()}
                                            </small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {lightboxUrl && (
                <div
                    onClick={() => setLightboxUrl(null)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.85)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', zIndex: 2000,
                        cursor: 'zoom-out', padding: '2rem'
                    }}
                >
                    <img
                        src={lightboxUrl}
                        alt="Complaint evidence — full size"
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px' }}
                    />
                    <button
                        type="button"
                        onClick={() => setLightboxUrl(null)}
                        style={{
                            position: 'fixed', top: '1.5rem', right: '1.5rem',
                            border: 'none', borderRadius: '50%', width: '2.5rem', height: '2.5rem',
                            backgroundColor: '#fff', color: '#2c3e50', fontSize: '1.2rem',
                            cursor: 'pointer', lineHeight: '2.5rem', textAlign: 'center', padding: 0
                        }}
                        aria-label="Close image"
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    );
}