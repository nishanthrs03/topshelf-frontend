import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
    const { user, loading } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    if (loading) return <nav className="navbar-header">Loading..</nav>;

    return (
        <nav className="navbar-header">
            <div className='navbar-content'>
                <Link to="/" className="nav-brand">TopShelf</Link>
                <div className='nav-links'>
                    <Link to="/" className="nav-item">Home</Link>
                    <Link to="/community" className="nav-item">Community</Link>

                    {user && user.username ? (
                        <>
                            {isAdmin && (
                                <div className="admin-dropdown">
                                    <span className="nav-item admin-link">🛡️ Admin Panel</span>
                                    <div className="dropdown-menu">
                                        <Link to="/admin/moderate" className="dropdown-item">
                                            Moderate Content
                                        </Link>
                                        <Link to="/admin/roles" className="dropdown-item">
                                            Update User Roles
                                        </Link>
                                        <Link to="/admin/delete-user" className="dropdown-item dropdown-item--danger">
                                            Delete User
                                        </Link>
                                    </div>
                                </div>
                            )}

                            <Link to="/add" className="nav-item">Write a Recommendation</Link>
                            <Link to="/mine" className="nav-item">My Collection</Link>
                            <Link to="/myaccount" className="nav-item">My Account</Link>
                            <a href="http://localhost:9090/logout" className="nav-btn">Logout</a>
                        </>
                    ) : (
                        <a href="http://localhost:9090/oauth2/authorization/google" className="nav-btn login-btn">Login</a>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;