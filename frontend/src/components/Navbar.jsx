// src/components/Navbar.jsx
import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to={user ? '/home' : '/login'} style={{ color: '#fff', textDecoration: 'none' }}>
                <h2>Civic Connect</h2>
            </Link>
            <div className="nav-links">
                {!user ? (
                    <Link to="/login" className="btn">Sign In</Link>
                ) : (
                    <>
                        <Link to="/home">Home</Link>
                        {user.role === 'ADMIN' && <Link to="/admin">Dashboard</Link>}
                        {user.role === 'USER' && <Link to="/dashboard">My Reports</Link>}
                        <Link to="/jobs">Contracts</Link>
                        
                        <span style={{ color: '#bdc3c7', fontSize: '0.9rem' }}>
                            Points: {user.rewardPoints}
                        </span>
                        
                        <button className="btn btn-danger" onClick={handleLogout}>
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}