import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axiosConfig';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Sends request to http://localhost:8080/api/auth/login
            const response = await api.post('/auth/login', { email, password });
            const userData = response.data;

            // Save to global state
            login(userData);

            // Both roles land on the shared home page after signing in
            navigate('/home');
        } catch (err) {
            setError('Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-box">
                <div className="auth-brand-panel">
                    <div className="auth-brand-badge">CC</div>
                    <h1>Your Voice.<br />Your City.</h1>
                    <p>Sign in to report civic issues, track their progress, and take on contracts to earn reward points.</p>
                    <ul className="auth-brand-points">
                        <li>Report potholes, streetlights &amp; more</li>
                        <li>Track resolution status in real time</li>
                        <li>Earn points for helping your community</li>
                    </ul>
                </div>

                <div className="auth-form-panel">
                    <h2>Sign In</h2>
                    <p className="auth-form-subtitle">Welcome back — enter your details to continue.</p>

                    {error && (
                        <div style={{ color: '#e74c3c', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
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
                            {loading ? 'Signing In...' : 'Login'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                        Don't have an account? <Link to="/register" style={{ color: '#3498db' }}>Register here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
