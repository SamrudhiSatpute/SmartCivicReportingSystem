import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axiosConfig';

// Small inline icon set so we don't need an extra icon-library dependency
const CameraIcon = () => (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
    </svg>
);

const HandshakeIcon = () => (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 17 6 12l-4 4 5 5z" />
        <path d="M7 13l4-4 3 3 6-6 4 4-6.5 6.5a2 2 0 0 1-2.8 0L9 15" />
    </svg>
);

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

export default function Home() {
    const { user } = useContext(AuthContext);
    const isAdmin = user?.role === 'ADMIN';

    const [stats, setStats] = useState({ resolved: 0, active: 0, loaded: false });

    useEffect(() => {
        let cancelled = false;

        const loadStats = async () => {
            try {
                const [issuesRes, jobsRes] = await Promise.all([
                    api.get('/issues/all'),
                    api.get('/jobs/all')
                ]);

                if (cancelled) return;

                const resolved = issuesRes.data.filter(i => i.status === 'RESOLVED').length;
                const active = jobsRes.data.filter(j => j.status === 'OPEN').length;

                setStats({ resolved, active, loaded: true });
            } catch (error) {
                // Homepage should still render nicely even if stats can't load
                console.error('Failed to load homepage stats', error);
                setStats(s => ({ ...s, loaded: true }));
            }
        };

        loadStats();
        return () => { cancelled = true; };
    }, []);

    const primaryCta = isAdmin
        ? { to: '/admin', label: 'Go to Admin Dashboard' }
        : { to: '/dashboard', label: 'Report an Issue' };

    return (
        <div className="home-page">
            {/* Hero */}
            <section className="home-hero">
                <div className="home-hero-inner">
                    <span className="home-eyebrow">Welcome back, {user?.name || 'there'} 👋</span>
                    <h1>Your Voice. Your City.<br />Better Together.</h1>
                    <p className="home-subtitle">
                        Report local issues, take on civic contracts, and earn rewards
                        for keeping our community thriving.
                    </p>
                    <div className="home-cta-row">
                        <Link to={primaryCta.to} className="btn btn-hero-primary">{primaryCta.label}</Link>
                        <Link to="/jobs" className="btn btn-hero-secondary">Browse Contracts</Link>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="home-section">
                <h2 className="home-section-title">How It Works</h2>
                <div className="how-it-works-grid">
                    <div className="feature-card">
                        <div className="icon-badge icon-badge-blue"><CameraIcon /></div>
                        <h3>Spot &amp; Report</h3>
                        <p>See a pothole, broken streetlight, or water leak? Snap a photo and pin it with your location in seconds.</p>
                    </div>
                    <div className="feature-card">
                        <div className="icon-badge icon-badge-orange"><HandshakeIcon /></div>
                        <h3>Take Action</h3>
                        <p>Browse available civic contracts. Volunteer to clean up or verify issues to earn community reward points.</p>
                    </div>
                    <div className="feature-card">
                        <div className="icon-badge icon-badge-green"><CheckIcon /></div>
                        <h3>Track Progress</h3>
                        <p>Watch real-time updates as city admins and fellow citizens work through and resolve neighborhood problems.</p>
                    </div>
                </div>
            </section>

            {/* Live stats */}
            <section className="stats-band">
                <div className="stats-band-inner">
                    <div className="stat-item">
                        <span className="stat-value">{stats.loaded ? stats.resolved : '—'}</span>
                        <span className="stat-label">Issues Resolved</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{stats.loaded ? stats.active : '—'}</span>
                        <span className="stat-label">Active Civic Contracts</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{user?.rewardPoints ?? 0}</span>
                        <span className="stat-label">Your Reward Points</span>
                    </div>
                </div>
            </section>

            {/* Closing banner */}
            <section className="home-banner">
                <p>
                    {isAdmin
                        ? <>Ready to review what citizens are reporting? <Link to="/admin">Open the Admin Dashboard</Link>.</>
                        : <>Noticed a problem nearby? <Link to="/dashboard">Report it now</Link> and help your neighborhood.</>}
                </p>
            </section>
        </div>
    );
}
