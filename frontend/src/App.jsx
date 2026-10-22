import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';

// Import Components
import Navbar from './components/Navbar';

// Import Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/home/Home';
import UserDashboard from './pages/citizen/UserDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import Jobs from './pages/jobs/Jobs';

// A wrapper that checks if the user is logged in and has the right role
const ProtectedRoute = ({ children, requiredRole }) => {
    const { user } = useContext(AuthContext);
    
    // If not logged in at all, kick them to the login page
    if (!user) {
        return <Navigate to="/login" />;
    }
    
    // If they are logged in but trying to access a page meant for another role
    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} />;
    }
    
    // If everything is correct, show the page
    return children;
};

// Contains all the valid URLs for your application
function AppRoutes() {
    const { user } = useContext(AuthContext);

    return (
        <Router>
            <Navbar />
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Shared landing page shown to both citizens and admins after login */}
                <Route path="/home" element={
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                } />

                {/* Protected Routes for Citizens */}
                <Route path="/dashboard" element={
                    <ProtectedRoute requiredRole="USER">
                        <UserDashboard />
                    </ProtectedRoute>
                } />

                {/* Protected Routes for Admins */}
                <Route path="/admin" element={
                    <ProtectedRoute requiredRole="ADMIN">
                        <AdminDashboard />
                    </ProtectedRoute>
                } />

                {/* Contracts/Jobs - visible to any logged-in user, USER or ADMIN */}
                <Route path="/jobs" element={
                    <ProtectedRoute>
                        <Jobs />
                    </ProtectedRoute>
                } />

                {/* Root - send logged-in users to the home page, everyone else to login */}
                <Route path="/" element={<Navigate to={user ? '/home' : '/login'} />} />

                {/* Fallback route - catches any typos in the URL */}
                <Route path="*" element={<Navigate to={user ? '/home' : '/login'} />} />
            </Routes>
        </Router>
    );
}

export default function App() {
    return (
        // AuthProvider wraps the whole app so every page knows who is logged in
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}