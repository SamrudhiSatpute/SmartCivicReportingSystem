import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Sends request to http://localhost:8080/api/auth/register
            await api.post('/auth/register', { name, email, password });

            setSuccess(true);
            // Give the user a moment to see the confirmation before redirecting
            setTimeout(() => navigate('/login'), 1200);
        } catch (err) {
            setError('Registration failed. This email might already be in use.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-box">
                <div className="auth-brand-panel">
                    <div className="auth-brand-badge">CC</div>
                    <h1>Join Your<br />Community.</h1>
                    <p>Create an account to start reporting civic issues and helping your neighborhood get things fixed faster.</p>
                    <ul className="auth-brand-points">
                        <li>Free to join, takes under a minute</li>
                        <li>Report issues from your phone or desktop</li>
                        <li>Earn reward points as issues get resolved</li>
                    </ul>
                </div>

                <div className="auth-form-panel">
                    <h2>Create Account</h2>
                    <p className="auth-form-subtitle">Fill in your details to get started.</p>

                    {error && (
                        <div style={{ color: '#e74c3c', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{ color: '#27ae60', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            Account created! Redirecting you to sign in...
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                            {loading ? 'Creating Account...' : 'Register'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                        Already have an account? <Link to="/login" style={{ color: '#3498db' }}>Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
